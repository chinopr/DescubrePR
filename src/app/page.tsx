import HomeClient from './HomeClient';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
    title: 'Descubre lo mejor de Puerto Rico',
    description: 'Explora lugares, eventos, promociones y negocios en Puerto Rico desde una sola plataforma.',
    path: '/',
    keywords: ['Puerto Rico', 'lugares', 'eventos', 'promociones', 'negocios', 'turismo local'],
    image: 'https://images.unsplash.com/photo-1620982363177-386dbe3eb16b?auto=format&fit=crop&w=1200&q=80',
});

export default function HomePage() {
    return <HomeClient />;
}
