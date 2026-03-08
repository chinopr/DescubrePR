'use client';
import { useEffect, useRef, useState } from 'react';

interface ShareButtonsProps {
    title: string;
    text?: string;
    hashtags?: string[];
}

export default function ShareButtons({ title, text, hashtags = [] }: ShareButtonsProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

    useEffect(() => {
        if (!showMenu) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showMenu]);

    const getUrl = () => typeof window !== 'undefined' ? window.location.href : '';

    const share = async (platform: string) => {
        const url = getUrl();
        const msg = text || title;
        const encoded = encodeURIComponent(url);
        const encodedText = encodeURIComponent(`${msg} - DescubrePR`);
        const hashtagQuery = hashtags.length > 0 ? `&hashtags=${encodeURIComponent(hashtags.join(','))}` : '';

        const links: Record<string, string> = {
            whatsapp: `https://wa.me/?text=${encodedText}%20${encoded}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encoded}${hashtagQuery}`,
        };

        if (platform === 'copy') {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setShowMenu(false);
            setTimeout(() => setCopied(false), 2000);
            return;
        }

        if (platform === 'native' && navigator.share) {
            await navigator.share({ title, text: msg, url });
            setShowMenu(false);
            return;
        }

        window.open(links[platform], '_blank', 'noopener,noreferrer,width=600,height=400');
        setShowMenu(false);
    };

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                aria-label={`Compartir ${title}`}
                aria-expanded={showMenu}
                className="inline-flex items-center gap-2 rounded-full backdrop-blur-sm bg-white/90 dark:bg-slate-800/90 px-3 py-2 shadow-sm border border-white/60 dark:border-slate-700/80 transition-transform hover:scale-[1.02] text-slate-800 dark:text-slate-100"
            >
                <span className="material-symbols-outlined text-slate-700 dark:text-slate-300 text-[20px]">share</span>
                <span className="text-sm font-semibold">Compartir</span>
                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[18px]">
                    {showMenu ? 'expand_less' : 'expand_more'}
                </span>
            </button>

            {showMenu && (
                <div className="absolute right-0 top-14 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 min-w-[220px] z-50">
                    {canNativeShare && (
                        <button
                            type="button"
                            onClick={() => void share('native')}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition text-left text-sm font-medium text-slate-800 dark:text-slate-100"
                        >
                            <span className="material-symbols-outlined text-primary">ios_share</span>
                            Compartir con el sistema
                        </button>
                    )}
                    {canNativeShare && <hr className="my-1 border-slate-200 dark:border-slate-700" />}
                    <button type="button" onClick={() => void share('whatsapp')} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition text-left text-sm font-medium text-slate-800 dark:text-slate-100">
                        <span className="material-symbols-outlined text-green-500">chat</span>
                        WhatsApp
                    </button>
                    <button type="button" onClick={() => void share('facebook')} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition text-left text-sm font-medium text-slate-800 dark:text-slate-100">
                        <span className="material-symbols-outlined text-blue-600">thumb_up</span>
                        Facebook
                    </button>
                    <button type="button" onClick={() => void share('twitter')} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition text-left text-sm font-medium text-slate-800 dark:text-slate-100">
                        <span className="material-symbols-outlined text-sky-500">tag</span>
                        X / Twitter
                    </button>
                    <hr className="my-1 border-slate-200 dark:border-slate-700" />
                    <button type="button" onClick={() => void share('copy')} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition text-left text-sm font-medium text-slate-800 dark:text-slate-100">
                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">{copied ? 'check' : 'content_copy'}</span>
                        {copied ? 'Copiado!' : 'Copiar enlace'}
                    </button>
                </div>
            )}
        </div>
    );
}
