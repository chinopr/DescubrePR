'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import NotificationBell from './NotificationBell';

export default function Header() {
    const { user, profile, loading, signOut } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/20 dark:border-primary/10 px-4 md:px-10 py-3 bg-background-light dark:bg-background-dark sticky top-0 z-50">
            <div className="flex items-center gap-4 md:gap-8">
                <Link href="/" className="flex items-center gap-2 md:gap-4 text-primary">
                    <span className="material-symbols-outlined text-3xl">map</span>
                    <h2 className="text-xl font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100 hidden sm:block">Explore PR</h2>
                </Link>
                <label className="flex flex-col min-w-40 !h-10 max-w-64 hidden md:flex">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-primary/10 dark:bg-primary/20">
                        <div className="text-primary flex items-center justify-center pl-4 rounded-l-lg">
                            <span className="material-symbols-outlined text-[24px]">search</span>
                        </div>
                        <input
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-slate-500 dark:placeholder:text-slate-400 px-4 rounded-l-none pl-2 text-base font-normal leading-normal text-slate-900 dark:text-slate-100"
                            placeholder="Search"
                            defaultValue=""
                        />
                    </div>
                </label>
            </div>
            <div className="flex flex-1 justify-end gap-4 md:gap-8">
                <nav className="hidden md:flex items-center gap-9">
                    <Link className="text-primary font-medium leading-normal border-b-2 border-primary py-2" href="/">Explore</Link>
                    <Link className="text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary font-medium leading-normal transition-colors" href="/map">Map</Link>
                    <Link className="text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary font-medium leading-normal transition-colors" href="/events">Events</Link>
                    <Link className="text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary font-medium leading-normal transition-colors" href="/promos">Promos</Link>
                    <Link className="text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary font-medium leading-normal transition-colors" href="/services">Classifieds</Link>
                    <Link className="text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary font-medium leading-normal transition-colors" href="/pricing">Planes</Link>
                </nav>

                {loading ? (
                    <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                ) : user ? (
                    <div className="flex items-center gap-3">
                        <NotificationBell />
                        <Link href="/favorites" className="text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-colors" title="Mis Favoritos">
                            <span className="material-symbols-outlined text-2xl">favorite</span>
                        </Link>
                        <Link href="/profile" className="flex items-center gap-2">
                            <div
                                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-primary/30 bg-primary/10 flex items-center justify-center text-primary font-bold"
                                style={profile?.avatar_url ? { backgroundImage: `url(${profile.avatar_url})` } : undefined}
                            >
                                {!profile?.avatar_url && (profile?.nombre?.[0]?.toUpperCase() || 'U')}
                            </div>
                            <span className="hidden lg:block text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                                {profile?.nombre || 'Mi Perfil'}
                            </span>
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className="hidden md:flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors"
                            title="Cerrar sesión"
                        >
                            <span className="material-symbols-outlined text-xl">logout</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <Link
                            href="/auth/login"
                            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors hidden md:block"
                        >
                            Entrar
                        </Link>
                        <Link
                            href="/auth/register"
                            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">person_add</span>
                            <span className="hidden sm:inline">Registro</span>
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
}
