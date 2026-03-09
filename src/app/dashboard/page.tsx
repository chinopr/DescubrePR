'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { hasActiveBoost } from '@/lib/boosts/config';
import PublishGateNotice from '@/components/ui/PublishGateNotice';
import { createClient } from '@/lib/supabase/client';
import { usePublishAccess } from '@/lib/subscriptions/use-publish-access';
import type { Business, Event, Promotion, ServiceListing } from '@/lib/types/database';

interface DashStats {
    businesses: number;
    events: number;
    promos: number;
    services: number;
    pendingBiz: number;
    pendingEvents: number;
    pendingPromos: number;
    totalFavs: number;
    totalViews: number;
    totalClicks: number;
    activeBoosts: number;
    topContent: Array<{
        id: string;
        title: string;
        type: 'business' | 'event' | 'promotion' | 'service';
        views: number;
        clicks: number;
    }>;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [supabase] = useState(() => createClient());
    const [stats, setStats] = useState<DashStats | null>(null);
    const [loading, setLoading] = useState(true);
    const publishAccess = usePublishAccess();

    useEffect(() => {
        if (!user) return;
        async function fetch() {
            const [bizRes, evRes, servicesRes] = await Promise.all([
                supabase.from('businesses').select('*').eq('owner_id', user!.id),
                supabase.from('events').select('*').eq('created_by', user!.id),
                supabase.from('service_listings').select('*').eq('user_id', user!.id),
            ]);

            const businesses = (bizRes.data || []) as Business[];
            const events = (evRes.data || []) as Event[];
            const services = (servicesRes.data || []) as ServiceListing[];
            const bizIds = businesses.map((biz) => biz.id);

            const { data: promosData } = bizIds.length > 0
                ? await supabase.from('promotions').select('*').in('business_id', bizIds)
                : { data: [] };
            const promos = (promosData || []) as Promotion[];

            // Get total favorites for user's businesses
            let totalFavs = 0;
            if (bizIds.length > 0) {
                const { count } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('target_type', 'business').in('target_id', bizIds);
                totalFavs = count || 0;
            }

            const topContent = [
                ...businesses.map((biz) => ({ id: biz.id, title: biz.nombre, type: 'business' as const, views: biz.metrics_view_count, clicks: biz.metrics_click_count })),
                ...events.map((event) => ({ id: event.id, title: event.titulo, type: 'event' as const, views: event.metrics_view_count, clicks: event.metrics_click_count })),
                ...promos.map((promo) => ({ id: promo.id, title: promo.titulo, type: 'promotion' as const, views: promo.metrics_view_count, clicks: promo.metrics_click_count })),
                ...services.map((service) => ({ id: service.id, title: service.titulo, type: 'service' as const, views: service.metrics_view_count, clicks: service.metrics_click_count })),
            ]
                .sort((a, b) => (b.views + b.clicks) - (a.views + a.clicks))
                .slice(0, 5);

            const activeBoosts = [
                ...businesses,
                ...events,
                ...promos,
                ...services,
            ].filter((record) => hasActiveBoost(record)).length;

            const totalViews = [
                ...businesses,
                ...events,
                ...promos,
                ...services,
            ].reduce((sum, record) => sum + (record.metrics_view_count || 0), 0);

            const totalClicks = [
                ...businesses,
                ...events,
                ...promos,
                ...services,
            ].reduce((sum, record) => sum + (record.metrics_click_count || 0), 0);

            setStats({
                businesses: businesses.length,
                events: events.length,
                promos: promos.length,
                services: services.length,
                pendingBiz: businesses.filter((record) => record.estado === 'pending').length,
                pendingEvents: events.filter((record) => record.estado === 'pending').length,
                pendingPromos: promos.filter((record) => record.estado === 'pending').length,
                totalFavs,
                totalViews,
                totalClicks,
                activeBoosts,
                topContent,
            });
            setLoading(false);
        }
        fetch();
    }, [user, supabase]);

    const cards = stats ? [
        { label: 'Negocios', value: stats.businesses, icon: 'storefront', color: 'bg-blue-500', href: '/dashboard/businesses' },
        { label: 'Eventos', value: stats.events, icon: 'event', color: 'bg-purple-500', href: '/dashboard/events' },
        { label: 'Promociones', value: stats.promos, icon: 'local_offer', color: 'bg-amber-500', href: '/dashboard/promos' },
        { label: 'Clasificados', value: stats.services, icon: 'campaign', color: 'bg-teal-500', href: '/dashboard/services' },
        { label: 'Favoritos Recibidos', value: stats.totalFavs, icon: 'favorite', color: 'bg-rose-500' },
        { label: 'Vistas Totales', value: stats.totalViews, icon: 'visibility', color: 'bg-cyan-500' },
        { label: 'Clicks Totales', value: stats.totalClicks, icon: 'ads_click', color: 'bg-emerald-500' },
    ] : [];

