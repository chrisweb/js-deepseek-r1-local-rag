import type React from 'react'
import styles from './page.module.css'
import MessageInput from '@/components/chat/MessageInput'

export default function Home() {
    return (
        <div className={styles.page}>
            <MessageInput />
        </div>
    )
}
