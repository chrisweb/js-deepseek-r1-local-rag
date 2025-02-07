'use client'

import Form from '@/components/base/Form'
import Input from '@/components/base/Input'
import Button from '@/components/base/Button'

const MessageInput: React.FC = () => {


    const onSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {

        const formData = new FormData(event.currentTarget)

        event.preventDefault()

        // use the entries (names and values) or values (only values)
        formData.entries().forEach(([name, value], index) => {
            console.log('name, value, index: ', name, value, index)
        })

    }

    return (
        <Form onSubmit={onSubmitHandler}>
            <Input name="prompt" />
            <Button type="submit">s</Button>
        </Form>
    )
}

export default MessageInput