    const totalPending = stats ? stats.pendingBiz + stats.pendingEvents + stats.pendingPromos : 0;

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto text-slate-900 dark:text-slate-100">
            <div className="mb-8">
                <h1 className="text-3xl font-black mb-1 text-slate-900 dark:text-white">Mi Panel</h1>
                <p className="text-slate-600 dark:text-slate-400">Administra tus negocios, eventos y promociones</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 gap-4">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-xl animate-pulse" />)}
                </div>
            ) : stats && (
                <>
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                        {cards.map(card => (
                            <div key={card.label} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow text-slate-900 dark:text-slate-100">
                                {card.href ? (
                                    <Link href={card.href} className="block text-inherit">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                                                <span className="material-symbols-outlined text-white text-xl">{card.icon}</span>
                                            </div>
                                            <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{card.label}</span>
                                        </div>
                                        <p className="text-3xl font-black text-slate-900 dark:text-white">{card.value}</p>
                                    </Link>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                                                <span className="material-symbols-outlined text-white text-xl">{card.icon}</span>
                                            </div>
                                            <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{card.label}</span>
                                        </div>
                                        <p className="text-3xl font-black text-slate-900 dark:text-white">{card.value}</p>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pending items */}
                    {totalPending > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-5 mb-8 text-slate-900 dark:text-slate-100">
                            <h3 className="font-bold flex items-center gap-2 mb-3 text-slate-900 dark:text-white">
                                <span className="material-symbols-outlined text-amber-500">schedule</span>
                                Pendiente de Aprobación
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {stats.pendingBiz > 0 && <span className="text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">{stats.pendingBiz} negocio(s)</span>}
                                {stats.pendingEvents > 0 && <span className="text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">{stats.pendingEvents} evento(s)</span>}
                                {stats.pendingPromos > 0 && <span className="text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">{stats.pendingPromos} promo(s)</span>}
                            </div>
                        </div>
                    )}

                    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/15 rounded-xl p-5 mb-8 text-slate-900 dark:text-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Boosts y rendimiento</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {stats.activeBoosts} boost(s) activo(s) y {stats.totalViews} vista(s) acumuladas en tu contenido.
                                </p>
                            </div>
                            <Link href="/dashboard/subscription" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover transition-colors">
                                <span className="material-symbols-outlined text-lg">rocket_launch</span>
                                Gestionar plan
                            </Link>
                        </div>
                    </div>

                    {stats.topContent.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-8 text-slate-900 dark:text-slate-100">
                            <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Contenido con mejor rendimiento</h3>
                            <div className="flex flex-col gap-3">
                                {stats.topContent.map((item) => (
                                    <div key={`${item.type}-${item.id}`} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/70">
                                        <div className="min-w-0">
                                            <p className="truncate font-medium text-slate-900 dark:text-white">{item.title}</p>
                                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.type}</p>
                                        </div>
                                        <div className="flex gap-2 text-xs text-slate-600 dark:text-slate-300">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 dark:bg-slate-900">
                                                <span className="material-symbols-outlined text-[14px]">visibility</span>
                                                {item.views}
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 dark:bg-slate-900">
                                                <span className="material-symbols-outlined text-[14px]">ads_click</span>
                                                {item.clicks}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick actions */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 text-slate-900 dark:text-slate-100">
                        <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Acciones Rápidas</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Link href="/submit/business" className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                                <span className="material-symbols-outlined text-primary">add_business</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Nuevo Negocio</span>
                            </Link>
                            {publishAccess.canPublish && (
                                <>
                                    <Link href="/submit/event" className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                                        <span className="material-symbols-outlined text-primary">event</span>
                                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Nuevo Evento</span>
                                    </Link>
                                    <Link href="/submit/promo" className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                                        <span className="material-symbols-outlined text-primary">local_offer</span>
                                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Nueva Promo</span>
                                    </Link>
                                </>
                            )}
                        </div>
                        {!publishAccess.loading && !publishAccess.canPublish && (
                            <div className="mt-4">
                                <PublishGateNotice reason={publishAccess.reason || 'Necesitas un plan activo para publicar eventos y promociones.'} businessCount={publishAccess.businessCount} />
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
