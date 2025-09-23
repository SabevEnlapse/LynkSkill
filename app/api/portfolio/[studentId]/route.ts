import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: Promise<{ studentId: string }> }) {
    try {
        const { studentId } = await params
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        // Allow company or student to fetch
        const portfolio = await prisma.portfolio.findUnique({
            where: { studentId },
            include: {
                student: {
                    include: {
                        profile: true, // ✅ gets profile.name
                    },
                },
            },
        })

        if (!portfolio) {
            return NextResponse.json({ error: "Portfolio not found" }, { status: 404 })
        }

        return NextResponse.json({
            ...portfolio,
            fullName: portfolio.student.profile?.name || portfolio.fullName || "Unnamed Student",
        })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 })
    }
}
