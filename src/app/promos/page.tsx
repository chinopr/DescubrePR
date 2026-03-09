import PromosPageClientActions from './PromosPageClientActions';
import Header from '@/components/ui/Header';
import MobileNav from '@/components/ui/MobileNav';
import PromoCard from '@/components/ui/PromoCard';
import { createClient } from '@/lib/supabase/server';
import type { Promotion } from '@/lib/types/database';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { isMissingBoostColumnError } from '@/lib/supabase/boost-fallback';

type PromotionWithBusiness = Promotion & { businesses?: { nombre: string } };

export const metadata = buildPageMetadata({
    title: 'Promociones y ofertas en Puerto Rico',
    description: 'Encuentra descuentos, ofertas y promociones locales activas en todo Puerto Rico.',
    path: '/promos',
    keywords: ['promociones Puerto Rico', 'ofertas', 'descuentos', 'deals locales'],
    image: 'https://images.unsplash.com/photo-1542157585-ef20bbcce1b6?auto=format&fit=crop&w=1200&q=80',
});

export default async function PromosPage() {
    const supabase = await createClient();
    let response = await supabase
        .from('promotions')
        .select('*, businesses(nombre)')
        .eq('estado', 'approved')
        .gte('end_date', new Date().toISOString().split('T')[0])
        .order('boost_score', { ascending: false })
        .order('destacado', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20);

    if (isMissingBoostColumnError(response.error)) {
        response = await supabase
            .from('promotions')
            .select('*, businesses(nombre)')
            .eq('estado', 'approved')
            .gte('end_date', new Date().toISOString().split('T')[0])
            .order('destacado', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(20);
    }

    const promos = (response.data || []) as PromotionWithBusiness[];

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark pb-16 md:pb-0">
            <Header />

            <main className="px-4 md:px-10 py-6 md:py-8 flex flex-1 justify-center">
                <div className="max-w-[1200px] w-full flex flex-col gap-8">
                    <div className="flex flex-col items-center text-center justify-center py-8">
                        <h1 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 dark:text-white"><span className="text-primary">Ahorra</span> en Puerto Rico</h1>
                        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mb-4">
                            Descubre las mejores ofertas, descuentos y promociones locales.
                        </p>
                        <PromosPageClientActions />
                    </div>

                    {promos.length === 0 ? (
                        <div className="text-center py-16 text-slate-500 dark:text-slate-400">
                            <span className="material-symbols-outlined text-5xl mb-2 block">local_offer</span>
                            <p className="text-lg">No hay promociones activas en este momento.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {promos.map(promo => (
                                <PromoCard
                                    key={promo.id}
                                    id={promo.id}
                                    title={promo.titulo}
                                    businessName={promo.businesses?.nombre || ''}
                                    location={promo.codigo ? `Código: ${promo.codigo}` : ''}
                                    discountBadge={promo.codigo || undefined}
                                    imageUrl={promo.fotos[0] || 'https://images.unsplash.com/photo-1542157585-ef20bbcce1b6?auto=format&fit=crop&q=80'}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <MobileNav />
        </div>
    );
}
