'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import ImageUpload from '@/components/ui/ImageUpload';
import { MUNICIPIOS } from '@/lib/constants/municipios';
import { formatCoordinates, parseLocationInput } from '@/lib/maps/location-input';
import type { ListingType } from '@/lib/types/database';

export default function EditServicePage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const router = useRouter();
    const supabase = createClient();

    const [tipo, setTipo] = useState<ListingType>('servicio');
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [municipio, setMunicipio] = useState('');
    const [precio, setPrecio] = useState('');
    const [telefono, setTelefono] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [locationReference, setLocationReference] = useState('');
    const [fotos, setFotos] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const tipoLabels: Record<ListingType, string> = { servicio: 'Servicio', producto: 'Producto', alquiler: 'Alquiler' };

    useEffect(() => {
        if (!user) return;
        supabase.from('service_listings').select('*').eq('id', id).eq('user_id', user.id).single()
            .then(({ data }) => {
                if (!data) { router.push('/dashboard/services'); return; }
                setTipo(data.tipo);
                setTitulo(data.titulo);
                setDescripcion(data.descripcion || '');
                setMunicipio(data.municipio);
                setPrecio(data.precio ? String(data.precio) : '');
                setTelefono(data.telefono || '');
                setWhatsapp(data.whatsapp || '');
                setLocationReference(formatCoordinates(data.lat, data.lng));
                setFotos(data.fotos || []);
                setLoading(false);
            });
    }, [user, id, supabase, router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSaving(true);
        const parsedLocation = tipo === 'alquiler' && locationReference.trim() ? parseLocationInput(locationReference) : null;

        if (tipo === 'alquiler' && locationReference.trim() && !parsedLocation) {
            setError('Ingresa coordenadas válidas o un enlace de Google Maps con ubicación.');
            setSaving(false);
            return;
        }

        await supabase.from('service_listings').update({
            tipo, titulo, descripcion: descripcion || null, municipio,
            lat: tipo === 'alquiler' ? parsedLocation?.lat ?? null : null,
            lng: tipo === 'alquiler' ? parsedLocation?.lng ?? null : null,
            precio: precio ? parseFloat(precio) : null,
            telefono: telefono || null, whatsapp: whatsapp || null, fotos,
        }).eq('id', id);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" /></div>;

    return (
        <div className="p-6 md:p-8 max-w-2xl mx-auto">
            <Link href="/dashboard/services" className="text-sm text-slate-500 hover:text-primary transition flex items-center gap-1 mb-6">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Mis Clasificados
            </Link>

            <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Editar Anuncio</h1>

            <form onSubmit={handleSave} className="flex flex-col gap-5 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tipo</label>
                    <div className="flex gap-3">
                        {(Object.entries(tipoLabels) as [ListingType, string][]).map(([key, label]) => (
                            <button key={key} type="button" onClick={() => setTipo(key)} className={`flex-1 py-2.5 rounded-lg font-medium border transition text-center ${tipo === key ? 'bg-primary text-white border-primary' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-primary'}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titulo *</label>
                    <input type="text" required value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripcion</label>
                    <textarea rows={4} value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 resize-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Municipio *</label>
                        <select required value={municipio} onChange={e => setMunicipio(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700">
                            {MUNICIPIOS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Precio ($)</label>
                        <input type="number" min="0" step="0.01" value={precio} onChange={e => setPrecio(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" />
                    </div>
                </div>
                {tipo === 'alquiler' && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ubicación para Cómo Llegar</label>
                        <input type="text" value={locationReference} onChange={e => setLocationReference(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" placeholder="18.4655, -66.1057 o enlace de Google Maps" />
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Solo para alquileres. Si la llenas, el detalle mostrará el botón <span className="font-semibold">Cómo llegar</span>.</p>
                    </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefono</label>
                        <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">WhatsApp</label>
                        <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" />
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
