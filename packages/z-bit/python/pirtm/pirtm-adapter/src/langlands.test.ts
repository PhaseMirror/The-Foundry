/**
 * Langlands Automorphy Layer unit tests
 * ADR-083 (PM-2505)
 */

import { describe, expect, test } from '@jest/globals';
import {
  checkCRTCoherence,
  checkLFunctionBound,
  checkSymmetryBlock,
  checkLanglandsCoherence,
} from './langlands';
import type { ModuleBinding } from './langlands';

// Reference modules: p=7 and p=11 are coprime, both prime
const mod7: ModuleBinding = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8 };
const mod11: ModuleBinding = { primeIndex: 11, epsilon: 0.4, opNormT: 0.9 };
// Non-coprime pair: 6 and 9 share factor 3
const mod6: ModuleBinding = { primeIndex: 6, epsilon: 0.5, opNormT: 0.8 };
const mod9: ModuleBinding = { primeIndex: 9, epsilon: 0.5, opNormT: 0.8 };

// Gain matrices for 2-module cases
const contractiveGain = [[0.3, 0.2], [0.1, 0.4]];   // diag * eps < 1, off-diag < sqrt(eps_i * eps_j)
const nonContractiveGain = [[2.5, 0.1], [0.1, 0.3]]; // diag[0]*epsilon = 2.5*0.5 = 1.25 >= 1

// ---------------------------------------------------------------------------
// checkCRTCoherence
// ---------------------------------------------------------------------------

describe('checkCRTCoherence', () => {
  test('passes for coprime module pair (7, 11)', () => {
    const r = checkCRTCoherence([mod7, mod11]);
    expect(r.coherent).toBe(true);
    expect(r.checks.every((c) => c.passed)).toBe(true);
  });

  test('fails for non-coprime pair (6, 9)', () => {
    const r = checkCRTCoherence([mod6, mod9]);
    expect(r.coherent).toBe(false);
    expect(r.reason).toMatch(/NOT coprime/);
  });

  test('trivially coherent with 0 modules', () => {
    expect(checkCRTCoherence([]).coherent).toBe(true);
  });

  test('trivially coherent with 1 module', () => {
    expect(checkCRTCoherence([mod7]).coherent).toBe(true);
  });

  test('three coprime primes pass', () => {
    const mod13: ModuleBinding = { primeIndex: 13, epsilon: 0.3, opNormT: 0.7 };
    const r = checkCRTCoherence([mod7, mod11, mod13]);
    expect(r.coherent).toBe(true);
  });

  test('non-coprime pair among three modules fails', () => {
    const r = checkCRTCoherence([mod7, mod6, mod9]);
    expect(r.coherent).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// checkLFunctionBound
// ---------------------------------------------------------------------------

describe('checkLFunctionBound', () => {
  test('passes when opNormT * epsilon < 1 for all modules', () => {
    // mod7: 0.8 * 0.5 = 0.4 < 1
    // mod11: 0.9 * 0.4 = 0.36 < 1
    const r = checkLFunctionBound([mod7, mod11]);
    expect(r.coherent).toBe(true);
  });

  test('fails when opNormT * epsilon >= 1', () => {
    const overBound: ModuleBinding = { primeIndex: 7, epsilon: 0.8, opNormT: 1.5 };
    // 1.5 * 0.8 = 1.2 >= 1
    const r = checkLFunctionBound([overBound]);
    expect(r.coherent).toBe(false);
    expect(r.reason).toMatch(/L_FUNCTION_EXCEEDED/);
  });

  test('empty modules pass', () => {
    expect(checkLFunctionBound([]).coherent).toBe(true);
  });

  test('custom spectralRadiusMax respected', () => {
    // mod7: 0.8 * 0.5 = 0.4 — passes with max=1 but fails with max=0.3
    const r = checkLFunctionBound([mod7], 0.3);
    expect(r.coherent).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// checkSymmetryBlock
// ---------------------------------------------------------------------------

describe('checkSymmetryBlock', () => {
  test('passes for contractive diagonal and bounded coupling', () => {
    // G[0][0]*eps = 0.3*0.5=0.15 < 1; G[1][1]*eps = 0.4*0.4=0.16 < 1
    // off-diag: G[0][1]=0.2 < sqrt(0.5*0.4)=sqrt(0.2)≈0.447 ✔
    //           G[1][0]=0.1 < sqrt(0.4*0.5)≈0.447 ✔
    const r = checkSymmetryBlock([mod7, mod11], contractiveGain);
    expect(r.coherent).toBe(true);
  });

  test('fails when diagonal not contractive', () => {
    const r = checkSymmetryBlock([mod7, mod11], nonContractiveGain);
    // mod7: G[0][0]*epsilon = 2.5*0.5 = 1.25 >= 1
    expect(r.coherent).toBe(false);
    expect(r.reason).toMatch(/DIAGONAL_NOT_CONTRACTIVE/);
  });

  test('fails when coupling exceeds geometric mean bound', () => {
    // mod7, mod11: sqrt(0.5*0.4)≈0.447; create coupling of 0.9
    const highCoupling = [[0.3, 0.9], [0.9, 0.4]];
    const r = checkSymmetryBlock([mod7, mod11], highCoupling);
    expect(r.coherent).toBe(false);
    expect(r.reason).toMatch(/COUPLING_EXCEEDED/);
  });

  test('returns error on dimension mismatch', () => {
    const r = checkSymmetryBlock([mod7, mod11], [[0.3]]);
    expect(r.coherent).toBe(false);
    expect(r.reason).toMatch(/dimensions/);
  });

  test('trivially passes for empty module set', () => {
    expect(checkSymmetryBlock([], []).coherent).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// checkLanglandsCoherence — composite
// ---------------------------------------------------------------------------

describe('checkLanglandsCoherence', () => {
  test('passes when all three checks pass', () => {
    const r = checkLanglandsCoherence([mod7, mod11], contractiveGain);
    expect(r.coherent).toBe(true);
    expect(r.reason).toBeUndefined();
  });

  test('fails when CRT check fails (non-coprime)', () => {
    const r = checkLanglandsCoherence([mod6, mod9], contractiveGain);
    expect(r.coherent).toBe(false);
    expect(r.reason).toMatch(/NOT coprime/);
  });

  test('fails when L-function bound exceeded', () => {
    const overBound: ModuleBinding = { primeIndex: 7, epsilon: 0.9, opNormT: 1.5 };
    const singleGain = [[0.3]];
    const r = checkLanglandsCoherence([overBound], singleGain);
    expect(r.coherent).toBe(false);
  });

  test('checks array contains entries from all three sub-checks', () => {
    const r = checkLanglandsCoherence([mod7, mod11], contractiveGain);
    // CRT: 1 pair → 1 check
    // L-function: 2 modules → 2 checks
    // Symmetry: 2 diagonal + 2 off-diagonal → 4 checks
    expect(r.checks.length).toBeGreaterThanOrEqual(7);
  });

  test('single module with coprime (trivial) passes all gates', () => {
    const single = [[0.2]];
    const r = checkLanglandsCoherence([mod7], single);
    expect(r.coherent).toBe(true);
  });
});
