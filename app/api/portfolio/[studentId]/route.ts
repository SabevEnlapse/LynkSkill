import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ studentId: string }> }
) {
    try {
        const { studentId } = await params
        const { userId } = await auth()

        if (!userId)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        // Check if requester is student or company
        const requester = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, role: true },
        })

        if (!requester)
            return NextResponse.json({ error: "User not found" }, { status: 404 })

        // Students can ONLY view their own portfolio
        if (requester.role === "STUDENT" && requester.id !== studentId) {
            return NextResponse.json(
                { error: "You cannot access another student's portfolio" },
                { status: 403 }
            )
        }

        // Fetch portfolio
        const portfolio = await prisma.portfolio.findUnique({
            where: { studentId },
            select: {
                id: true,
                studentId: true,
                fullName: true,
                headline: true,
                age: true,
                bio: true,
                skills: true,
                interests: true,
                experience: true,
                education: true,
                projects: true,
                certifications: true,
                linkedin: true,
                github: true,
                portfolioUrl: true,
                createdAt: true,
                updatedAt: true,
                student: {
                    select: {
                        profile: { select: { name: true } },
                    },
                },
            },
        })

        if (!portfolio) {
            return NextResponse.json(
                { error: "Portfolio not found" },
                { status: 404 }
            )
        }

        // Determine best full name
        const resolvedName =
            portfolio.student.profile?.name ||
            portfolio.fullName ||
            "Unnamed Student"

        return NextResponse.json({
            ...portfolio,
            fullName: resolvedName,
        })
    } catch (err) {
        console.error("Error fetching portfolio:", err)
        return NextResponse.json(
            { error: "Failed to fetch portfolio" },
            { status: 500 }
        )
    }
}
