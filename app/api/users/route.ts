// app/api/users/route.ts
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

export async function GET() {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Optional: respond with minimal user info so Clerk doesn't fail
    return NextResponse.json({ success: true })
}

// Optional: add POST too, in case Clerk or other parts of your app call it
export async function POST() {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ success: true })
}
