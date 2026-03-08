import { createHmac, timingSafeEqual } from 'crypto'
import { getPlanById, getPlanByPriceId, type PlanId } from '@/lib/constants/plans'

const STRIPE_API_BASE = 'https://api.stripe.com/v1'

type StripeRequestOptions = {
    method?: 'GET' | 'POST'
    body?: URLSearchParams
}

type StripeCheckoutSession = {
    id: string
    url: string | null
    customer: string | null
    subscription: string | null
    client_reference_id: string | null
    metadata?: Record<string, string>
}

export type StripeSubscriptionObject = {
    id: string
    customer: string | null
    status: string
    cancel_at_period_end: boolean
    current_period_start: number | null
    current_period_end: number | null
    canceled_at: number | null
    metadata?: Record<string, string>
    items?: {
        data: Array<{
            price?: {
                id?: string | null
            } | null
        }>
    }
}

export type StripeWebhookEvent<T = unknown> = {
    type: string
    data: {
        object: T
    }
}

function getStripeSecretKey() {
    const secretKey = process.env.STRIPE_SECRET_KEY

    if (!secretKey) {
        throw new Error('Missing STRIPE_SECRET_KEY')
    }

    return secretKey
}

function getStripeWebhookSecret() {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
        throw new Error('Missing STRIPE_WEBHOOK_SECRET')
    }

    return webhookSecret
}

export function getAppUrl() {
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

async function stripeRequest<T>(path: string, options: StripeRequestOptions = {}): Promise<T> {
    const response = await fetch(`${STRIPE_API_BASE}${path}`, {
        method: options.method || 'GET',
        headers: {
            Authorization: `Bearer ${getStripeSecretKey()}`,
            ...(options.body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
        },
        body: options.body?.toString(),
        cache: 'no-store',
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Stripe request failed (${response.status}): ${errorText}`)
    }

    return response.json() as Promise<T>
}

export async function createStripeCheckoutSession({
    planId,
    userId,
    userEmail,
}: {
    planId: PlanId
    userId: string
    userEmail: string | null
}) {
    const plan = getPlanById(planId)

    if (!plan) {
        throw new Error('Invalid plan selected')
    }

    const appUrl = getAppUrl()
    const params = new URLSearchParams()
    params.set('mode', 'subscription')
    params.set('success_url', `${appUrl}/dashboard/subscription?success=1&session_id={CHECKOUT_SESSION_ID}`)
    params.set('cancel_url', `${appUrl}/dashboard/subscription?canceled=1`)
    params.set('line_items[0][price]', plan.priceId)
    params.set('line_items[0][quantity]', '1')
    params.set('client_reference_id', userId)
    params.set('allow_promotion_codes', 'true')
    params.set('metadata[user_id]', userId)
    params.set('metadata[plan_id]', plan.id)
    params.set('metadata[price_id]', plan.priceId)
    params.set('subscription_data[metadata][user_id]', userId)
    params.set('subscription_data[metadata][plan_id]', plan.id)
    params.set('subscription_data[metadata][price_id]', plan.priceId)

    if (userEmail) {
        params.set('customer_email', userEmail)
    }

    return stripeRequest<StripeCheckoutSession>('/checkout/sessions', {
        method: 'POST',
        body: params,
    })
}

export async function createStripeBillingPortalSession({
    customerId,
}: {
    customerId: string
}) {
    const params = new URLSearchParams()
    params.set('customer', customerId)
    params.set('return_url', `${getAppUrl()}/dashboard/subscription`)

    return stripeRequest<{ url: string }>('/billing_portal/sessions', {
        method: 'POST',
        body: params,
    })
}

export async function retrieveStripeSubscription(subscriptionId: string) {
    return stripeRequest<StripeSubscriptionObject>(`/subscriptions/${subscriptionId}`)
}

export function verifyStripeWebhookSignature(payload: string, signatureHeader: string | null) {
    if (!signatureHeader) return false

    const webhookSecret = getStripeWebhookSecret()
    const signatureParts = signatureHeader.split(',').reduce<Record<string, string>>((acc, part) => {
        const [key, value] = part.split('=')
        if (key && value) {
            acc[key] = value
        }
        return acc
    }, {})

    const timestamp = signatureParts.t
    const signature = signatureParts.v1

    if (!timestamp || !signature) return false

    const signedPayload = `${timestamp}.${payload}`
    const expectedSignature = createHmac('sha256', webhookSecret)
        .update(signedPayload, 'utf8')
        .digest('hex')

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8')
    const signatureBuffer = Buffer.from(signature, 'utf8')

    if (expectedBuffer.length !== signatureBuffer.length) return false

    return timingSafeEqual(expectedBuffer, signatureBuffer)
}

export function getStripeSubscriptionPriceId(subscription: StripeSubscriptionObject) {
    return subscription.items?.data?.[0]?.price?.id || null
}

export function inferPlanIdFromStripeSubscription(subscription: StripeSubscriptionObject) {
    const priceId = getStripeSubscriptionPriceId(subscription)
    return subscription.metadata?.plan_id || getPlanByPriceId(priceId)?.id || null
}
