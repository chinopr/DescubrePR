import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://descubrepr.com';

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${baseUrl}/events`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/promos`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
        { url: `${baseUrl}/map`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ];

    // Dynamic pages: places
    const { data: places } = await supabase
        .from('places')
        .select('id, updated_at')
        .eq('estado', 'published');

    const placePages: MetadataRoute.Sitemap = (places || []).map(place => ({
        url: `${baseUrl}/places/${place.id}`,
        lastModified: place.updated_at ? new Date(place.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // Dynamic pages: businesses
    const { data: businesses } = await supabase
        .from('businesses')
        .select('id, updated_at')
        .eq('estado', 'published');

    const businessPages: MetadataRoute.Sitemap = (businesses || []).map(biz => ({
        url: `${baseUrl}/businesses/${biz.id}`,
        lastModified: biz.updated_at ? new Date(biz.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [...staticPages, ...placePages, ...businessPages];
}
