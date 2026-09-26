/**
 * Tests for ADR-093: GFT Renormalization Epoch Layer
 */

import { describe, expect, test } from '@jest/globals';
import {
  runningLambda,
  runningG,
  epochToScale,
  betaLambda6,
  betaLambda4,
  checkEpochUnlockCondition,
  validateRunningVacuumBounds,
} from './gft-rg';
import type { RunningVacuumParams } from './gft-rg';

// ---------------------------------------------------------------------------
// runningLambda
// ---------------------------------------------------------------------------

describe('runningLambda', () => {
  test('Λ(H) = Λ₀ when ν = 0', () => {
    const p: RunningVacuumParams = { Lambda0: 0.5, nu: 0, G0: 1, omega: 0 };
    expect(runningLambda(p, 10)).toBeCloseTo(0.5);
  });

  test('Λ(H=0) = Λ₀ regardless of ν', () => {
    const p: RunningVacuumParams = { Lambda0: 0.3, nu: 0.001, G0: 1, omega: 0 };
    expect(runningLambda(p, 0)).toBeCloseTo(0.3);
  });

  test('Λ(H=1, ν=0.001) = Λ₀ + 0.001', () => {
    const p: RunningVacuumParams = { Lambda0: 0, nu: 0.001, G0: 1, omega: 0 };
    expect(runningLambda(p, 1)).toBeCloseTo(0.001);
  });

  test('ν negative decreases Λ at large H', () => {
    const p: RunningVacuumParams = { Lambda0: 1.0, nu: -0.001, G0: 1, omega: 0 };
    expect(runningLambda(p, 10)).toBeLessThan(1.0);
  });
});

// ---------------------------------------------------------------------------
// runningG
// ---------------------------------------------------------------------------

