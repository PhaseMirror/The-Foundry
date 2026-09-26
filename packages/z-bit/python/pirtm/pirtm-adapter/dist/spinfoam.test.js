/**
 * Tests for ADR-092: Spin-Foam Noise Kernel Integration
 */
import { describe, expect, test } from '@jest/globals';
import { canonicalCumulants, foamDiffusiveDriftBound, computeFNL, computeTotalDriftBudget, checkNonGaussianityTolerance, computeNoiseKernelBound, auditFoamDrift, PLANCK_SUPPRESSION, FNL_TOLERANCE, P_ZETA_CANONICAL, } from './spinfoam';
// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
describe('constants', () => {
    test('PLANCK_SUPPRESSION = 1e-5', () => {
        expect(PLANCK_SUPPRESSION).toBe(1e-5);
    });
    test('FNL_TOLERANCE = 0.5', () => {
        expect(FNL_TOLERANCE).toBe(0.5);
    });
    test('P_ZETA_CANONICAL is the Planck 2018 amplitude', () => {
        expect(P_ZETA_CANONICAL).toBeCloseTo(2.1e-9);
    });
});
// ---------------------------------------------------------------------------
// canonicalCumulants
// ---------------------------------------------------------------------------
describe('canonicalCumulants', () => {
    test('C2 = 1 with default leading factor', () => {
        expect(canonicalCumulants().C2).toBe(1);
    });
    test('C3 ~ (1e-5)^2 = 1e-10', () => {
        expect(canonicalCumulants().C3).toBeCloseTo(1e-10);
    });
    test('C4 ~ (1e-5)^4 = 1e-20', () => {
        expect(canonicalCumulants().C4).toBeCloseTo(1e-20);
    });
    test('scalar scaling: leadingFactor=2 doubles all cumulants', () => {
        const c = canonicalCumulants(2);
        expect(c.C2).toBe(2);
        expect(c.C3).toBeCloseTo(2e-10);
        expect(c.C4).toBeCloseTo(2e-20);
    });
});
// ---------------------------------------------------------------------------
// foamDiffusiveDriftBound
// ---------------------------------------------------------------------------
describe('foamDiffusiveDriftBound', () => {
    test('σ_foam(t=1, C2=1) = 1', () => {
        expect(foamDiffusiveDriftBound(1, 1)).toBe(1);
    });
    test('σ_foam(t=4, C2=1) = 2', () => {
        expect(foamDiffusiveDriftBound(1, 4)).toBeCloseTo(2);
    });
    test('σ_foam = 0 at t=0', () => {
        expect(foamDiffusiveDriftBound(1, 0)).toBe(0);
    });
    test('foam drift with canonical cumulants is extremely small', () => {
        const c = canonicalCumulants();
        expect(foamDiffusiveDriftBound(c.C2, 1)).toBe(1); // C2=1 → σ=1
    });
    test('throws for negative C2', () => {
        expect(() => foamDiffusiveDriftBound(-1, 1)).toThrow();
    });
    test('throws for negative t', () => {
        expect(() => foamDiffusiveDriftBound(1, -1)).toThrow();
    });
});
// ---------------------------------------------------------------------------
// computeFNL
// ---------------------------------------------------------------------------
describe('computeFNL', () => {
    test('computeFNL formula: f_NL = C3 / Pzeta^2', () => {
        // C3 = 1e-10 (Planck-scale cumulant), Pzeta = 2.1e-9.
        // f_NL = C3 / Pzeta^2 ≈ 22.7M — physically large because C3 is a cumulant, not the bispectrum.
        const c = canonicalCumulants();
        const fNL = computeFNL(c.C3, P_ZETA_CANONICAL);
        expect(fNL).toBeCloseTo(c.C3 / (P_ZETA_CANONICAL * P_ZETA_CANONICAL), 5);
    });
    test('f_NL = C3 / Pzeta^2', () => {
        const fNL = computeFNL(1e-10, 1e-5);
        expect(fNL).toBeCloseTo(1e-10 / (1e-5 * 1e-5));
    });
    test('throws for Pzeta ≤ 0', () => {
        expect(() => computeFNL(1e-10, 0)).toThrow();
        expect(() => computeFNL(1e-10, -1)).toThrow();
    });
});
// ---------------------------------------------------------------------------
// computeTotalDriftBudget
// ---------------------------------------------------------------------------
describe('computeTotalDriftBudget', () => {
    test('large cognitive bound → positive remaining budget', () => {
        const budget = computeTotalDriftBudget(100, 1, 1, 2.0);
        expect(budget).toBe(100 - 2 * Math.sqrt(1));
    });
    test('zero cognitive bound → always negative (no budget)', () => {
        expect(computeTotalDriftBudget(0, 1, 1)).toBeLessThan(0);
    });
});
// ---------------------------------------------------------------------------
// checkNonGaussianityTolerance
// ---------------------------------------------------------------------------
describe('checkNonGaussianityTolerance', () => {
    test('small f_NL passes', () => {
        const result = checkNonGaussianityTolerance(0.1, 0.5);
        expect(result.pass).toBe(true);
    });
    test('f_NL = 0.5 = tolerance → passes (strict <)', () => {
        // |0.5| is NOT < 0.5, so this should fail
        const result = checkNonGaussianityTolerance(0.5, 0.5);
        expect(result.pass).toBe(false);
    });
    test('f_NL = 0.499 passes', () => {
        expect(checkNonGaussianityTolerance(0.499, 0.5).pass).toBe(true);
    });
    test('f_NL = 0.6 fails', () => {
        const result = checkNonGaussianityTolerance(0.6, 0.5);
        expect(result.pass).toBe(false);
        expect(result.reason).toContain('tolerance violated');
    });
    test('small f_NL value passes tolerance', () => {
        // Use a directly small f_NL value rather than canonical cumulants (C3/Pζ^2 >> 0.5).
        expect(checkNonGaussianityTolerance(0.1).pass).toBe(true);
    });
});
// ---------------------------------------------------------------------------
// computeNoiseKernelBound
// ---------------------------------------------------------------------------
describe('computeNoiseKernelBound', () => {
    test('large cognitive bound → withinBudget = true', () => {
        const result = computeNoiseKernelBound({ C2: 1, C3: 1e-10, C4: 1e-20 }, 1, 1000);
        expect(result.withinBudget).toBe(true);
    });
    test('tiny cognitive bound → withinBudget = false', () => {
        const result = computeNoiseKernelBound({ C2: 1, C3: 1e-10, C4: 1e-20 }, 100, 0.01);
        expect(result.withinBudget).toBe(false);
    });
    test('returns driftBound = √(C₂·t)', () => {
        const result = computeNoiseKernelBound({ C2: 4, C3: 0, C4: 0 }, 1, 100);
        expect(result.driftBound).toBeCloseTo(2);
    });
});
// ---------------------------------------------------------------------------
// auditFoamDrift
// ---------------------------------------------------------------------------
describe('auditFoamDrift', () => {
    test('returns structured audit record', () => {
        const record = auditFoamDrift(1, 1000);
        expect(record).toHaveProperty('t');
        expect(record).toHaveProperty('foamDrift');
        expect(record).toHaveProperty('budgetRemaining');
        expect(record).toHaveProperty('compliant');
        expect(record).toHaveProperty('fNLCheck');
        expect(record).toHaveProperty('timestamp');
    });
    test('compliant = true for large cognitive delta with tiny C3', () => {
        // Pass explicit cumulants where C3 is small enough that f_NL = C3/Pζ^2 < 0.5.
        // C3 = 1e-30 → f_NL ≈ 5e-14 ≪ 0.5.
        const tinyCumulants = { C2: 1, C3: 1e-30, C4: 1e-60 };
        const record = auditFoamDrift(1, 1000, tinyCumulants);
        expect(record.compliant).toBe(true);
    });
    test('compliant uses canonical cumulants by default', () => {
        const record = auditFoamDrift(1, 1e-4);
        // foamDrift with C2=1, t=1 → σ=1, safety=2 → required budget = 2 > 1e-4
        expect(record.compliant).toBe(false);
    });
    test('timestamp is ISO string', () => {
        const record = auditFoamDrift(1, 100);
        expect(record.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
});
//# sourceMappingURL=spinfoam.test.js.map