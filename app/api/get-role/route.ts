// /app/api/get-role/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    const { clerkId } = await req.json()
    if (!clerkId) return NextResponse.json({ role: null, onboardingComplete: false })

    const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { role: true, onboardingComplete: true },
    })

    return NextResponse.json({
        role: user?.role ?? null,
        onboardingComplete: user?.onboardingComplete ?? false,
    })
}
