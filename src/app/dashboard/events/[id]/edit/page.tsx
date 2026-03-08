'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import ImageUpload from '@/components/ui/ImageUpload';
import { MUNICIPIOS } from '@/lib/constants/municipios';

export default function EditEventPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const router = useRouter();
    const supabase = createClient();

    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [municipio, setMunicipio] = useState('');
    const [startDatetime, setStartDatetime] = useState('');
    const [endDatetime, setEndDatetime] = useState('');
    const [costo, setCosto] = useState('0');
    const [link, setLink] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [fotos, setFotos] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!user) return;
        supabase.from('events').select('*').eq('id', id).eq('created_by', user.id).single()
            .then(({ data }) => {
                if (!data) { router.push('/dashboard/events'); return; }
                setTitulo(data.titulo);
                setDescripcion(data.descripcion || '');
                setMunicipio(data.municipio);
                setStartDatetime(data.start_datetime?.slice(0, 16) || '');
                setEndDatetime(data.end_datetime?.slice(0, 16) || '');
                setCosto(String(data.costo || 0));
                setLink(data.link || '');
                setWhatsapp(data.whatsapp || '');
                setFotos(data.fotos || []);
                setLoading(false);
            });
    }, [user, id, supabase, router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        await supabase.from('events').update({
            titulo, descripcion: descripcion || null, municipio,
            start_datetime: startDatetime, end_datetime: endDatetime,
            costo: parseFloat(costo) || 0, link: link || null,
            whatsapp: whatsapp || null, fotos,
        }).eq('id', id);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" /></div>;

    return (
        <div className="p-6 md:p-8 max-w-2xl mx-auto">
            <Link href="/dashboard/events" className="text-sm text-slate-500 hover:text-primary transition flex items-center gap-1 mb-6">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Mis Eventos
            </Link>

            <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Editar Evento</h1>

            <form onSubmit={handleSave} className="flex flex-col gap-5 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titulo *</label>
                    <input type="text" required value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripcion</label>
                    <textarea rows={3} value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 resize-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Inicio *</label>
                        <input type="datetime-local" required value={startDatetime} onChange={e => setStartDatetime(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fin *</label>
                        <input type="datetime-local" required value={endDatetime} onChange={e => setEndDatetime(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Municipio *</label>
                        <select required value={municipio} onChange={e => setMunicipio(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700">
                            {MUNICIPIOS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Costo ($)</label>
                        <input type="number" min="0" step="0.01" value={costo} onChange={e => setCosto(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Link / Boletos</label>
                        <input type="url" value={link} onChange={e => setLink(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700" />
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
