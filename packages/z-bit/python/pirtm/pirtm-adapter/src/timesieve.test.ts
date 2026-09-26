/**
 * Tests for ADR-090: Time-Sieve Module
 */

import { describe, expect, test } from '@jest/globals';
import {
  evaluateSymbol,
  computeEssentialBand,
  verifyBochnerPositivity,
  sampleSymbolBands,
  canonicalPaperSieve,
  validateTimeSieve,
} from './timesieve';
import type { TimeSieveCoefficients } from './timesieve';

// ---------------------------------------------------------------------------
// evaluateSymbol
// ---------------------------------------------------------------------------

describe('evaluateSymbol', () => {
  test('at omega=0: cos(0) = 1 → m(0) = a0 + Σap', () => {
    const coeffs: TimeSieveCoefficients = {
      a0: 0.3,
      ap: new Map([[2, 0.1], [3, 0.05]]),
    };
    expect(evaluateSymbol(coeffs, 0)).toBeCloseTo(0.3 + 0.1 + 0.05);
  });

  test('with no ap entries equals a0', () => {
    const coeffs: TimeSieveCoefficients = { a0: 0.4, ap: new Map() };
    expect(evaluateSymbol(coeffs, 99)).toBeCloseTo(0.4);
  });

  test('is periodic in omega (period = 2π / log p for each p)', () => {
    const coeffs: TimeSieveCoefficients = { a0: 0, ap: new Map([[2, 1.0]]) };
    const period = (2 * Math.PI) / Math.log(2);
    expect(evaluateSymbol(coeffs, 0)).toBeCloseTo(evaluateSymbol(coeffs, period), 10);
  });
});

// ---------------------------------------------------------------------------
// computeEssentialBand
// ---------------------------------------------------------------------------

describe('computeEssentialBand', () => {
  test('empty ap → mMin = mMax = a0, isPositive = true', () => {
    const band = computeEssentialBand({ a0: 0.3, ap: new Map() });
    expect(band.mMin).toBeCloseTo(0.3);
    expect(band.mMax).toBeCloseTo(0.3);
    expect(band.isPositive).toBe(true);
    expect(band.l1BudgetUsed).toBe(0);
  });

  test('mMin = a0 − Σ|ap|', () => {
    const coeffs: TimeSieveCoefficients = { a0: 0.5, ap: new Map([[2, 0.3]]) };
    const band = computeEssentialBand(coeffs);
    expect(band.mMin).toBeCloseTo(0.2);
    expect(band.mMax).toBeCloseTo(0.8);
  });

  test('isPositive = false when a0 < Σ|ap|', () => {
    const coeffs: TimeSieveCoefficients = { a0: 0.1, ap: new Map([[2, 0.3]]) };
    const band = computeEssentialBand(coeffs);
    expect(band.isPositive).toBe(false);
    expect(band.mMin).toBeCloseTo(-0.2);
  });

  test('isPositive = true exactly at boundary (a0 = Σ|ap|)', () => {
    const coeffs: TimeSieveCoefficients = { a0: 0.3, ap: new Map([[2, 0.3]]) };
    const band = computeEssentialBand(coeffs);
    expect(band.isPositive).toBe(true);
    expect(band.mMin).toBeCloseTo(0);
  });
});

// ---------------------------------------------------------------------------
// verifyBochnerPositivity
// ---------------------------------------------------------------------------

describe('verifyBochnerPositivity', () => {
  test('positivity holds when a0 > Σ|ap|', () => {
    const coeffs: TimeSieveCoefficients = { a0: 0.5, ap: new Map([[2, 0.2]]) };
    expect(verifyBochnerPositivity(coeffs)).toBe(true);
  });

  test('positivity fails when a0 < Σ|ap|', () => {
    const coeffs: TimeSieveCoefficients = { a0: 0.1, ap: new Map([[2, 0.5]]) };
    expect(verifyBochnerPositivity(coeffs)).toBe(false);
  });

  test('canonical paper sieve passes Bochner', () => {
    expect(verifyBochnerPositivity(canonicalPaperSieve([2, 3, 5]))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// sampleSymbolBands
// ---------------------------------------------------------------------------

describe('sampleSymbolBands', () => {
  test('sampled min ≥ analytical mMin (numeric ≥ analytic lower bound)', () => {
    const coeffs = canonicalPaperSieve([2, 3, 5]);
    const band = computeEssentialBand(coeffs);
    const { sampledMin } = sampleSymbolBands(coeffs, 500);
    // Sampled min should approach but not go below the analytical bound
    expect(sampledMin).toBeGreaterThanOrEqual(band.mMin - 1e-10);
  });

  test('sampled max ≤ analytical mMax', () => {
    const coeffs = canonicalPaperSieve([2, 3, 5]);
    const band = computeEssentialBand(coeffs);
    const { sampledMax } = sampleSymbolBands(coeffs, 500);
    expect(sampledMax).toBeLessThanOrEqual(band.mMax + 1e-10);
  });
});

// ---------------------------------------------------------------------------
// canonicalPaperSieve
// ---------------------------------------------------------------------------

describe('canonicalPaperSieve', () => {
  test('a0 = 0.3', () => {
    const sieve = canonicalPaperSieve([2, 3, 5]);
    expect(sieve.a0).toBe(0.3);
  });

  test('ap for prime 2 = 0.4/4 = 0.1', () => {
    const sieve = canonicalPaperSieve([2]);
    expect(sieve.ap.get(2)).toBeCloseTo(0.1);
  });

  test('ap for prime 3 = 0.4/9 ≈ 0.0444', () => {
    const sieve = canonicalPaperSieve([3]);
    expect(sieve.ap.get(3)).toBeCloseTo(0.4 / 9);
  });

  test('Bochner positive for [2,3,5,7,11,13]', () => {
    expect(verifyBochnerPositivity(canonicalPaperSieve([2, 3, 5, 7, 11, 13]))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateTimeSieve
// ---------------------------------------------------------------------------

describe('validateTimeSieve', () => {
  test('canonical paper sieve passes', () => {
    const result = validateTimeSieve(canonicalPaperSieve([2, 3, 5]));
    expect(result.valid).toBe(true);
  });

  test('a0 ≤ 0 fails', () => {
    const result = validateTimeSieve({ a0: 0, ap: new Map() });
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('a0_positive');
  });

  test('Bochner violation fails', () => {
    const coeffs: TimeSieveCoefficients = { a0: 0.1, ap: new Map([[2, 5.0]]) };
    const result = validateTimeSieve(coeffs);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('bochner_positive');
  });

  test('failure detail mentions Bochner condition', () => {
    const coeffs: TimeSieveCoefficients = { a0: 0.1, ap: new Map([[2, 5.0]]) };
    const result = validateTimeSieve(coeffs);
    const check = result.checks.find(c => c.name === 'bochner_positive')!;
    expect(check.detail).toContain('Bochner');
  });
});
