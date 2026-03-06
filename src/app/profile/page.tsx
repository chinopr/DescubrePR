'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import MobileNav from '@/components/ui/MobileNav';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [favCount, setFavCount] = useState(0);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }
            setUser(user);

            const { count } = await supabase
                .from('favorites')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            setFavCount(count || 0);
            setLoading(false);
        }
        getUser();
    }, [supabase, router]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark pb-16 md:pb-0">
            <Header />

            <main className="flex-1 w-full max-w-4xl mx-auto p-6 md:py-12">

                {/* PROFILE HEADER */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-md">
                        <span className="material-symbols-outlined text-5xl">person</span>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-black mb-1">{user.user_metadata?.nombre || 'Mi Perfil'}</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-4">{user.email}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                {user.user_metadata?.rol === 'business' ? 'Dueño de Negocio' : 'Explorador'}
                            </span>
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                Activo
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="px-6 py-2 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    >
                        Cerrar Sesión
                    </button>
                </div>

                {/* QUICK LINKS */}
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/favorites" className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-rose-500 font-variation-fill">favorite</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold group-hover:text-primary transition-colors">Mis Favoritos</h3>
                            <p className="text-sm text-slate-500">{favCount} guardados</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                    </Link>
                    <Link href="/submit/business" className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">storefront</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold group-hover:text-primary transition-colors">Registrar Negocio</h3>
                            <p className="text-sm text-slate-500">Publica tu negocio</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                    </Link>
                    <Link href="/dashboard" className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-purple-500">dashboard</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold group-hover:text-primary transition-colors">Panel de Negocio</h3>
                            <p className="text-sm text-slate-500">Administra tu contenido</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                    </Link>
                </section>

            </main>

            <MobileNav />
        </div>
    );
}
