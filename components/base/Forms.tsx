import { type FormHTMLAttributes } from 'react'

export type BaseFormProps = FormHTMLAttributes<HTMLFormElement>

const BaseForm: React.FC<BaseFormProps> = (props) => {

    const { children, ...rest } = props

    return (
        <form {...rest}>
            <form>
                {children}
            </form>
        </form>
    )
}

export default BaseForm