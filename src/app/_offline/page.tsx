import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
    title: 'Sin conexión',
    description: 'Estás sin conexión. Algunas partes de DescubrePR seguirán disponibles en modo offline básico.',
    path: '/_offline',
});

export default function OfflinePage() {
    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center px-4">
            <div className="max-w-md w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-8 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                    <span className="material-symbols-outlined text-4xl">wifi_off</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Sin conexión</h1>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                    No pudimos cargar esta página desde la red. Intenta de nuevo cuando recuperes conexión.
                </p>
                <div className="flex flex-col gap-3">
                    <Link
                        href="/"
                        className="rounded-xl bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 transition-colors"
                    >
                        Ir al inicio
                    </Link>
                    <p className="text-xs text-slate-400">
                        Si ya visitaste antes algunas rutas, el service worker podrá servir contenido cacheado.
                    </p>
                </div>
            </div>
        </main>
    );
}
