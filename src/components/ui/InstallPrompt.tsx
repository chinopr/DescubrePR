'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            setDeferredPrompt(event as BeforeInstallPromptEvent);
        };

        const handleAppInstalled = () => {
            setDeferredPrompt(null);
            setHidden(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        await deferredPrompt.prompt();
        const result = await deferredPrompt.userChoice;

        if (result.outcome === 'accepted') {
            setHidden(true);
        }

        setDeferredPrompt(null);
    };

    if (!deferredPrompt || hidden) return null;

    return (
        <div className="fixed inset-x-4 bottom-20 md:bottom-6 md:left-auto md:right-6 md:max-w-sm z-[60]">
            <div className="rounded-2xl border border-primary/20 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-xl p-4">
                <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">download</span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 dark:text-white">Instala DescubrePR</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                            Guarda la app en tu pantalla de inicio para acceso rápido y soporte offline básico.
                        </p>
                    </div>
                </div>
                <div className="mt-4 flex gap-2">
                    <button
                        onClick={handleInstall}
                        className="flex-1 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-4 transition-colors"
                    >
                        Instalar
                    </button>
                    <button
                        onClick={() => setHidden(true)}
                        className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        Luego
                    </button>
                </div>
            </div>
        </div>
    );
}
