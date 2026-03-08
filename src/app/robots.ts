import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://descubrepr.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/dashboard/', '/profile', '/favorites'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
