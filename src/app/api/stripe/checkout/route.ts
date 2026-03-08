import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createStripeCheckoutSession } from '@/lib/stripe/server'
import { getPlanById, type PlanId } from '@/lib/constants/plans'

export const runtime = 'nodejs'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const planId = formData.get('planId')?.toString() as PlanId | undefined

        if (!planId || !getPlanById(planId)) {
            return NextResponse.redirect(new URL('/pricing?error=plan', request.url))
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }

        const session = await createStripeCheckoutSession({
            planId,
            userId: user.id,
            userEmail: user.email ?? null,
        })

        if (!session.url) {
            throw new Error('Stripe checkout session did not return a URL')
        }

        return NextResponse.redirect(session.url, 303)
    } catch {
        return NextResponse.redirect(new URL('/dashboard/subscription?error=checkout', request.url), 303)
    }
}
