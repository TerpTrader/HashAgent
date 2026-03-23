import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

// Routes accessible without auth
const PUBLIC_ROUTES = new Set([
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/check-email',
    '/terms',
    '/privacy',
    '/pricing',
])

// Dashboard routes that require auth
const DASHBOARD_ROUTES = [
    '/dashboard',
    '/batches',
    '/rosin',
    '/pressed',
    '/equipment',
    '/freeze-dryers',
    '/cleaning',
    '/maintenance',
    '/compliance',
    '/analytics',
    '/ai',
    '/settings',
]

export default async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // Skip API routes and static files
    if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
        return NextResponse.next()
    }

    const session = await auth()
    const isAuthenticated = !!session?.user
    const isEmailVerified = session?.emailVerified ?? false

    // Public routes: redirect authenticated users to dashboard
    if (PUBLIC_ROUTES.has(pathname)) {
        if (isAuthenticated && isEmailVerified && (pathname === '/login' || pathname === '/register' || pathname === '/')) {
            return NextResponse.redirect(new URL('/dashboard', req.url))
        }
        return NextResponse.next()
    }

    // Dashboard routes: require auth + email verification
    const isDashboardRoute = DASHBOARD_ROUTES.some(route => pathname.startsWith(route))
    if (isDashboardRoute) {
        if (!isAuthenticated) {
            const loginUrl = new URL('/login', req.url)
            loginUrl.searchParams.set('callbackUrl', pathname)
            return NextResponse.redirect(loginUrl)
        }

        // Skip email verification check in development
        const skipEmailVerification = process.env.SKIP_EMAIL_VERIFICATION === 'true'
        if (!isEmailVerified && !skipEmailVerification) {
            return NextResponse.redirect(new URL('/check-email', req.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
