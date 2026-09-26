import { NextRequest, NextResponse } from 'next/server';
import { readEngineRegistry } from '@/lib/engine-bridge';
import { buildGovernanceContext } from '@/lib/research-governance';
import { ResearchProviderUnboundError, chat, isProviderBound, type ChatTurn } from '@/lib/research-provider';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Research chat over a real, bound provider.
 *
 * The system instruction keeps this package's contribution: the model is a
 * formal methods engineer operating under the accepted Architecture Decision
 * Records. That context is read from the engine registry at request time. If
 * the registry cannot be read the request still proceeds with the persona alone
 * and says so, rather than substituting the hardcoded `ALL_FOUNDRY_ADRS` set
 * that `lib/adr-data.ts` holds.
 *
 * When the provider is unbound the route returns a typed 503. It does not
 * return a stand-in answer.
 */
export async function POST(req: NextRequest) {
  let body: { messages?: unknown; papers?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid-body', detail: 'Request body must be JSON.' }, { status: 400 });
  }

  const { messages, papers } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'messages-required', detail: 'A non-empty messages array is required.' }, { status: 400 });
  }

  if (!isProviderBound()) {
    return NextResponse.json(
      { error: 'research-provider-unbound', detail: 'GEMINI_API_KEY is not set. No inference was performed and no result was produced.' },
      { status: 503 },
    );
  }

  const papersContext = Array.isArray(papers) && papers.length > 0
    ? papers
        .map((p: Record<string, unknown>) => `[ID: ${p.id}] Title: "${p.title}" (${p.year}) by ${(p.authors as string[]).join(', ')}. Abstract: ${p.abstract}`)
        .join('\n\n')
    : 'No papers provided.';

  const { adrs, source } = await readEngineRegistry();
  const governanceContext = buildGovernanceContext(adrs, source).text;

  const systemInstruction = `You are PhaseMirror, a formal methods engineer and Lean 4 specialist operating under PrismPM and Universal Object Reference (UOR) principles.
You answer research questions accurately, critically analyze literature, and cite specific papers from the provided context using their titles or IDs. Maintain a scholarly, precise tone.

FOUNDRY MACHINERY GOVERNANCE CONTEXT (registry source: ${source}):
${governanceContext}

CONTEXT PAPERS:
${papersContext}`;

  const turns = messages as { role?: string; content?: string }[];
  const history: ChatTurn[] = turns.slice(0, -1).map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    text: m.content ?? '',
  }));
  const last = turns[turns.length - 1];
  if (typeof last?.content !== 'string' || last.content.trim().length === 0) {
    return NextResponse.json({ error: 'last-message-required', detail: 'The final message must carry non-empty content.' }, { status: 400 });
  }

  try {
    const reply = await chat(systemInstruction, history, last.content);
    return NextResponse.json({ success: true, reply, registrySource: source });
  } catch (error) {
    if (error instanceof ResearchProviderUnboundError) {
      return NextResponse.json({ error: error.code, detail: error.message }, { status: 503 });
    }
    const detail = error instanceof Error ? error.message : 'The provider call failed.';
    return NextResponse.json({ error: 'provider-failed', detail }, { status: 502 });
  }
}
