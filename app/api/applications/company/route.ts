// app/api/company/applications/route.ts
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        // Find the company user
        const companyUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true },
        })
        if (!companyUser)
            return NextResponse.json(
                { error: "Company user not found" },
                { status: 404 }
            )

        // Find the company
        const company = await prisma.company.findFirst({
            where: { ownerId: companyUser.id },
            select: { id: true },
        })
        if (!company)
            return NextResponse.json(
                { error: "Company not found" },
                { status: 404 }
            )

        // Fetch company applications
        const applications = await prisma.application.findMany({
            where: {
                internship: { companyId: company.id },
            },
            include: {
                internship: {
                    include: {
                        company: true,
                    },
                },
                student: {
                    include: {
                        profile: true,
                        assignments: {
                            include: {
                                submissions: {
                                    select: { id: true },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        // Compute hasUploadedFiles
        const formatted = applications.map((app) => {
            const hasUploadedFiles = app.student.assignments.some(
                (a) =>
                    a.internshipId === app.internshipId &&
                    a.submissions.length > 0
            )

            // Detect whether the internship actually has an assignment
            const assignmentRequired = Boolean(app.internship.testAssignmentTitle)

            return {
                ...app,
                hasUploadedFiles,
                assignmentRequired,
            }
        })


        return NextResponse.json(formatted)
    } catch (err) {
        console.error("Error fetching company applications:", err)
        return NextResponse.json(
            { error: "Failed to fetch company applications" },
            { status: 500 }
        )
    }
}
