import { NextResponse } from "next/server";
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    console.warn("⚠️ OPENAI_API_KEY is missing. API route will not work until it's set.");
}

// Only create the client if the key exists
const openai = apiKey
    ? new OpenAI({ apiKey })
    : ({} as OpenAI);

export async function POST(req: Request) {
    try {
        if (!apiKey) {
            return NextResponse.json(
                { error: "Missing OPENAI_API_KEY in server environment" },
                { status: 500 }
            );
        }

        const { message } = await req.json();

        const response = await openai.responses.create({
            model: "gpt-4.1-mini",
            input: `You are an AI assistant for LynkSkill. ${message}`,
        });

        if (response.output_text) {
            return NextResponse.json({ reply: response.output_text });
        }

        const textParts: string[] = [];

        for (const item of response.output ?? []) {
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
        return NextResponse.json({ error: "Failed to get response from AI." }, { status: 500 });
    }
}
