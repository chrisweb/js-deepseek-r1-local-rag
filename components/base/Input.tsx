import { type InputHTMLAttributes } from 'react'

export type BaseInputProps = InputHTMLAttributes<HTMLInputElement>

const BaseInput: React.FC<BaseInputProps> = (props) => {

    return (
        <input {...props} />
    )
}

export default BaseInput