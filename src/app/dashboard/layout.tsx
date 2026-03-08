'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Resumen', icon: 'dashboard' },
    { href: '/dashboard/businesses', label: 'Mis Negocios', icon: 'storefront' },
    { href: '/dashboard/events', label: 'Mis Eventos', icon: 'event' },
    { href: '/dashboard/promos', label: 'Mis Promos', icon: 'local_offer' },
    { href: '/dashboard/services', label: 'Mis Clasificados', icon: 'campaign' },
    { href: '/dashboard/subscription', label: 'Suscripción', icon: 'card_membership' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, profile, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            {/* Mobile header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between text-slate-900 dark:text-slate-100">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 text-slate-900 dark:text-slate-100">
                    <span className="material-symbols-outlined">{sidebarOpen ? 'close' : 'menu'}</span>
                </button>
                <Link href="/dashboard" className="font-bold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined">store</span>
                    Mi Negocio
                </Link>
                <Link href="/" className="text-sm text-slate-700 dark:text-slate-300 hover:text-primary">
                    <span className="material-symbols-outlined">home</span>
                </Link>
            </div>

            {/* Sidebar */}
            <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-40 transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 hidden md:block">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-3xl text-primary">store</span>
                        <div>
                            <h1 className="font-bold text-lg text-slate-900 dark:text-white">DescubrePR</h1>
                            <p className="text-xs text-slate-600 dark:text-slate-400">Panel de Negocio</p>
                        </div>
                    </Link>
                </div>
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 hidden md:block">
                    <p className="text-sm font-medium truncate text-slate-900 dark:text-white">{profile?.nombre || 'Mi Cuenta'}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{user.email}</p>
                </div>
                <nav className="flex-1 py-4 mt-14 md:mt-0">
                    {NAV_ITEMS.map(item => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${isActive ? 'text-primary bg-primary/5 border-r-2 border-primary' : 'text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                <span className={`material-symbols-outlined ${isActive ? 'font-variation-fill' : ''}`}>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                    <Link href="/submit/business" className="flex items-center gap-2 text-sm text-primary font-medium px-2 py-2 hover:bg-primary/5 rounded-lg transition">
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        Nuevo Negocio
                    </Link>
                    <Link href="/" className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-primary transition-colors px-2 py-2">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Volver al sitio
                    </Link>
                </div>
            </aside>

            {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

            <main className="flex-1 pt-14 md:pt-0 min-h-screen">
                {children}
            </main>
        </div>
    );
}
