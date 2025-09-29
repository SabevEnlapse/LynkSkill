// app/applications/[id]/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const body = await req.json()
        const { status } = body

        // 1. Update application status
        const updatedApplication = await prisma.application.update({
            where: { id },
            data: { status },
            include: { internship: true, student: true },
        })

        // 2. If approved → create project (if not already created)
        if (status === "APPROVED") {
            const existingProject = await prisma.project.findUnique({
                where: { applicationId: updatedApplication.id },
            })

            if (!existingProject) {
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
        }

        return NextResponse.json(updatedApplication)
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Failed to update application" },
            { status: 500 }
        )
    }
}
