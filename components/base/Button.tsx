import Button, { type ButtonProps } from '@mui/material/Button'

export type BaseButtonProps = ButtonProps

const BaseButton: React.FC<BaseButtonProps> = (props) => {

    const { children, ...rest } = props

    return (
        <Button {...rest}>
            {children}
        </Button>
    )
}

export default BaseButton