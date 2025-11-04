import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        const response = await openai.responses.create({
            model: "gpt-4.1-mini",
            input: `You are an AI assistant for LynkSkill. ${message}`,
        });

        // ✅ Simplest: use the helper if available
        if (response.output_text) {
            return NextResponse.json({ reply: response.output_text });
        }

        // ✅ Otherwise, manually combine text parts
        const textParts: string[] = [];

        for (const item of response.output ?? []) {
            // Only process "message" type items
            if (item.type === "message" && Array.isArray(item.content)) {
                for (const part of item.content) {
                    if (part.type === "output_text" && typeof part.text === "string") {
                        textParts.push(part.text);
                    }
                }
            }
        }

        const outputText = textParts.join(" ") || "No response text found.";

        return NextResponse.json({ reply: outputText });
    } catch (error) {
        console.error("Assistant error:", error);
        return NextResponse.json(
            { error: "Failed to get response from AI." },
            { status: 500 }
        );
    }
}
