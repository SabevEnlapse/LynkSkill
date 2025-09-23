import {auth} from "@clerk/nextjs/server";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Service Role key (server-side only)
);

export async function POST(req: Request) {
    try {
        const {userId} = await auth()
        if (!userId) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }

        const student = await prisma.user.findUnique({where: {clerkId: userId}})
        if (!student) {
            return NextResponse.json({error: "Student not found"}, {status: 404})
        }

        const formData = await req.formData()
        const file = formData.get("file") as File | null
        const section = formData.get("section") as string | null // 👈 match frontend

        if (!file || !section) {
            return NextResponse.json({error: "Missing file or section"}, {status: 400})
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({error: "File too large (max 5MB)"}, {status: 400})
        }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const ext = file.name.split(".").pop()
        const path = `${student.id}/portfolio/${section}-${Date.now()}.${ext}`

        const {error} = await supabase.storage
            .from("portfolio-files")
            .upload(path, buffer, {
                contentType: file.type,
                upsert: true,
            });

        if (error) {
            console.error("Supabase upload error:", error.message, error);
            return NextResponse.json({error: error.message}, {status: 500});
        }

        const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portfolio-files/${path}`

        // return as FileAttachment
        const fileAttachment = {
            name: file.name,
            url: fileUrl,
            type: file.type,
            size: file.size,
            path,
        }

        return NextResponse.json({file: fileAttachment})
    } catch (err) {
        console.error("Upload error:", err)
        return NextResponse.json({error: "Internal Server Error"}, {status: 500})
    }
}


export async function DELETE(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const filePath = url.searchParams.get("path");

        if (!filePath) {
            return NextResponse.json({ error: "Missing file path" }, { status: 400 });
        }

        const { error } = await supabase.storage
            .from("portfolio-files")
            .remove([filePath]);

        if (error) {
            console.error("Supabase delete error:", error);
            return NextResponse.json({ error: "Delete failed" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Delete error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