describe('runningG', () => {
  test('G(H) = G₀ when ω = 0', () => {
    const p: RunningVacuumParams = { Lambda0: 0, nu: 0, G0: 1.0, omega: 0 };
    expect(runningG(p, 10)).toBeCloseTo(1.0);
  });

  test('G(H=0) = G₀ regardless of ω', () => {
    const p: RunningVacuumParams = { Lambda0: 0, nu: 0, G0: 0.7, omega: 0.5 };
    expect(runningG(p, 0)).toBeCloseTo(0.7);
  });

  test('G({G0=1, omega=0.01}, H=10) = 0.5', () => {
    const p: RunningVacuumParams = { Lambda0: 0, nu: 0, G0: 1, omega: 0.01 };
    expect(runningG(p, 10)).toBeCloseTo(0.5);
  });

  test('G decreases with H when ω > 0', () => {
    const p: RunningVacuumParams = { Lambda0: 0, nu: 0, G0: 1, omega: 0.1 };
    expect(runningG(p, 5)).toBeLessThan(runningG(p, 1));
  });

  test('throws when denominator ≤ 0 (unphysical ω)', () => {
    const p: RunningVacuumParams = { Lambda0: 0, nu: 0, G0: 1, omega: -2 };
    expect(() => runningG(p, 1)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// epochToScale
// ---------------------------------------------------------------------------

describe('epochToScale', () => {
  test('prime=2, sigma=1 → 0.5', () => {
    expect(epochToScale(2, 1.0)).toBeCloseTo(0.5);
  });

  test('prime=7, sigma=0.3', () => {
    expect(epochToScale(7, 0.3)).toBeCloseTo(Math.pow(7, -0.3));
  });

  test('k0 scales result', () => {
    expect(epochToScale(2, 1.0, 2.0)).toBeCloseTo(1.0);
  });

  test('throws for prime ≤ 1', () => {
    expect(() => epochToScale(1, 1.0)).toThrow();
    expect(() => epochToScale(0, 1.0)).toThrow();
  });

  test('throws for sigma ≤ 0', () => {
    expect(() => epochToScale(2, 0)).toThrow();
    expect(() => epochToScale(2, -1)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// betaLambda6
// ---------------------------------------------------------------------------

describe('betaLambda6', () => {
  test('βλ₆ = 0 when lambda6 = 0 (trivial fixed point)', () => {
    expect(betaLambda6(0, 0.5, 0.1)).toBeCloseTo(0);
  });

  test('βλ₆ with small lambda6 and eta ≈ 0 is very small', () => {
    const bl6 = betaLambda6(0.0001, 0.02, 0.1);
    expect(Math.abs(bl6)).toBeLessThan(0.01);
  });

  test('large lambda6 gives large beta (IR divergence)', () => {
    const bl6 = betaLambda6(0.5, 0.02, 0.1);
    expect(Math.abs(bl6)).toBeGreaterThan(0.1);
  });

  test('Litim integral I3(0) = 1/(1+mbar2)^3', () => {
    const mbar2 = 0.0;
    const lambda6 = 1.0;
    const eta = 0.0;
    // βλ₆ = 0 + 24 × 1² × I₃(0) = 24 × 1 = 24
    expect(betaLambda6(lambda6, eta, mbar2)).toBeCloseTo(24);
  });
});

// ---------------------------------------------------------------------------
// betaLambda4
// ---------------------------------------------------------------------------

describe('betaLambda4', () => {
  test('βλ₄ = 0 when lambda4 = 0', () => {
    expect(betaLambda4(0, 0.5, 0.1)).toBeCloseTo(0);
  });

  test('βλ₄ = 0 when eta = 0 (no wave-function renormalization)', () => {
    expect(betaLambda4(0.1, 0, 0.1)).toBeCloseTo(0);
  });
});

// ---------------------------------------------------------------------------
// checkEpochUnlockCondition
// ---------------------------------------------------------------------------

describe('checkEpochUnlockCondition', () => {
  test('prime=7, small lambda6, small eta → approved', () => {
    const result = checkEpochUnlockCondition(7, 1.0, 0.01, 0.0001, 0.02, 0.1);
    expect(result.unlockApproved).toBe(true);
    expect(result.prime).toBe(7);
  });

  test('prime=7, large lambda6 (unconverged flow) → blocked', () => {
    const result = checkEpochUnlockCondition(7, 1.0, 0.01, 0.5, 0.7, 0.1);
    expect(result.unlockApproved).toBe(false);
    expect(result.betaConverged).toBe(false);
  });

  test('prime=7, large eta (non-Gaussian phase) → blocked', () => {
    const result = checkEpochUnlockCondition(7, 1.0, 0.01, 0.0001, 0.5, 0.1);
    expect(result.unlockApproved).toBe(false);
    expect(result.gaussianRegime).toBe(false);
  });

  test('composite 4 → rejected (not prime)', () => {
    const result = checkEpochUnlockCondition(4, 1.0, 0, 0, 0, 0);
    expect(result.unlockApproved).toBe(false);
    expect(result.reason).toContain('not prime');
  });

  test('prime=1 → rejected (not prime)', () => {
    const result = checkEpochUnlockCondition(1, 1.0, 0, 0, 0, 0);
    expect(result.unlockApproved).toBe(false);
  });

  test('result includes scale = k0 × p^{-σ}', () => {
    const result = checkEpochUnlockCondition(2, 1.0, 0, 0.0001, 0.02, 0.1, { k0: 1.0 });
    expect(result.scale).toBeCloseTo(0.5);
  });

  test('custom betaThreshold option is respected', () => {
    // betaLambda6 at lambda6=0.001, eta=0.02, mbar2=0.1 is very small → should pass default 0.01
    const defaultResult = checkEpochUnlockCondition(7, 1, 0, 0.001, 0.02, 0.1);
    expect(defaultResult.betaConverged).toBe(true);
    // With extremely tight threshold, same input fails
    const strictResult = checkEpochUnlockCondition(7, 1, 0, 0.001, 0.02, 0.1, { betaThreshold: 1e-10 });
    expect(strictResult.betaConverged).toBe(false);
  });

  test('approved result reason contains prime number', () => {
    const result = checkEpochUnlockCondition(11, 1.0, 0, 0.0001, 0.02, 0.1);
    if (result.unlockApproved) {
      expect(result.reason).toContain('11');
    }
  });
});

// ---------------------------------------------------------------------------
// validateRunningVacuumBounds
// ---------------------------------------------------------------------------

describe('validateRunningVacuumBounds', () => {
  test('all zeros → valid', () => {
    const p: RunningVacuumParams = { Lambda0: 0, nu: 0, G0: 1, omega: 0 };
    expect(validateRunningVacuumBounds(p).valid).toBe(true);
  });

  test('ν within bound → valid', () => {
    const p: RunningVacuumParams = { Lambda0: 0, nu: 0.001, G0: 1, omega: 0 };
    expect(validateRunningVacuumBounds(p).valid).toBe(true);
  });

  test('ν exceeds bound → violation', () => {
    const p: RunningVacuumParams = { Lambda0: 0, nu: 0.02, G0: 1, omega: 0 };
    const result = validateRunningVacuumBounds(p);
    expect(result.valid).toBe(false);
    expect(result.violations[0]).toContain('ν');
  });

  test('ω exceeds bound → violation', () => {
    const p: RunningVacuumParams = { Lambda0: 0, nu: 0, G0: 1, omega: 0.02 };
    const result = validateRunningVacuumBounds(p);
    expect(result.valid).toBe(false);
    expect(result.violations[0]).toContain('ω');
  });

  test('both ν and ω violate → two violations', () => {
    const p: RunningVacuumParams = { Lambda0: 0, nu: 0.05, G0: 1, omega: 0.05 };
    const result = validateRunningVacuumBounds(p);
    expect(result.violations).toHaveLength(2);
  });

  test('negative ν within magnitude bound → valid', () => {
    const p: RunningVacuumParams = { Lambda0: 0, nu: -0.001, G0: 1, omega: 0 };
    expect(validateRunningVacuumBounds(p).valid).toBe(true);
  });
});
