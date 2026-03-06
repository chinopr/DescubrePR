'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';

interface DashStats {
    businesses: number;
    events: number;
    promos: number;
    pendingBiz: number;
    pendingEvents: number;
    pendingPromos: number;
    totalFavs: number;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const supabase = createClient();
    const [stats, setStats] = useState<DashStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        async function fetch() {
            const [biz, ev, pr, pBiz, pEv, pPr] = await Promise.all([
                supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('owner_id', user!.id),
                supabase.from('events').select('*', { count: 'exact', head: true }).eq('created_by', user!.id),
                supabase.from('promotions').select('id, business_id', { count: 'exact', head: false }).then(async (res) => {
                    // Get promos only for user's businesses
                    const { data: myBiz } = await supabase.from('businesses').select('id').eq('owner_id', user!.id);
                    const bizIds = (myBiz || []).map(b => b.id);
                    if (bizIds.length === 0) return { count: 0 };
                    return supabase.from('promotions').select('*', { count: 'exact', head: true }).in('business_id', bizIds);
                }),
                supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('owner_id', user!.id).eq('estado', 'pending'),
                supabase.from('events').select('*', { count: 'exact', head: true }).eq('created_by', user!.id).eq('estado', 'pending'),
                // pending promos for user's businesses
                supabase.from('businesses').select('id').eq('owner_id', user!.id).then(async ({ data }) => {
                    const bizIds = (data || []).map(b => b.id);
                    if (bizIds.length === 0) return { count: 0 };
                    return supabase.from('promotions').select('*', { count: 'exact', head: true }).in('business_id', bizIds).eq('estado', 'pending');
                }),
            ]);

            // Get total favorites for user's businesses
            const { data: myBizData } = await supabase.from('businesses').select('id').eq('owner_id', user!.id);
            const bizIds = (myBizData || []).map(b => b.id);
            let totalFavs = 0;
            if (bizIds.length > 0) {
                const { count } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('target_type', 'business').in('target_id', bizIds);
                totalFavs = count || 0;
            }

            setStats({
                businesses: biz.count || 0,
                events: ev.count || 0,
                promos: pr.count || 0,
                pendingBiz: pBiz.count || 0,
                pendingEvents: pEv.count || 0,
                pendingPromos: pPr.count || 0,
                totalFavs,
            });
            setLoading(false);
        }
        fetch();
    }, [user, supabase]);

    const cards = stats ? [
        { label: 'Negocios', value: stats.businesses, icon: 'storefront', color: 'bg-blue-500', href: '/dashboard/businesses' },
        { label: 'Eventos', value: stats.events, icon: 'event', color: 'bg-purple-500', href: '/dashboard/events' },
        { label: 'Promociones', value: stats.promos, icon: 'local_offer', color: 'bg-amber-500', href: '/dashboard/promos' },
        { label: 'Favoritos Recibidos', value: stats.totalFavs, icon: 'favorite', color: 'bg-rose-500' },
    ] : [];

    const totalPending = stats ? stats.pendingBiz + stats.pendingEvents + stats.pendingPromos : 0;

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black mb-1">Mi Panel</h1>
                <p className="text-slate-500">Administra tus negocios, eventos y promociones</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 gap-4">
                    {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-xl animate-pulse" />)}
                </div>
            ) : stats && (
                <>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {cards.map(card => (
                            <div key={card.label} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                                {card.href ? (
                                    <Link href={card.href} className="block">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                                                <span className="material-symbols-outlined text-white text-xl">{card.icon}</span>
                                            </div>
                                            <span className="text-sm text-slate-500 font-medium">{card.label}</span>
                                        </div>
                                        <p className="text-3xl font-black">{card.value}</p>
                                    </Link>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                                                <span className="material-symbols-outlined text-white text-xl">{card.icon}</span>
                                            </div>
                                            <span className="text-sm text-slate-500 font-medium">{card.label}</span>
                                        </div>
                                        <p className="text-3xl font-black">{card.value}</p>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pending items */}
                    {totalPending > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-5 mb-8">
                            <h3 className="font-bold flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-amber-500">schedule</span>
                                Pendiente de Aprobación
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {stats.pendingBiz > 0 && <span className="text-sm bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">{stats.pendingBiz} negocio(s)</span>}
                                {stats.pendingEvents > 0 && <span className="text-sm bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">{stats.pendingEvents} evento(s)</span>}
                                {stats.pendingPromos > 0 && <span className="text-sm bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">{stats.pendingPromos} promo(s)</span>}
                            </div>
                        </div>
                    )}

                    {/* Quick actions */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Acciones Rápidas</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Link href="/submit/business" className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors border border-slate-200 dark:border-slate-700">
                                <span className="material-symbols-outlined text-primary">add_business</span>
                                <span className="text-sm font-medium">Nuevo Negocio</span>
                            </Link>
                            <Link href="/submit/event" className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors border border-slate-200 dark:border-slate-700">
                                <span className="material-symbols-outlined text-primary">event</span>
                                <span className="text-sm font-medium">Nuevo Evento</span>
                            </Link>
                            <Link href="/submit/promo" className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors border border-slate-200 dark:border-slate-700">
                                <span className="material-symbols-outlined text-primary">local_offer</span>
                                <span className="text-sm font-medium">Nueva Promo</span>
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
