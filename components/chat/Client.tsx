'use client'

import { useEffect, useRef } from 'react'
import Form from '@/components/base/Form'
import Input from '@/components/base/Input'
import Button from '@/components/base/Button'
import { useChat } from '@ai-sdk/react'
import Markdown from 'react-markdown'

const ChatClient: React.FC = () => {

    const { messages, input, handleInputChange, handleSubmit, status } = useChat(
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

    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (messagesEndRef.current) {
            const scrollToBottom = () => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            }
            setTimeout(scrollToBottom, 100)
        }
    }, [messages])

    function MessageFormatter({ content }: { content: string }) {
        if (content.includes("<think>")) {
            let parts: string[] = []
            if (content.includes("</think>")) {
                parts = content.split(/<think>|<\/think>/)
            } else {
                parts = content.split(/<think>/)
            }
            if (parts.length >= 3) {
                return (
                    <>
                        <div className="message-content">{parts[0]}</div>
                        {parts.length > 1 && (
                            <div className="think-element">
                                <div className="message-content">
                                    <Markdown>{parts[1]}</Markdown>
                                </div>
                            </div>
                        )}
                        {parts.length > 2 && (
                            <div className="message-content">
                                <strong>Conclusion: </strong>
                                <Markdown>{parts[2]}</Markdown>
                            </div>
                        )
                        }
                    </>
                )
            } else if (parts.length >= 2) {
                return (
                    <>
                        <div className="message-content">{parts[0]}</div>
                        <div className="think-element">
                            <div className="message-content">
                                <Markdown>{parts[1]}</Markdown>
                            </div>
                        </div>
                    </>
                )
            }
        }
        return (
            <>
                <div className="message-content">
                    <Markdown>{content}</Markdown>
                </div>
            </>
        )
    }

    return (
        <>
            <div className="messages-container">
                <div key="welcome_human" className="message message-bot">
                    <div className="message-content">
                        <strong>AI:</strong>
                        Hello human, how can I help you today?
                    </div>
                    <div className="message-timestamp">just now</div>
                </div>
                {messages.length > 0 && (
                    <>
                        {messages.map(message => (
                            <div key={message.id} className={`message ${message.role === 'user' ? 'message-user' : 'message-bot'}`}>
                                <div className="message-content">
                                    <strong>{message.role === 'user' ? 'User: ' : 'AI: '}</strong>
                                    <MessageFormatter content={message.content} />
                                </div>
                                <div className="message-timestamp">
                                    {message.createdAt instanceof Date ? message.createdAt.toLocaleString() : message.createdAt ?? 'just now'}
                                </div>
                            </div>
                        ))}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div >
            <Form onSubmit={handleSubmit} className="form-container">
                <Input type="text" name="prompt" value={input} onChange={handleInputChange} placeholder="Ask me anything..." aria-label="Message input" className="message-input" />
                <Button type="submit" className="form-button" disabled={status === 'streaming' ? true : false} aria-label="Send message">{status === 'streaming' ? '🧠' : (status === 'submitted' ? '💭' : '🤖')}</Button>
            </Form>
        </>
    )
}

export default ChatClient