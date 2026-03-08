'use client';
import { useEffect, useState } from 'react';

type ContentType = 'businesses' | 'events' | 'promotions' | 'service_listings';
type ModerationAction = 'approve' | 'reject';

interface PendingItem {
    id: string;
    type: ContentType;
    title: string;
    subtitle: string;
    created_at: string;
}

const TABS: { key: ContentType; label: string; icon: string }[] = [
    { key: 'businesses', label: 'Negocios', icon: 'storefront' },
    { key: 'events', label: 'Eventos', icon: 'event' },
    { key: 'promotions', label: 'Promos', icon: 'local_offer' },
    { key: 'service_listings', label: 'Clasificados', icon: 'campaign' },
];

export default function ModerationPage() {
    const [tab, setTab] = useState<ContentType>('businesses');
    const [items, setItems] = useState<PendingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState<string | null>(null);
    const [counts, setCounts] = useState<Record<ContentType, number>>({ businesses: 0, events: 0, promotions: 0, service_listings: 0 });

    useEffect(() => {
        let cancelled = false;

        const fetchItems = async () => {
            setLoading(true);

            try {
                const response = await fetch(`/api/admin/moderation?tab=${tab}`, { cache: 'no-store' });
                const result = await response.json().catch(() => null) as {
                    counts?: Record<ContentType, number>;
                    items?: PendingItem[];
                } | null;

                if (!response.ok || !result) {
                    throw new Error('moderation_failed');
                }

                if (cancelled) return;

                setCounts(result.counts || { businesses: 0, events: 0, promotions: 0, service_listings: 0 });
                setItems(result.items || []);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void fetchItems();

        return () => {
            cancelled = true;
        };
    }, [tab]);

    const handleAction = async (id: string, action: ModerationAction) => {
        setActing(id);
        try {
            const response = await fetch('/api/admin/moderation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, tab, action }),
            });

            if (!response.ok) {
                throw new Error('moderation_action_failed');
            }

            setItems(prev => prev.filter(i => i.id !== id));
            setCounts(prev => ({ ...prev, [tab]: Math.max(0, prev[tab] - 1) }));
        } finally {
            setActing(null);
        }
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('es-PR', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black mb-1 text-slate-900 dark:text-white">Moderación</h1>
                <p className="text-slate-500 dark:text-slate-400">Aprueba o rechaza contenido pendiente</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto mb-6 pb-1">
                {TABS.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${tab === t.key ? 'bg-primary text-white shadow-sm' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-primary'}`}
                    >
                        <span className="material-symbols-outlined text-lg">{t.icon}</span>
                        {t.label}
                        {counts[t.key] > 0 && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tab === t.key ? 'bg-white/20' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                                {counts[t.key]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Items */}
            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1,2,3].map(i => <div key={i} className="h-20 bg-white dark:bg-slate-900 rounded-xl animate-pulse" />)}
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="material-symbols-outlined text-5xl text-green-400 mb-3 block">check_circle</span>
                    <p className="text-lg font-medium text-slate-600 dark:text-slate-400">No hay contenido pendiente</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500">en {TABS.find(t => t.key === tab)?.label}</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {items.map(item => (
                        <div key={item.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 md:p-5 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg truncate text-slate-900 dark:text-white">{item.title}</h3>
                                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                    {item.subtitle && <span>{item.subtitle}</span>}
                                    <span>{formatDate(item.created_at)}</span>
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                                <button
                                    onClick={() => handleAction(item.id, 'approve')}
                                    disabled={acting === item.id}
                                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium text-sm transition disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-lg">check</span>
                                    Aprobar
                                </button>
                                <button
                                    onClick={() => handleAction(item.id, 'reject')}
                                    disabled={acting === item.id}
                                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-lg">close</span>
                                    Rechazar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
