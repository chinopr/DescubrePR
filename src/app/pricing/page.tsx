'use client';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import MobileNav from '@/components/ui/MobileNav';
import { useAuth } from '@/lib/auth/AuthProvider';
import { PLANS } from '@/lib/constants/plans';

export default function PricingPage() {
    const { user } = useAuth();

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark pb-16 md:pb-0">
            <Header />
            <main className="flex-1 px-4 md:px-10 py-8 md:py-16 flex justify-center">
                <div className="max-w-5xl w-full">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-black mb-4">
                            Haz crecer tu <span className="text-primary">negocio</span>
                        </h1>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                            Elige el plan ideal para dar visibilidad a tu negocio en toda la isla.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {PLANS.map(plan => (
                            <div
                                key={plan.id}
                                className={`relative bg-white dark:bg-slate-900 rounded-2xl border-2 p-6 md:p-8 flex flex-col transition-shadow hover:shadow-xl ${
                                    plan.highlighted
                                        ? 'border-primary shadow-lg scale-[1.02] md:scale-105'
                                        : 'border-slate-200 dark:border-slate-800'
                                }`}
                            >
                                {plan.highlighted && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                                        Más Popular
                                    </div>
                                )}

                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan.highlighted ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                                        <span className="material-symbols-outlined text-2xl">{plan.icon}</span>
                                    </div>
                                    <h2 className="text-2xl font-black">{plan.name}</h2>
                                </div>

                                <div className="mb-6">
                                    <span className="text-4xl font-black">${plan.price}</span>
                                    <span className="text-slate-500 text-sm"> /mes</span>
                                </div>

                                <ul className="flex-1 flex flex-col gap-3 mb-8">
                                    {plan.features.map((feat, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <span className="material-symbols-outlined text-green-500 text-lg shrink-0">check_circle</span>
                                            <span className="text-slate-600 dark:text-slate-300">{feat}</span>
                                        </li>
                                    ))}
                                </ul>

                                {user ? (
                                    <a
                                        href={plan.paymentLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-full py-3 rounded-xl font-bold text-center transition flex items-center justify-center gap-2 ${
                                            plan.highlighted
                                                ? 'bg-primary hover:bg-primary-hover text-white shadow-md'
                                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-300'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-lg">shopping_cart</span>
                                        Suscribirme
                                    </a>
                                ) : (
                                    <Link
                                        href="/auth/register"
                                        className={`w-full py-3 rounded-xl font-bold text-center transition flex items-center justify-center gap-2 ${
                                            plan.highlighted
                                                ? 'bg-primary hover:bg-primary-hover text-white shadow-md'
                                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-300'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-lg">person_add</span>
                                        Crear Cuenta
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-slate-400 text-sm">
                            Todos los planes incluyen 14 días de prueba gratis. Cancela cuando quieras.
                        </p>
                        <p className="text-slate-400 text-sm mt-1">
                            Pagos procesados de forma segura por Stripe.
                        </p>
                    </div>
                </div>
            </main>
            <MobileNav />
        </div>
    );
}
