// app/redirect-after-signin/page.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"

export default function RedirectAfterSignIn() {
    const router = useRouter()
    const { user, isSignedIn, isLoaded } = useUser()

    useEffect(() => {
        if (!isLoaded) return

        (async () => {
            if (!isSignedIn || !user) {
                router.replace("/sign-in")
                return
            }

            try {
                const res = await fetch("/api/get-role", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ clerkId: user.id }),
                })
                const data = await res.json()

                if (!data?.role || !data.onboardingComplete) {
                    router.replace("/onboarding")
                    return
                }

                if (data.role.toUpperCase() === "STUDENT") router.replace("/dashboard/student")
                else if (data.role.toUpperCase() === "COMPANY") router.replace("/dashboard/company")
                else router.replace("/onboarding")
            } catch (err) {
                console.error(err)
                router.replace("/onboarding")
            }
        })()
    }, [user, isSignedIn, isLoaded, router])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Redirecting…</p>
        </div>
    )
}
