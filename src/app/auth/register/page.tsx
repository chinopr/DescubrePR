'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BotProtectionFields from '@/components/ui/BotProtectionFields';
import { useBotProtection } from '@/lib/security/use-bot-protection';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('user'); // user or business
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const botProtection = useBotProtection();
    const [supabase] = useState(() => createClient());

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    email,
                    password,
                    rol,
                    validateOnly: true,
                    contactWebsite: botProtection.honeypot,
                    startedAt: botProtection.startedAt,
                    captchaToken: botProtection.captchaToken,
                }),
            });

            const result = await response.json().catch(() => null) as { error?: string; redirectTo?: string } | null;

            if (!response.ok) {
                setError(result?.error || 'No pudimos crear la cuenta.');
                return;
            }

            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: nombre,
                        name: nombre,
                        role: rol,
                        nombre,
                        rol,
                    },
                },
            });

            if (signUpError) {
                setError('No pudimos crear la cuenta.');
                return;
            }

            router.push(data.session ? '/profile' : '/auth/login?registered=1');
            router.refresh();
        } catch {
            setError('No pudimos crear la cuenta.');
        } finally {
            botProtection.resetChallenge();
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-primary">
                    <span className="material-symbols-outlined text-5xl">person_add</span>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
                    Crea tu cuenta
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                    ¿Ya tienes cuenta?{' '}
                    <Link href="/auth/login" className="font-medium text-primary hover:text-primary-hover">
                        Inicia sesión
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-slate-200 dark:border-slate-700">
                    <form className="space-y-6" onSubmit={handleRegister}>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Nombre Completo
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                    type="text"
                                    required
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    className="block w-full sm:text-sm border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg focus:ring-primary focus:border-primary"
                                    placeholder="Juan del Pueblo"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Email
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full sm:text-sm border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg focus:ring-primary focus:border-primary"
                                    placeholder="tucorreo@ejemplo.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Contraseña
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full sm:text-sm border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg focus:ring-primary focus:border-primary"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                ¿Cómo usarás la app?
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <label className={`border rounded-lg p-3 text-center cursor-pointer transition ${rol === 'user' ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary font-bold' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                    <input type="radio" value="user" checked={rol === 'user'} onChange={(e) => setRol(e.target.value)} className="hidden" />
                                    Explorador
                                </label>
                                <label className={`border rounded-lg p-3 text-center cursor-pointer transition ${rol === 'business' ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary font-bold' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                    <input type="radio" value="business" checked={rol === 'business'} onChange={(e) => setRol(e.target.value)} className="hidden" />
                                    Dueño de Negocio
                                </label>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <span className="material-symbols-outlined text-red-400">error</span>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            Error al registrarse
                                        </h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>{error}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <BotProtectionFields
                            honeypot={botProtection.honeypot}
                            onHoneypotChange={botProtection.setHoneypot}
                            onCaptchaTokenChange={botProtection.setCaptchaToken}
                            resetKey={botProtection.challengeNonce}
                        />

                        <div>
                            <button
                                type="submit"
                                disabled={loading || (botProtection.captchaEnabled && !botProtection.captchaToken)}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition"
                            >
                                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                            </button>
                        </div>

                        <div className="mt-6 relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">
                                <Link href="/" className="hover:text-primary transition underline decoration-transparent hover:decoration-primary">
                                    Volver al inicio
                                </Link>
                            </span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
