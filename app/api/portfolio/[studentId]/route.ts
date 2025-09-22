// app/api/portfolio/[studentId]/route.ts
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ studentId: string }> }
) {
    const { studentId } = await params

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
}
