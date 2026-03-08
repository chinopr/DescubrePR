import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createStripeBillingPortalSession } from '@/lib/stripe/server'

export const runtime = 'nodejs'

const MANAGEABLE_STATUSES = new Set(['trialing', 'active', 'past_due', 'unpaid', 'paused'])

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.redirect(new URL('/auth/login', request.url), 303)
        }

        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('stripe_customer_id, status')
            .eq('user_id', user.id)
            .single()

        if (!subscription?.stripe_customer_id || !MANAGEABLE_STATUSES.has(subscription.status)) {
            return NextResponse.redirect(new URL('/dashboard/subscription?error=portal', request.url), 303)
        }

        const portalSession = await createStripeBillingPortalSession({
            customerId: subscription.stripe_customer_id,
        })

        return NextResponse.redirect(portalSession.url, 303)
    } catch {
        return NextResponse.redirect(new URL('/dashboard/subscription?error=portal', request.url), 303)
    }
}
