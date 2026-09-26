import { NextRequest, NextResponse } from 'next/server';
import { ALL_FOUNDRY_ADRS } from '@/lib/adr-data';
import { HologramAI } from '@/lib/hologram-ai';

const ai = new HologramAI({ endpoint: process.env.HOLOGRAM_ENDPOINT || 'local', agent: 'phasemirror' });

const FOUNDRY_CONTEXT = ALL_FOUNDRY_ADRS.filter(a => a.status === 'Accepted').map(a =>
  `[ADR ${a.id}] ${a.title}: ${a.decision}`).join('\n');

export async function POST(req: NextRequest) {
  try {
    const { topic, papers } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'Research topic is required' }, { status: 400 });
    }

    const papersContext = papers && papers.length > 0 
      ? papers.map((p: any) => `- ${p.title} (${p.year}) by ${p.authors.join(', ')}: ${p.abstract}`).join('\n')
      : 'No specific local papers provided. Use general scholarly knowledge.';

    const prompt = `You are PhaseMirror, a formal methods engineer and Lean 4 specialist operating under PrismPM and Universal Object Reference (UOR) principles.
You are operating under Foundry machinery governance. The following Architecture Decision Records are currently accepted and govern the system:

FOUNDRY GOVERNANCE:
${FOUNDRY_CONTEXT}

Please conduct a rigorous literature synthesis and evidence mapping on the following research topic:

TOPIC: "${topic}"

AVAILABLE LITERATURE / PAPERS:
${papersContext}`;

    const data = await ai.generateJSON(prompt);

    return NextResponse.json({ success: true, synthesis: data });
  } catch (error: any) {
    console.error('Synthesis error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
