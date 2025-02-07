import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'

import './globals.css'
import '@mui/material-pigment-css/styles.css'

export const metadata: Metadata = {
    title: 'Create Next App',
    description: 'Generated by create next app',
}

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-roboto',
})

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className={roboto.variable}>
                {children}
            </body>
        </html>
    )
}
