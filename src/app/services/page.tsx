'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import MobileNav from '@/components/ui/MobileNav';
import { createClient } from '@/lib/supabase/client';
import type { ServiceListing, ListingType } from '@/lib/types/database';

export default function ServicesPage() {
    const [services, setServices] = useState<ServiceListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState<'all' | ListingType>('all');
    const supabase = createClient();

    useEffect(() => {
        async function fetchServices() {
            setLoading(true);
            let query = supabase
                .from('service_listings')
                .select('*')
                .eq('estado', 'approved')
                .order('destacado', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(20);

            if (typeFilter !== 'all') {
                query = query.eq('tipo', typeFilter);
            }

            const { data } = await query;
            setServices(data || []);
            setLoading(false);
        }
        fetchServices();
    }, [typeFilter, supabase]);

    const formatPrice = (precio: number | null) => {
        if (precio === null || precio === 0) return 'Contactar';
        return `$${precio.toLocaleString()}`;
    };

    const typeLabels: Record<string, string> = {
        servicio: 'Servicio',
        producto: 'Producto',
        alquiler: 'Alquiler',
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark pb-16 md:pb-0">
            <Header />

            <main className="px-4 md:px-10 py-6 md:py-8 flex flex-1 justify-center">
                <div className="max-w-[1200px] w-full flex flex-col gap-8">

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2">Clasificados PR</h1>
                            <p className="text-slate-500">Encuentra servicios, productos y alquileres locales.</p>
                        </div>

                        <Link href="/submit/service" className="w-full md:w-auto bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md flex justify-center items-center gap-2">
                            <span className="material-symbols-outlined">add_circle</span>
                            Publicar Anuncio
                        </Link>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">

                        {/* Filter Sidebar */}
                        <div className="w-full md:w-64 shrink-0 flex flex-col gap-6">
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                <h3 className="font-bold text-lg mb-4">Filtrar por Tipo</h3>
                                <div className="flex flex-col gap-3">
                                    {(['all', 'servicio', 'producto', 'alquiler'] as const).map(type => (
                                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="type"
                                                checked={typeFilter === type}
                                                onChange={() => setTypeFilter(type)}
                                                className="text-primary focus:ring-primary w-4 h-4"
                                            />
                                            <span className="text-slate-700 dark:text-slate-300">
                                                {type === 'all' ? 'Todos' : typeLabels[type]}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1">
                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-xl h-64 animate-pulse" />
                                    ))}
                                </div>
                            ) : services.length === 0 ? (
                                <div className="text-center py-16 text-slate-500">
                                    <span className="material-symbols-outlined text-5xl mb-2 block">storefront</span>
                                    <p className="text-lg">No hay anuncios publicados aún.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {services.map(service => (
                                        <div key={service.id} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow group flex flex-col cursor-pointer">
                                            <div
                                                className="w-full h-48 bg-cover bg-center"
                                                style={{ backgroundImage: `url("${service.fotos[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80'}")` }}
                                            >
                                                <div className="p-3 flex justify-between items-start">
                                                    <span className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded shadow-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                                                        {typeLabels[service.tipo] || service.tipo}
                                                    </span>
                                                    <span className="bg-primary text-white font-bold px-3 py-1 rounded-full shadow-sm text-sm">
                                                        {formatPrice(service.precio)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-4 flex flex-col flex-1">
                                                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">{service.titulo}</h3>
                                                <p className="text-sm text-slate-500 mb-3 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                                                    {service.municipio}
                                                </p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-auto">
                                                    {service.descripcion}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                </div>
            </main>

            <MobileNav />
        </div>
    );
}
