import { type ButtonHTMLAttributes } from 'react'

export type BaseButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

const BaseButton: React.FC<BaseButtonProps> = (props) => {

    const { children, ...rest } = props

    return (
        <button {...rest}>
            {children}
        </button>
    )
}

export default BaseButton