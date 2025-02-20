import { createOllama } from 'ollama-ai-provider'
import { streamText } from 'ai'
import { type CoreMessage } from 'ai'

interface ChatRequest {
    messages: {
        role: string
        content: string
    }[]
}

// sets max streaming response time to 30 seconds
export const maxDuration = 30

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

    const prompt = `You are a helpful AI chat bot.
    You should answer the following question: "${lastMessage}"\n\n`

    const result = streamText({
        model: ollamaModel,
        prompt: prompt,
        temperature: 0.1,
        //messages,
        //maxTokens: 500,
        //experimental_continueSteps: true,
        //experimental_telemetry: {},
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
        /*onChunk({ chunk }) {
            console.log('chunk: ', chunk)
        },*/
        /*onFinish({ text, finishReason, usage, response }) {
            console.log('text: ', text)
            console.log('finishReason: ', finishReason)
            console.log('usage: ', usage)
            console.log('response: ', response)
        },*/
        //experimental_transform: smoothStream({ chunking: 'line' }),
    })

    return result.toDataStreamResponse({
        getErrorMessage: (error) => {
            const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown error')
            console.error(message)
            return message
        },
    })

}