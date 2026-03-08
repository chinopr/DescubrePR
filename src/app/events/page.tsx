import EventsPageClient from './EventsPageClient';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
    title: 'Eventos en Puerto Rico',
    description: 'Encuentra conciertos, festivales, actividades y eventos próximos alrededor de Puerto Rico.',
    path: '/events',
    keywords: ['eventos Puerto Rico', 'festivales', 'actividades', 'conciertos', 'agenda PR'],
    image: 'https://images.unsplash.com/photo-1533174000220-db9284bd06b0?auto=format&fit=crop&w=1200&q=80',
});

export default function EventsPage() {
    return <EventsPageClient />;
}
