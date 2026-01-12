/**
 * Portfolio Report Prompt System for OpenAI API
 * Generates complete, real-time portfolio reports for students
 */

import OpenAI from 'openai';

export interface PortfolioData {
  fullName: string;
  headline?: string | null;
  bio?: string | null;
  skills?: string | null;
  projects?: string | null;
  experience?: string | null;
  education?: string | null;
  linkedin?: string | null;
  github?: string | null;
  portfolioUrl?: string | null;
}

export interface StudentMemory {
  reviewedSections: string[];
  identifiedWeaknesses: string[];
  strengths: string[];
  lastFocusedSection: string | null;
  careerGoal: string | null;
  auditGenerated: boolean;
}

export type AssistantMode = 'PORTFOLIO_AUDIT' | 'CHAT_ADVISOR';

/**
 * PORTFOLIO_AUDIT mode prompt - One-time only, generates full portfolio audit
 * Trigger when no prior audit exists
 */
export const PORTFOLIO_AUDIT_PROMPT = `You are a professional career advisor helping students (ages 16-22) improve their portfolios for internships and jobs. Be supportive but direct. No academic language.

## REQUIRED OUTPUT FORMAT:

### Portfolio Summary

One short paragraph (1-2 lines) highlighting clear strengths and clear gaps.

### Headline

What is good:
[1-2 lines]

What is missing or weak:
[1-2 lines]

What to improve next:
[1-2 lines]

Improved example:

\`\`\`
[Copy-ready improved headline example]
\`\`\`

### Bio / About

What is good:
[1-2 lines]

What is missing or weak:
[1-2 lines]

What to improve next:
[1-2 lines]

Improved example:

\`\`\`
[Copy-ready improved bio example]
\`\`\`

### Skills

What is good:
[1-2 lines]

What is missing or weak:
[1-2 lines]

What to improve next:
[1-2 lines]

Improved example:

\`\`\`
[Copy-ready improved skills example]
\`\`\`

### Projects

What is good:
[1-2 lines]

What is missing or weak:
[1-2 lines]

What to improve next:
[1-2 lines]

Improved example:

\`\`\`
[Copy-ready improved projects example]
\`\`\`

### Experience

What is good:
[1-2 lines]

What is missing or weak:
[1-2 lines]

What to improve next:
[1-2 lines]

Improved example:

\`\`\`
[Copy-ready improved experience example]
\`\`\`

### Education

What is good:
[1-2 lines]

What is missing or weak:
[1-2 lines]

What to improve next:
[1-2 lines]

Improved example:

\`\`\`
[Copy-ready improved education example]
\`\`\`

### Links (GitHub, LinkedIn, Portfolio)

What is good:
[1-2 lines]

What is missing or weak:
[1-2 lines]

What to improve next:
[1-2 lines]

Improved example:

\`\`\`
[Copy-ready improved links example]
\`\`\`

## STUDENT PORTFOLIO DATA:

Student Name: {{fullName}}
Headline: {{headline}}
Bio: {{bio}}
Skills: {{skills}}
Projects: {{projects}}
Experience: {{experience}}
Education: {{education}}
LinkedIn: {{linkedin}}
GitHub: {{github}}
Portfolio URL: {{portfolioUrl}}

## STRICT RULES:
- Use ### for section headers only (no deeper nesting)
- Short paragraphs only (1-2 lines maximum)
- No long bullet lists
- No nested lists
- Clear spacing between sections
- NO emojis
- NO filler sentences
- NO "Explanation & Steps" sections
- EVERY section must have an improved example in a code block
- Code blocks must use triple backticks
- Keep language simple and direct for students
- Focus on actionable improvements
- Output must be scannable in under 5 seconds`;

/**
 * CHAT_ADVISOR mode prompt - Default mode for follow-up conversations
 * Trigger when audit already exists
 */
export const CHAT_ADVISOR_PROMPT = `You are Linky, a friendly AI career advisor helping students improve their portfolios. You have already reviewed their portfolio and provided an audit.

## YOUR ROLE:
- Answer ONLY what the student asks
- Keep replies short and actionable
- Provide examples only if relevant to their question
- Ask one clarifying question if needed to give better advice
- Never restate the full audit
- Reference their portfolio context when helpful

## TONE:
- Professional
- Supportive
- Direct
- Not academic

## CONTEXT FROM PREVIOUS AUDIT:
Reviewed Sections: {{reviewedSections}}
Identified Weaknesses: {{identifiedWeaknesses}}
Strengths: {{strengths}}
Last Focused Section: {{lastFocusedSection}}
Career Goal: {{careerGoal}}

## STUDENT PORTFOLIO DATA:
Student Name: {{fullName}}
Headline: {{headline}}
Bio: {{bio}}
Skills: {{skills}}
Projects: {{projects}}
Experience: {{experience}}
Education: {{education}}
LinkedIn: {{linkedin}}
GitHub: {{github}}
Portfolio URL: {{portfolioUrl}}

## STRICT RULES:
- Answer ONLY the specific question asked
- Keep response under 5 lines if possible
- Use code blocks for any examples
- No long explanations
- No restating the audit
- No filler sentences
- If you need more info, ask ONE clarifying question
- Be direct and actionable

## STUDENT QUESTION:
{{message}}`;

