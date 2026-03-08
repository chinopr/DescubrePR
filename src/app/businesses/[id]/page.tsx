import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import BusinessDetail from './BusinessDetail';
import { buildDetailMetadata } from '@/lib/seo/metadata';

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();
    const { data: business } = await supabase
        .from('businesses')
        .select('nombre, descripcion, municipio, categorias')
        .eq('id', id)
        .single();

    if (!business) {
        return { title: 'Negocio no encontrado | DescubrePR' };
    }

    const description = business.descripcion
        ? business.descripcion.slice(0, 160)
        : `${business.nombre} en ${business.municipio}, Puerto Rico. ${business.categorias?.join(', ') || ''}`;

    const image = 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80';

    return buildDetailMetadata({
        title: `${business.nombre} - ${business.municipio} | DescubrePR`,
        description,
        path: `/businesses/${id}`,
        image,
        keywords: [business.nombre, business.municipio, 'Puerto Rico', ...(business.categorias || [])],
    });
}

export default async function BusinessDetailPage({ params }: Props) {
    const { id } = await params;
    return <BusinessDetail id={id} />;
}
