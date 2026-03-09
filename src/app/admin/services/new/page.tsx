'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '@/components/ui/ImageUpload';
import { MUNICIPIOS } from '@/lib/constants/municipios';
import type { ListingType } from '@/lib/types/database';

export default function NewAdminServicePage() {
    const router = useRouter();
    const [tipo, setTipo] = useState<ListingType>('servicio');
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [municipio, setMunicipio] = useState('');
    const [precio, setPrecio] = useState('');
    const [telefono, setTelefono] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [locationReference, setLocationReference] = useState('');
    const [fotos, setFotos] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const tipoLabels: Record<ListingType, string> = {
        servicio: 'Servicio',
        producto: 'Producto',
        alquiler: 'Alquiler',
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const response = await fetch('/api/admin/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tipo,
                    titulo,
                    descripcion,
                    municipio,
                    precio,
                    telefono,
                    whatsapp,
                    locationReference,
                    fotos,
                }),
            });

            const result = await response.json().catch(() => null) as { error?: string } | null;

            if (!response.ok) {
                setError(result?.error || 'No pudimos crear el clasificado.');
                return;
            }

            router.push('/services');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-2xl mx-auto">
            <Link href="/admin" className="text-sm text-slate-500 hover:text-primary transition flex items-center gap-1 mb-6">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Panel Admin
            </Link>

            <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Nuevo Clasificado</h1>
            <p className="mb-6 text-slate-500 dark:text-slate-400">Crea un clasificado aprobado desde admin.</p>

            <form onSubmit={handleCreate} className="flex flex-col gap-5 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tipo *</label>
                    <div className="flex gap-3">
                        {(Object.entries(tipoLabels) as [ListingType, string][]).map(([key, label]) => (
                            <button key={key} type="button" onClick={() => setTipo(key)} className={`flex-1 py-2.5 rounded-lg font-medium border transition text-center ${tipo === key ? 'bg-primary text-white border-primary' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-primary'}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título *</label>
                    <input type="text" required value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" placeholder="Ej: Servicio de plomería residencial" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
                    <textarea rows={4} value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 resize-none" placeholder="Describe el clasificado..." />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Municipio *</label>
                        <select required value={municipio} onChange={e => setMunicipio(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700">
                            <option value="">Seleccionar...</option>
                            {MUNICIPIOS.map(municipioOption => <option key={municipioOption} value={municipioOption}>{municipioOption}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Precio ($)</label>
                        <input type="number" min="0" step="0.01" value={precio} onChange={e => setPrecio(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" placeholder="Opcional" />
                    </div>
                </div>

                {tipo === 'alquiler' && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ubicación para Cómo Llegar</label>
                        <input
                            type="text"
                            value={locationReference}
                            onChange={e => setLocationReference(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700"
                            placeholder="18.4655, -66.1057 o enlace de Google Maps"
                        />
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            Solo para alquileres. Se convertirá en el destino del botón <span className="font-semibold">Cómo llegar</span>.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
                        <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" placeholder="787-555-1234" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">WhatsApp</label>
                        <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" placeholder="787-555-1234" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Fotos</label>
                    <ImageUpload value={fotos} onChange={setFotos} max={5} />
                </div>

                {error ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                        <span className="material-symbols-outlined text-red-500 shrink-0">error</span>
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                ) : null}

                <button type="submit" disabled={saving} className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" /> Creando...</> : <><span className="material-symbols-outlined">campaign</span> Crear Clasificado</>}
                </button>
            </form>
        </div>
    );
}
