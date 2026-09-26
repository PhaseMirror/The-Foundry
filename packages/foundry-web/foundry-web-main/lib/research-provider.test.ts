import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ResearchProviderUnboundError,
  ResearchSynthesisShapeError,
  assertSynthesisShape,
  chat,
  isProviderBound,
  parseSynthesisJson,
  synthesize,
} from './research-provider';

/**
 * Checks for the research provider binding.
 *
 * Every case here is a refusal: an unbound provider, an unparseable answer, or
 * an answer that does not match the schema the prompt requested. The point of
 * these tests is that the routes now fail loudly instead of returning text no
 * model produced.
 */

const VALID = {
  overview: 'A synthesis of the topic.',
  keyThemes: [{ theme: 'T', description: 'D', papers: ['P1'] }],
  methodologies: ['formal methods'],
  researchGaps: ['an open question'],
  futureDirections: ['a direction'],
};

function withKey<T>(value: string | undefined, fn: () => T): T {
  const previous = process.env.GEMINI_API_KEY;
  if (value === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = value;
  try {
    return fn();
  } finally {
    if (previous === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previous;
  }
}

test('the provider is unbound when the key is absent, empty, or whitespace', () => {
  withKey(undefined, () => assert.equal(isProviderBound(), false));
  withKey('', () => assert.equal(isProviderBound(), false));
  withKey('   ', () => assert.equal(isProviderBound(), false));
  withKey('k', () => assert.equal(isProviderBound(), true));
});

test('an unbound provider refuses both entry points instead of answering', async () => {
  await withKey(undefined, async () => {
    await assert.rejects(() => chat('sys', [], 'hello'), ResearchProviderUnboundError);
    await assert.rejects(() => synthesize('topic'), ResearchProviderUnboundError);
  });
});

test('bare JSON parses', () => {
  assert.deepEqual(parseSynthesisJson(JSON.stringify(VALID)), VALID);
});

test('a fenced block parses, and the fence is the only concession made', () => {
  const fenced = '```json\n' + JSON.stringify(VALID) + '\n```';
  assert.deepEqual(parseSynthesisJson(fenced), VALID);
  const bareFence = '```\n' + JSON.stringify(VALID) + '\n```';
  assert.deepEqual(parseSynthesisJson(bareFence), VALID);
});

test('unparseable text is refused, not defaulted to an empty object', () => {
  // The previous implementation used `response.text || '{}'`, so a provider that
  // returned nothing produced a well-formed empty synthesis.
  assert.throws(() => parseSynthesisJson(''), ResearchSynthesisShapeError);
  assert.throws(() => parseSynthesisJson('I am unable to help with that.'), ResearchSynthesisShapeError);
  assert.throws(() => parseSynthesisJson('{"overview": '), ResearchSynthesisShapeError);
});

test('a non-object top level is refused', () => {
  assert.throws(() => parseSynthesisJson('[]'), ResearchSynthesisShapeError);
  assert.throws(() => parseSynthesisJson('"a string"'), ResearchSynthesisShapeError);
  assert.throws(() => parseSynthesisJson('null'), ResearchSynthesisShapeError);
});

test('a well-formed synthesis passes validation', () => {
  assert.deepEqual(assertSynthesisShape({ ...VALID }), VALID);
});

test('each missing or wrongly typed schema key is refused', () => {
  const cases: [string, unknown][] = [
    ['overview missing', { ...VALID, overview: undefined }],
    ['overview empty', { ...VALID, overview: '   ' }],
    ['keyThemes missing', { ...VALID, keyThemes: undefined }],
    ['keyThemes empty', { ...VALID, keyThemes: [] }],
    ['theme missing papers', { ...VALID, keyThemes: [{ theme: 'T', description: 'D' }] }],
    ['theme papers not strings', { ...VALID, keyThemes: [{ theme: 'T', description: 'D', papers: [1] }] }],
    ['methodologies missing', { ...VALID, methodologies: undefined }],
    ['researchGaps missing', { ...VALID, researchGaps: undefined }],
    ['futureDirections not an array', { ...VALID, futureDirections: 'none' }],
  ];
  for (const [label, payload] of cases) {
    assert.throws(
      () => assertSynthesisShape(payload as Record<string, unknown>),
      ResearchSynthesisShapeError,
      `${label} must be refused`,
    );
  }
});

test('a missing researchGaps is refused rather than reported as no gaps', () => {
  // The failure this guards: a synthesis with no gap analysis reads as a
  // finding that no gaps exist, which is a claim the model never made.
  const { researchGaps: _omitted, ...withoutGaps } = VALID;
  assert.throws(() => assertSynthesisShape(withoutGaps), ResearchSynthesisShapeError);
});
