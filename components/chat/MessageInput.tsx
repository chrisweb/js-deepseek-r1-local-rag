'use client'

import Form from '@/components/base/Form'
import Input from '@/components/base/Input'
import Button from '@/components/base/Button'
//import submitAction from '@/actions/chat/Submit'
import { useChat } from '@ai-sdk/react'

const MessageInput: React.FC = () => {

    /*return (
        <Form action={submitAction}>
            <Input name="prompt" />
            <Button type="submit">s</Button>
        </Form>
    )*/

    const { messages, input, handleInputChange, handleSubmit } = useChat(
        {
            // value is in milliseconds
            //experimental_throttle: 50,
            //maxSteps: 3,
            onError: (error) => {
                console.error('useChat onError: ', error)
            },
            /*onFinish: (message) => {
                console.log('useChat onFinish: ', message)
            },
            onResponse: (response) => {
                console.log('useChat onResponse: ', response)
            },*/
        }
    )

    return (
        <>
            {messages.map(message => (
                <div key={message.id}>
                    {message.role === 'user' ? 'User: ' : 'AI: '}
                    {message.content}
                </div>
            ))}

            <Form onSubmit={handleSubmit}/*action={submitAction}*/>
                <Input name="prompt" value={input} onChange={handleInputChange} />
                <Button type="submit">s</Button>
            </Form>
        </>
    )
}

export default MessageInput