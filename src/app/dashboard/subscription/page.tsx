import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PLANS, getPlanById } from '@/lib/constants/plans'
import type { Subscription } from '@/lib/types/database'

type Props = {
    searchParams?: Promise<Record<string, string | string[] | undefined>>
}

const ACTIVE_STATUSES = new Set(['trialing', 'active', 'past_due', 'unpaid', 'paused'])

function getStatusLabel(status: string) {
    switch (status) {
        case 'trialing':
            return 'Prueba'
        case 'active':
            return 'Activo'
        case 'past_due':
            return 'Pago pendiente'
        case 'unpaid':
            return 'Sin pagar'
        case 'canceled':
            return 'Cancelado'
        case 'paused':
            return 'Pausado'
        default:
            return 'Inactivo'
    }
}

export default async function SubscriptionPage({ searchParams }: Props) {
    const params = searchParams ? await searchParams : {}
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: subscription } = user
        ? await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle()
        : { data: null }

    const currentSubscription = subscription as Subscription | null
    const currentPlan = currentSubscription?.plan_id ? getPlanById(currentSubscription.plan_id) : null
    const hasManageableSubscription = !!currentSubscription?.stripe_customer_id && ACTIVE_STATUSES.has(currentSubscription.status)
    const success = params.success === '1'
    const canceled = params.canceled === '1'
    const errorCode = typeof params.error === 'string' ? params.error : null

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto text-slate-900 dark:text-slate-100">
            <div className="mb-8">
                <h1 className="text-3xl font-black mb-1 text-slate-900 dark:text-white">Suscripción</h1>
                <p className="text-slate-600 dark:text-slate-400">Administra tu plan de DescubrePR</p>
            </div>

            {success && (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800/30 px-4 py-3 text-sm text-green-700 dark:text-green-300">
                    Stripe confirmó tu pago. Tu plan debe reflejarse automáticamente cuando llegue el webhook.
                </div>
            )}
            {canceled && (
                <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800/30 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                    Cancelaste el checkout antes de completar el pago.
                </div>
            )}
            {errorCode && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800/30 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                    No pudimos completar la operación de Stripe. Revisa la configuración o intenta de nuevo.
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-8 text-slate-900 dark:text-slate-100">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400 text-2xl">card_membership</span>
                    </div>
                    <div>
                        <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                            Plan Actual: <span className="text-slate-600 dark:text-slate-300">{currentPlan?.name || 'Gratis'}</span>
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Estado: {currentSubscription ? getStatusLabel(currentSubscription.status) : 'Sin suscripción activa'}
                        </p>
                    </div>
                </div>

                {currentSubscription?.current_period_end && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        Próxima fecha clave: {new Date(currentSubscription.current_period_end).toLocaleDateString('es-PR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </p>
                )}

                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-500 shrink-0">info</span>
                    <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                            {currentPlan ? 'Gestiona tu suscripción desde Stripe' : 'Mejora tu plan para desbloquear más funcionalidades'}
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            {currentPlan
                                ? 'Los upgrades, cancelaciones y cambios de método de pago se manejan desde el portal de facturación.'
                                : 'Destaca tu negocio, publica eventos ilimitados y obtén estadísticas avanzadas.'}
                        </p>
                    </div>
                </div>

                {hasManageableSubscription && (
                    <form action="/api/stripe/portal" method="post" className="mt-4">
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold px-5 py-2.5 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">manage_accounts</span>
                            Administrar facturación
                        </button>
                    </form>
                )}
            </div>

            <h3 className="font-bold text-xl mb-4 text-slate-900 dark:text-white">Planes Disponibles</h3>
            <div className="flex flex-col gap-4">
                {PLANS.map(plan => {
                    const isCurrentPlan = currentSubscription?.plan_id === plan.id && ACTIVE_STATUSES.has(currentSubscription.status)

                    return (
                        <div
                            key={plan.id}
                            className={`bg-white dark:bg-slate-900 rounded-xl border-2 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-slate-900 dark:text-slate-100 ${
                                plan.highlighted ? 'border-primary' : 'border-slate-200 dark:border-slate-800'
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${plan.highlighted ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                                <span className="material-symbols-outlined text-2xl">{plan.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{plan.name}</h3>
                                    {plan.highlighted && <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">Popular</span>}
                                    {isCurrentPlan && <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-bold px-2 py-0.5 rounded-full">Actual</span>}
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{plan.features.slice(0, 3).join(' · ')}</p>
                            </div>
                            <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto">
                                <span className="text-2xl font-black text-slate-900 dark:text-white">${plan.price}<span className="text-sm font-normal text-slate-600 dark:text-slate-400">/mes</span></span>
                                {isCurrentPlan ? (
                                    <span className="px-5 py-2.5 rounded-lg font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300">
                                        En uso
                                    </span>
                                ) : (
                                    <form action="/api/stripe/checkout" method="post">
                                        <input type="hidden" name="planId" value={plan.id} />
                                        <button
                                            type="submit"
                                            className={`px-5 py-2.5 rounded-lg font-bold text-sm transition flex items-center gap-1.5 ${
                                                plan.highlighted
                                                    ? 'bg-primary hover:bg-primary-hover text-white'
                                                    : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-primary/10 dark:hover:bg-primary/15 hover:border-primary/40 text-slate-900 dark:text-slate-100'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-lg">upgrade</span>
                                            Elegir
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-8 text-center">
                <Link href="/pricing" className="text-primary text-sm font-medium hover:underline flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-sm">info</span>
                    Ver comparación detallada de planes
                </Link>
            </div>
        </div>
    )
}
