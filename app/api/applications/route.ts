import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { userId } = await auth()
    if (!userId) return new NextResponse("Unauthorized", { status: 401 })

    const student = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!student || student.role !== "STUDENT") {
        return new NextResponse("Forbidden", { status: 403 })
    }

    const { internshipId } = await req.json()
    if (!internshipId) {
        return NextResponse.json({ error: "Internship ID required" }, { status: 400 })
    }

    // 🔎 Check if already applied
    const existing = await prisma.application.findUnique({
        where: {
            internshipId_studentId: {
                internshipId,
                studentId: student.id,
            },
        },
    })

    if (existing) {
        return NextResponse.json(
            { error: "You have already applied to this internship" },
            { status: 400 }
        )
    }

    // ✅ Create new application
    const application = await prisma.application.create({
        data: {
            studentId: student.id,
            internshipId,
        },
    })

    return NextResponse.json(application)
}

