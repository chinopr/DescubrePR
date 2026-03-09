'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '@/components/ui/ImageUpload';
import { MUNICIPIOS, PLACE_CATEGORIES } from '@/lib/constants/municipios';
import type { PlaceCost, ContentStatus } from '@/lib/types/database';

export default function EditPlacePage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [municipio, setMunicipio] = useState('');
    const [addressText, setAddressText] = useState('');
    const [categorias, setCategorias] = useState<string[]>([]);
    const [costo, setCosto] = useState<PlaceCost>('free');
    const [fotos, setFotos] = useState<string[]>([]);
    const [estado, setEstado] = useState<ContentStatus>('published');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const fetchPlace = async () => {
            const response = await fetch(`/api/admin/places/${id}`, { cache: 'no-store' });
            const result = await response.json().catch(() => null) as { place?: Record<string, unknown> } | null;

            if (!response.ok || !result?.place) {
                router.push('/admin/places');
                return;
            }

            const data = result.place;
            if (cancelled) return;

            setNombre(String(data.nombre || ''));
            setDescripcion(String(data.descripcion || ''));
            setMunicipio(String(data.municipio || ''));
            setAddressText(String(data.address_text || ''));
            setCategorias(Array.isArray(data.categorias) ? data.categorias.map(String) : []);
            setCosto(data.costo as PlaceCost);
            setFotos(Array.isArray(data.fotos) ? data.fotos.map(String) : []);
            setEstado(data.estado as ContentStatus);
            setLoading(false);
        };

        void fetchPlace();

        return () => {
            cancelled = true;
        };
    }, [id, router]);

    const toggleCategory = (cat: string) => {
        setCategorias(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const response = await fetch(`/api/admin/places/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    descripcion,
                    municipio,
                    addressText,
                    categorias,
                    costo,
                    fotos,
                    estado,
                }),
            });

            const result = await response.json().catch(() => null) as { error?: string } | null;

            if (!response.ok) {
                setError(result?.error || 'No pudimos guardar el lugar.');
                return;
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" /></div>;

    return (
        <div className="p-6 md:p-8 max-w-2xl mx-auto">
            <Link href="/admin/places" className="text-sm text-slate-500 hover:text-primary transition flex items-center gap-1 mb-6">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Lugares
            </Link>

            <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Editar Lugar</h1>

            <form onSubmit={handleSave} className="flex flex-col gap-5 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre *</label>
                        <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripcion</label>
                        <textarea rows={4} value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 resize-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Municipio *</label>
                        <select required value={municipio} onChange={e => setMunicipio(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700">
                            <option value="">Seleccionar...</option>
                            {MUNICIPIOS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dirección o Link de Google Maps</label>
                        <input type="text" value={addressText} onChange={e => setAddressText(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" placeholder="Ej: Sector La Parguera o https://maps.google.com/..." />
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Si pegas un enlace de Google Maps, el botón <span className="font-semibold">Cómo llegar</span> usará ese destino.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Costo</label>
                        <select value={costo} onChange={e => setCosto(e.target.value as PlaceCost)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700">
                            <option value="free">Gratis</option>
                            <option value="paid">Pago</option>
                            <option value="varies">Variable</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label>
                        <select value={estado} onChange={e => setEstado(e.target.value as ContentStatus)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700">
                            <option value="published">Publicado</option>
                            <option value="pending">Pendiente</option>
                            <option value="rejected">Rechazado</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Categorias</label>
                    <div className="flex flex-wrap gap-2">
                        {PLACE_CATEGORIES.map(cat => (
                            <button key={cat} type="button" onClick={() => toggleCategory(cat)} className={`px-3 py-1.5 rounded-full text-sm font-medium border transition capitalize ${categorias.includes(cat) ? 'bg-primary text-white border-primary' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-primary'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Fotos</label>
                    <ImageUpload value={fotos} onChange={setFotos} max={8} />
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                        <span className="material-symbols-outlined text-red-500 shrink-0">error</span>
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <button type="submit" disabled={saving} className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-lg transition disabled:opacity-50 flex items-center gap-2">
                        {saving ? <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" /> Guardando...</> : <><span className="material-symbols-outlined">save</span> Guardar Cambios</>}
                    </button>
                    {saved && <span className="text-green-500 text-sm font-medium flex items-center gap-1"><span className="material-symbols-outlined text-sm">check</span> Guardado</span>}
                </div>
            </form>
        </div>
    );
}
