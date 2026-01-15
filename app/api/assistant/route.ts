import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import {
  generatePortfolioAudit,
  generateChatAdvisorResponse,
  PortfolioData,
  StudentMemory,
  AssistantMode
} from "./prompts";
import { readFileSync } from "fs";
import { join } from "path";

// Force read from .env file to bypass system environment variable
function getApiKeyFromEnvFile(): string | null {
    try {
        const envPath = join(process.cwd(), '.env');
        const envContent = readFileSync(envPath, 'utf-8');
        const match = envContent.match(/^OPENAI_API_KEY=(.+)$/m);
        if (match && match[1]) {
            // Remove quotes if present
            const key = match[1].replace(/^["']|["']$/g, '');
            return key;
        }
    } catch (error) {
        console.error("Error reading .env file:", error);
    }
    return null;
}

// Get API key - prioritize .env file over system environment variable
const apiKey = getApiKeyFromEnvFile() || process.env.OPENAI_API_KEY;

// Log API key status (masked for security) for debugging
if (apiKey) {
    const maskedKey = apiKey.length > 10
        ? `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`
        : '***';
    console.log(`✅ OPENAI_API_KEY loaded: ${maskedKey}`);
} else {
    console.error("❌ OPENAI_API_KEY is missing from environment variables!");
}

// Only create the client if the key exists with timeout configuration
const openai = apiKey
    ? new OpenAI({
        apiKey,
        timeout: 60000, // 60 seconds timeout for complex audits
        maxRetries: 2,   // Increase retries for transient failures
    })
    : ({} as OpenAI);

// Note: In-memory Map cache doesn't work in serverless environments (Vercel)
// For serverless, we rely on client-side caching and optimize the LLM call
// Memory cache for student sessions (still used for session continuity)
const memoryCache = new Map<string, { memory: StudentMemory; timestamp: number }>();
const MEMORY_TTL = 30 * 60 * 1000; // 30 minutes for memory


function getStudentMemory(studentId: string): StudentMemory | null {
    const cached = memoryCache.get(studentId);
    if (cached && Date.now() - cached.timestamp < MEMORY_TTL) {
        return cached.memory;
    }
    if (cached) {
        memoryCache.delete(studentId); // Remove expired entry
    }
    return null;
}

function setStudentMemory(studentId: string, memory: StudentMemory): void {
    memoryCache.set(studentId, { memory, timestamp: Date.now() });
}

function createInitialMemory(): StudentMemory {
    return {
        reviewedSections: [],
        identifiedWeaknesses: [],
        strengths: [],
        lastFocusedSection: null,
        careerGoal: null,
        auditGenerated: false,
    };
}

function determineMode(memory: StudentMemory | null): AssistantMode {
    if (!memory || !memory.auditGenerated) {
        return 'PORTFOLIO_AUDIT';
    }
    return 'CHAT_ADVISOR';
}

function updateMemoryFromAudit(memory: StudentMemory, auditText: string): StudentMemory {
    // Extract insights from the audit to populate memory
    const updatedMemory = { ...memory };
    updatedMemory.auditGenerated = true;

    // Mark all sections as reviewed
    updatedMemory.reviewedSections = ['Headline', 'Bio', 'Skills', 'Projects', 'Experience', 'Education', 'Links'];

    // Extract weaknesses (simplified - in production, use more sophisticated parsing)
    const lowerAudit = auditText.toLowerCase();
    if (lowerAudit.includes('missing') || lowerAudit.includes('weak')) {
        updatedMemory.identifiedWeaknesses.push('Portfolio needs improvements in multiple sections');
    }

    // Extract strengths (simplified)
    if (lowerAudit.includes('good') || lowerAudit.includes('strong')) {
        updatedMemory.strengths.push('Portfolio has some strong elements');
    }

    return updatedMemory;
}

function updateMemoryFromChat(memory: StudentMemory, message: string): StudentMemory {
    const updatedMemory = { ...memory };
    const lowerMessage = message.toLowerCase();

    // Track which section the student is asking about
    if (lowerMessage.includes('headline') || lowerMessage.includes('title')) {
        updatedMemory.lastFocusedSection = 'Headline';
    } else if (lowerMessage.includes('bio') || lowerMessage.includes('about')) {
        updatedMemory.lastFocusedSection = 'Bio';
    } else if (lowerMessage.includes('skill')) {
        updatedMemory.lastFocusedSection = 'Skills';
    } else if (lowerMessage.includes('project')) {
        updatedMemory.lastFocusedSection = 'Projects';
    } else if (lowerMessage.includes('experience') || lowerMessage.includes('work')) {
        updatedMemory.lastFocusedSection = 'Experience';
    } else if (lowerMessage.includes('education') || lowerMessage.includes('school')) {
        updatedMemory.lastFocusedSection = 'Education';
    } else if (lowerMessage.includes('link') || lowerMessage.includes('github') || lowerMessage.includes('linkedin')) {
        updatedMemory.lastFocusedSection = 'Links';
    }

    return updatedMemory;
}

export async function POST(req: Request) {
    try {
        // Verify user is authenticated
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized: Please sign in to access the AI assistant." },
                { status: 401 }
            );
        }

        if (!apiKey) {
            return NextResponse.json(
                { error: "Missing OPENAI_API_KEY in server environment" },
                { status: 500 }
            );
        }

        // Validate request size (max 10KB)
        const contentLength = req.headers.get("content-length");
        if (contentLength && parseInt(contentLength) > 10240) {
            return NextResponse.json(
                { error: "Request payload too large. Maximum 10KB allowed." },
                { status: 400 }
            );
        }

        const body = await req.json();

        // Handle both old message-based and new structured formats
        const type: string = body.type || "portfolio-audit";
        const message: string | undefined = body.message;
        let portfolio: PortfolioData | undefined = body.portfolio;
        const studentId: string | undefined = body.studentId;

        // Legacy support: if message contains portfolio JSON, extract it
        if (message && !portfolio) {
            try {
                const match = message.match(/\{[\s\S]*\}/);
                if (match) {
                    portfolio = JSON.parse(match[0]);
                }
            } catch (e) {
                // Continue with validation
            }
        }

        // Validate portfolio data
        if (!portfolio) {
            return NextResponse.json(
                { error: "Invalid request: 'portfolio' field is required." },
                { status: 400 }
            );
        }

        // Validate fullName is present
        if (!portfolio.fullName || typeof portfolio.fullName !== "string") {
            return NextResponse.json(
                { error: "Invalid request: 'portfolio.fullName' is required and must be a string." },
                { status: 400 }
            );
        }

        // Use authenticated userId instead of untrusted studentId from body
        const authenticatedUserId = userId;
        const memoryKey = authenticatedUserId;
        let memory = getStudentMemory(memoryKey);

        // Create new memory if none exists
        if (!memory) {
            memory = createInitialMemory();
        }

        // Determine the mode based on memory state
        const mode = determineMode(memory);

        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error("Request timeout")), 60000);
        });

        let reply: string;

        if (mode === 'PORTFOLIO_AUDIT') {
            // Generate portfolio audit (no caching for serverless)
            reply = await Promise.race([
                generatePortfolioAudit(portfolio as PortfolioData, openai),
                timeoutPromise,
            ]);

            // Update memory with audit insights
            const updatedMemory = updateMemoryFromAudit(memory, reply);
            setStudentMemory(memoryKey, updatedMemory);

            return NextResponse.json({ reply, mode: 'PORTFOLIO_AUDIT' });

        } else {
            // CHAT_ADVISOR mode - handle chat messages
            if (!message || typeof message !== "string") {
                return NextResponse.json(
                    { error: "Invalid request: 'message' field is required for chat mode." },
                    { status: 400 }
                );
            }

            // Generate chat response (no caching for serverless)
            reply = await Promise.race([
                generateChatAdvisorResponse(portfolio as PortfolioData, memory, message, openai),
                timeoutPromise,
            ]);

            // Update memory based on conversation
            const updatedMemory = updateMemoryFromChat(memory, message);
            setStudentMemory(memoryKey, updatedMemory);

            return NextResponse.json({ reply, mode: 'CHAT_ADVISOR' });
        }

    } catch (error) {
        console.error("Assistant error:", error);
        if (error instanceof Error && error.message === "Request timeout") {
            return NextResponse.json({ error: "AI request timed out. Please try again." }, { status: 504 });
        }
        return NextResponse.json({ error: "Failed to get response from AI." }, { status: 500 });
    }
}
