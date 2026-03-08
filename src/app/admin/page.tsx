'use client';
import { useEffect, useState } from 'react';
import type { AdminAuditLog } from '@/lib/types/database';

interface Stats {
    places: number;
    businesses: number;
    events: number;
    promotions: number;
    services: number;
    users: number;
    pendingEvents: number;
    pendingBusinesses: number;
    pendingPromos: number;
    pendingServices: number;
}

interface AuditLogItem extends AdminAuditLog {
    actor_name: string;
    actor_email: string | null;
}

const STAT_CARDS: { key: keyof Stats; label: string; icon: string; color: string; href?: string }[] = [
    { key: 'places', label: 'Lugares', icon: 'explore', color: 'bg-emerald-500' },
    { key: 'businesses', label: 'Negocios', icon: 'storefront', color: 'bg-blue-500' },
    { key: 'events', label: 'Eventos', icon: 'event', color: 'bg-purple-500' },
    { key: 'promotions', label: 'Promociones', icon: 'local_offer', color: 'bg-amber-500' },
    { key: 'services', label: 'Clasificados', icon: 'campaign', color: 'bg-rose-500' },
    { key: 'users', label: 'Usuarios', icon: 'group', color: 'bg-indigo-500' },
];

const PENDING_CARDS: { key: keyof Stats; label: string; icon: string }[] = [
    { key: 'pendingBusinesses', label: 'Negocios por aprobar', icon: 'storefront' },
    { key: 'pendingEvents', label: 'Eventos por aprobar', icon: 'event' },
    { key: 'pendingPromos', label: 'Promos por aprobar', icon: 'local_offer' },
    { key: 'pendingServices', label: 'Clasificados por aprobar', icon: 'campaign' },
];

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function fetchStats() {
            try {
                const [statsResponse, auditResponse] = await Promise.all([
                    fetch('/api/admin/stats', { cache: 'no-store' }),
                    fetch('/api/admin/audit', { cache: 'no-store' }),
                ]);

                const statsResult = await statsResponse.json().catch(() => null) as Stats | null;
                const auditResult = await auditResponse.json().catch(() => null) as { logs?: AuditLogItem[] } | null;

                if (!statsResponse.ok || !statsResult || !auditResponse.ok || !auditResult) {
                    throw new Error('stats_failed');
                }

                if (!cancelled) {
                    setStats(statsResult);
                    setAuditLogs(auditResult.logs || []);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }
        void fetchStats();

        return () => {
            cancelled = true;
        };
    }, []);

    const totalPending = stats ? stats.pendingEvents + stats.pendingBusinesses + stats.pendingPromos + stats.pendingServices : 0;

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black mb-1 text-slate-900 dark:text-white">Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400">Vista general de DescubrePR</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-xl animate-pulse" />)}
                </div>
            ) : stats && (
                <>
                    {/* Total stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                        {STAT_CARDS.map(card => (
                            <div key={card.key} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                                        <span className="material-symbols-outlined text-white text-xl">{card.icon}</span>
                                    </div>
                                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{card.label}</span>
                                </div>
                                <p className="text-3xl font-black text-slate-900 dark:text-white">{stats[card.key]}</p>
                            </div>
                        ))}
                    </div>

                    {/* Pending moderation */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                <span className="material-symbols-outlined text-amber-500">pending_actions</span>
                                Pendiente de Moderación
                            </h2>
                            {totalPending > 0 && (
                                <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-sm font-bold">
                                    {totalPending} total
                                </span>
                            )}
                        </div>
                        {totalPending === 0 ? (
                            <div className="text-center py-8">
                                <span className="material-symbols-outlined text-5xl text-green-400 mb-2 block">check_circle</span>
                                <p className="text-slate-500 dark:text-slate-400">Todo al día. No hay contenido pendiente.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {PENDING_CARDS.map(card => {
                                    const count = stats[card.key];
                                    if (count === 0) return null;
                                    return (
                                        <a key={card.key} href="/admin/moderation" className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 hover:shadow-md transition-shadow text-slate-900 dark:text-slate-100">
                                            <span className="material-symbols-outlined text-amber-600">{card.icon}</span>
                                            <span className="flex-1 font-medium text-sm text-slate-900 dark:text-slate-100">{card.label}</span>
                                            <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">{count}</span>
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="mt-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                <span className="material-symbols-outlined text-sky-500">history</span>
                                Audit Log
                            </h2>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                Últimas acciones admin
                            </span>
                        </div>

                        {auditLogs.length === 0 ? (
                            <div className="text-center py-8">
                                <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-2 block">history_toggle_off</span>
                                <p className="text-slate-500 dark:text-slate-400">Aún no hay eventos registrados.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {auditLogs.map(log => (
                                    <div
                                        key={log.id}
                                        className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/70"
                                    >
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">
                                                    {log.actor_name}
                                                </p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {String(log.action)} · {String(log.target_type)}
                                                </p>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {new Date(log.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                                            {log.target_id ? `Objetivo: ${log.target_id}` : 'Objetivo sin ID persistido.'}
                                        </p>
                                        {log.ip_address ? (
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                IP: {log.ip_address}
                                            </p>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
