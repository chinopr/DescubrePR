import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import EventDetail from './EventDetail';
import { buildDetailMetadata } from '@/lib/seo/metadata';

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();
    const { data: event } = await supabase
        .from('events')
        .select('titulo, descripcion, municipio, fotos')
        .eq('id', id)
        .single();

    if (!event) {
        return { title: 'Evento no encontrado | DescubrePR' };
    }

    const description = event.descripcion
        ? event.descripcion.slice(0, 160)
        : `${event.titulo} en ${event.municipio}, Puerto Rico.`;

    const image = event.fotos?.[0] || 'https://images.unsplash.com/photo-1533174000220-db9284bd06b0?auto=format&fit=crop&q=80';

    return buildDetailMetadata({
        title: `${event.titulo} - ${event.municipio} | DescubrePR`,
        description,
        path: `/events/${id}`,
        image,
        keywords: [event.titulo, event.municipio, 'eventos Puerto Rico'],
    });
}

export default async function EventDetailPage({ params }: Props) {
    const { id } = await params;
    return <EventDetail id={id} />;
}