/**
 * Formats the portfolio audit prompt with student data
 */
export function formatPortfolioAuditPrompt(portfolioData: PortfolioData): string {
  const {
    fullName,
    headline = 'Not provided',
    bio = 'Not provided',
    skills = 'Not provided',
    projects = 'Not provided',
    experience = 'Not provided',
    education = 'Not provided',
    linkedin = 'Not provided',
    github = 'Not provided',
    portfolioUrl = 'Not provided'
  } = portfolioData;

  return PORTFOLIO_AUDIT_PROMPT
    .replace('{{fullName}}', fullName)
    .replace('{{headline}}', headline || 'Not provided')
    .replace('{{bio}}', bio || 'Not provided')
    .replace('{{skills}}', skills || 'Not provided')
    .replace('{{projects}}', projects || 'Not provided')
    .replace('{{experience}}', experience || 'Not provided')
    .replace('{{education}}', education || 'Not provided')
    .replace('{{linkedin}}', linkedin || 'Not provided')
    .replace('{{github}}', github || 'Not provided')
    .replace('{{portfolioUrl}}', portfolioUrl || 'Not provided');
}

/**
 * Formats the chat advisor prompt with student data and memory
 */
export function formatChatAdvisorPrompt(
  portfolioData: PortfolioData,
  memory: StudentMemory,
  message: string
): string {
  const {
    fullName,
    headline = 'Not provided',
    bio = 'Not provided',
    skills = 'Not provided',
    projects = 'Not provided',
    experience = 'Not provided',
    education = 'Not provided',
    linkedin = 'Not provided',
    github = 'Not provided',
    portfolioUrl = 'Not provided'
  } = portfolioData;

  return CHAT_ADVISOR_PROMPT
    .replace('{{fullName}}', fullName)
    .replace('{{headline}}', headline || 'Not provided')
    .replace('{{bio}}', bio || 'Not provided')
    .replace('{{skills}}', skills || 'Not provided')
    .replace('{{projects}}', projects || 'Not provided')
    .replace('{{experience}}', experience || 'Not provided')
    .replace('{{education}}', education || 'Not provided')
    .replace('{{linkedin}}', linkedin || 'Not provided')
    .replace('{{github}}', github || 'Not provided')
    .replace('{{portfolioUrl}}', portfolioUrl || 'Not provided')
    .replace('{{reviewedSections}}', memory.reviewedSections.join(', ') || 'None')
    .replace('{{identifiedWeaknesses}}', memory.identifiedWeaknesses.join(', ') || 'None')
    .replace('{{strengths}}', memory.strengths.join(', ') || 'None')
    .replace('{{lastFocusedSection}}', memory.lastFocusedSection || 'None')
    .replace('{{careerGoal}}', memory.careerGoal || 'Not specified')
    .replace('{{message}}', message);
}

/**
 * Generates a portfolio audit using OpenAI API (PORTFOLIO_AUDIT mode)
 */
export async function generatePortfolioAudit(
  portfolioData: PortfolioData,
  openai: OpenAI
): Promise<string> {
  const prompt = formatPortfolioAuditPrompt(portfolioData);

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: prompt,
  });

  let outputText = "";
  if (response.output_text) {
    outputText = response.output_text;
  } else {
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
    outputText = textParts.join(" ") || "No response text found.";
  }

  return outputText;
}

/**
 * Generates a chat response using OpenAI API (CHAT_ADVISOR mode)
 */
export async function generateChatAdvisorResponse(
  portfolioData: PortfolioData,
  memory: StudentMemory,
  message: string,
  openai: OpenAI
): Promise<string> {
  const prompt = formatChatAdvisorPrompt(portfolioData, memory, message);

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: prompt,
  });

  let outputText = "";
  if (response.output_text) {
    outputText = response.output_text;
  } else {
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
    outputText = textParts.join(" ") || "No response text found.";
  }

  return outputText;
}

/**
 * Legacy function for backward compatibility - generates portfolio report
 * @deprecated Use generatePortfolioAudit instead
 */
export async function generatePortfolioReport(
  portfolioData: PortfolioData,
  openai: OpenAI
): Promise<string> {
  return generatePortfolioAudit(portfolioData, openai);
}

/**
 * Legacy function for backward compatibility - formats prompt with portfolio data
 * @deprecated Use formatPortfolioAuditPrompt instead
 */
export function formatPromptWithPortfolioData(portfolioData: PortfolioData): string {
  return formatPortfolioAuditPrompt(portfolioData);
}
