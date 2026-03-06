'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import type { FavoriteTarget } from '@/lib/types/database';

interface FavoriteButtonProps {
    id: string;
    type: FavoriteTarget;
    className?: string;
}

export default function FavoriteButton({ id, type, className = '' }: FavoriteButtonProps) {
    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (!user) return;
        supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('target_type', type)
            .eq('target_id', id)
            .maybeSingle()
            .then(({ data }) => setIsFavorite(!!data));
    }, [user, id, type, supabase]);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (loading || !user) return;

        setLoading(true);
        const prev = isFavorite;
        setIsFavorite(!prev);

        if (prev) {
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('target_type', type)
                .eq('target_id', id);
            if (error) setIsFavorite(prev);
        } else {
            const { error } = await supabase
                .from('favorites')
                .insert({ user_id: user.id, target_type: type, target_id: id });
            if (error) setIsFavorite(prev);
        }
        setLoading(false);
    };

    return (
        <button
            onClick={toggleFavorite}
            disabled={loading}
            className={`p-2 rounded-full backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 shadow-sm transition-all hover:scale-105 active:scale-95 ${className}`}
            aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
            <span className={`material-symbols-outlined ${isFavorite ? 'text-rose-500 font-variation-fill' : 'text-slate-400 dark:text-slate-300'}`}>
                favorite
            </span>
        </button>
    );
}
