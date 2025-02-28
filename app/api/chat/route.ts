import { createOllama } from 'ollama-ai-provider'
import { streamText, embed } from 'ai'
import { type CoreMessage } from 'ai'
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
            SELECT content, metadata, vector <=> $1 AS distance
            FROM vectors
            ORDER BY distance
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

const getEmbedding = async (question: string): Promise<number[]> => {

    const ollamaProvider = createOllama({
        baseURL: 'http://localhost:11434/api'
    })

    const embeddingModel = ollamaProvider.embedding('nomic-embed-text:latest')
    //const embeddingModel = ollamaProvider.embedding('deepseek-r1:1.5b')

    try {
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

export async function POST(req: Request) {

    const body = await req.json() as ChatRequest
    const messages = body.messages as CoreMessage[]

    const ollamaProvider = createOllama({
        baseURL: 'http://localhost:11434/api',
    })

    const ollamaModel = ollamaProvider('deepseek-r1:1.5b')
    // if your device is powerful enough, you can try a larger model:
    //const ollamaModel = ollamaProvider('deepseek-r1:8b-llama-distill-q8_0')

    const lastMessage = messages[messages.length - 1].content
    let knowledge = null

    try {
        if (typeof lastMessage !== 'string') {
            throw new Error('Message content must be a string')
        }
        knowledge = await findKnowledge(lastMessage)
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'unknown error'
        return new Response(errorMessage, { status: 500 })
    }

    let prompt = `You are a helpful AI chat bot.
    You should answer the following question: "${lastMessage}"\n\n`

    if (typeof knowledge === 'string' && knowledge !== '') {
        prompt += `When answering you should use the following knowledge:
        <knowledge>${knowledge}</knowledge>\n\n`
    }

    prompt += 'End every response with the sentence "Happy coding!"'

    const result = streamText({
        model: ollamaModel,
        prompt: prompt,
        temperature: 0.1,
    })

    return result.toDataStreamResponse({
        getErrorMessage: (error) => {
            const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown error')
            console.error(message)
            return message
        },
    })

}