// /api/portfolio/[studentId]/route.ts
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
    req: Request,
    { params }: { params: { studentId: string } }
) {
    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        // allow company or student to fetch
        const portfolio = await prisma.portfolio.findUnique({
            where: { studentId: params.studentId },
        })
        if (!portfolio) return NextResponse.json({ error: "Not found" }, { status: 404 })

        return NextResponse.json(portfolio)
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 })
    }
}
