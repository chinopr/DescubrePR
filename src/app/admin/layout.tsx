'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';

const NAV_ITEMS = [
    { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
    { href: '/admin/moderation', label: 'Moderación', icon: 'fact_check' },
    { href: '/admin/businesses', label: 'Negocios', icon: 'storefront' },
    { href: '/admin/places', label: 'Lugares', icon: 'place' },
    { href: '/admin/promos/new', label: 'Nueva Promo', icon: 'local_offer' },
    { href: '/admin/services/new', label: 'Nuevo Clasificado', icon: 'campaign' },
    { href: '/admin/users', label: 'Usuarios', icon: 'group' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
            {/* Mobile header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 text-slate-900 dark:text-slate-100">
                    <span className="material-symbols-outlined">{sidebarOpen ? 'close' : 'menu'}</span>
                </button>
                <Link href="/admin" className="font-bold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined">admin_panel_settings</span>
                    Admin Panel
                </Link>
                <Link href="/" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary">
                    <span className="material-symbols-outlined">home</span>
                </Link>
            </div>

            {/* Sidebar */}
            <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-40 transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 hidden md:block">
                    <Link href="/admin" className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-3xl text-primary">admin_panel_settings</span>
                        <div>
                            <h1 className="font-bold text-lg text-slate-900 dark:text-white">DescubrePR</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Admin Panel</p>
                        </div>
                    </Link>
                </div>
                <nav className="flex-1 py-4 mt-14 md:mt-0">
                    {NAV_ITEMS.map(item => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${isActive ? 'text-primary bg-primary/5 border-r-2 border-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                <span className={`material-symbols-outlined ${isActive ? 'font-variation-fill' : ''}`}>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <Link href="/" className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors px-2 py-2">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Volver al sitio
                    </Link>
                </div>
            </aside>

            {/* Overlay */}
            {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* Content */}
            <main className="flex-1 pt-14 md:pt-0 min-h-screen">
                {children}
            </main>
        </div>
    );
}
