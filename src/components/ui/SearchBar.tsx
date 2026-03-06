'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MUNICIPIOS } from '@/lib/constants';

interface SearchBarProps {
    initialPueblo?: string;
    initialQuery?: string;
    className?: string;
}

export default function SearchBar({ initialPueblo = '', initialQuery = '', className = '' }: SearchBarProps) {
    const router = useRouter();
    const [pueblo, setPueblo] = useState(initialPueblo);
    const [query, setQuery] = useState(initialQuery);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (pueblo) params.set('pueblo', pueblo);
        if (query) params.set('q', query);

        router.push(`/map?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSearch} className={`w-full max-w-3xl z-10 bg-white dark:bg-slate-800 rounded-xl p-2 flex flex-col sm:flex-row items-center shadow-xl gap-2 sm:gap-0 ${className}`}>
            <div className="flex-1 flex w-full items-center px-4 sm:border-r border-slate-200 dark:border-slate-700 py-2 sm:py-0">
                <span className="material-symbols-outlined text-slate-400">location_on</span>
                <select
                    value={pueblo}
                    onChange={(e) => setPueblo(e.target.value)}
                    className="w-full border-none bg-transparent focus:ring-0 text-slate-900 dark:text-slate-100 h-10 appearance-none"
                >
                    <option value="">Cualquier Pueblo</option>
                    {MUNICIPIOS.map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
            </div>
            <div className="flex-1 flex w-full items-center px-4 py-2 sm:py-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-slate-400">category</span>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Categoría o lugar"
                    className="w-full border-none bg-transparent focus:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 h-10"
                />
            </div>
            <button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white font-bold py-3 sm:py-2 px-8 rounded-lg transition-colors shadow-md mt-2 sm:mt-0">
                Buscar
            </button>
        </form>
    );
}
