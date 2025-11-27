import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
    try {
        // Get ID from URL query instead of req.json()
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Missing internship ID" },
                { status: 400 }
            );
        }

        // Check if internship has applications
        const linkedApplications = await prisma.application.count({
            where: { internshipId: id },
        });

        if (linkedApplications > 0) {
            return NextResponse.json(
                {
                    error: "Cannot delete internship because students have already applied."
                },
                { status: 400 }
            );
        }

        // Delete internship
        await prisma.internship.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Internship deleted successfully" });

    } catch (err) {
        console.error("Delete internship error:", err);
        return NextResponse.json(
            { error: "Failed to delete internship" },
            { status: 500 }
        );
    }
}
