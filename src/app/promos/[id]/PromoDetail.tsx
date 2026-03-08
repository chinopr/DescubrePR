'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import MobileNav from '@/components/ui/MobileNav';
import FavoriteButton from '@/components/ui/FavoriteButton';
import ShareButtons from '@/components/ui/ShareButtons';
import { createClient } from '@/lib/supabase/client';
import type { Promotion } from '@/lib/types/database';

type PromotionWithBusiness = Promotion & {
    businesses?: { id: string; nombre: string; municipio: string | null } | null;
};

export default function PromoDetail({ id }: { id: string }) {
    const [promo, setPromo] = useState<PromotionWithBusiness | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchPromo() {
            const { data } = await supabase
                .from('promotions')
                .select('*, businesses(id, nombre, municipio)')
                .eq('id', id)
                .single();
            setPromo(data as PromotionWithBusiness | null);
            setLoading(false);
        }
        fetchPromo();
    }, [id, supabase]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (!promo) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <span className="material-symbols-outlined text-6xl text-slate-300">local_offer</span>
            <p className="text-xl text-slate-500">Promoción no encontrada</p>
        </div>
    );

    const mainPhoto = promo.fotos[0] || 'https://images.unsplash.com/photo-1542157585-ef20bbcce1b6?auto=format&fit=crop&q=80';
    const validity = `${new Date(promo.start_date).toLocaleDateString('es-PR', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date(promo.end_date).toLocaleDateString('es-PR', { day: 'numeric', month: 'short', year: 'numeric' })}`;

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark pb-16 md:pb-0">
            <Header />

            <main className="flex-1 w-full max-w-[1100px] mx-auto bg-white dark:bg-slate-900 md:my-8 md:rounded-2xl md:shadow-sm overflow-hidden border-x border-y-0 md:border-y border-slate-200 dark:border-slate-800">
                <div className="relative w-full h-[34vh] md:h-[42vh] bg-slate-200 dark:bg-slate-800">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${mainPhoto}")` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/30" />
                    <div className="absolute top-4 right-4 flex gap-2">
                        <FavoriteButton id={promo.id} type="promotion" />
                        <ShareButtons title={promo.titulo} text={promo.descripcion || promo.titulo} hashtags={['PuertoRico', 'Promociones']} />
                    </div>
                    <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                        <span className="bg-primary px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase mb-2 inline-block">
                            {promo.codigo || 'PROMO'}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black mb-2">{promo.titulo}</h1>
                        {promo.businesses?.nombre && (
                            <div className="flex items-center gap-2 text-lg font-medium opacity-90">
                                <span className="material-symbols-outlined text-[20px]">storefront</span>
                                {promo.businesses.nombre}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 p-6 md:p-8">
                    <div className="flex-1 flex flex-col gap-8">
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Detalles de la promoción</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                                {promo.descripcion || 'Sin descripción disponible.'}
                            </p>
                        </section>

                        {promo.condiciones && (
                            <section>
                                <h3 className="text-xl font-bold mb-3">Condiciones</h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{promo.condiciones}</p>
                            </section>
                        )}
                    </div>

                    <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">sell</span>
                                Resumen
                            </h3>
                            <div className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Válida</p>
                                    <p>{validity}</p>
                                </div>
                                {promo.codigo && (
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Código</p>
                                        <p className="inline-flex mt-1 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">{promo.codigo}</p>
                                    </div>
                                )}
                                {promo.businesses?.id && (
                                    <Link
                                        href={`/businesses/${promo.businesses.id}`}
                                        className="mt-2 w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                                    >
                                        <span className="material-symbols-outlined">storefront</span>
                                        Ver negocio
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <MobileNav />
        </div>
    );
}
