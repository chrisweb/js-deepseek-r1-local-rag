import type React from 'react'
import styles from './page.module.css'
import ChatClient from '@/components/chat/Client'

export default function Home() {

    return (
        <div className={styles.page}>
            <ChatClient />
        </div>
    )
}