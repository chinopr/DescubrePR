'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import MobileNav from '@/components/ui/MobileNav';
import FavoriteButton from '@/components/ui/FavoriteButton';
import { useAuth } from '@/lib/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import type { FavoriteTarget } from '@/lib/types/database';

interface FavItem {
    id: string;
    target_type: FavoriteTarget;
    target_id: string;
    created_at: string;
    name: string;
    subtitle: string;
    url: string;
    icon: string;
}

const TAB_CONFIG: { key: 'all' | FavoriteTarget; label: string; icon: string }[] = [
    { key: 'all', label: 'Todos', icon: 'bookmarks' },
    { key: 'place', label: 'Lugares', icon: 'explore' },
    { key: 'business', label: 'Negocios', icon: 'storefront' },
    { key: 'event', label: 'Eventos', icon: 'event' },
    { key: 'promotion', label: 'Promos', icon: 'local_offer' },
    { key: 'service', label: 'Clasificados', icon: 'campaign' },
];

export default function FavoritesPage() {
    const { user, loading: authLoading } = useAuth();
    const supabase = createClient();
    const [items, setItems] = useState<FavItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'all' | FavoriteTarget>('all');

    useEffect(() => {
        if (!user) return;

        async function fetchFavorites() {
            setLoading(true);
            const { data: favs } = await supabase
                .from('favorites')
                .select('*')
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false });

            if (!favs || favs.length === 0) {
                setItems([]);
                setLoading(false);
                return;
            }

            const grouped: Record<string, string[]> = {};
            for (const f of favs) {
                if (!grouped[f.target_type]) grouped[f.target_type] = [];
                grouped[f.target_type].push(f.target_id);
            }

            const resolved: FavItem[] = [];

            if (grouped['place']) {
                const { data } = await supabase.from('places').select('id, nombre, municipio').in('id', grouped['place']);
                for (const p of data || []) {
                    const fav = favs.find(f => f.target_id === p.id)!;
                    resolved.push({ id: fav.id, target_type: 'place', target_id: p.id, created_at: fav.created_at, name: p.nombre, subtitle: p.municipio, url: `/places/${p.id}`, icon: 'explore' });
                }
            }

            if (grouped['business']) {
                const { data } = await supabase.from('businesses').select('id, nombre, municipio').in('id', grouped['business']);
                for (const b of data || []) {
                    const fav = favs.find(f => f.target_id === b.id)!;
                    resolved.push({ id: fav.id, target_type: 'business', target_id: b.id, created_at: fav.created_at, name: b.nombre, subtitle: b.municipio, url: `/businesses/${b.id}`, icon: 'storefront' });
                }
            }

            if (grouped['event']) {
                const { data } = await supabase.from('events').select('id, titulo, municipio').in('id', grouped['event']);
                for (const ev of data || []) {
                    const fav = favs.find(f => f.target_id === ev.id)!;
                    resolved.push({ id: fav.id, target_type: 'event', target_id: ev.id, created_at: fav.created_at, name: ev.titulo, subtitle: ev.municipio, url: `/events/${ev.id}`, icon: 'event' });
                }
            }

            if (grouped['promotion']) {
                const { data } = await supabase.from('promotions').select('id, titulo, business_id').in('id', grouped['promotion']);
                for (const pr of data || []) {
                    const fav = favs.find(f => f.target_id === pr.id)!;
                    resolved.push({ id: fav.id, target_type: 'promotion', target_id: pr.id, created_at: fav.created_at, name: pr.titulo, subtitle: 'Promoción', url: `/promos`, icon: 'local_offer' });
                }
            }

            if (grouped['service']) {
                const { data } = await supabase.from('service_listings').select('id, titulo, municipio').in('id', grouped['service']);
                for (const s of data || []) {
                    const fav = favs.find(f => f.target_id === s.id)!;
                    resolved.push({ id: fav.id, target_type: 'service', target_id: s.id, created_at: fav.created_at, name: s.titulo, subtitle: s.municipio, url: `/services`, icon: 'campaign' });
                }
            }

            resolved.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setItems(resolved);
            setLoading(false);
        }
        fetchFavorites();
    }, [user, supabase]);

    const filtered = tab === 'all' ? items : items.filter(i => i.target_type === tab);

    if (authLoading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (!user) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
            <span className="material-symbols-outlined text-6xl text-slate-300">lock</span>
            <p className="text-xl text-slate-500 text-center">Inicia sesión para ver tus favoritos</p>
            <Link href="/auth/login" className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-hover transition">
                Iniciar Sesión
            </Link>
        </div>
    );

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark pb-16 md:pb-0">
            <Header />
            <main className="flex-1 px-4 md:px-10 py-6 md:py-8 flex justify-center">
                <div className="max-w-[900px] w-full flex flex-col gap-6">

                    <div>
                        <h1 className="text-3xl md:text-4xl font-black mb-2">Mis Favoritos</h1>
                        <p className="text-slate-500">Tus lugares, negocios y eventos guardados.</p>
                    </div>

                    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                        {TAB_CONFIG.map(t => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${tab === t.key ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                            >
                                <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                                {t.label}
                                {t.key !== 'all' && (
                                    <span className="text-xs opacity-70">({items.filter(i => i.target_type === t.key).length})</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex flex-col gap-3">
                            {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16">
                            <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">favorite_border</span>
                            <p className="text-lg text-slate-500 mb-2">No tienes favoritos guardados</p>
                            <p className="text-sm text-slate-400">Explora y guarda tus lugares y negocios favoritos.</p>
                            <Link href="/" className="inline-flex items-center gap-2 mt-4 text-primary font-medium hover:underline">
                                <span className="material-symbols-outlined text-sm">explore</span> Explorar
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {filtered.map(item => (
                                <div key={item.id} className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow group">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-primary">{item.icon}</span>
                                    </div>
                                    <Link href={item.url} className="flex-1 min-w-0">
                                        <h3 className="font-bold truncate group-hover:text-primary transition-colors">{item.name}</h3>
                                        <p className="text-sm text-slate-500 truncate">{item.subtitle}</p>
                                    </Link>
                                    <FavoriteButton id={item.target_id} type={item.target_type} className="shrink-0" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <MobileNav />
        </div>
    );
}
