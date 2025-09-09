import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/'])
const isOnboardingRoute = createRouteMatcher([
    '/onboarding',
    '/redirect-after-signin',
    '/sign-in',
    '/sign-up',
])

export default clerkMiddleware(async (auth, req) => {
    const { userId, sessionClaims } = await auth()
    const url = req.nextUrl

    // 1) Not logged in → always redirect to landing (/) for non-public routes
    if (!userId && !isPublicRoute(req)) {
        return NextResponse.redirect(new URL('/', req.url))
    }

    // 🔹 Normalize Clerk metadata values
    const onboardingRaw = sessionClaims?.metadata?.onboardingComplete as boolean | string | undefined
    const onboardingComplete = onboardingRaw === true || onboardingRaw === 'true'

    // 2) Logged in but not onboarded → redirect to onboarding (unless already there or to redirect page)
    if (userId && !onboardingComplete && !isOnboardingRoute(req)) {
        return NextResponse.redirect(new URL('/onboarding', req.url))
    }

    // 3) Logged in + onboarded, but on landing "/" → route to proper dashboard
    if (userId && onboardingComplete && url.pathname === '/') {
        const roleClaim = (sessionClaims?.metadata?.role || '').toString().toUpperCase()
        if (roleClaim === 'STUDENT') {
            return NextResponse.redirect(new URL('/dashboard/student', req.url))
        }
        if (roleClaim === 'COMPANY') {
            return NextResponse.redirect(new URL('/dashboard/company', req.url))
        }
    }

    return NextResponse.next()
})

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
}
