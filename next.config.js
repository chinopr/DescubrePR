/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'lgqtifzazzwjcoldgcxh.supabase.co',
            }
        ],
    },
    // Fix Next 16 Turbopack compatibility with next-pwa webpack modifications
    experimental: {
        // next-pwa modifies webpack config, so we explicitly provide an empty turbopack config
        // to silence the NEXT 16 error, or we could just opt-out of turbopack in package.json
    },
    turbopack: {} // Setting empty turbopack config to silence the error as suggested by Next.js
};

module.exports = withPWA(nextConfig);
