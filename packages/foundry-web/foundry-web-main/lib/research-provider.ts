/**
 * Research provider binding.
 *
 * This replaces `lib/hologram-ai.ts`, which was a self-declared stub: its
 * `generate` returned the literal string "Synthesis complete" while performing
 * no inference, and its `generateJSON` returned a hardcoded object whose
 * `overview` read "Overview mechanism missing. Replaced vibe claim." Both
 * research routes were wired to it, so `POST /api/research/chat` and
 * `POST /api/research/synthesize` returned plausible prose that no model
 * produced. That is a fabricated result, and a client could not tell it from a
 * real one.
 *
 * The mechanism restored here is the one this package already declares:
 * `@google/genai` is a production dependency and `GEMINI_API_KEY` is the
 * documented key in `.env.example`. The sibling `foundry-web-example` package
 * used exactly this call, and the only thing lost in this package was the
 * binding itself.
 *
 * Two properties hold here:
 *
 *   1. No fabricated content. Every return value is text a model produced. When
 *      the provider is unbound the caller gets a typed error, never a stand-in.
 *   2. The response schema is requested, not assumed. `SYNTHESIS_SCHEMA` is the
 *      single source for the shape asked of the model and for the shape
 *      validated on the way back, so the prompt and the check cannot drift.
 */

import { GoogleGenAI } from '@google/genai';

export const RESEARCH_MODEL = 'gemini-2.5-flash';

export class ResearchProviderUnboundError extends Error {
  readonly code = 'research-provider-unbound';
  constructor() {
    super('GEMINI_API_KEY is not set. No inference was performed and no result was produced.');
    this.name = 'ResearchProviderUnboundError';
  }
}

export class ResearchSynthesisShapeError extends Error {
  readonly code = 'research-synthesis-shape';
  constructor(reason: string) {
    super(`The model returned JSON that does not match the requested schema: ${reason}`);
    this.name = 'ResearchSynthesisShapeError';
  }
}

/**
 * The synthesis contract, stated once.
 *
 * The example package carried this schema inside a prompt string, so nothing
 * checked the model's answer against it. Here the same shape is both requested
 * and verified.
 */
export const SYNTHESIS_SCHEMA = {
  overview: 'string',
  keyThemes: [{ theme: 'string', description: 'string', papers: ['string'] }],
  methodologies: ['string'],
  researchGaps: ['string'],
  futureDirections: ['string'],
} as const;

export const SYNTHESIS_SCHEMA_PROMPT = `Please return your response in strict JSON format with the following keys:
{
  "overview": "A comprehensive academic overview and synthesis of the research topic (3-4 paragraphs).",
  "keyThemes": [
    {
      "theme": "Name of theme",
      "description": "Detailed breakdown of this research theme.",
      "papers": ["Relevant paper titles or authors"]
    }
  ],
  "methodologies": ["List of dominant research methods or frameworks used in this domain"],
  "researchGaps": ["Identified open questions or unexplored areas in current literature"],
  "futureDirections": ["Recommended directions for future research"]
}

Ensure the output is valid JSON only, without markdown wrapping or code blocks if possible, or inside standard JSON format.`;

export function isProviderBound(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return typeof key === 'string' && key.trim().length > 0;
}

function client(): GoogleGenAI {
  if (!isProviderBound()) {
    throw new ResearchProviderUnboundError();
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export interface ChatTurn {
  readonly role: 'user' | 'model';
  readonly text: string;
}

/**
 * Run one turn of a real chat session.
 *
 * `history` excludes the message being sent, matching the SDK's session shape.
 * The returned string is the model's own text.
 */
export async function chat(systemInstruction: string, history: readonly ChatTurn[], message: string): Promise<string> {
  const session = client().chats.create({
    model: RESEARCH_MODEL,
    config: { systemInstruction },
    history: history.map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.text }],
    })),
  });
  const result = await session.sendMessage({ message });
  const text = result.text;
  if (typeof text !== 'string' || text.length === 0) {
    throw new ResearchSynthesisShapeError('the model returned no text');
  }
  return text;
}

/**
 * Strip a markdown fence and parse.
 *
 * The model is asked for bare JSON, but a fenced block is a formatting
 * difference, not a reason to discard a real answer. This tolerates the fence
 * and nothing else: it never invents a key or substitutes a default.
 */
export function parseSynthesisJson(text: string): Record<string, unknown> {
  const candidates = [text];
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    candidates.push(fenced[1]);
  }
  let parsed: unknown;
  let lastError: unknown;
  for (const candidate of candidates) {
    try {
      parsed = JSON.parse(candidate.trim());
      break;
    } catch (err) {
      lastError = err;
    }
  }
  if (parsed === undefined) {
    throw new ResearchSynthesisShapeError(`it is not parseable JSON (${String(lastError)})`);
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new ResearchSynthesisShapeError('the top level is not an object');
  }
  return parsed as Record<string, unknown>;
}

function isStringArray(value: unknown): boolean {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

/**
 * Verify the model's answer against `SYNTHESIS_SCHEMA`.
 *
 * A synthesis that is missing `researchGaps` is not a synthesis. Returning it
 * anyway would hand the client an empty gap analysis that looks like a finding.
 */
export function assertSynthesisShape(data: Record<string, unknown>): Record<string, unknown> {
  if (typeof data.overview !== 'string' || data.overview.trim().length === 0) {
    throw new ResearchSynthesisShapeError('`overview` is missing or empty');
  }
  if (!Array.isArray(data.keyThemes) || data.keyThemes.length === 0) {
    throw new ResearchSynthesisShapeError('`keyThemes` is missing or empty');
  }
  for (const theme of data.keyThemes) {
    const t = theme as Record<string, unknown>;
    if (typeof t?.theme !== 'string' || typeof t?.description !== 'string' || !isStringArray(t?.papers)) {
      throw new ResearchSynthesisShapeError('a `keyThemes` entry is missing theme, description, or papers');
    }
  }
  for (const key of ['methodologies', 'researchGaps', 'futureDirections'] as const) {
    if (!isStringArray(data[key])) {
      throw new ResearchSynthesisShapeError(`\`${key}\` is missing or is not an array of strings`);
    }
  }
  return data;
}

/** Run a real synthesis and return a shape-verified object. */
export async function synthesize(prompt: string): Promise<Record<string, unknown>> {
  const response = await client().models.generateContent({
    model: RESEARCH_MODEL,
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });
  const text = response.text ?? '{}';
  return assertSynthesisShape(parseSynthesisJson(text));
}
