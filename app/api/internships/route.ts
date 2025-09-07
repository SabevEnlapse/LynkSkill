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
    salary: z.union([z.number().positive(), z.null()]),
}).superRefine((data, ctx) => {
    if (data.paid && data.salary == null) {
        ctx.addIssue({
            code: "custom",
            path: ["salary"],
            message: "Salary is required if internship is paid",
        })
    }
})



// ------------------- CREATE internship -------------------
export async function POST(req: Request) {
    const { userId } = await auth()
    if (!userId) return new NextResponse("Unauthorized", { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user || user.role !== "COMPANY") {
        return new NextResponse("Forbidden", { status: 403 })
    }

    const body = await req.json()
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

// ------------------- READ internships -------------------
export async function GET() {
    const { userId } = await auth()
    if (!userId) return new NextResponse("Unauthorized", { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
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

// ------------------- UPDATE internship -------------------
// ------------------- UPDATE internship -------------------
export async function PUT(req: Request) {
    const { userId } = await auth()
    if (!userId) return new NextResponse("Unauthorized", { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user || user.role !== "COMPANY") {
        return new NextResponse("Forbidden", { status: 403 })
    }

    const body = await req.json()
    const { id, title, description, location, qualifications, paid, salary } = body

    if (!id) return new NextResponse("Internship ID required", { status: 400 })

    // ✅ Validation
    if (!title || title.length < 3) return NextResponse.json({ error: "Title too short" }, { status: 400 })
    if (!description || description.length < 10) return NextResponse.json({ error: "Description too short" }, { status: 400 })
    if (!location || location.length < 2) return NextResponse.json({ error: "Location too short" }, { status: 400 })
    if (paid && (salary == null || salary <= 0)) return NextResponse.json({ error: "Salary required for paid internship" }, { status: 400 })

    const existing = await prisma.internship.findUnique({ where: { id } })
    if (!existing || existing.companyId !== user.id) {
        return new NextResponse("Not found or unauthorized", { status: 404 })
    }

    const updated = await prisma.internship.update({
        where: { id },
        data: {
            title,
            description,
            location,
            qualifications: qualifications ?? null, // always update
            paid,
            salary: paid ? salary : null,
        },
    })

    return NextResponse.json(updated)
}


// ------------------- DELETE internship -------------------
export async function DELETE(req: Request) {
    const { userId } = await auth()
    if (!userId) return new NextResponse("Unauthorized", { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user || user.role !== "COMPANY") {
        return new NextResponse("Forbidden", { status: 403 })
    }

    const { id } = await req.json()
    if (!id) return new NextResponse("Internship ID required", { status: 400 })

    const existing = await prisma.internship.findUnique({ where: { id } })
    if (!existing || existing.companyId !== user.id) {
        return new NextResponse("Not found or unauthorized", { status: 404 })
    }

    await prisma.internship.delete({ where: { id } })

    return NextResponse.json({ success: true })
}
