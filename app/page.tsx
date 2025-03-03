import ChatClient from '@/components/chat/Client'

export default function Home() {

    return (
        <section className="chat-container">
            <header className="chat-header">
                <h1>AI chatbot example</h1>
                <p className="tagline">Local DeepSeek-R1 chatbot and RAG</p>
            </header>
            <main>
                <ChatClient />
            </main>
        </section>
    )
}