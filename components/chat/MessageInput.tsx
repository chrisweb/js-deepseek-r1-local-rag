import Form from '@/components/base/Form'
import Input from '@/components/base/Input'
import Button from '@/components/base/Button'

const MessageInput: React.FC = () => {
    return (
        <Form>
            <Input />
            <Button type="submit">
                Send
            </Button>
        </Form>
    )
}

export default MessageInput