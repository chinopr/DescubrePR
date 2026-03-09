'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import MobileNav from '@/components/ui/MobileNav';
import SearchBar from '@/components/ui/SearchBar';
import { trackEngagement } from '@/lib/engagement/tracking';
import { createClient } from '@/lib/supabase/client';
import { isMissingBoostColumnError } from '@/lib/supabase/boost-fallback';

type TabKey = 'all' | 'places' | 'businesses' | 'events' | 'promos' | 'services';

interface SearchResult {
    id: string;
    type: 'place' | 'business' | 'event' | 'promo' | 'service';
    titulo: string;
    descripcion: string | null;
    municipio: string;
    imagen: string | null;
    extra?: string;
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <SearchPageContent />
        </Suspense>
    );
}

function SearchPageContent() {
    const searchParams = useSearchParams();
    const q = searchParams.get('q') || '';
    const pueblo = searchParams.get('pueblo') || '';

    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState<TabKey>('all');
    const [supabase] = useState(() => createClient());

    useEffect(() => {
        let cancelled = false;

        const search = async () => {
            if (!q && !pueblo) {
                setResults([]);
                return;
            }
            setLoading(true);

            const ilike = q ? `%${q}%` : '%';
            const all: SearchResult[] = [];

            if (tab === 'all' || tab === 'places') {
                let query = supabase.from('places').select('id, nombre, descripcion, municipio, fotos, categorias').eq('estado', 'published');
                if (pueblo) query = query.eq('municipio', pueblo);
                if (q) query = query.or(`nombre.ilike.${ilike},descripcion.ilike.${ilike}`);
                query = query.order('boost_score', { ascending: false }).order('created_at', { ascending: false });
                let response = await query.limit(10);
                if (isMissingBoostColumnError(response.error)) {
                    let fallbackQuery = supabase.from('places').select('id, nombre, descripcion, municipio, fotos, categorias').eq('estado', 'published');
                    if (pueblo) fallbackQuery = fallbackQuery.eq('municipio', pueblo);
                    if (q) fallbackQuery = fallbackQuery.or(`nombre.ilike.${ilike},descripcion.ilike.${ilike}`);
                    response = await fallbackQuery.order('created_at', { ascending: false }).limit(10);
                }
                (response.data || []).forEach(r => all.push({
                    id: r.id, type: 'place', titulo: r.nombre, descripcion: r.descripcion,
                    municipio: r.municipio, imagen: r.fotos?.[0] || null, extra: r.categorias?.join(', ')
                }));
            }

            if (tab === 'all' || tab === 'businesses') {
                let query = supabase.from('businesses').select('id, nombre, descripcion, municipio, categorias').eq('estado', 'published');
                if (pueblo) query = query.eq('municipio', pueblo);
                if (q) query = query.or(`nombre.ilike.${ilike},descripcion.ilike.${ilike}`);
                query = query.order('boost_score', { ascending: false }).order('created_at', { ascending: false });
                let response = await query.limit(10);
                if (isMissingBoostColumnError(response.error)) {
                    let fallbackQuery = supabase.from('businesses').select('id, nombre, descripcion, municipio, categorias').eq('estado', 'published');
                    if (pueblo) fallbackQuery = fallbackQuery.eq('municipio', pueblo);
                    if (q) fallbackQuery = fallbackQuery.or(`nombre.ilike.${ilike},descripcion.ilike.${ilike}`);
                    response = await fallbackQuery.order('created_at', { ascending: false }).limit(10);
                }
                (response.data || []).forEach(r => all.push({
                    id: r.id, type: 'business', titulo: r.nombre, descripcion: r.descripcion,
                    municipio: r.municipio, imagen: null, extra: r.categorias?.join(', ')
                }));
            }

            if (tab === 'all' || tab === 'events') {
                let query = supabase.from('events').select('id, titulo, descripcion, municipio, fotos, start_datetime')
                    .eq('estado', 'approved').gte('start_datetime', new Date().toISOString());
                if (pueblo) query = query.eq('municipio', pueblo);
                if (q) query = query.or(`titulo.ilike.${ilike},descripcion.ilike.${ilike}`);
                let response = await query.order('boost_score', { ascending: false }).order('start_datetime', { ascending: true }).limit(10);
                if (isMissingBoostColumnError(response.error)) {
                    let fallbackQuery = supabase.from('events').select('id, titulo, descripcion, municipio, fotos, start_datetime')
                        .eq('estado', 'approved').gte('start_datetime', new Date().toISOString());
                    if (pueblo) fallbackQuery = fallbackQuery.eq('municipio', pueblo);
                    if (q) fallbackQuery = fallbackQuery.or(`titulo.ilike.${ilike},descripcion.ilike.${ilike}`);
                    response = await fallbackQuery.order('start_datetime', { ascending: true }).limit(10);
                }
                (response.data || []).forEach(r => all.push({
                    id: r.id, type: 'event', titulo: r.titulo, descripcion: r.descripcion,
                    municipio: r.municipio, imagen: r.fotos?.[0] || null,
                    extra: new Date(r.start_datetime).toLocaleDateString('es-PR', { day: 'numeric', month: 'short', year: 'numeric' })
                }));
            }

            if (tab === 'all' || tab === 'promos') {
                let query = supabase.from('promotions').select('id, titulo, descripcion, fotos, end_date')
                    .eq('estado', 'approved').gte('end_date', new Date().toISOString().split('T')[0]);
                if (q) query = query.or(`titulo.ilike.${ilike},descripcion.ilike.${ilike}`);
                let response = await query.order('boost_score', { ascending: false }).order('created_at', { ascending: false }).limit(10);
                if (isMissingBoostColumnError(response.error)) {
                    let fallbackQuery = supabase.from('promotions').select('id, titulo, descripcion, fotos, end_date')
                        .eq('estado', 'approved').gte('end_date', new Date().toISOString().split('T')[0]);
                    if (q) fallbackQuery = fallbackQuery.or(`titulo.ilike.${ilike},descripcion.ilike.${ilike}`);
                    response = await fallbackQuery.order('created_at', { ascending: false }).limit(10);
                }
                (response.data || []).forEach(r => all.push({
                    id: r.id, type: 'promo', titulo: r.titulo, descripcion: r.descripcion,
                    municipio: '', imagen: r.fotos?.[0] || null,
                    extra: `Hasta ${new Date(r.end_date).toLocaleDateString('es-PR', { day: 'numeric', month: 'short' })}`
                }));
            }

            if (tab === 'all' || tab === 'services') {
                let query = supabase.from('service_listings').select('id, titulo, descripcion, municipio, fotos, precio, tipo')
                    .eq('estado', 'approved');
                if (pueblo) query = query.eq('municipio', pueblo);
                if (q) query = query.or(`titulo.ilike.${ilike},descripcion.ilike.${ilike}`);
                let response = await query.order('boost_score', { ascending: false }).order('created_at', { ascending: false }).limit(10);
                if (isMissingBoostColumnError(response.error)) {
                    let fallbackQuery = supabase.from('service_listings').select('id, titulo, descripcion, municipio, fotos, precio, tipo')
                        .eq('estado', 'approved');
                    if (pueblo) fallbackQuery = fallbackQuery.eq('municipio', pueblo);
                    if (q) fallbackQuery = fallbackQuery.or(`titulo.ilike.${ilike},descripcion.ilike.${ilike}`);
                    response = await fallbackQuery.order('created_at', { ascending: false }).limit(10);
                }
                (response.data || []).forEach(r => all.push({
                    id: r.id, type: 'service', titulo: r.titulo, descripcion: r.descripcion,
                    municipio: r.municipio, imagen: r.fotos?.[0] || null,
                    extra: r.precio ? `$${r.precio}` : r.tipo
                }));
            }

            if (cancelled) return;

            setResults(all);
            setLoading(false);
        };

        void search();

        return () => {
            cancelled = true;
        };
    }, [pueblo, q, supabase, tab]);

    const typeLabel: Record<string, string> = {
        place: 'Lugar', business: 'Negocio', event: 'Evento', promo: 'Promo', service: 'Servicio'
    };
    const typeColor: Record<string, string> = {
        place: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        business: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        event: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        promo: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        service: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    };
    const typeLink: Record<string, string> = {
        place: '/places/', business: '/businesses/', event: '/events/', promo: '/promos/', service: '/services/'
    };

    const tabs: { key: TabKey; label: string }[] = [
        { key: 'all', label: 'Todos' },
        { key: 'places', label: 'Lugares' },
        { key: 'businesses', label: 'Negocios' },
        { key: 'events', label: 'Eventos' },
        { key: 'promos', label: 'Promos' },
        { key: 'services', label: 'Servicios' },
    ];

    const counts: Record<TabKey, number> = {
        all: results.length,
        places: results.filter(r => r.type === 'place').length,
        businesses: results.filter(r => r.type === 'business').length,
        events: results.filter(r => r.type === 'event').length,
        promos: results.filter(r => r.type === 'promo').length,
        services: results.filter(r => r.type === 'service').length,
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark pb-16 md:pb-0">
            <Header />

            <main className="px-4 md:px-10 py-6 md:py-8 flex flex-1 justify-center">
                <div className="max-w-[1000px] w-full flex flex-col gap-6">

                    <SearchBar initialPueblo={pueblo} initialQuery={q} className="!shadow-none border border-slate-200 dark:border-slate-700" />

                    {(q || pueblo) && (
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                            {loading ? 'Buscando...' : `${results.length} resultado${results.length !== 1 ? 's' : ''}`}
                            {q && <> para <strong className="text-slate-900 dark:text-white">&quot;{q}&quot;</strong></>}
                            {pueblo && <> en <strong className="text-slate-900 dark:text-white">{pueblo}</strong></>}
                        </p>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                        {tabs.map(t => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${
                                    tab === t.key
                                        ? 'bg-primary text-white'
                                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary'
                                }`}
                            >
                                {t.label} {counts[t.key] > 0 && `(${counts[t.key]})`}
                            </button>
                        ))}
                    </div>

                    {/* Results */}
                    <div className="flex flex-col gap-3">
                        {loading ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-xl h-24 animate-pulse" />
                            ))
                        ) : results.length === 0 && (q || pueblo) ? (
                            <div className="text-center py-16 text-slate-500">
                                <span className="material-symbols-outlined text-5xl mb-2 block">search_off</span>
                                <p className="text-lg">No se encontraron resultados.</p>
                                <p className="text-sm mt-1">Intenta con otros terminos o pueblo.</p>
                            </div>
                        ) : !q && !pueblo ? (
                            <div className="text-center py-16 text-slate-500">
                                <span className="material-symbols-outlined text-5xl mb-2 block">search</span>
                                <p className="text-lg">Busca lugares, negocios, eventos y mas en Puerto Rico.</p>
                            </div>
                        ) : (
                            results.map(r => (
                                <Link
                                    key={`${r.type}-${r.id}`}
                                    href={`${typeLink[r.type]}${r.id}`}
                                    onClick={() => trackEngagement({ action: 'click', targetType: r.type === 'promo' ? 'promotion' : r.type, targetId: r.id })}
                                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex gap-4 hover:shadow-md transition-shadow group"
                                >
                                    {r.imagen && (
                                        <div
                                            className="w-20 h-20 rounded-lg bg-cover bg-center shrink-0"
                                            style={{ backgroundImage: `url("${r.imagen}")` }}
                                        />
                                    )}
                                    <div className="flex flex-col justify-center flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeColor[r.type]}`}>
                                                {typeLabel[r.type]}
                                            </span>
                                            {r.extra && (
                                                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{r.extra}</span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                                            {r.titulo}
                                        </h3>
                                        {r.descripcion && (
                                            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5">{r.descripcion}</p>
                                        )}
                                        {r.municipio && (
                                            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                <span className="material-symbols-outlined text-[14px]">location_on</span>
                                                {r.municipio}
                                            </div>
                                        )}
                                    </div>
                                    <span className="material-symbols-outlined text-slate-400 self-center shrink-0">chevron_right</span>
                                </Link>
                            ))
                        )}
                    </div>

                </div>
            </main>

            <MobileNav />
        </div>
    );
}
