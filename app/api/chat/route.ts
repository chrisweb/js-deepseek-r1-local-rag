import { createOllama } from 'ollama-ai-provider'
import { streamText, tool, embed } from 'ai'
import { type CoreMessage } from 'ai'
import { z } from 'zod'
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
}

// allow streaming responses up to 30 seconds
export const maxDuration = 30

/*const generateChunks = (input: string) => {
    return input
        .trim()
        .split('.')
        .filter(i => i !== '')
}*/

const getEmbeddings = async (question: string) => {

    //const chunks = generateChunks(question)

    const ollamaProvider = createOllama({
        baseURL: 'http://localhost:11434/api'
    })

    const embeddingModel = ollamaProvider.embedding('nomic-embed-text:latest')

    try {
        /*const { embeddings } = await embedMany({
            model: embeddingModel,
            values: chunks,
        })*/
        const embeddings = await embed({
            model: embeddingModel,
            value: question,
        })

        return embeddings
    } catch (error) {
        console.error('Error finding knowledge:', error)
        throw new Error('Error finding knowledge')
    }

}

const findKnowledge = async (question: string) => {

    console.log('finding knowledge for: ', question)

    const pgPool = createPool()

    pgPool.on('error', (error) => {
        console.error('Error connecting to Postgres:', error)
    })

    try {

        const embeddings = await getEmbeddings(question)

        // good old sql :)
        const query = `
            SELECT content, metadata
            FROM documents
            ORDER BY embedding <-> $1
            LIMIT 5
        `

        const result = await pgPool.query<EmbeddingsRow>(query, [embeddings])

        if (result.rows.length > 0) {

            const knowledge = result.rows.map(row => ({
                content: row.content,
                metadata: row.metadata
            }))

            console.log('knowledge found: ', knowledge)

            const knowledgeContent = knowledge.map(k => k.content).join(' ')

            return knowledgeContent

        } else {
            const message = 'Sorry, I don\'t know that.'
            return message
        }

    } catch (error) {
        console.error('Error finding knowledge:', error)
        throw new Error('Error finding knowledge')
    } finally {
        await endPool(pgPool)
        console.log('pool closed')
    }
}

export async function POST(req: Request) {

    const ollamaProvider = createOllama({
        baseURL: 'http://localhost:11434/api',
    })

    const ollamaModel = ollamaProvider('deepseek-r1:1.5b')

    const prompt = `You are a helpful onboarding AI that guides new co-workers so that they can get started quickly.
    Your answers are short and to the point.
    If no relevant information is found, respond with "Sorry, I don't know that.".
    Only respond to questions using the following information:`

    const body = await req.json() as ChatRequest
    const messages = body.messages as CoreMessage[]

    const result = streamText({
        model: ollamaModel,
        system: prompt,
        messages,
        //maxTokens: 500,
        tools: {
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
        },
    })

    return result.toDataStreamResponse({
        getErrorMessage: (error) => {
            const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown error')
            console.error(message)
            return 'An error occurred'
        },
    })

}