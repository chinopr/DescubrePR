'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/ui/Header';
import MobileNav from '@/components/ui/MobileNav';
import FavoriteButton from '@/components/ui/FavoriteButton';
import ShareButtons from '@/components/ui/ShareButtons';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import type { Event } from '@/lib/types/database';

const MapView = dynamic(() => import('@/components/ui/MapView'), { ssr: false });

type EventWithRelations = Event & {
    businesses?: { nombre: string; municipio: string | null } | null;
    places?: { nombre: string; municipio: string | null } | null;
};

export default function EventDetail({ id }: { id: string }) {
    const [event, setEvent] = useState<EventWithRelations | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchEvent() {
            const { data } = await supabase
                .from('events')
                .select('*, businesses(nombre, municipio), places(nombre, municipio)')
                .eq('id', id)
                .single();
            setEvent(data as EventWithRelations | null);
            setLoading(false);
        }
        fetchEvent();
    }, [id, supabase]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (!event) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <span className="material-symbols-outlined text-6xl text-slate-300">event_busy</span>
            <p className="text-xl text-slate-500">Evento no encontrado</p>
        </div>
    );

    const mainPhoto = event.fotos[0] || 'https://images.unsplash.com/photo-1533174000220-db9284bd06b0?auto=format&fit=crop&q=80';
    const dateLabel = new Date(event.start_datetime).toLocaleDateString('es-PR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
    const endLabel = new Date(event.end_datetime).toLocaleDateString('es-PR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
    const hostLabel = event.businesses?.nombre || event.places?.nombre || null;
    const priceLabel = event.costo === 0 ? 'Gratis' : `$${event.costo.toFixed(2)}`;

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark pb-16 md:pb-0">
            <Header />

            <main className="flex-1 w-full max-w-[1200px] mx-auto bg-white dark:bg-slate-900 md:my-8 md:rounded-2xl md:shadow-sm overflow-hidden border-x border-y-0 md:border-y border-slate-200 dark:border-slate-800">
                <div className="relative w-full h-[36vh] md:h-[46vh] bg-slate-200 dark:bg-slate-800">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${mainPhoto}")` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/30" />
                    <div className="absolute top-4 right-4 flex gap-2">
                        <FavoriteButton id={event.id} type="event" />
                        <ShareButtons title={event.titulo} text={event.descripcion || `${event.titulo} en ${event.municipio}`} hashtags={['PuertoRico', 'Eventos']} />
                    </div>
                    <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                        <span className="bg-primary px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase mb-2 inline-block">
                            {priceLabel}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black mb-2">{event.titulo}</h1>
                        <div className="flex items-center gap-2 text-lg font-medium opacity-90">
                            <span className="material-symbols-outlined text-[20px]">location_on</span>
                            {event.municipio}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 p-6 md:p-8">
                    <div className="flex-1 flex flex-col gap-8">
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Sobre este evento</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                                {event.descripcion || 'Sin descripción disponible.'}
                            </p>
                        </section>
                    </div>

                    <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">info</span>
                                Información
                            </h3>
                            <div className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300">
                                <div className="flex gap-3">
                                    <span className="material-symbols-outlined text-slate-400">calendar_today</span>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Comienza</p>
                                        <p>{dateLabel}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <span className="material-symbols-outlined text-slate-400">event_repeat</span>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Termina</p>
                                        <p>{endLabel}</p>
                                    </div>
                                </div>
                                {hostLabel && (
                                    <div className="flex gap-3">
                                        <span className="material-symbols-outlined text-slate-400">storefront</span>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Organiza</p>
                                            <p>{hostLabel}</p>
                                        </div>
                                    </div>
                                )}
                                {event.link && (
                                    <a
                                        href={event.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-2 w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                                    >
                                        <span className="material-symbols-outlined">confirmation_number</span>
                                        Ver enlace del evento
                                    </a>
                                )}
                                {event.whatsapp && (
                                    <a
                                        href={`https://wa.me/1${event.whatsapp.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors hover:bg-[#25D366]/20"
                                    >
                                        <span className="material-symbols-outlined">chat</span>
                                        WhatsApp
                                    </a>
                                )}
                            </div>
                        </div>

                        {event.lat && event.lng && (
                            <>
                                <div className="h-64 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm relative z-0">
                                    <MapView
                                        markers={[{ id: event.id, lat: event.lat, lng: event.lng, title: event.titulo, category: 'Evento', url: '#' }]}
                                        center={[event.lat, event.lng]}
                                        zoom={14}
                                    />
                                </div>
                                <a
                                    href={`https://maps.google.com/?q=${event.lat},${event.lng}`}
                                    target="_blank"
                                    rel="noreferrer"
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
