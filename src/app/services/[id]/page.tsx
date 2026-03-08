import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ServiceDetail from './ServiceDetail';
import { buildDetailMetadata } from '@/lib/seo/metadata';

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();
    const { data: service } = await supabase
        .from('service_listings')
        .select('titulo, descripcion, municipio, fotos')
        .eq('id', id)
        .single();

    if (!service) {
        return { title: 'Clasificado no encontrado | DescubrePR' };
    }

    const description = service.descripcion
        ? service.descripcion.slice(0, 160)
        : `${service.titulo} en ${service.municipio}, Puerto Rico.`;

    const image = service.fotos?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80';

    return buildDetailMetadata({
        title: `${service.titulo} - ${service.municipio} | DescubrePR`,
        description,
        path: `/services/${id}`,
        image,
        keywords: [service.titulo, service.municipio, 'clasificados Puerto Rico', 'servicios'],
    });
}

export default async function ServiceDetailPage({ params }: Props) {
    const { id } = await params;
    return <ServiceDetail id={id} />;
}
