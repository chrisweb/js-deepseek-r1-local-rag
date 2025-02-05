import Input, { type InputProps } from '@mui/material/Input'

export type BaseInputProps = InputProps

const BaseInput: React.FC<BaseInputProps> = (props) => {

    return (
        <Input {...props} />
    )
}

export default BaseInput