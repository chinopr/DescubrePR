'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { MUNICIPIOS, BUSINESS_CATEGORIES } from '@/lib/constants/municipios';
import { parseLocationInput } from '@/lib/maps/location-input';

export default function EditBusinessPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const router = useRouter();
    const supabase = createClient();

    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [municipio, setMunicipio] = useState('');
    const [addressText, setAddressText] = useState('');
    const [telefono, setTelefono] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [instagram, setInstagram] = useState('');
    const [website, setWebsite] = useState('');
    const [categorias, setCategorias] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        supabase.from('businesses').select('*').eq('id', id).eq('owner_id', user.id).single()
            .then(({ data }) => {
                if (!data) { router.push('/dashboard/businesses'); return; }
                setNombre(data.nombre);
                setDescripcion(data.descripcion || '');
                setMunicipio(data.municipio);
                setAddressText(data.address_text || '');
                setTelefono(data.telefono || '');
                setWhatsapp(data.whatsapp || '');
                setInstagram(data.instagram || '');
                setWebsite(data.website || '');
                setCategorias(data.categorias || []);
                setLoading(false);
            });
    }, [user, id, supabase, router]);

    const toggleCategory = (cat: string) => {
        setCategorias(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : prev.length < 3 ? [...prev, cat] : prev
        );
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSaving(true);
        const parsedLocation = addressText.trim() ? parseLocationInput(addressText) : null;
        await supabase.from('businesses').update({
            nombre, descripcion: descripcion || null, municipio,
            lat: parsedLocation?.lat ?? null,
            lng: parsedLocation?.lng ?? null,
            address_text: addressText || null, telefono: telefono || null,
            whatsapp: whatsapp || null, instagram: instagram || null,
            website: website || null, categorias,
        }).eq('id', id);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" /></div>;

    return (
        <div className="p-6 md:p-8 max-w-2xl mx-auto">
            <Link href="/dashboard/businesses" className="text-sm text-slate-500 hover:text-primary transition flex items-center gap-1 mb-6">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Mis Negocios
            </Link>

            <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Editar Negocio</h1>

            <form onSubmit={handleSave} className="flex flex-col gap-5 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre *</label>
                    <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripcion</label>
                    <textarea rows={3} value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 resize-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Municipio *</label>
                        <select required value={municipio} onChange={e => setMunicipio(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700">
                            {MUNICIPIOS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dirección o Link de Google Maps</label>
                        <input type="text" value={addressText} onChange={e => setAddressText(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" placeholder="Calle, número, sector o https://maps.google.com/..." />
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Si pegas un enlace de Google Maps, el botón <span className="font-semibold">Cómo llegar</span> del negocio usará ese destino.</p>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Categorias (max 3)</label>
                    <div className="flex flex-wrap gap-2">
                        {BUSINESS_CATEGORIES.map(cat => (
                            <button key={cat} type="button" onClick={() => toggleCategory(cat)} className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${categorias.includes(cat) ? 'bg-primary text-white border-primary' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-primary'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefono</label>
                        <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">WhatsApp</label>
                        <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Instagram</label>
                        <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" placeholder="@tunegocio" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Website</label>
                        <input type="url" value={website} onChange={e => setWebsite(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" />
                    </div>
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
