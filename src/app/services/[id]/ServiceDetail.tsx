'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/ui/Header';
import MobileNav from '@/components/ui/MobileNav';
import EngagementViewTracker from '@/components/ui/EngagementViewTracker';
import FavoriteButton from '@/components/ui/FavoriteButton';
import ShareButtons from '@/components/ui/ShareButtons';
import dynamic from 'next/dynamic';
import { trackEngagement } from '@/lib/engagement/tracking';
import { createClient } from '@/lib/supabase/client';
import type { ServiceListing } from '@/lib/types/database';

const MapView = dynamic(() => import('@/components/ui/MapView'), { ssr: false });

const TYPE_LABEL: Record<string, string> = {
    servicio: 'Servicio',
    producto: 'Producto',
    alquiler: 'Alquiler',
};

export default function ServiceDetail({ id }: { id: string }) {
    const [service, setService] = useState<ServiceListing | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchService() {
            const { data } = await supabase
                .from('service_listings')
                .select('*')
                .eq('id', id)
                .single();
            setService(data);
            setLoading(false);
        }
        fetchService();
    }, [id, supabase]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (!service) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <span className="material-symbols-outlined text-6xl text-slate-300">storefront</span>
            <p className="text-xl text-slate-500">Clasificado no encontrado</p>
        </div>
    );

    const mainPhoto = service.fotos[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80';
    const priceLabel = service.precio && service.precio > 0 ? `$${service.precio.toLocaleString()}` : 'Contactar';

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark pb-16 md:pb-0">
            <EngagementViewTracker targetType="service" targetId={service.id} />
            <Header />

            <main className="flex-1 w-full max-w-[1100px] mx-auto bg-white dark:bg-slate-900 md:my-8 md:rounded-2xl md:shadow-sm overflow-hidden border-x border-y-0 md:border-y border-slate-200 dark:border-slate-800">
                <div className="relative w-full h-[34vh] md:h-[42vh] bg-slate-200 dark:bg-slate-800">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${mainPhoto}")` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/30" />
                    <div className="absolute top-4 right-4 flex gap-2">
                        <FavoriteButton id={service.id} type="service" />
                        <ShareButtons title={service.titulo} text={service.descripcion || `${service.titulo} en ${service.municipio}`} hashtags={['PuertoRico', 'Servicios']} />
                    </div>
                    <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                        <span className="bg-primary px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm uppercase mb-2 inline-block">
                            {TYPE_LABEL[service.tipo] || service.tipo}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{service.titulo}</h1>
                        <div className="flex items-center gap-2 text-lg font-medium text-slate-100">
                            <span className="material-symbols-outlined text-[20px] text-white/85">location_on</span>
                            {service.municipio}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 p-6 md:p-8">
                    <div className="flex-1 flex flex-col gap-8">
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Descripción</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                                {service.descripcion || 'Sin descripción disponible.'}
                            </p>
                        </section>
                    </div>

                    <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">info</span>
                                Información
                            </h3>
                            <div className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Tipo</p>
                                    <p>{TYPE_LABEL[service.tipo] || service.tipo}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Precio</p>
                                    <p>{priceLabel}</p>
                                </div>
                                {service.telefono && (
                                    <a
                                        href={`tel:${service.telefono}`}
                                        onClick={() => trackEngagement({ action: 'click', targetType: 'service', targetId: service.id })}
                                        className="mt-2 w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                                    >
                                        <span className="material-symbols-outlined">call</span>
                                        Llamar
                                    </a>
                                )}
                                {service.whatsapp && (
                                    <a
                                        href={`https://wa.me/1${service.whatsapp.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={() => trackEngagement({ action: 'click', targetType: 'service', targetId: service.id })}
                                        className="w-full bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors hover:bg-[#25D366]/20"
                                    >
                                        <span className="material-symbols-outlined">chat</span>
                                        WhatsApp
                                    </a>
                                )}
                            </div>
                        </div>

                        {service.lat !== null && service.lng !== null && (
                            <>
                                <div className="h-64 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm relative z-0">
                                    <MapView
                                        markers={[{ id: service.id, lat: service.lat, lng: service.lng, title: service.titulo, category: TYPE_LABEL[service.tipo] || service.tipo, url: '#' }]}
                                        center={[service.lat, service.lng]}
                                        zoom={14}
                                    />
                                </div>
                                <a
                                    href={`https://maps.google.com/?q=${service.lat},${service.lng}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={() => trackEngagement({ action: 'click', targetType: 'service', targetId: service.id })}
                                    className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                                >
                                    <span className="material-symbols-outlined">directions</span>
                                    Cómo Llegar
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </main>

            <MobileNav />
        </div>
    );
}
