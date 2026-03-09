'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import MobileNav from '@/components/ui/MobileNav';
import BotProtectionFields from '@/components/ui/BotProtectionFields';
import PublishGateNotice from '@/components/ui/PublishGateNotice';
import { useAuth } from '@/lib/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import ImageUpload from '@/components/ui/ImageUpload';
import { MUNICIPIOS } from '@/lib/constants/municipios';
import { useBotProtection } from '@/lib/security/use-bot-protection';
import { usePublishAccess } from '@/lib/subscriptions/use-publish-access';
import type { Business } from '@/lib/types/database';

export default function SubmitEventPage() {
    const { user, loading: authLoading } = useAuth();
    const [supabase] = useState(() => createClient());

    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [municipio, setMunicipio] = useState('');
    const [startDatetime, setStartDatetime] = useState('');
    const [endDatetime, setEndDatetime] = useState('');
    const [costo, setCosto] = useState('0');
    const [link, setLink] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [businessId, setBusinessId] = useState('');
    const [fotos, setFotos] = useState<string[]>([]);
    const [myBusinesses, setMyBusinesses] = useState<Business[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const botProtection = useBotProtection();
    const publishAccess = usePublishAccess();

    useEffect(() => {
        if (!user) return;
        supabase
            .from('businesses')
            .select('*')
            .eq('owner_id', user.id)
            .then(({ data }) => setMyBusinesses(data || []));
    }, [user, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/submit/event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId,
                    titulo,
                    descripcion,
                    startDatetime,
                    endDatetime,
                    municipio,
                    costo,
                    link,
                    whatsapp,
                    fotos,
                    contactWebsite: botProtection.honeypot,
                    startedAt: botProtection.startedAt,
                    captchaToken: botProtection.captchaToken,
                }),
            });

            const result = await response.json().catch(() => null) as { error?: string } | null;

            if (!response.ok) {
                setError(result?.error || 'No pudimos guardar el evento.');
                return;
            }

            setSuccess(true);
        } catch {
            setError('No pudimos guardar el evento.');
        } finally {
            botProtection.resetChallenge();
            setSubmitting(false);
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
            <p className="text-xl text-slate-500 text-center">Debes iniciar sesión para publicar un evento</p>
            <Link href="/auth/login" className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-hover transition">
                Iniciar Sesión
            </Link>
        </div>
    );

    if (!publishAccess.loading && !publishAccess.canPublish) return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark pb-16 md:pb-0">
            <Header />
            <main className="flex-1 flex items-center justify-center px-4">
                <div className="max-w-lg w-full">
                    <PublishGateNotice reason={publishAccess.reason || 'Necesitas un plan activo para publicar eventos.'} businessCount={publishAccess.businessCount} />
                </div>
            </main>
            <MobileNav />
        </div>
    );

    if (success) return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark pb-16 md:pb-0">
            <Header />
            <main className="flex-1 flex items-center justify-center px-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-lg border border-slate-200 dark:border-slate-700">
                    <span className="material-symbols-outlined text-6xl text-green-500 mb-4 block">check_circle</span>
                    <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Evento Enviado</h2>
                    <p className="text-slate-500 mb-6">Tu evento fue enviado y está pendiente de aprobación.</p>
                    <div className="flex flex-col gap-3">
                        <Link href="/events" className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-hover transition">
                            Ver Eventos
                        </Link>
                        <button onClick={() => { setSuccess(false); setTitulo(''); setDescripcion(''); setMunicipio(''); setStartDatetime(''); setEndDatetime(''); setCosto('0'); setLink(''); setWhatsapp(''); setBusinessId(''); }} className="text-primary font-medium hover:underline">
                            Publicar Otro
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
                        <Link href="/events" className="text-sm text-slate-500 hover:text-primary transition flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">arrow_back</span> Eventos
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-symbols-outlined text-3xl text-primary">event</span>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Publicar Evento</h1>
                                <p className="text-slate-500 text-sm">Comparte tu evento con la comunidad de Puerto Rico</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título del Evento *</label>
                                <input type="text" required value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-primary focus:border-primary" placeholder="Ej: Festival de Salsa en la Playa" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
                                <textarea rows={3} value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-primary focus:border-primary resize-none" placeholder="Describe el evento, artistas, actividades..." />
                            </div>

                            {myBusinesses.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Asociar a Negocio (opcional)</label>
                                    <select value={businessId} onChange={e => setBusinessId(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-primary focus:border-primary">
                                        <option value="">Sin negocio asociado</option>
                                        {myBusinesses.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Inicio *</label>
                                    <input type="datetime-local" required value={startDatetime} onChange={e => setStartDatetime(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fin *</label>
                                    <input type="datetime-local" required value={endDatetime} onChange={e => setEndDatetime(e.target.value)} min={startDatetime} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-primary focus:border-primary" />
                                </div>
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
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Costo ($)</label>
                                    <input type="number" min="0" step="0.01" value={costo} onChange={e => setCosto(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-primary focus:border-primary" placeholder="0 = Gratis" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Link / Boletos</label>
                                    <input type="url" value={link} onChange={e => setLink(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-primary focus:border-primary" placeholder="https://..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">WhatsApp</label>
                                    <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-primary focus:border-primary" placeholder="787-555-1234" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Fotos del Evento</label>
                                <ImageUpload value={fotos} onChange={setFotos} max={5} />
                            </div>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                                    <span className="material-symbols-outlined text-red-500 shrink-0">error</span>
                                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            <BotProtectionFields
                                honeypot={botProtection.honeypot}
                                onHoneypotChange={botProtection.setHoneypot}
                                onCaptchaTokenChange={botProtection.setCaptchaToken}
                                resetKey={botProtection.challengeNonce}
                            />

                            <button type="submit" disabled={submitting || (botProtection.captchaEnabled && !botProtection.captchaToken)} className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
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
