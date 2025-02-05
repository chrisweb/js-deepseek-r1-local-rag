'use client'

import type React from 'react'
import FormControl from '@mui/material/FormControl'

export type BaseFormProps = React.PropsWithChildren<React.FormHTMLAttributes<HTMLFormElement>>

const BaseForm: React.FC<BaseFormProps> = (props) => {

    const { children, ...rest } = props

    const onSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {

        const formData = new FormData(event.currentTarget)

        event.preventDefault()

        console.log(formData)

    }

    return (
        <form onSubmit={onSubmitHandler} {...rest}>
            <FormControl>
                {children}
            </FormControl>
        </form>
    )
}

export default BaseForm