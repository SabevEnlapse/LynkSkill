import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node"; // 👈 важна промяна

export async function POST(req: Request) {
    const { role } = await req.json();

    if (!["student", "company"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const user = await currentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) {
        return NextResponse.json({ error: "No email found" }, { status: 400 });
    }

    // 1) Update Clerk metadata
    await clerkClient.users.updateUserMetadata(user.id, {
        publicMetadata: { role },
    });

    // 2) Sync with Prisma DB
    const existingUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
    });

    if (existingUser) {
        return NextResponse.json(existingUser);
    }

    const newUser = await prisma.user.create({
        data: {
            clerkId: user.id,
            email,
            role: role.toUpperCase(), // "STUDENT" | "COMPANY"
            profile: { create: { name: "", bio: "" } },
        },
    });

    return NextResponse.json(newUser);
}
