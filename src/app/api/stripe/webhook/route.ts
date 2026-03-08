import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
    inferPlanIdFromStripeSubscription,
    retrieveStripeSubscription,
    verifyStripeWebhookSignature,
    type StripeSubscriptionObject,
    type StripeWebhookEvent,
} from '@/lib/stripe/server'
import { getPlanByPriceId } from '@/lib/constants/plans'

export const runtime = 'nodejs'

function toIso(timestamp: number | null | undefined) {
    return timestamp ? new Date(timestamp * 1000).toISOString() : null
}

async function resolveUserId(adminClient: ReturnType<typeof createAdminClient>, subscription: StripeSubscriptionObject) {
    const metadataUserId = subscription.metadata?.user_id
    if (metadataUserId) return metadataUserId

    if (!subscription.id && !subscription.customer) return null

    const { data } = await adminClient
        .from('subscriptions')
        .select('user_id')
        .or([
            subscription.id ? `stripe_subscription_id.eq.${subscription.id}` : null,
            subscription.customer ? `stripe_customer_id.eq.${subscription.customer}` : null,
        ].filter(Boolean).join(','))
        .maybeSingle()

    return data?.user_id || null
}

async function upsertSubscription(subscription: StripeSubscriptionObject, checkoutSessionId?: string | null) {
    const adminClient = createAdminClient()
    const userId = await resolveUserId(adminClient, subscription)

    if (!userId) return

    const priceId = subscription.items?.data?.[0]?.price?.id || null
    const planId = inferPlanIdFromStripeSubscription(subscription) || getPlanByPriceId(priceId)?.id || null

    await adminClient
        .from('subscriptions')
        .upsert({
            user_id: userId,
            plan_id: planId,
            stripe_customer_id: subscription.customer,
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId,
            stripe_checkout_session_id: checkoutSessionId ?? null,
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_start: toIso(subscription.current_period_start),
            current_period_end: toIso(subscription.current_period_end),
            canceled_at: toIso(subscription.canceled_at),
        }, { onConflict: 'user_id' })
}

export async function POST(request: Request) {
    const payload = await request.text()
    const signatureHeader = request.headers.get('stripe-signature')

    try {
        const isValid = verifyStripeWebhookSignature(payload, signatureHeader)

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

        const event = JSON.parse(payload) as StripeWebhookEvent

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as {
                    id: string
                    subscription?: string | null
                }

                if (session.subscription) {
                    const subscription = await retrieveStripeSubscription(session.subscription)
                    await upsertSubscription(subscription, session.id)
                }
                break
            }
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as StripeSubscriptionObject
                await upsertSubscription(subscription)
                break
            }
            default:
                break
        }

        return NextResponse.json({ received: true })
    } catch {
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
    }
}
