import { NextRequest, NextResponse } from 'next/server';
import { ALL_FOUNDRY_ADRS } from '@/lib/adr-data';
import { HologramAI } from '@/lib/hologram-ai';

const ai = new HologramAI({ endpoint: process.env.HOLOGRAM_ENDPOINT || 'local', agent: 'phasemirror' });

const FOUNDRY_CONTEXT = ALL_FOUNDRY_ADRS.filter(a => a.status === 'Accepted').map(a =>
  `[ADR ${a.id}] ${a.title}: ${a.decision}`).join('\n');

export async function POST(req: NextRequest) {
  try {
    const { messages, papers } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const papersContext = papers && papers.length > 0
      ? papers.map((p: any) => `[ID: ${p.id}] Title: "${p.title}" (${p.year}) by ${p.authors.join(', ')}. Abstract: ${p.abstract}`).join('\n\n')
      : 'No papers provided.';

    const systemInstruction = `You are PhaseMirror, a formal methods engineer and Lean 4 specialist.
    
FOUNDRY MACHINERY GOVERNANCE CONTEXT:
${FOUNDRY_CONTEXT}

CONTEXT PAPERS:
${papersContext}`;

    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      content: m.content
    }));

    const lastMessage = formattedMessages[formattedMessages.length - 1].content;
    const result = await ai.generate(systemInstruction + '\n\n' + lastMessage, formattedMessages.slice(0, -1));

    return NextResponse.json({ success: true, reply: result });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
