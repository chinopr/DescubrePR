'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/ui/Header';
import MobileNav from '@/components/ui/MobileNav';
import FavoriteButton from '@/components/ui/FavoriteButton';
import ShareButtons from '@/components/ui/ShareButtons';
import PromoCard from '@/components/ui/PromoCard';
import EventCard from '@/components/ui/EventCard';
import { createClient } from '@/lib/supabase/client';
import type { Business, Promotion, Event } from '@/lib/types/database';

export default function BusinessDetail({ id }: { id: string }) {
    const [business, setBusiness] = useState<Business | null>(null);
    const [promos, setPromos] = useState<Promotion[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchBusiness() {
            const [bizRes, promosRes, eventsRes] = await Promise.all([
                supabase.from('businesses').select('*').eq('id', id).single(),
                supabase.from('promotions').select('*').eq('business_id', id).eq('estado', 'approved').gte('end_date', new Date().toISOString().split('T')[0]).limit(4),
                supabase.from('events').select('*').eq('business_id', id).eq('estado', 'approved').gte('start_datetime', new Date().toISOString()).order('start_datetime', { ascending: true }).limit(3),
            ]);

            setBusiness(bizRes.data);
            setPromos(promosRes.data || []);
            setEvents(eventsRes.data || []);
            setLoading(false);
        }
        fetchBusiness();
    }, [id, supabase]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (!business) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <span className="material-symbols-outlined text-6xl text-slate-300">store_mall_directory</span>
            <p className="text-xl text-slate-500">Negocio no encontrado</p>
        </div>
    );

    const horarios = business.horarios as Record<string, string> | null;
    const biz = business as Business & { cover_url?: string; avatar_url?: string };
    const coverUrl = biz.cover_url || 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80';
    const avatarUrl = biz.avatar_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80';

    const formatEventDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const time = date.toLocaleTimeString('es-PR', { hour: 'numeric', minute: '2-digit', hour12: true });
        if (isToday) return `Hoy, ${time}`;
        return date.toLocaleDateString('es-PR', { weekday: 'long', day: 'numeric', month: 'short' }) + `, ${time}`;
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark pb-16 md:pb-0">
            <Header />

            <main className="flex-1 w-full max-w-[1200px] mx-auto bg-white dark:bg-slate-900 md:my-8 md:rounded-2xl md:shadow-md overflow-hidden outline outline-1 outline-slate-200 dark:outline-slate-800">

                {/* HERO COVER */}
                <div className="relative w-full h-48 md:h-72 bg-slate-200 dark:bg-slate-800">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${coverUrl}")` }} />
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute top-4 right-4 flex gap-2">
                        <FavoriteButton id={business.id} type="business" />
                        <ShareButtons title={business.nombre} text={business.descripcion || `${business.nombre} en ${business.municipio}`} hashtags={['PuertoRico', 'NegociosLocales']} />
                    </div>
                </div>

                {/* PROFILE HEADER */}
                <div className="px-6 md:px-10 relative">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-end -mt-16 md:-mt-20 mb-6">
                        <div
                            className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-800 shadow-lg bg-cover bg-center shrink-0 z-10"
                            style={{ backgroundImage: `url("${avatarUrl}")` }}
                        />
                        <div className="flex-1 pb-2">
                            <div className="flex items-center gap-2 mb-1">
                                {business.verificado && (
                                    <span className="material-symbols-outlined text-blue-500 font-variation-fill" title="Cuenta Verificada">verified</span>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black">{business.nombre}</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">{business.categorias.join(' \u2022 ')}</p>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-10">

                        {/* MAIN CONTENT */}
                        <div className="flex-1 flex flex-col gap-10">

                            <section>
                                <h2 className="text-2xl font-bold mb-4">Sobre nosotros</h2>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                                    {business.descripcion || 'Sin descripción disponible.'}
                                </p>
                            </section>

                            {/* ACTION BUTTONS (MOBILE) */}
                            <div className="grid grid-cols-2 gap-3 lg:hidden">
                                {business.telefono && (
                                    <a href={`tel:${business.telefono}`} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                                        <span className="material-symbols-outlined mb-1">call</span>
                                        Llamar
                                    </a>
                                )}
                                {business.whatsapp && (
                                    <a href={`https://wa.me/1${business.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-500 font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition">
                                        <span className="material-symbols-outlined mb-1">chat</span>
                                        WhatsApp
                                    </a>
                                )}
                            </div>

                            {/* PROMOS */}
                            {promos.length > 0 && (
                                <section>
                                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary">local_offer</span>
                                            Promociones Activas
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {promos.map(promo => (
                                            <PromoCard
                                                key={promo.id}
                                                id={promo.id}
                                                title={promo.titulo}
                                                businessName={business.nombre}
                                                location={business.municipio}
                                                imageUrl={promo.fotos[0] || 'https://images.unsplash.com/photo-1542157585-ef20bbcce1b6?auto=format&fit=crop&q=80'}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* EVENTS */}
                            {events.length > 0 && (
                                <section className="mb-10">
                                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary">event</span>
                                            Próximos Eventos
                                        </h2>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {events.map(event => (
                                            <EventCard
                                                key={event.id}
                                                id={event.id}
                                                title={event.titulo}
                                                dateStr={formatEventDate(event.start_datetime)}
                                                location={business.nombre}
                                                imageUrl={event.fotos[0] || 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&q=80'}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}

                        </div>

                        {/* SIDEBAR */}
                        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6 mb-10">
                            <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-4">
                                <h3 className="font-bold text-lg border-b border-slate-200 dark:border-slate-700 pb-2">Contacto</h3>

                                {business.address_text && (
                                    <div className="flex gap-3 text-slate-600 dark:text-slate-300">
                                        <span className="material-symbols-outlined shrink-0 text-slate-400">location_on</span>
                                        <span className="text-sm leading-tight">{business.address_text}</span>
                                    </div>
                                )}

                                {horarios && (
                                    <div className="flex gap-3 text-slate-600 dark:text-slate-300">
                                        <span className="material-symbols-outlined shrink-0 text-slate-400">schedule</span>
                                        <div className="text-sm w-full">
                                            {Object.entries(horarios).map(([key, val]) => (
                                                <div key={key} className="flex justify-between mb-1">
                                                    <span className="capitalize">{key}</span>
                                                    <span className="font-medium">{val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* DESKTOP QUICK ACTIONS */}
                                <div className="hidden lg:flex flex-col gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    {business.telefono && (
                                        <a href={`tel:${business.telefono}`} className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary transition font-medium">
                                            <span className="material-symbols-outlined text-slate-500">call</span>
                                            {business.telefono}
                                        </a>
                                    )}
                                    {business.whatsapp && (
                                        <a href={`https://wa.me/1${business.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-2 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/20 rounded-lg transition font-medium">
                                            <span className="material-symbols-outlined">chat</span>
                                            WhatsApp
                                        </a>
                                    )}
                                    {business.instagram && (
                                        <a href={`https://instagram.com/${business.instagram}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800/50 hover:opacity-80 rounded-lg transition font-medium">
                                            <span className="material-symbols-outlined text-xl">photo_camera</span>
                                            @{business.instagram}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <MobileNav />
        </div>
    );
}
