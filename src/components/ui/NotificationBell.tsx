'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { Notification } from '@/lib/types/database';

export default function NotificationBell() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const [unread, setUnread] = useState(0);
    const [referenceTime, setReferenceTime] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const [supabase] = useState(() => createClient());

    useEffect(() => {
        if (!user) return;

        const fetch = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);
            setNotifications(data || []);
            setUnread((data || []).filter(n => !n.leida).length);
            setReferenceTime(new Date().getTime());
        };

        fetch();

        const channel = supabase
            .channel('notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`,
            }, (payload) => {
                const n = payload.new as Notification;
                setNotifications(prev => [n, ...prev].slice(0, 10));
                setUnread(prev => prev + 1);
                setReferenceTime(new Date().getTime());
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user, supabase]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const markAllRead = async () => {
        if (!user) return;
        await supabase
            .from('notifications')
            .update({ leida: true })
            .eq('user_id', user.id)
            .eq('leida', false);
        setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
        setUnread(0);
    };

    const timeAgo = (dateStr: string) => {
        const diff = referenceTime - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'ahora';
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h`;
        return `${Math.floor(hrs / 24)}d`;
    };

    if (!user) return null;

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => {
                    setReferenceTime(new Date().getTime());
                    setOpen(!open);
                }}
                className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition"
            >
                <span className="material-symbols-outlined">notifications</span>
                {unread > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-sm">Notificaciones</h3>
                        {unread > 0 && (
                            <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                                Marcar todas leidas
                            </button>
                        )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                                <span className="material-symbols-outlined text-3xl block mb-1">notifications_off</span>
                                <p className="text-sm">Sin notificaciones</p>
                            </div>
                        ) : (
                            notifications.map(n => {
                                const content = (
                                    <div
                                        key={n.id}
                                        className={`px-4 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${!n.leida ? 'bg-primary/5' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-medium text-sm text-slate-900 dark:text-white">{n.titulo}</p>
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{timeAgo(n.created_at)}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{n.mensaje}</p>
                                    </div>
                                );
                                return n.link ? (
                                    <Link key={n.id} href={n.link} onClick={() => setOpen(false)}>
                                        {content}
                                    </Link>
                                ) : (
                                    <div key={n.id}>{content}</div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
