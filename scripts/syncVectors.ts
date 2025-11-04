// Imports
import 'dotenv/config';

import { openai } from '@/lib/openai';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { prisma } from '@/lib/prisma'; // note: default export, not named


async function chunkText(text: string, maxChars = 1500) {
    const parts = text.split('\n\n');
    const chunks: string[] = [];
    let cur = '';
    for (const p of parts) {
        if ((cur + '\n\n' + p).length > maxChars) {
            chunks.push(cur);
            cur = p;
        } else cur = cur ? cur + '\n\n' + p : p;
    }
    if (cur) chunks.push(cur);
    return chunks;
}

async function getEmbedding(text: string) {
    const r = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
    });
    return r.data[0].embedding;
}

export async function syncProjectsToVectors() {
    const projects = await prisma.project.findMany();
    for (const p of projects) {
        const text = `Project: ${p.title}\n\n${p.description ?? ''}\n\nInternship ID: ${p.internshipId}\n\nCompany ID: ${p.companyId}`;
        const chunks = await chunkText(text, 1500);
        for (const c of chunks) {
            const embedding = await getEmbedding(c);
            await supabaseAdmin
                .from('documents')
                .upsert([
                    {
                        source: 'project',
                        source_id: p.id,
                        title: p.title,
                        content: c,
                        embedding,
                    },
                ], { onConflict: 'source_id' });
        }
    }
}

if (require.main === module) {
    syncProjectsToVectors()
        .then(() => console.log('✅ done'))
        .catch(err => {
            console.error('❌ error:', err);
            process.exit(1);
        });
}
