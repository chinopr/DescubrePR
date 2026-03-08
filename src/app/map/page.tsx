import MapPageClient from './MapPageClient';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
    title: 'Mapa de lugares y negocios en Puerto Rico',
    description: 'Explora un mapa con lugares y negocios publicados en Puerto Rico para descubrir qué hay cerca de ti.',
    path: '/map',
    keywords: ['mapa Puerto Rico', 'lugares cerca de mí', 'negocios PR', 'explorar Puerto Rico'],
});

export default function MapPage() {
    return <MapPageClient />;
}
