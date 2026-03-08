import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { hasAdminAccess } from '@/lib/admin/is-admin'

export async function proxy(request: NextRequest) {
    const response = await updateSession(request)

    if (request.nextUrl.pathname.startsWith('/admin')) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value
                    },
                    set() {},
                    remove() {},
                },
            }
        )

        const {
            data: { session },
        } = await supabase.auth.getSession()
        const user = session?.user ?? null

        if (!user) {
            const loginUrl = new URL('/auth/login', request.url)
            const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`
            loginUrl.searchParams.set('next', nextPath)
            return NextResponse.redirect(loginUrl)
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('rol')
            .eq('id', user.id)
            .maybeSingle()

        if (!hasAdminAccess(profile?.rol, user)) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
