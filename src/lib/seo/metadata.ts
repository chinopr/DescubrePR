import type { Metadata } from 'next';

const DEFAULT_OG_IMAGE = '/icon-512x512.png';

type BuildPageMetadataInput = {
    title: string;
    description: string;
    path: string;
    keywords?: string[];
    image?: string;
};

export function buildPageMetadata({
    title,
    description,
    path,
    keywords = [],
    image = DEFAULT_OG_IMAGE,
}: BuildPageMetadataInput): Metadata {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://descubrepr.com';
    const canonicalUrl = new URL(path, baseUrl).toString();

    return {
        title,
        description,
        alternates: {
            canonical: path,
        },
        keywords,
        openGraph: {
            title,
            description,
            type: 'website',
            siteName: 'DescubrePR',
            locale: 'es_PR',
            url: canonicalUrl,
            images: [{ url: image, width: 1200, height: 630, alt: title }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        },
    };
}

type BuildDetailMetadataInput = {
    title: string;
    description: string;
    path: string;
    image?: string;
    keywords?: string[];
};

export function buildDetailMetadata({
    title,
    description,
    path,
    image = DEFAULT_OG_IMAGE,
    keywords = [],
}: BuildDetailMetadataInput): Metadata {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://descubrepr.com';
    const canonicalUrl = new URL(path, baseUrl).toString();

    return {
        title,
        description,
        alternates: {
            canonical: path,
        },
        keywords,
        openGraph: {
            title,
            description,
            type: 'article',
            siteName: 'DescubrePR',
            locale: 'es_PR',
            url: canonicalUrl,
            images: [{ url: image, width: 1200, height: 630, alt: title }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        },
    };
}
