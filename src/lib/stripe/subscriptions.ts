import { createAdminClient } from '@/lib/supabase/admin'
import { getPlanByPriceId } from '@/lib/constants/plans'
import {
  inferPlanIdFromStripeSubscription,
  retrieveStripeCheckoutSession,
  retrieveStripeSubscription,
  type StripeSubscriptionObject,
} from '@/lib/stripe/server'

function toIso(timestamp: number | null | undefined) {
  return timestamp ? new Date(timestamp * 1000).toISOString() : null
}

async function resolveUserId(
  adminClient: ReturnType<typeof createAdminClient>,
  subscription: StripeSubscriptionObject
) {
  const metadataUserId = subscription.metadata?.user_id
  if (metadataUserId) return metadataUserId

  if (!subscription.id && !subscription.customer) return null

  const filters = [
    subscription.id ? `stripe_subscription_id.eq.${subscription.id}` : null,
    subscription.customer ? `stripe_customer_id.eq.${subscription.customer}` : null,
  ].filter(Boolean)

  if (filters.length === 0) return null

  const { data } = await adminClient
    .from('subscriptions')
    .select('user_id')
    .or(filters.join(','))
    .maybeSingle()

  return data?.user_id || null
}

export async function upsertStripeSubscription(
  subscription: StripeSubscriptionObject,
  options: {
    checkoutSessionId?: string | null
    expectedUserId?: string | null
  } = {}
) {
  const adminClient = createAdminClient()
  const resolvedUserId = await resolveUserId(adminClient, subscription)
  const userId = options.expectedUserId || resolvedUserId

  if (!userId) return null

  const priceId = subscription.items?.data?.[0]?.price?.id || null
  const planId = inferPlanIdFromStripeSubscription(subscription) || getPlanByPriceId(priceId)?.id || null

  const payload = {
    user_id: userId,
    plan_id: planId,
    stripe_customer_id: subscription.customer,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    stripe_checkout_session_id: options.checkoutSessionId ?? null,
    status: subscription.status,
    cancel_at_period_end: subscription.cancel_at_period_end,
    current_period_start: toIso(subscription.current_period_start),
    current_period_end: toIso(subscription.current_period_end),
    canceled_at: toIso(subscription.canceled_at),
  }

  const { data, error } = await adminClient
    .from('subscriptions')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function syncStripeCheckoutSession(sessionId: string, expectedUserId?: string | null) {
  const session = await retrieveStripeCheckoutSession(sessionId)
  const sessionUserId = session.metadata?.user_id || session.client_reference_id || null

  if (expectedUserId && sessionUserId && sessionUserId !== expectedUserId) {
    throw new Error('Stripe session does not belong to the current user')
  }

  if (!session.subscription) {
    return null
  }

  const subscription = await retrieveStripeSubscription(session.subscription)
  return upsertStripeSubscription(subscription, {
    checkoutSessionId: session.id,
    expectedUserId: expectedUserId || sessionUserId,
  })
}
