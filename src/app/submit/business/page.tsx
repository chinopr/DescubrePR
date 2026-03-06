'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import MobileNav from '@/components/ui/MobileNav';
import { useAuth } from '@/lib/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { MUNICIPIOS, BUSINESS_CATEGORIES } from '@/lib/constants/municipios';

export default function SubmitBusinessPage() {
    const { user, loading: authLoading } = useAuth();
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
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const toggleCategory = (cat: string) => {
        setCategorias(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : prev.length < 3 ? [...prev, cat] : prev
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSubmitting(true);
        setError(null);

        const { error: insertError } = await supabase.from('businesses').insert({
            owner_id: user.id,
            nombre,
            descripcion: descripcion || null,
            municipio,
            address_text: addressText || null,
            telefono: telefono || null,
            whatsapp: whatsapp || null,
            instagram: instagram || null,
            website: website || null,
            categorias,
            estado: 'pending',
        });

        if (insertError) {
            setError(insertError.message);
            setSubmitting(false);
        } else {
            setSuccess(true);
        }
    };

    if (authLoading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (!user) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
            <span className="material-symbols-outlined text-6xl text-slate-300">lock</span>
            <p className="text-xl text-slate-500 text-center">Debes iniciar sesión para registrar un negocio</p>
            <Link href="/auth/login" className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-hover transition">
                Iniciar Sesión
            </Link>
        </div>
    );

    if (success) return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark pb-16 md:pb-0">
            <Header />
            <main className="flex-1 flex items-center justify-center px-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-lg border border-slate-200 dark:border-slate-700">
                    <span className="material-symbols-outlined text-6xl text-green-500 mb-4 block">check_circle</span>
                    <h2 className="text-2xl font-bold mb-2">Negocio Registrado</h2>
                    <p className="text-slate-500 mb-6">Tu negocio fue enviado y está pendiente de aprobación. Te notificaremos cuando sea publicado.</p>
                    <div className="flex flex-col gap-3">
                        <Link href="/" className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-hover transition">
                            Volver al Inicio
                        </Link>
                        <button onClick={() => { setSuccess(false); setNombre(''); setDescripcion(''); setMunicipio(''); setAddressText(''); setTelefono(''); setWhatsapp(''); setInstagram(''); setWebsite(''); setCategorias([]); }} className="text-primary font-medium hover:underline">
                            Registrar Otro
                        </button>
                    </div>
                </div>
            </main>
            <MobileNav />
        </div>
    );

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark pb-16 md:pb-0">
            <Header />
            <main className="flex-1 px-4 md:px-10 py-6 md:py-8 flex justify-center">
                <div className="max-w-2xl w-full">
                    <div className="mb-6">
                        <Link href="/" className="text-sm text-slate-500 hover:text-primary transition flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">arrow_back</span> Volver
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-symbols-outlined text-3xl text-primary">storefront</span>
                            <div>
                                <h1 className="text-2xl font-bold">Registrar Negocio</h1>
                                <p className="text-slate-500 text-sm">Completa los datos de tu negocio para aparecer en DescubrePR</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre del Negocio *</label>
                                <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-primary focus:border-primary" placeholder="Ej: Café Don Pedro" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
                                <textarea rows={3} value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-primary focus:border-primary resize-none" placeholder="Describe tu negocio..." />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Municipio *</label>
                                    <select required value={municipio} onChange={e => setMunicipio(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-primary focus:border-primary">
                                        <option value="">Seleccionar...</option>
                                        {MUNICIPIOS.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dirección</label>
                                    <input type="text" value={addressText} onChange={e => setAddressText(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-primary focus:border-primary" placeholder="Calle, número, sector..." />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Categorías (máx. 3) *</label>
                                <div className="flex flex-wrap gap-2">
                                    {BUSINESS_CATEGORIES.map(cat => (
                                        <button key={cat} type="button" onClick={() => toggleCategory(cat)} className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${categorias.includes(cat) ? 'bg-primary text-white border-primary' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-primary'}`}>
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-slate-200 dark:border-slate-700 pt-5">
                                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400">contact_phone</span>
                                    Contacto
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
                                        <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-primary focus:border-primary" placeholder="787-555-1234" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">WhatsApp</label>
                                        <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-primary focus:border-primary" placeholder="787-555-1234" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Instagram</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">@</span>
                                            <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-primary focus:border-primary" placeholder="tunegocio" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Website</label>
                                        <input type="url" value={website} onChange={e => setWebsite(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-primary focus:border-primary" placeholder="https://tunegocio.com" />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                                    <span className="material-symbols-outlined text-red-500 shrink-0">error</span>
                                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            <button type="submit" disabled={submitting || categorias.length === 0} className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
                                {submitting ? (
                                    <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div> Enviando...</>
                                ) : (
                                    <><span className="material-symbols-outlined">send</span> Enviar para Aprobación</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
            <MobileNav />
        </div>
    );
}
