declare module 'next-pwa' {
    import type { NextConfig } from 'next'

    type NextPwaOptions = {
        dest: string
        register?: boolean
        skipWaiting?: boolean
        disable?: boolean
        cacheOnFrontEndNav?: boolean
        reloadOnOnline?: boolean
        fallbacks?: {
            document?: string
            image?: string
            audio?: string
            video?: string
            font?: string
            data?: string
        }
    }

    export default function nextPwa(options: NextPwaOptions): (config: NextConfig) => NextConfig
}
