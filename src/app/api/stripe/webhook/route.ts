import { NextResponse } from 'next/server'
import {
    verifyStripeWebhookSignature,
    type StripeSubscriptionObject,
    type StripeWebhookEvent,
} from '@/lib/stripe/server'
import { syncStripeCheckoutSession, upsertStripeSubscription } from '@/lib/stripe/subscriptions'

export const runtime = 'nodejs'

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
                }

                await syncStripeCheckoutSession(session.id)
                break
            }
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as StripeSubscriptionObject
                await upsertStripeSubscription(subscription)
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
