import type { NextConfig } from "next";
import nextPwa from "next-pwa";

const withPWA = nextPwa({
  dest: "public",
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  fallbacks: {
    document: "/_offline",
  },
  disable: process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_ENABLE_PWA_DEV !== "1",
});

const nextConfig: NextConfig = {
  distDir: '/tmp/descubrepr-next',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lgqtifzazzwjcoldgcxh.supabase.co' },
    ],
  },
  // Keep the config explicit while next-pwa still patches webpack under Next 16.
  turbopack: {},
};

export default withPWA(nextConfig);
