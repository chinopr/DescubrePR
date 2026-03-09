'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import MobileNav from '@/components/ui/MobileNav';
import PublishGateNotice from '@/components/ui/PublishGateNotice';
import SearchBar from '@/components/ui/SearchBar';
import { createClient } from '@/lib/supabase/client';
import { trackEngagement } from '@/lib/engagement/tracking';
import { isMissingBoostColumnError } from '@/lib/supabase/boost-fallback';
import { usePublishAccess } from '@/lib/subscriptions/use-publish-access';
import type { Event } from '@/lib/types/database';

type DateFilter = 'all' | 'today' | 'tomorrow' | 'weekend' | 'week';

export default function EventsPageClient() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<DateFilter>('all');
    const [supabase] = useState(() => createClient());
    const publishAccess = usePublishAccess();

    useEffect(() => {
        let cancelled = false;

        async function fetchEvents() {
            setLoading(true);
            const now = new Date();

            let query = supabase
                .from('events')
                .select('*')
                .eq('estado', 'approved')
                .gte('start_datetime', now.toISOString())
                .order('boost_score', { ascending: false })
                .order('start_datetime', { ascending: true });

            if (filter === 'today') {
                const endOfDay = new Date(now);
                endOfDay.setHours(23, 59, 59, 999);
                query = query.lte('start_datetime', endOfDay.toISOString());
            } else if (filter === 'tomorrow') {
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);
                const endOfTomorrow = new Date(tomorrow);
                endOfTomorrow.setHours(23, 59, 59, 999);
                query = query.gte('start_datetime', tomorrow.toISOString()).lte('start_datetime', endOfTomorrow.toISOString());
            } else if (filter === 'weekend') {
                const day = now.getDay();
                const daysUntilSat = day === 0 ? 6 : 6 - day;
                const saturday = new Date(now);
                saturday.setDate(now.getDate() + daysUntilSat);
                saturday.setHours(0, 0, 0, 0);
                const sunday = new Date(saturday);
                sunday.setDate(saturday.getDate() + 1);
                sunday.setHours(23, 59, 59, 999);
                query = query.gte('start_datetime', saturday.toISOString()).lte('start_datetime', sunday.toISOString());
            } else if (filter === 'week') {
                const endOfWeek = new Date(now);
                endOfWeek.setDate(now.getDate() + 7);
                query = query.lte('start_datetime', endOfWeek.toISOString());
            }

            let response = await query.limit(20);

            if (isMissingBoostColumnError(response.error)) {
                let fallbackQuery = supabase
                    .from('events')
                    .select('*')
                    .eq('estado', 'approved')
                    .gte('start_datetime', now.toISOString())
                    .order('start_datetime', { ascending: true });

                if (filter === 'today') {
                    const endOfDay = new Date(now);
                    endOfDay.setHours(23, 59, 59, 999);
                    fallbackQuery = fallbackQuery.lte('start_datetime', endOfDay.toISOString());
                } else if (filter === 'tomorrow') {
                    const tomorrow = new Date(now);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(0, 0, 0, 0);
                    const endOfTomorrow = new Date(tomorrow);
                    endOfTomorrow.setHours(23, 59, 59, 999);
                    fallbackQuery = fallbackQuery.gte('start_datetime', tomorrow.toISOString()).lte('start_datetime', endOfTomorrow.toISOString());
                } else if (filter === 'weekend') {
                    const day = now.getDay();
                    const daysUntilSat = day === 0 ? 6 : 6 - day;
                    const saturday = new Date(now);
                    saturday.setDate(now.getDate() + daysUntilSat);
                    saturday.setHours(0, 0, 0, 0);
                    const sunday = new Date(saturday);
                    sunday.setDate(saturday.getDate() + 1);
                    sunday.setHours(23, 59, 59, 999);
                    fallbackQuery = fallbackQuery.gte('start_datetime', saturday.toISOString()).lte('start_datetime', sunday.toISOString());
                } else if (filter === 'week') {
                    const endOfWeek = new Date(now);
                    endOfWeek.setDate(now.getDate() + 7);
                    fallbackQuery = fallbackQuery.lte('start_datetime', endOfWeek.toISOString());
                }

                response = await fallbackQuery.limit(20);
            }

            if (cancelled) return;

            setEvents(response.data || []);
            setLoading(false);
        }

        void fetchEvents();

        return () => {
            cancelled = true;
        };
    }, [filter, supabase]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const isTomorrow = date.toDateString() === tomorrow.toDateString();
        const time = date.toLocaleTimeString('es-PR', { hour: 'numeric', minute: '2-digit', hour12: true });
        if (isToday) return `Hoy, ${time}`;
        if (isTomorrow) return `Mañana, ${time}`;
        return date.toLocaleDateString('es-PR', { weekday: 'long', day: 'numeric', month: 'short' }) + `, ${time}`;
    };

    const filters: { key: DateFilter; label: string }[] = [
        { key: 'all', label: 'Todos' },
        { key: 'today', label: 'Hoy' },
        { key: 'tomorrow', label: 'Mañana' },
        { key: 'weekend', label: 'Este Weekend' },
        { key: 'week', label: 'Esta Semana' },
    ];

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark pb-16 md:pb-0">
            <Header />

            <main className="px-4 md:px-10 py-6 md:py-8 flex flex-1 justify-center">
                <div className="max-w-[1000px] w-full flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2 text-slate-900 dark:text-white">Puerto Rico Events</h1>
                            <p className="text-slate-600 dark:text-slate-400">Discover what&apos;s happening around you.</p>
                        </div>
                        <SearchBar className="w-full md:w-auto md:min-w-[400px] !shadow-none border border-slate-200 dark:border-slate-700" />
                        {publishAccess.loading ? null : publishAccess.canPublish ? (
                            <Link href="/submit/event" className="w-full md:w-auto bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md flex justify-center items-center gap-2 shrink-0">
                                <span className="material-symbols-outlined">add_circle</span>
                                Publicar Evento
                            </Link>
                        ) : (
                            <div className="w-full md:w-auto md:max-w-sm">
                                <PublishGateNotice reason={publishAccess.reason || 'Necesitas un plan activo para publicar eventos.'} businessCount={publishAccess.businessCount} />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 overflow-x-auto hide-scrollbar">
                        {filters.map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`px-5 py-2 rounded-full font-bold shadow-sm whitespace-nowrap transition-colors ${
                                    filter === f.key
                                        ? 'bg-primary text-white'
                                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col gap-4">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-xl h-32 animate-pulse" />
                            ))
                        ) : events.length === 0 ? (
                            <div className="text-center py-16 text-slate-500 dark:text-slate-400">
                                <span className="material-symbols-outlined text-5xl mb-2 block">event_busy</span>
                                <p className="text-lg">No hay eventos para este filtro.</p>
                            </div>
                        ) : (
                            events.map(event => (
                                <Link
                                    key={event.id}
                                    href={`/events/${event.id}`}
                                    onClick={() => trackEngagement({ action: 'click', targetType: 'event', targetId: event.id })}
                                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow group cursor-pointer"
                                >
                                    <div
                                        className="w-full sm:w-48 h-48 sm:h-32 rounded-lg bg-cover bg-center shrink-0"
                                        style={{ backgroundImage: `url("${event.fotos[0] || 'https://images.unsplash.com/photo-1533174000220-db9284bd06b0?auto=format&fit=crop&q=80'}")` }}
                                    />
                                    <div className="flex flex-col justify-center flex-1">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 md:line-clamp-1 mb-2">
                                            {event.titulo}
                                        </h3>
                                        <div className="flex items-center text-slate-600 dark:text-slate-300 gap-2 mb-1 text-sm md:text-base">
                                            <span className="material-symbols-outlined text-[18px] text-primary">calendar_today</span>
                                            {formatDate(event.start_datetime)}
                                        </div>
                                        <div className="flex items-center text-slate-600 dark:text-slate-300 gap-2 text-sm md:text-base">
                                            <span className="material-symbols-outlined text-[18px]">location_on</span>
                                            {event.municipio}
                                        </div>
                                    </div>
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
