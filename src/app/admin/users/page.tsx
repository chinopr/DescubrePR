'use client';
import { useEffect, useState } from 'react';
import type { Profile, UserRole } from '@/lib/types/database';

const ROLE_LABELS: Record<UserRole, { label: string; color: string }> = {
    user: { label: 'Usuario', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' },
    business: { label: 'Negocio', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
    admin: { label: 'Admin', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' },
};

export default function UsersPage() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchUsers() {
            try {
                const response = await fetch('/api/admin/users', { cache: 'no-store' });
                const result = await response.json().catch(() => null) as { users?: Profile[] } | null;

                if (!response.ok) {
                    throw new Error('users_failed');
                }

                if (!cancelled) {
                    setUsers(result?.users || []);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }
        void fetchUsers();

        return () => {
            cancelled = true;
        };
    }, []);

    const changeRole = async (userId: string, newRole: UserRole) => {
        setUpdating(userId);
        try {
            const response = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, newRole }),
            });

            if (!response.ok) {
                throw new Error('role_failed');
            }

            setUsers(prev => prev.map(u => u.id === userId ? { ...u, rol: newRole } : u));
        } finally {
            setUpdating(null);
        }
    };

    const filtered = search
        ? users.filter(u => u.nombre.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
        : users;

    const formatDate = (d: string) => new Date(d).toLocaleDateString('es-PR', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black mb-1 text-slate-900 dark:text-white">Usuarios</h1>
                    <p className="text-slate-500 dark:text-slate-400">{users.length} registrados</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">search</span>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o email..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary text-sm"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1,2,3,4].map(i => <div key={i} className="h-16 bg-white dark:bg-slate-900 rounded-xl animate-pulse" />)}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Usuario</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rol</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Registro</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filtered.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                    {user.nombre?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <span className="font-medium text-slate-900 dark:text-white">{user.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ROLE_LABELS[user.rol].color}`}>
                                                {ROLE_LABELS[user.rol].label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{formatDate(user.created_at)}</td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={user.rol}
                                                onChange={e => changeRole(user.id, e.target.value as UserRole)}
                                                disabled={updating === user.id}
                                                className="text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-2 py-1.5 disabled:opacity-50"
                                            >
                                                <option value="user">Usuario</option>
                                                <option value="business">Negocio</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                        {filtered.map(user => (
                            <div key={user.id} className="p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                                    {user.nombre?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate text-slate-900 dark:text-white">{user.nombre}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                                </div>
                                <select
                                    value={user.rol}
                                    onChange={e => changeRole(user.id, e.target.value as UserRole)}
                                    disabled={updating === user.id}
                                    className="text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-2 py-1.5 disabled:opacity-50"
                                >
                                    <option value="user">Usuario</option>
                                    <option value="business">Negocio</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                            <span className="material-symbols-outlined text-4xl mb-2 block">search_off</span>
                            <p>No se encontraron usuarios</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
