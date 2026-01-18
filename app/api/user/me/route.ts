import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const revalidate = 60 // Cache for 60 seconds

export async function GET() {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Lazy sync: ensure user exists
    let user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: { profile: true },
    })

    // If user doesn't exist, create them (lazy sync from middleware removal)
    if (!user) {
        user = await prisma.user.create({
            data: {
                clerkId: userId,
                email: "",
                role: "STUDENT",
                onboardingComplete: false,
            },
            include: { profile: true },
        })
    }

    return NextResponse.json(user)
}
