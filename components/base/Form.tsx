'use client'

import type React from 'react'
import FormControl from '@mui/material/FormControl'

export type BaseFormProps = React.PropsWithChildren<React.FormHTMLAttributes<HTMLFormElement>>

const BaseForm: React.FC<BaseFormProps> = (props) => {

    const { children, ...rest } = props

    return (
        <form {...rest}>
            <FormControl>
                {children}
            </FormControl>
        </form>
    )
}

export default BaseForm