import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import PromoDetail from './PromoDetail';
import { buildDetailMetadata } from '@/lib/seo/metadata';

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();
    const { data: promo } = await supabase
        .from('promotions')
        .select('titulo, descripcion, fotos')
        .eq('id', id)
        .single();

    if (!promo) {
        return { title: 'Promoción no encontrada | DescubrePR' };
    }

    const description = promo.descripcion
        ? promo.descripcion.slice(0, 160)
        : `${promo.titulo} en DescubrePR.`;

    const image = promo.fotos?.[0] || 'https://images.unsplash.com/photo-1542157585-ef20bbcce1b6?auto=format&fit=crop&q=80';

    return buildDetailMetadata({
        title: `${promo.titulo} | DescubrePR`,
        description,
        path: `/promos/${id}`,
        image,
        keywords: [promo.titulo, 'promociones Puerto Rico', 'ofertas'],
    });
}

export default async function PromoDetailPage({ params }: Props) {
    const { id } = await params;
    return <PromoDetail id={id} />;
}
