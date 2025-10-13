import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { tosAccepted, privacyAccepted, portfolioId } = await req.json()
        if (!portfolioId || portfolioId === "null" || portfolioId === "undefined") {
            return NextResponse.json({ error: "Portfolio ID required" }, { status: 400 })
        }

        const portfolio = await prisma.portfolio.findUnique({
            where: { id: portfolioId },
            include: { student: true },
        })
        if (!portfolio) return NextResponse.json({ error: "Portfolio not found" }, { status: 404 })

        if (portfolio.student.clerkId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const updated = await prisma.user.update({
            where: { id: portfolio.studentId },
            data: {
                tosAccepted: Boolean(tosAccepted),
                privacyAccepted: Boolean(privacyAccepted),
            },
        })

        return NextResponse.json({ success: true, user: updated })
    } catch (err) {
        console.error("Error updating student policies:", err)
        return NextResponse.json({ error: "Failed to update policies" }, { status: 500 })
    }
}