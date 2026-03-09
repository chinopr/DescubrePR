'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import BoostActionButton from '@/components/ui/BoostActionButton';
import PublishGateNotice from '@/components/ui/PublishGateNotice';
import { createClient } from '@/lib/supabase/client';
import { usePublishAccess } from '@/lib/subscriptions/use-publish-access';
import type { Event } from '@/lib/types/database';

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
    pending: { label: 'Pendiente', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    approved: { label: 'Aprobado', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    rejected: { label: 'Rechazado', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export default function MyEventsPage() {
    const { user } = useAuth();
    const supabase = createClient();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const publishAccess = usePublishAccess();

    useEffect(() => {
        if (!user) return;
        supabase
            .from('events')
            .select('*')
            .eq('created_by', user.id)
            .order('start_datetime', { ascending: false })
            .then(({ data }) => { setEvents(data || []); setLoading(false); });
    }, [user, supabase]);

    const formatDate = (d: string) => new Date(d).toLocaleDateString('es-PR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto text-slate-900 dark:text-slate-100">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black mb-1 text-slate-900 dark:text-white">Mis Eventos</h1>
                    <p className="text-slate-600 dark:text-slate-400">{events.length} creado(s)</p>
                </div>
                {publishAccess.canPublish && (
                    <Link href="/submit/event" className="bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-5 rounded-lg transition flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-lg">add</span> Nuevo
                    </Link>
                )}
            </div>

            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1,2].map(i => <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-xl animate-pulse" />)}
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">event</span>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">No tienes eventos creados</p>
                    {publishAccess.canPublish ? (
                        <Link href="/submit/event" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-hover transition">
                            <span className="material-symbols-outlined">add</span> Crear Evento
                        </Link>
                    ) : (
                        <div className="max-w-md mx-auto">
                            <PublishGateNotice reason={publishAccess.reason || 'Necesitas un plan activo para publicar eventos.'} businessCount={publishAccess.businessCount} />
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {events.map(ev => {
                        const badge = STATUS_BADGE[ev.estado] || STATUS_BADGE['pending'];
                        const isPast = new Date(ev.end_datetime) < new Date();
                        return (
                            <div key={ev.id} className={`bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-slate-900 dark:text-slate-100 ${isPast ? 'opacity-60' : ''}`}>
                                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-purple-500">event</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg truncate text-slate-900 dark:text-white">{ev.titulo}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badge.cls}`}>{badge.label}</span>
                                        {isPast && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Pasado</span>}
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{ev.municipio} &middot; {formatDate(ev.start_datetime)}</p>
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">
                                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                                            {ev.metrics_view_count} vistas
                                        </span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">
                                            <span className="material-symbols-outlined text-[14px]">ads_click</span>
                                            {ev.metrics_click_count} clics
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3 shrink-0">
                                    <BoostActionButton
                                        targetType="event"
                                        targetId={ev.id}
                                        boostExpiresAt={ev.boost_expires_at}
                                        boostScore={ev.boost_score}
                                    />
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-slate-700 dark:text-slate-300">{ev.costo === 0 ? 'Gratis' : `$${ev.costo.toFixed(2)}`}</span>
                                        <Link href={`/dashboard/events/${ev.id}/edit`} className="text-slate-700 dark:text-slate-300 hover:text-primary text-sm font-medium flex items-center gap-1 transition">
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
