'use client';
import Link from 'next/link';
import { PLANS } from '@/lib/constants/plans';

export default function SubscriptionPage() {
    // In production, you'd fetch the user's active subscription from Supabase
    // For now, show plans with upgrade links

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black mb-1">Suscripción</h1>
                <p className="text-slate-500">Administra tu plan de DescubrePR</p>
            </div>

            {/* Current plan */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400 text-2xl">card_membership</span>
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">Plan Actual: <span className="text-slate-500">Gratis</span></h2>
                        <p className="text-sm text-slate-500">Funcionalidades limitadas</p>
                    </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-500 shrink-0">info</span>
                    <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Mejora tu plan para desbloquear más funcionalidades</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Destaca tu negocio, publica eventos ilimitados y obtén estadísticas avanzadas.</p>
                    </div>
                </div>
            </div>

            {/* Available plans */}
            <h3 className="font-bold text-xl mb-4">Planes Disponibles</h3>
            <div className="flex flex-col gap-4">
                {PLANS.map(plan => (
                    <div
                        key={plan.id}
                        className={`bg-white dark:bg-slate-900 rounded-xl border-2 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
                            plan.highlighted ? 'border-primary' : 'border-slate-200 dark:border-slate-800'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${plan.highlighted ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                            <span className="material-symbols-outlined text-2xl">{plan.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg">{plan.name}</h3>
                                {plan.highlighted && <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">Popular</span>}
                            </div>
                            <p className="text-sm text-slate-500 mt-0.5">{plan.features.slice(0, 3).join(' · ')}</p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto">
                            <span className="text-2xl font-black">${plan.price}<span className="text-sm font-normal text-slate-500">/mes</span></span>
                            <a
                                href={plan.paymentLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`px-5 py-2.5 rounded-lg font-bold text-sm transition flex items-center gap-1.5 ${
                                    plan.highlighted
                                        ? 'bg-primary hover:bg-primary-hover text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-300'
                                }`}
                            >
                                <span className="material-symbols-outlined text-lg">upgrade</span>
                                Elegir
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <Link href="/pricing" className="text-primary text-sm font-medium hover:underline flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-sm">info</span>
                    Ver comparación detallada de planes
                </Link>
            </div>
        </div>
    );
}
