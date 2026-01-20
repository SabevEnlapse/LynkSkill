import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

// Get a single candidate's full profile
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id: candidateId } = await params

        // Fetch the candidate with all related data
        const student = await prisma.user.findUnique({
            where: { 
                id: candidateId,
                role: "STUDENT"
            },
            include: {
                profile: true,
                portfolio: true,
                projects: true,
                experiences: {
                    include: {
                        company: true
                    }
                }
            }
        })

        if (!student) {
            return NextResponse.json({ error: "Candidate not found" }, { status: 404 })
        }

        const candidate = {
            id: student.id,
            name: student.profile?.name || student.portfolio?.fullName || "Student",
            email: student.email || "",
            headline: student.portfolio?.headline || undefined,
            bio: student.portfolio?.bio || undefined,
            skills: student.portfolio?.skills || [],
            interests: student.portfolio?.interests || [],
            experience: student.portfolio?.experience || undefined,
            projects: student.projects?.map(p => ({
                id: p.id,
                title: p.title,
                description: p.description,
                technologies: p.technologies || []
            })) || [],
            experiences: student.experiences?.map(e => ({
                id: e.id,
                title: e.title,
                company: e.company?.name || "Company",
                description: e.description || undefined,
                startDate: e.startDate.toISOString(),
                endDate: e.endDate?.toISOString() || undefined
            })) || []
        }

        return NextResponse.json({ candidate })

    } catch (error) {
        console.error("Error fetching candidate:", error)
        return NextResponse.json({ error: "Failed to fetch candidate" }, { status: 500 })
    }
}
