import type { NextConfig } from 'next'
import { withPigment, type PigmentOptions } from '@pigment-css/nextjs-plugin'
import { createTheme } from '@mui/material'

const nextConfig: NextConfig = {
    // Next.js configuration options
}

const pigmentConfig: PigmentOptions = {
    theme: createTheme({
        typography: {
            fontFamily: 'var(--font-roboto)',
        },
    }),
    transformLibraries: ['@mui/material'],
}

export default withPigment(nextConfig, pigmentConfig)