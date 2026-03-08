'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import MobileNav from '@/components/ui/MobileNav';
import PushNotificationCard from '@/components/ui/PushNotificationCard';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types/database';

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [favCount, setFavCount] = useState(0);
    const [editing, setEditing] = useState(false);
    const [nombre, setNombre] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const [supabase] = useState(() => createClient());
    const router = useRouter();

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/auth/login'); return; }
            setUser(user);

            const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            setProfile(prof);
            setNombre(prof?.nombre || user.user_metadata?.nombre || '');

            const { count } = await supabase
                .from('favorites')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);
            setFavCount(count || 0);
            setLoading(false);
        }
        getUser();
    }, [supabase, router]);

    const handleSaveProfile = async () => {
        if (!user) return;
        setSaving(true);
        await supabase.from('profiles').update({ nombre }).eq('id', user.id);
        setProfile((prev) => prev ? { ...prev, nombre } : prev);
        setSaving(false);
        setSaved(true);
        setEditing(false);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;
        setUploading(true);

        const ext = file.name.split('.').pop();
        const path = `avatars/${user.id}.${ext}`;

        await supabase.storage.from('media').upload(path, file, { cacheControl: '3600', upsert: true });
        const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
        const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

        await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id);
        setProfile((prev) => prev ? { ...prev, avatar_url: avatarUrl } : prev);
        setUploading(false);
    };

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

    const displayName = profile?.nombre || nombre || user?.user_metadata?.nombre || 'Mi Perfil';
    const avatarUrl = profile?.avatar_url;

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark pb-16 md:pb-0">
            <Header />

            <main className="flex-1 w-full max-w-4xl mx-auto p-6 md:py-12">

                {/* PROFILE HEADER */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative group">
                        <div
                            className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-md bg-cover bg-center"
                            style={avatarUrl ? { backgroundImage: `url("${avatarUrl}")` } : undefined}
                        >
                            {!avatarUrl && <span className="material-symbols-outlined text-5xl">person</span>}
                        </div>
                        <button
                            onClick={() => fileRef.current?.click()}
                            disabled={uploading}
                            className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            {uploading
                                ? <span className="material-symbols-outlined text-white animate-spin">progress_activity</span>
                                : <span className="material-symbols-outlined text-white">photo_camera</span>
                            }
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        {editing ? (
                            <div className="flex items-center gap-3 mb-2">
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={e => setNombre(e.target.value)}
                                    className="text-2xl font-bold border-b-2 border-primary bg-transparent focus:outline-none w-full max-w-xs"
                                    autoFocus
                                />
                                <button onClick={handleSaveProfile} disabled={saving} className="text-primary hover:text-primary-hover transition">
                                    <span className="material-symbols-outlined">check</span>
                                </button>
                                <button onClick={() => { setEditing(false); setNombre(displayName); }} className="text-slate-400 hover:text-slate-600 transition">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white">{displayName}</h1>
                                <button onClick={() => setEditing(true)} className="text-slate-400 hover:text-primary transition">
                                    <span className="material-symbols-outlined text-xl">edit</span>
                                </button>
                                {saved && <span className="text-green-500 text-sm font-medium">Guardado</span>}
                            </div>
                        )}
                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-4">{user?.email}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                {profile?.rol === 'business' ? 'Negocio' : profile?.rol === 'admin' ? 'Admin' : 'Explorador'}
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
                        Cerrar Sesion
                    </button>
                </div>

                {/* QUICK LINKS */}
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/favorites" className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-rose-500 font-variation-fill">favorite</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Mis Favoritos</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{favCount} guardados</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                    </Link>
                    {profile?.rol !== 'admin' && (
                        <Link href="/submit/business" className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary">storefront</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Registrar Negocio</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Publica tu negocio</p>
                            </div>
                            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                        </Link>
                    )}
                    {profile?.rol === 'admin' ? (
                        <Link href="/admin" className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">admin_panel_settings</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Panel Admin</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Moderación y control del sistema</p>
                            </div>
                            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                        </Link>
                    ) : (
                        <Link href="/dashboard" className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <span className="material-symbols-outlined text-purple-500">dashboard</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Panel de Negocio</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Administra tu contenido</p>
                            </div>
                            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                        </Link>
                    )}
                    <Link href="/pricing" className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-amber-500">card_membership</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Planes</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Ver opciones de suscripcion</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                    </Link>
                </section>

                <section className="mt-8">
                    <PushNotificationCard />
                </section>

            </main>

            <MobileNav />
        </div>
    );
}
