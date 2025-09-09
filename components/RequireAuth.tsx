"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"

export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { isLoaded, isSignedIn } = useUser()

    useEffect(() => {
        if (!isLoaded) return
        if (!isSignedIn) router.replace("/") // redirect to home if not logged in
    }, [isLoaded, isSignedIn, router])

    // Render nothing until loaded or redirect
    if (!isLoaded || !isSignedIn) return null

    return <>{children}</>
}
