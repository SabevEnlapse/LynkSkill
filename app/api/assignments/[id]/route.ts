import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const assignmentId = params.id

        const clerkUser = await currentUser()
        if (!clerkUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const dbUser = await prisma.user.findUnique({
            where: { clerkId: clerkUser.id },
        })

        if (!dbUser) {
            return NextResponse.json(
                { error: "User not found in database" },
                { status: 404 }
            )
        }

        // ✅ Fetch ASSIGNMENT by assignmentId
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: {
                internship: {
                    include: {
                        company: true,
                    },
                },
            },
        })

        if (!assignment) {
            return NextResponse.json(
                { error: "Assignment not found" },
                { status: 404 }
            )
        }

        // 🧩 Access Control
        if (dbUser.role === "STUDENT") {
            if (assignment.studentId !== dbUser.id) {
                return NextResponse.json(
                    { error: "Forbidden: this is not your assignment" },
                    { status: 403 }
                )
            }
        }

        if (dbUser.role === "COMPANY") {
            const ownsInternship = assignment.internship.companyId === dbUser.id
            if (!ownsInternship) {
                return NextResponse.json(
                    { error: "Forbidden: this is not your internship" },
                    { status: 403 }
                )
            }
        }

        return NextResponse.json({
            id: assignment.id,
            title: assignment.title,
            description: assignment.description,
            dueDate: assignment.dueDate,
            internshipTitle: assignment.internship.title,
            companyName: assignment.internship.company.name,
        })
    } catch (error) {
        console.error("Error fetching assignment:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
