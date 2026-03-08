'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Place } from '@/lib/types/database';

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
    pending: { label: 'Pendiente', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    approved: { label: 'Aprobado', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    published: { label: 'Publicado', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    rejected: { label: 'Rechazado', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    draft: { label: 'Borrador', cls: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
};

export default function AdminPlacesPage() {
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterMunicipio, setFilterMunicipio] = useState('');

    useEffect(() => {
        let cancelled = false;

        const fetchPlaces = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (search) params.set('search', search);
                if (filterMunicipio) params.set('municipio', filterMunicipio);

                const response = await fetch(`/api/admin/places?${params.toString()}`, { cache: 'no-store' });
                const result = await response.json().catch(() => null) as { places?: Place[] } | null;

                if (!response.ok) {
                    throw new Error('places_failed');
                }

                if (cancelled) return;

                setPlaces(result?.places || []);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void fetchPlaces();

        return () => {
            cancelled = true;
        };
    }, [filterMunicipio, search]);

    const handleDelete = async (id: string, nombre: string) => {
        if (!confirm(`Eliminar "${nombre}"? Esta accion no se puede deshacer.`)) return;
        const response = await fetch(`/api/admin/places/${id}`, { method: 'DELETE' });
        if (response.ok) {
            setPlaces(prev => prev.filter(p => p.id !== id));
        }
    };

    // Get unique municipios from loaded places for filter
    const municipios = [...new Set(places.map(p => p.municipio))].sort();

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black mb-1 text-slate-900 dark:text-white">Lugares</h1>
                    <p className="text-slate-500 dark:text-slate-400">{places.length} lugar(es)</p>
                </div>
                <Link href="/admin/places/new" className="bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-5 rounded-lg transition flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-lg">add</span> Nuevo Lugar
                </Link>
            </div>

            {/* Filters */}
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
                <select
                    value={filterMunicipio}
                    onChange={e => setFilterMunicipio(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                    <option value="">Todos los municipios</option>
                    {municipios.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1,2,3,4].map(i => <div key={i} className="h-16 bg-white dark:bg-slate-900 rounded-xl animate-pulse" />)}
                </div>
            ) : places.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">place</span>
                    <p className="text-lg text-slate-500 dark:text-slate-400">No se encontraron lugares</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {places.map(place => {
                        const badge = STATUS_BADGE[place.estado] || STATUS_BADGE['draft'];
                        return (
                            <div key={place.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                {place.fotos?.[0] && (
                                    <div className="w-12 h-12 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: `url("${place.fotos[0]}")` }} />
                                )}
                                {!place.fotos?.[0] && (
                                    <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-green-500">place</span>
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="font-bold truncate text-slate-900 dark:text-white">{place.nombre}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.cls}`}>{badge.label}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{place.municipio} &middot; {place.categorias?.join(', ')}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Link href={`/admin/places/${place.id}/edit`} className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm font-medium flex items-center gap-1 transition">
                                        <span className="material-symbols-outlined text-sm">edit</span> Editar
                                    </Link>
                                    <button onClick={() => handleDelete(place.id, place.nombre)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 text-sm font-medium flex items-center gap-1 transition">
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
