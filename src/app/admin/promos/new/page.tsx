'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '@/components/ui/ImageUpload';

type BusinessOption = {
    id: string;
    nombre: string;
    municipio: string;
    estado: string;
};

export default function NewAdminPromoPage() {
    const router = useRouter();
    const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
    const [loadingBusinesses, setLoadingBusinesses] = useState(true);
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [businessId, setBusinessId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [codigo, setCodigo] = useState('');
    const [condiciones, setCondiciones] = useState('');
    const [fotos, setFotos] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadBusinesses() {
            try {
                const response = await fetch('/api/admin/businesses', { cache: 'no-store' });
                const result = await response.json().catch(() => null) as { businesses?: BusinessOption[] } | null;

                if (!response.ok) {
                    throw new Error('businesses_failed');
                }

                if (!cancelled) {
                    setBusinesses(result?.businesses || []);
                }
            } catch {
                if (!cancelled) {
                    setError('No pudimos cargar los negocios disponibles.');
                }
            } finally {
                if (!cancelled) {
                    setLoadingBusinesses(false);
                }
            }
        }

        void loadBusinesses();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const response = await fetch('/api/admin/promos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId,
                    titulo,
                    descripcion,
                    startDate,
                    endDate,
                    codigo,
                    condiciones,
                    fotos,
                }),
            });

            const result = await response.json().catch(() => null) as { error?: string } | null;

            if (!response.ok) {
                setError(result?.error || 'No pudimos crear la promoción.');
                return;
            }

            router.push('/promos');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-2xl mx-auto">
            <Link href="/admin" className="text-sm text-slate-500 hover:text-primary transition flex items-center gap-1 mb-6">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Panel Admin
            </Link>

            <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Nueva Promo</h1>
            <p className="mb-6 text-slate-500 dark:text-slate-400">Publica una promoción aprobada desde admin para cualquier negocio.</p>

            <form onSubmit={handleCreate} className="flex flex-col gap-5 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Negocio *</label>
                    <select
                        required
                        value={businessId}
                        onChange={e => setBusinessId(e.target.value)}
                        disabled={loadingBusinesses}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700"
                    >
                        <option value="">{loadingBusinesses ? 'Cargando negocios...' : 'Seleccionar negocio...'}</option>
                        {businesses.map(business => (
                            <option key={business.id} value={business.id}>
                                {business.nombre} ({business.municipio})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título *</label>
                    <input type="text" required value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" placeholder="Ej: 20% de descuento este fin de semana" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
                    <textarea rows={4} value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 resize-none" placeholder="Explica la promoción..." />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha Inicio *</label>
                        <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha Fin *</label>
                        <input type="date" required min={startDate} value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Código Promo</label>
                        <input type="text" value={codigo} onChange={e => setCodigo(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" placeholder="DESCUBRE20" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Condiciones</label>
                        <input type="text" value={condiciones} onChange={e => setCondiciones(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" placeholder="Ej: Solo lunes a jueves" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Fotos</label>
                    <ImageUpload value={fotos} onChange={setFotos} max={3} />
                </div>

                {error ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                        <span className="material-symbols-outlined text-red-500 shrink-0">error</span>
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                ) : null}

                <button type="submit" disabled={saving || loadingBusinesses || businesses.length === 0} className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" /> Creando...</> : <><span className="material-symbols-outlined">local_offer</span> Crear Promo</>}
                </button>
            </form>
        </div>
    );
}
