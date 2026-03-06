'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/ui/Header';
import MobileNav from '@/components/ui/MobileNav';
import FavoriteButton from '@/components/ui/FavoriteButton';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import type { Place } from '@/lib/types/database';

const MapView = dynamic(() => import('@/components/ui/MapView'), { ssr: false });

export default function PlaceDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [place, setPlace] = useState<Place | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchPlace() {
            const { data } = await supabase
                .from('places')
                .select('*')
                .eq('id', id)
                .single();
            setPlace(data);
            setLoading(false);
        }
        fetchPlace();
    }, [id, supabase]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (!place) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <span className="material-symbols-outlined text-6xl text-slate-300">explore_off</span>
            <p className="text-xl text-slate-500">Lugar no encontrado</p>
        </div>
    );

    const costLabel = place.costo === 'free' ? 'Gratis' : place.costo === 'paid' ? 'Con Costo' : 'Varía';
    const mainPhoto = place.fotos[0] || 'https://images.unsplash.com/photo-1620982363177-386dbe3eb16b?auto=format&fit=crop&q=80';
    const horarios = place.horarios as Record<string, string> | null;

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark pb-16 md:pb-0">
            <Header />

            <main className="flex-1 w-full max-w-[1200px] mx-auto bg-white dark:bg-slate-900 md:my-8 md:rounded-2xl md:shadow-sm overflow-hidden border-x border-y-0 md:border-y border-slate-200 dark:border-slate-800">

                {/* HERO IMAGE */}
                <div className="relative w-full h-[40vh] md:h-[50vh] bg-slate-200 dark:bg-slate-800">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${mainPhoto}")` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
                    <div className="absolute top-4 right-4 flex gap-2">
                        <FavoriteButton id={place.id} type="place" />
                        <button className="p-2 rounded-full backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 shadow-sm transition-transform hover:scale-105">
                            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">share</span>
                        </button>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                        <span className="bg-primary px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase mb-2 inline-block">
                            {costLabel}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black mb-2">{place.nombre}</h1>
                        <div className="flex items-center gap-2 text-lg font-medium opacity-90">
                            <span className="material-symbols-outlined text-[20px]">location_on</span>
                            {place.municipio}
                        </div>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="flex flex-col lg:flex-row gap-8 p-6 md:p-8">
                    <div className="flex-1 flex flex-col gap-8">
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Sobre este lugar</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                                {place.descripcion || 'Sin descripción disponible.'}
                            </p>
                        </section>

                        {place.categorias.length > 0 && (
                            <section>
                                <h3 className="text-xl font-bold mb-3">Categorías</h3>
                                <div className="flex flex-wrap gap-2">
                                    {place.categorias.map(cat => (
                                        <span key={cat} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-full font-medium border border-slate-200 dark:border-slate-700">
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {place.fotos.length > 1 && (
                            <section>
                                <h3 className="text-xl font-bold mb-4">Galería</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {place.fotos.slice(1).map((foto, index) => (
                                        <div
                                            key={index}
                                            className="aspect-square bg-cover bg-center rounded-xl shadow-sm hover:opacity-90 transition-opacity cursor-pointer border border-slate-200 dark:border-slate-700"
                                            style={{ backgroundImage: `url("${foto}")` }}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* SIDEBAR */}
                    <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
                        {horarios && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">schedule</span>
                                    Horarios
                                </h3>
                                <ul className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    {Object.entries(horarios).map(([key, val]) => (
                                        <li key={key} className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2 last:border-0">
                                            <span className="font-medium capitalize">{key}</span>
                                            <span>{val}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {place.lat && place.lng && (
                            <>
                                <div className="h-64 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm relative z-0">
                                    <MapView
                                        markers={[{ id: place.id, lat: place.lat, lng: place.lng, title: place.nombre, category: 'Lugar', url: '#' }]}
                                        center={[place.lat, place.lng]}
                                        zoom={14}
                                    />
                                </div>
                                <a
                                    href={`https://maps.google.com/?q=${place.lat},${place.lng}`}
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
