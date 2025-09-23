import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// ✅ GET /api/portfolio
export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const student = await prisma.user.findUnique({ where: { clerkId: userId } })
        if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 })

        const portfolio = await prisma.portfolio.findUnique({
            where: { studentId: student.id },
        })

        return NextResponse.json(portfolio ?? {})
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 })
    }
}

// ✅ POST /api/portfolio (create or update)
export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const student = await prisma.user.findUnique({ where: { clerkId: userId } })
        if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 })

        const body = await req.json()

        // ✅ If age < 18, require approval
        const needsApproval = body.age && body.age < 18

        const portfolio = await prisma.portfolio.upsert({
            where: {
                studentId: student.id,
            },
            update: {
                fullName: body.fullName,
                headline: body.headline,
                age: body.age,
                bio: body.bio,
                skills: body.skills,
                interests: body.interests,
                experience: body.experience,
                education: body.education, // Now includes attachments array
                projects: body.projects, // Now includes attachments array
                certifications: body.certifications, // Now includes attachments array
                linkedin: body.linkedin,
                github: body.github,
                portfolioUrl: body.portfolioUrl,
                approvalStatus: needsApproval ? "PENDING" : "APPROVED",
                needsApproval: needsApproval,
            },
            create: {
                student: {
                    connect: {
                        id: student.id,
                    },
                },
                fullName: body.fullName,
                headline: body.headline,
                age: body.age,
                bio: body.bio,
                skills: body.skills,
                interests: body.interests,
                experience: body.experience,
                education: body.education, // Now includes attachments array
                projects: body.projects, // Now includes attachments array
                certifications: body.certifications, // Now includes attachments array
                linkedin: body.linkedin,
                github: body.github,
                portfolioUrl: body.portfolioUrl,
                approvalStatus: needsApproval ? "PENDING" : "APPROVED",
                needsApproval: needsApproval,
            },
        })

        return NextResponse.json(portfolio)
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Failed to save portfolio" }, { status: 500 })
    }
}