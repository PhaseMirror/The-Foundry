import { NextRequest, NextResponse } from 'next/server';
import { readEngineRegistry } from '@/lib/engine-bridge';
import { buildGovernanceContext } from '@/lib/research-governance';
import {
  ResearchProviderUnboundError,
  ResearchSynthesisShapeError,
  SYNTHESIS_SCHEMA_PROMPT,
  isProviderBound,
  synthesize,
} from '@/lib/research-provider';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Literature synthesis over a real, bound provider.
 *
 * This route previously called `HologramAI.generateJSON`, which ignored its
 * prompt and returned a hardcoded object, so the synthesis a client received
 * was fixed text. The JSON schema the example package put in its prompt is
 * restored here, and the model's answer is now verified against that schema
 * before it is returned: a response missing `researchGaps` is a failure, not a
 * synthesis with an empty gap analysis.
 */
export async function POST(req: NextRequest) {
  let body: { topic?: unknown; papers?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid-body', detail: 'Request body must be JSON.' }, { status: 400 });
  }

  const { topic, papers } = body;
  if (typeof topic !== 'string' || topic.trim().length === 0) {
    return NextResponse.json({ error: 'topic-required', detail: 'A non-empty research topic is required.' }, { status: 400 });
  }

  if (!isProviderBound()) {
    return NextResponse.json(
      { error: 'research-provider-unbound', detail: 'GEMINI_API_KEY is not set. No inference was performed and no result was produced.' },
      { status: 503 },
    );
  }

  const papersContext = Array.isArray(papers) && papers.length > 0
    ? papers
        .map((p: Record<string, unknown>) => `- ${p.title} (${p.year}) by ${(p.authors as string[]).join(', ')}: ${p.abstract}`)
        .join('\n')
    : 'No specific local papers provided. Use general scholarly knowledge.';

  const { adrs, source } = await readEngineRegistry();
  const governanceContext = buildGovernanceContext(adrs, source).text;

  const prompt = `You are PhaseMirror, a formal methods engineer and Lean 4 specialist operating under PrismPM and Universal Object Reference (UOR) principles.
You are operating under Foundry machinery governance. The following Architecture Decision Records are currently accepted and govern the system:

FOUNDRY GOVERNANCE (registry source: ${source}):
${governanceContext}

Please conduct a rigorous literature synthesis and evidence mapping on the following research topic:

TOPIC: "${topic}"

AVAILABLE LITERATURE / PAPERS:
${papersContext}

${SYNTHESIS_SCHEMA_PROMPT}`;

  try {
    const synthesis = await synthesize(prompt);
    return NextResponse.json({ success: true, synthesis, registrySource: source });
  } catch (error) {
    if (error instanceof ResearchProviderUnboundError) {
      return NextResponse.json({ error: error.code, detail: error.message }, { status: 503 });
    }
    if (error instanceof ResearchSynthesisShapeError) {
      return NextResponse.json({ error: error.code, detail: error.message }, { status: 502 });
    }
    const detail = error instanceof Error ? error.message : 'The provider call failed.';
    return NextResponse.json({ error: 'provider-failed', detail }, { status: 502 });
  }
}
