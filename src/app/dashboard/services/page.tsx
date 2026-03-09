'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import BoostActionButton from '@/components/ui/BoostActionButton';
import { createClient } from '@/lib/supabase/client';
import type { ServiceListing } from '@/lib/types/database';

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
    pending: { label: 'Pendiente', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    approved: { label: 'Activo', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    rejected: { label: 'Rechazado', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    sold: { label: 'Vendido', cls: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
};

const TIPO_LABEL: Record<string, string> = { servicio: 'Servicio', producto: 'Producto', alquiler: 'Alquiler' };

export default function MyServicesPage() {
    const { user } = useAuth();
    const supabase = createClient();
    const [items, setItems] = useState<ServiceListing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        supabase
            .from('service_listings')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .then(({ data }) => { setItems(data || []); setLoading(false); });
    }, [user, supabase]);

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto text-slate-900 dark:text-slate-100">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black mb-1 text-slate-900 dark:text-white">Mis Clasificados</h1>
                    <p className="text-slate-600 dark:text-slate-400">{items.length} anuncio(s)</p>
                </div>
                <Link href="/submit/service" className="bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-5 rounded-lg transition flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-lg">add</span> Nuevo
                </Link>
            </div>

            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1,2].map(i => <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-xl animate-pulse" />)}
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">campaign</span>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">No tienes anuncios creados</p>
                    <Link href="/submit/service" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-hover transition">
                        <span className="material-symbols-outlined">add</span> Crear Anuncio
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {items.map(item => {
                        const badge = STATUS_BADGE[item.estado] || STATUS_BADGE['pending'];
                        return (
                            <div key={item.id} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-slate-900 dark:text-slate-100">
                                <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-teal-500">campaign</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg truncate text-slate-900 dark:text-white">{item.titulo}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badge.cls}`}>{badge.label}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {TIPO_LABEL[item.tipo]} &middot; {item.municipio}
                                        {item.precio && <span className="ml-2 font-bold text-primary">${item.precio}</span>}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">
                                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                                            {item.metrics_view_count} vistas
                                        </span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">
                                            <span className="material-symbols-outlined text-[14px]">ads_click</span>
                                            {item.metrics_click_count} clics
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3 shrink-0">
                                    <BoostActionButton
                                        targetType="service"
                                        targetId={item.id}
                                        boostExpiresAt={item.boost_expires_at}
                                        boostScore={item.boost_score}
                                    />
                                    <Link href={`/dashboard/services/${item.id}/edit`} className="text-slate-700 dark:text-slate-300 hover:text-primary text-sm font-medium flex items-center gap-1 transition shrink-0">
                                        <span className="material-symbols-outlined text-sm">edit</span> Editar
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
