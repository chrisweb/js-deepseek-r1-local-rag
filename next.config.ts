import type { NextConfig } from 'next'
import { withPigment, type PigmentOptions } from '@pigment-css/nextjs-plugin'
import { createTheme } from '@mui/material'

const nextConfig: NextConfig = {
    /* config options here */
}

const pigmentConfig: PigmentOptions = {
    theme: createTheme({
        cssVariables: {
            colorSchemeSelector: 'class',
        },
        colorSchemes: { light: true, dark: true },
        typography: {
            fontFamily: 'var(--font-roboto)',
        },
    }),
    transformLibraries: ['@mui/material'],
}

export default withPigment(nextConfig, pigmentConfig)