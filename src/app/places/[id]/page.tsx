import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import PlaceDetail from './PlaceDetail';
import { buildDetailMetadata } from '@/lib/seo/metadata';

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();
    const { data: place } = await supabase
        .from('places')
        .select('nombre, descripcion, municipio, fotos, categorias')
        .eq('id', id)
        .single();

    if (!place) {
        return { title: 'Lugar no encontrado | DescubrePR' };
    }

    const description = place.descripcion
        ? place.descripcion.slice(0, 160)
        : `Descubre ${place.nombre} en ${place.municipio}, Puerto Rico.`;

    const image = place.fotos?.[0] || 'https://images.unsplash.com/photo-1620982363177-386dbe3eb16b?auto=format&fit=crop&q=80';

    return buildDetailMetadata({
        title: `${place.nombre} - ${place.municipio} | DescubrePR`,
        description,
        path: `/places/${id}`,
        image,
        keywords: [place.nombre, place.municipio, 'Puerto Rico', ...(place.categorias || [])],
    });
}

export default async function PlaceDetailPage({ params }: Props) {
    const { id } = await params;
    return <PlaceDetail id={id} />;
}
