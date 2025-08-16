import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/']) // landing е public
const isOnboardingRoute = createRouteMatcher(['/onboarding'])

export default clerkMiddleware(async (auth, req: NextRequest) => {
    const { userId, sessionClaims } = await auth()

    // Ако не е логнат → landing
    if (!userId && !isPublicRoute(req)) {
        return NextResponse.redirect(new URL('/', req.url))
    }

    // Ако е логнат и няма onboardingComplete → винаги /onboarding
    if (userId && !sessionClaims?.metadata?.onboardingComplete && !isOnboardingRoute(req)) {
        return NextResponse.redirect(new URL('/onboarding', req.url))
    }

    // Ако е логнат, има onboardingComplete и е на landing (/) → към правилния dashboard
    if (userId && sessionClaims?.metadata?.onboardingComplete && req.nextUrl.pathname === '/') {
        const role = sessionClaims.metadata.role
        if (role === 'student') {
            return NextResponse.redirect(new URL('/dashboard/student', req.url))
        }
        if (role === 'company') {
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
