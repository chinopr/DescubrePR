'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import type { Promotion } from '@/lib/types/database';

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
    pending: { label: 'Pendiente', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    approved: { label: 'Activa', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    rejected: { label: 'Rechazada', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    expired: { label: 'Expirada', cls: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
};

export default function MyPromosPage() {
    const { user } = useAuth();
    const supabase = createClient();
    const [promos, setPromos] = useState<(Promotion & { business_name?: string })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        async function fetch() {
            const { data: myBiz } = await supabase.from('businesses').select('id, nombre').eq('owner_id', user!.id);
            if (!myBiz || myBiz.length === 0) { setLoading(false); return; }

            const bizIds = myBiz.map(b => b.id);
            const bizMap = Object.fromEntries(myBiz.map(b => [b.id, b.nombre]));

            const { data } = await supabase
                .from('promotions')
                .select('*')
                .in('business_id', bizIds)
                .order('created_at', { ascending: false });

            setPromos((data || []).map(p => ({ ...p, business_name: bizMap[p.business_id] })));
            setLoading(false);
        }
        fetch();
    }, [user, supabase]);

    const formatDate = (d: string) => new Date(d).toLocaleDateString('es-PR', { day: 'numeric', month: 'short' });

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black mb-1">Mis Promociones</h1>
                    <p className="text-slate-500">{promos.length} creada(s)</p>
                </div>
                <Link href="/submit/promo" className="bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-5 rounded-lg transition flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-lg">add</span> Nueva
                </Link>
            </div>

            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1,2].map(i => <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-xl animate-pulse" />)}
                </div>
            ) : promos.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">local_offer</span>
                    <p className="text-lg text-slate-500 mb-4">No tienes promociones creadas</p>
                    <Link href="/submit/promo" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-hover transition">
                        <span className="material-symbols-outlined">add</span> Crear Promoción
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {promos.map(promo => {
                        const isExpired = new Date(promo.end_date) < new Date();
                        const status = isExpired ? 'expired' : promo.estado;
                        const badge = STATUS_BADGE[status] || STATUS_BADGE['pending'];
                        return (
                            <div key={promo.id} className={`bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${isExpired ? 'opacity-60' : ''}`}>
                                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-amber-500">local_offer</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg truncate">{promo.titulo}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badge.cls}`}>{badge.label}</span>
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        {promo.business_name} &middot; {formatDate(promo.start_date)} - {formatDate(promo.end_date)}
                                        {promo.codigo && <span className="ml-2 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">{promo.codigo}</span>}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
