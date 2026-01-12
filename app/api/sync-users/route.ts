import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { userId, sessionClaims } = await req.json();

        if (!userId) {
            return NextResponse.json({ ok: false, reason: "No Clerk user" }, { status: 401 });
        }

        // Validate sessionClaims structure before accessing nested properties
        const email = sessionClaims?.email || "";
        const role = (sessionClaims?.metadata?.role || "STUDENT").toString().toUpperCase();
        const onboardingComplete =
            sessionClaims?.metadata?.onboardingComplete === true ||
            sessionClaims?.metadata?.onboardingComplete === "true";

        // Check if user exists in Supabase (via Prisma)
        let user = await prisma.user.findUnique({ where: { clerkId: userId } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    clerkId: userId,
                    email,
                    role,
                    onboardingComplete,
                },
            });
        }

        return NextResponse.json({ ok: true, user });
    } catch (error) {
        console.error("Sync users error:", error);
        // Return success even if sync fails to avoid blocking the request
        // The middleware will retry on the next request
        return NextResponse.json({ ok: false, error: "Failed to sync user" }, { status: 500 });
    }
}
