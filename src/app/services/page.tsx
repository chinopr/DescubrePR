import ServicesPageClient from './ServicesPageClient';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
    title: 'Clasificados y servicios en Puerto Rico',
    description: 'Descubre servicios, productos y alquileres publicados por la comunidad en Puerto Rico.',
    path: '/services',
    keywords: ['clasificados Puerto Rico', 'servicios', 'productos', 'alquileres', 'anuncios locales'],
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
});

export default function ServicesPage() {
    return <ServicesPageClient />;
}
