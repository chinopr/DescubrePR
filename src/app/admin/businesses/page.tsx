'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type AdminBusiness = {
    id: string;
    owner_id: string;
    nombre: string;
    municipio: string;
    estado: string;
    categorias: string[];
    metrics_view_count: number;
    metrics_click_count: number;
    created_at: string;
};

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
    pending: { label: 'Pendiente', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    approved: { label: 'Aprobado', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    published: { label: 'Publicado', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    rejected: { label: 'Rechazado', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    draft: { label: 'Borrador', cls: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
};

export default function AdminBusinessesPage() {
    const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function fetchBusinesses() {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (search) params.set('search', search);

                const response = await fetch(`/api/admin/businesses?${params.toString()}`, { cache: 'no-store' });
                const result = await response.json().catch(() => null) as { businesses?: AdminBusiness[] } | null;

                if (!response.ok) {
                    throw new Error('businesses_failed');
                }

                if (!cancelled) {
                    setBusinesses(result?.businesses || []);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void fetchBusinesses();

        return () => {
            cancelled = true;
        };
    }, [search]);

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black mb-1 text-slate-900 dark:text-white">Negocios</h1>
                    <p className="text-slate-500 dark:text-slate-400">{businesses.length} negocio(s)</p>
                </div>
                <Link href="/admin/moderation" className="bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-5 rounded-lg transition flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-lg">fact_check</span> Moderar Pendientes
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xl">search</span>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por nombre..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white dark:bg-slate-900 rounded-xl animate-pulse" />)}
                </div>
            ) : businesses.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">storefront</span>
                    <p className="text-lg text-slate-500 dark:text-slate-400">No se encontraron negocios</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {businesses.map(business => {
                        const badge = STATUS_BADGE[business.estado] || STATUS_BADGE.draft;
                        return (
                            <div key={business.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-blue-500">storefront</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="font-bold truncate text-slate-900 dark:text-white">{business.nombre}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.cls}`}>{badge.label}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{business.municipio} &middot; {(business.categorias || []).join(', ') || 'Sin categoría'}</p>
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">
                                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                                            {business.metrics_view_count || 0} vistas
                                        </span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">
                                            <span className="material-symbols-outlined text-[14px]">ads_click</span>
                                            {business.metrics_click_count || 0} clics
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    {business.estado === 'pending' ? (
                                        <Link href="/admin/moderation" className="text-slate-700 dark:text-slate-300 hover:text-primary text-sm font-medium flex items-center gap-1 transition">
                                            <span className="material-symbols-outlined text-sm">fact_check</span> Moderar
                                        </Link>
                                    ) : null}
                                    <Link href={`/businesses/${business.id}`} className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                                        Ver <span className="material-symbols-outlined text-sm">open_in_new</span>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
