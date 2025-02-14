import { createOllama } from 'ollama-ai-provider'
import { streamText/*, tool*/, embed } from 'ai'
import { type CoreMessage } from 'ai'
//import { z } from 'zod'
import { createPool, endPool } from '@/lib/postgres'

interface ChatRequest {
    messages: {
        role: string
        content: string
    }[]
}

interface EmbeddingsRow {
    content: string
    metadata: unknown
    vector: number[]
}

// sets max streaming response time to 30 seconds
export const maxDuration = 30

/*const generateChunks = (input: string) => {
    return input
        .trim()
        .split('.')
        .filter(i => i !== '')
}*/

const getEmbedding = async (question: string): Promise<number[]> => {

    //const chunks = generateChunks(question)

    const ollamaProvider = createOllama({
        baseURL: 'http://localhost:11434/api'
    })

    //const embeddingModel = ollamaProvider.embedding('nomic-embed-text:latest')
    const embeddingModel = ollamaProvider.embedding('deepseek-r1:1.5b')

    try {
        /*const { embeddings } = await embedMany({
            model: embeddingModel,
            values: chunks,
        })*/
        const result = await embed({
            model: embeddingModel,
            value: question,
        })

        return result.embedding
    } catch (error) {
        console.error('Error getting embeddings:', error)
        throw new Error('Error getting embeddings')
    }

}

const findKnowledge = async (question: string) => {

    const pgPool = createPool()

    pgPool.on('error', (error) => {
        console.error('Error connecting to Postgres:', error)
    })

    try {

        const embedding = await getEmbedding(question)

        const embeddingString = `[${embedding.map(e => e.toFixed(6)).join(',')}]`

        // good old sql :)
        const query = `
            SELECT content, metadata
            FROM vectors
            ORDER BY vector <#> $1 ASC
            LIMIT 5
        `

        const result = await pgPool.query<EmbeddingsRow>(query, [embeddingString])

        if (result.rows.length > 0) {

            const knowledge = result.rows.map(row => ({
                content: row.content,
                metadata: row.metadata
            }))

            const knowledgeContent = knowledge.map(k => k.content).join(' ')

            return knowledgeContent

        } else {
            return null
        }

    } catch (error) {
        let message = 'Error while finding knowledge'
        const errorString = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown error')
        message += errorString !== '' ? ` (${errorString})` : ''
        throw new Error(message)
    } finally {
        await endPool(pgPool)
    }
}

export async function POST(req: Request) {

    const body = await req.json() as ChatRequest
    const messages = body.messages as CoreMessage[]

    const ollamaProvider = createOllama({
        baseURL: 'http://localhost:11434/api',
    })

    const ollamaModel = ollamaProvider('deepseek-r1:1.5b')
    // if your device is powerful enough, you can try a larger model:
    //const ollamaModel = ollamaProvider('deepseek-r1:8b-llama-distill-q8_0')

    let knowledge = null
    const lastMessage = messages[messages.length - 1].content

    try {
        if (typeof lastMessage !== 'string') {
            throw new Error('Message content must be a string')
        }
        knowledge = await findKnowledge(lastMessage)
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'unknown error'
        return new Response(errorMessage, { status: 500 })
    }

    let prompt = 'You are a helpful onboarding AI and your job is answer questions from new co-workers using internal documentation as context.'

    if (typeof knowledge === 'string' && knowledge !== '') {
        prompt += `When reasoning or responding, use the following knowledge (from the internal documents of the company) as context:
        ${knowledge}`
    }

    prompt += 'End every response with the sentence "Happy coding!"'

    const result = streamText({
        model: ollamaModel,
        prompt: prompt,
        //messages,
        //maxTokens: 500,
        /*tools: {
            getKnowledge: tool({
                description: 'get information from your knowledge base to answer questions.',
                parameters: z.object({
                    question: z.string().describe('the users question'),
                }),
                execute: async ({ question }) => {
                    console.log('getKnowledge tool executing for: ', question)
                    const knowledge = await findKnowledge(question)
                    console.log('getKnowledge tool result: ', knowledge)
                    return 'foo bar'
                },
            })
        },
        toolChoice: {
            type: 'tool',
            toolName: 'getKnowledge'
        },*/
    })

    return result.toDataStreamResponse({
        getErrorMessage: (error) => {
            const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown error')
            console.error(message)
            return 'An error occurred'
        },
    })

}