// app/api/internships/route.ts
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const internshipSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    location: z.string().min(2, "Location must be at least 2 characters"),
    qualifications: z.string().optional().nullable(),
    paid: z.boolean(),
    salary: z.number().positive().nullable(),
})
// Create internship (for Company)
export async function POST(req: Request) {
    const { userId } = await auth()
    if (!userId) return new NextResponse("Unauthorized", { status: 401 })

    const user = await prisma.user.findUnique({
        where: { clerkId: userId },
    })
    if (!user || user.role !== "COMPANY") {
        return new NextResponse("Forbidden", { status: 403 })
    }

    const body = await req.json()

    // ✅ Валидация с Zod
    const parsed = internshipSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json(
            { errors: parsed.error.flatten().fieldErrors },
            { status: 400 }
        )
    }

    const internship = await prisma.internship.create({
        data: {
            companyId: user.id,
            title: parsed.data.title,
            description: parsed.data.description,
            location: parsed.data.location,
            qualifications: parsed.data.qualifications || null,
            paid: parsed.data.paid,
            salary: parsed.data.paid ? parsed.data.salary : null,
        },
    })

    return NextResponse.json(internship)
}

// ------------------- GET (извличане на стажове) -------------------
export async function GET() {
    const { userId } = await auth()
    if (!userId) return new NextResponse("Unauthorized", { status: 401 })

    const user = await prisma.user.findUnique({
        where: { clerkId: userId },
    })
    if (!user) return new NextResponse("Unauthorized", { status: 401 })

    const internships =
        user.role === "COMPANY"
            ? await prisma.internship.findMany({
                where: { companyId: user.id },
                orderBy: { createdAt: "desc" },
            })
            : await prisma.internship.findMany({
                orderBy: { createdAt: "desc" },
            })

    return NextResponse.json(internships)
}