import type { NextConfig } from 'next'
import { withPigment, extendTheme } from '@pigment-css/nextjs-plugin'

const theme = extendTheme({})

const nextConfig: NextConfig = {
    /* config options here */
}

export default withPigment(nextConfig, { theme })