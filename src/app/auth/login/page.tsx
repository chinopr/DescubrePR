'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BotProtectionFields from '@/components/ui/BotProtectionFields';
import { useBotProtection } from '@/lib/security/use-bot-protection';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const botProtection = useBotProtection();
    const [supabase] = useState(() => createClient());

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    validateOnly: true,
                    contactWebsite: botProtection.honeypot,
                    startedAt: botProtection.startedAt,
                    captchaToken: botProtection.captchaToken,
                }),
            });

            const result = await response.json().catch(() => null) as { error?: string; redirectTo?: string } | null;

            if (!response.ok) {
                setError(result?.error || 'No pudimos iniciar sesión.');
                return;
            }

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                setError(
                    signInError.message === 'Invalid login credentials'
                        ? 'No pudimos iniciar sesión con esas credenciales.'
                        : 'No pudimos iniciar sesión.'
                );
                return;
            }

            const nextPath = typeof window !== 'undefined'
                ? new URLSearchParams(window.location.search).get('next')
                : null;
            const safeNext = nextPath && nextPath.startsWith('/') ? nextPath : null;
            router.push(safeNext || result?.redirectTo || '/profile');
            router.refresh();
        } catch {
            setError('No pudimos iniciar sesión.');
        } finally {
            botProtection.resetChallenge();
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-primary">
                    <span className="material-symbols-outlined text-5xl">explore</span>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
                    Bienvenido a DescubrePR
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                    ¿No tienes cuenta?{' '}
                    <Link href="/auth/register" className="font-medium text-primary hover:text-primary-hover">
                        Regístrate aquí
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-slate-200 dark:border-slate-700">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Email
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 text-sm">mail</span>
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 block w-full sm:text-sm border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg focus:ring-primary focus:border-primary"
                                    placeholder="tucorreo@ejemplo.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Contraseña
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 text-sm">lock</span>
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 block w-full sm:text-sm border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg focus:ring-primary focus:border-primary"
                                    placeholder="••••••••"
                                />
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
                                            Error al iniciar sesión
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
                                {loading ? 'Entrando...' : 'Entrar'}
                            </button>
                        </div>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-300 dark:border-slate-600" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">
                                        <Link href="/" className="hover:text-primary transition underline decoration-transparent hover:decoration-primary">
                                            Volver al inicio
                                        </Link>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
