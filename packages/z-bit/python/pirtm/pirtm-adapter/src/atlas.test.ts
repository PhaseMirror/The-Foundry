/**
 * Tests for ADR-095: Production Operator Atlas & Frame Invariance
 */

import { describe, expect, test } from '@jest/globals';
import {
  OPERATOR_ATLAS,
  buildFrameInvarianceReport,
  validateAtlasCompleteness,
} from './atlas';
import type { SpectralCertResult } from './certify';

// ---------------------------------------------------------------------------
// OPERATOR_ATLAS static structure
// ---------------------------------------------------------------------------

describe('OPERATOR_ATLAS', () => {
  test('has exactly 12 entries', () => {
    expect(OPERATOR_ATLAS).toHaveLength(12);
  });

  test('all entries have required fields', () => {
    for (const entry of OPERATOR_ATLAS) {
      expect(entry).toHaveProperty('symbol');
      expect(entry).toHaveProperty('description');
      expect(entry).toHaveProperty('pirtmAttr');
      expect(entry).toHaveProperty('stateField');
      expect(entry).toHaveProperty('gateId');
      expect(entry).toHaveProperty('theoremRef');
    }
  });

  test('entry for E=Ξ has gateId=G7b', () => {
    const entry = OPERATOR_ATLAS.find(e => e.symbol === 'E=Ξ')!;
    expect(entry).toBeDefined();
    expect(entry.gateId).toBe('G7b');
  });

  test('entry for γ has theoremRef=Theorem 10', () => {
    const entry = OPERATOR_ATLAS.find(e => e.symbol === 'γ')!;
    expect(entry).toBeDefined();
    expect(entry.theoremRef).toBe('Theorem 10');
  });

  test('entry for Δ (GapLB) has gateId=G7a and theoremRef=Theorem 8', () => {
    const entry = OPERATOR_ATLAS.find(e => e.symbol === 'Δ')!;
    expect(entry).toBeDefined();
    expect(entry.gateId).toBe('G7a');
    expect(entry.theoremRef).toBe('Theorem 8');
  });

  test('entry for A has theoremRef=Theorem 8', () => {
    const entry = OPERATOR_ATLAS.find(e => e.symbol === 'A')!;
    expect(entry).toBeDefined();
    expect(entry.theoremRef).toBe('Theorem 8');
  });

  test('entry for B has gateId=G7b and theoremRef=Theorem 9', () => {
    const entry = OPERATOR_ATLAS.find(e => e.symbol === 'B')!;
    expect(entry).toBeDefined();
    expect(entry.gateId).toBe('G7b');
    expect(entry.theoremRef).toBe('Theorem 9');
  });

  test('running parameters G(H) and Λ(H) have gateId=null', () => {
    const entries = OPERATOR_ATLAS.filter(e => e.symbol === 'G(H)' || e.symbol === 'Λ(H)');
    expect(entries).toHaveLength(2);
    for (const e of entries) expect(e.gateId).toBeNull();
  });

  test('C₂ entry has gateId=G6', () => {
    const entry = OPERATOR_ATLAS.find(e => e.symbol === 'C₂')!;
    expect(entry.gateId).toBe('G6');
  });

  test('L (SlopeUB) entry has gateId=G7b', () => {
    const entry = OPERATOR_ATLAS.find(e => e.symbol === 'L')!;
    expect(entry.gateId).toBe('G7b');
  });

  test('σ entry has gateId=G4', () => {
    const entry = OPERATOR_ATLAS.find(e => e.symbol === 'σ')!;
    expect(entry.gateId).toBe('G4');
  });

  test('βλ₆ entry has gateId=null', () => {
    const entry = OPERATOR_ATLAS.find(e => e.symbol === 'βλ₆')!;
    expect(entry.gateId).toBeNull();
  });

  test('all symbols are unique', () => {
    const symbols = OPERATOR_ATLAS.map(e => e.symbol);
    const unique = new Set(symbols);
    expect(unique.size).toBe(symbols.length);
  });
});

// ---------------------------------------------------------------------------
// buildFrameInvarianceReport
// ---------------------------------------------------------------------------

describe('buildFrameInvarianceReport', () => {
  function makeCertResult(g8Pass: boolean): SpectralCertResult {
    const g8 = {
      pass: g8Pass,
      maxDeviation: 0,
      reason: g8Pass ? 'Frame invariance verified ✓' : 'Frame invariance violated',
    };
    const passGate = { pass: true, reason: 'ok' };
    return {
      g7a: { ...passGate, gapLB: 0.42 },
      g7b: { ...passGate, bochner: true, kPSD: true, xiNonNeg: true },
      g7c: { ...passGate, gamma: 0.42, opNormA: 0.4 },
      g8,
      overall: g8Pass,
      failedGates: g8Pass ? [] : ['G8'],
    };
  }

  test('g8.pass=true → certifiedAt is non-null ISO string', () => {
    const report = buildFrameInvarianceReport(makeCertResult(true));
    expect(report.certifiedAt).not.toBeNull();
    expect(report.certifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  test('g8.pass=false → certifiedAt is null', () => {
    const report = buildFrameInvarianceReport(makeCertResult(false));
    expect(report.certifiedAt).toBeNull();
  });

  test('theorem is always Theorem 13', () => {
    const report = buildFrameInvarianceReport(makeCertResult(true));
    expect(report.theorem).toBe('Theorem 13');
  });

  test('xiConstitutionRef = Article I §1', () => {
    const report = buildFrameInvarianceReport(makeCertResult(true));
    expect(report.xiConstitutionRef).toBe('Article I §1');
  });

  test('analogSovereigntyRef is correct', () => {
    const report = buildFrameInvarianceReport(makeCertResult(true));
    expect(report.analogSovereigntyRef).toBe('sovereignty_constraint.mirror_must_not_yield');
  });

  test('certResult contains g8 key', () => {
    const report = buildFrameInvarianceReport(makeCertResult(true));
    expect(report.certResult).toHaveProperty('g8');
  });
});

// ---------------------------------------------------------------------------
// validateAtlasCompleteness
// ---------------------------------------------------------------------------

describe('validateAtlasCompleteness', () => {
  test('all atlas attrs present → complete=true, missing=[]', () => {
    // Build a meta + stateFields covering every pirtmAttr in the atlas
    const meta: Record<string, unknown> = {};
    const stateFields: Record<string, unknown> = {};
    for (const entry of OPERATOR_ATLAS) {
      meta[entry.pirtmAttr] = true;
    }
    const result = validateAtlasCompleteness(meta, stateFields);
    expect(result.complete).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  test('missing sigma → missing includes σ', () => {
    const meta: Record<string, unknown> = {};
    const result = validateAtlasCompleteness(meta, {});
    expect(result.complete).toBe(false);
    expect(result.missing).toContain('σ');
  });

  test('field in stateFields counts as covered', () => {
    const meta: Record<string, unknown> = {};
    const stateFields: Record<string, unknown> = {};
    for (const entry of OPERATOR_ATLAS) {
      stateFields[entry.pirtmAttr] = true;
    }
    expect(validateAtlasCompleteness(meta, stateFields).complete).toBe(true);
  });

  test('partial coverage gives correct missing list', () => {
    // Only cover the first 6 attrs
    const meta: Record<string, unknown> = {};
    const covered = OPERATOR_ATLAS.slice(0, 6).map(e => e.pirtmAttr);
    for (const attr of covered) meta[attr] = true;
    const result = validateAtlasCompleteness(meta, {});
    expect(result.missing.length).toBe(OPERATOR_ATLAS.length - 6);
  });
});
