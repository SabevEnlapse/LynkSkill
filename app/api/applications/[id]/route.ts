// app/api/applications/[id]/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth()
        if (!userId)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { id } = await params
        const { status } = await req.json()

        if (!["APPROVED", "REJECTED"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 })
        }

        // ✅ Load EVERYTHING in one single query
        const data = await prisma.application.findUnique({
            where: { id },
            include: {
                internship: true,
                student: {
                    include: {
                        assignments: {
                            where: { internshipId: undefined }, // temporary, overwritten below
                            include: { submissions: { select: { id: true } } },
                        },
                    },
                },
                project: true,
            },
        })

        if (!data)
            return NextResponse.json(
                { error: "Application not found" },
                { status: 404 }
            )

        // Fix the internshipId filter dynamically (Prisma limitation)
        const assignments = await prisma.assignment.findMany({
            where: {
                internshipId: data.internshipId,
                studentId: data.studentId,
            },
            include: { submissions: { select: { id: true } } },
        })

        const hasUploadedFiles = assignments.some(
            (a) => a.submissions.length > 0
        )

        if (!hasUploadedFiles) {
            return NextResponse.json(
                {
                    error:
                        "The student has not uploaded any assignment files. You cannot approve or reject yet.",
                },
                { status: 400 }
            )
        }

        // ✅ Update application
        const updatedApplication = await prisma.application.update({
            where: { id },
            data: { status },
            include: { internship: true, student: true },
        })

        // ---------------------------------------------
        // CREATE PROJECT IF APPROVED AND NOT EXISTING
        // ---------------------------------------------
        if (status === "APPROVED" && !data.project) {
            await prisma.project.create({
                data: {
                    title: updatedApplication.internship.title,
                    description: updatedApplication.internship.description,
                    internshipId: updatedApplication.internshipId,
                    applicationId: updatedApplication.id,
                    studentId: updatedApplication.studentId,
                    companyId: updatedApplication.internship.companyId,
                },
            })
        }

        return NextResponse.json(updatedApplication)
    } catch (error) {
        console.error("Error updating application:", error)
        return NextResponse.json(
            { error: "Failed to update application" },
            { status: 500 }
        )
    }
}
