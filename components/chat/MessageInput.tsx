'use client'

import Form from '@/components/base/Form'
import Input from '@/components/base/Input'
import Button from '@/components/base/Button'
import submitAction from '@/actions/chat/Submit'

const MessageInput: React.FC = () => {
    return (
        <Form action={submitAction}>
            <Input name="prompt" />
            <Button type="submit">s</Button>
        </Form>
    )
}

export default MessageInput