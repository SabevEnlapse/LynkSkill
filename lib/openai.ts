import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { join } from 'path';

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
    console.log(`✅ OPENAI_API_KEY loaded in lib/openai.ts: ${maskedKey}`);
} else {
    console.error("❌ OPENAI_API_KEY is missing from environment variables in lib/openai.ts!");
    throw new Error('Missing OPENAI_API_KEY');
}

export const openai = new OpenAI({ apiKey });
