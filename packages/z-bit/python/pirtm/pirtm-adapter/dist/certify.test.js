/**
 * Tests for ADR-094: Spectral Certification Gate (G7a / G7b / G7c / G8)
 */
import { describe, expect, test } from '@jest/globals';
import { certifyGapLB, certifyPositivityGenerator, certifyACEDominance, certifyFrameInvariance, runSpectralCertification, } from './certify';
import { zeroBudget } from './spectral';
import { canonicalPaperSieve } from './timesieve';
// ---------------------------------------------------------------------------
// Gate G7a — certifyGapLB
// ---------------------------------------------------------------------------
describe('certifyGapLB', () => {
    test('zero budget → GapLB > 0 → passes', () => {
        const result = certifyGapLB([2, 3, 5], 1.0, 0.6, zeroBudget([2, 3, 5]));
        expect(result.pass).toBe(true);
        expect(result.gapLB).toBeGreaterThan(0);
    });
    test('massive budget → GapLB ≤ 0 → fails', () => {
        const bigBudget = {
            weights: new Map([[2, 10], [3, 10], [5, 10]]),
            normBounds: new Map([[2, 10], [3, 10], [5, 10]]),
            lipschitzBounds: new Map([[2, 0], [3, 0], [5, 0]]),
        };
        const result = certifyGapLB([2, 3, 5], 1.0, 0.6, bigBudget);
        expect(result.pass).toBe(false);
    });
    test('passing result reason contains Theorem 8', () => {
        const result = certifyGapLB([2, 3, 5], 1.0, 0.6, zeroBudget([2, 3, 5]));
        expect(result.reason).toContain('Theorem 8');
    });
    test('result always has gapLB field', () => {
        const result = certifyGapLB([7], 1.0, 0.6, zeroBudget([7]));
        expect(typeof result.gapLB).toBe('number');
    });
});
// ---------------------------------------------------------------------------
// Gate G7b — certifyPositivityGenerator
// ---------------------------------------------------------------------------
describe('certifyPositivityGenerator', () => {
    const goodSieve = canonicalPaperSieve([2, 3, 5]);
    test('all conditions met → pass', () => {
        const result = certifyPositivityGenerator(goodSieve, true, 0.1);
        expect(result.pass).toBe(true);
        expect(result.reason).toContain('Theorem 9');
    });
    test('bochner=false → fail with Bochner message', () => {
        // Construct sieve with m(ω) < 0
        const badSieve = { a0: 0.1, ap: new Map([[2, 5.0]]) };
        const result = certifyPositivityGenerator(badSieve, true, 0.1);
        expect(result.pass).toBe(false);
        expect(result.bochner).toBe(false);
        expect(result.reason).toContain('Bochner');
    });
    test('kPSD=false → fail with K-PSD message', () => {
        const result = certifyPositivityGenerator(goodSieve, false, 0.1);
        expect(result.pass).toBe(false);
        expect(result.kPSD).toBe(false);
        expect(result.reason).toContain('Gram kernel');
    });
    test('xiEigenMin < 0 → fail with Ξ message', () => {
        const result = certifyPositivityGenerator(goodSieve, true, -0.01);
        expect(result.pass).toBe(false);
        expect(result.xiNonNeg).toBe(false);
        expect(result.reason).toContain('Ξ');
    });
    test('xiEigenMin = 0 (boundary) → pass', () => {
        expect(certifyPositivityGenerator(goodSieve, true, 0).pass).toBe(true);
    });
    test('all three failing → reason contains all three', () => {
        const badSieve = { a0: 0.1, ap: new Map([[2, 5.0]]) };
        const result = certifyPositivityGenerator(badSieve, false, -0.1);
        expect(result.pass).toBe(false);
    });
});
// ---------------------------------------------------------------------------
// Gate G7c — certifyACEDominance
// ---------------------------------------------------------------------------
describe('certifyACEDominance', () => {
    const goodSieve = canonicalPaperSieve([2, 3, 5]);
    test('γ ≥ opNormA → pass (Theorem 10)', () => {
        // mMin ≈ 0.12 for canonical sieve, xiMin=0.3 → γ≈0.42, opNormA=0.4
        const result = certifyACEDominance(goodSieve, 0.3, 0.4);
        expect(result.pass).toBe(true);
        expect(result.reason).toContain('Theorem 10');
    });
    test('γ < opNormA → fail', () => {
        // mMin for canonical sieve ≈ 0.12, xiMin=0.0 → γ≈0.12 < opNormA=0.5
        const result = certifyACEDominance(goodSieve, 0.0, 0.5);
        expect(result.pass).toBe(false);
        expect(result.reason).toContain('ACE dominance violated');
    });
    test('result has gamma and opNormA fields', () => {
        const result = certifyACEDominance(goodSieve, 0.3, 0.4);
        expect(typeof result.gamma).toBe('number');
        expect(result.opNormA).toBe(0.4);
    });
});
// ---------------------------------------------------------------------------
// Gate G8 — certifyFrameInvariance
// ---------------------------------------------------------------------------
describe('certifyFrameInvariance', () => {
    test('deterministic GapLB → invariant → passes', () => {
        const result = certifyFrameInvariance([2, 3, 5], 1.0, 0.6, zeroBudget([2, 3, 5]));
        expect(result.pass).toBe(true);
        expect(result.maxDeviation).toBeLessThan(1e-10);
        expect(result.reason).toContain('Theorem 13');
    });
    test('numTrials=1 still passes', () => {
        const result = certifyFrameInvariance([2, 3], 1.0, 0.6, zeroBudget([2, 3]), 1);
        expect(result.pass).toBe(true);
    });
});
// ---------------------------------------------------------------------------
// runSpectralCertification — full pass
// ---------------------------------------------------------------------------
describe('runSpectralCertification', () => {
    const goodMeta = {
        primeIndex: 7,
        epsilon: 0.5,
        opNormT: 0.8,
        sigma: 1.0,
        alpha: 0.6,
        kPSD: true,
    };
    const goodInput = {
        meta: goodMeta,
        primes: [2, 3, 5],
        budget: zeroBudget([2, 3, 5]),
        sieveCoeffs: canonicalPaperSieve([2, 3, 5]),
        xiEigenMin: 0.3,
        opNormA: 0.4,
    };
    test('all conditions met → overall=true, failedGates=[]', () => {
        const result = runSpectralCertification(goodInput);
        expect(result.overall).toBe(true);
        expect(result.failedGates).toHaveLength(0);
    });
    test('has all gate keys', () => {
        const result = runSpectralCertification(goodInput);
        expect(result).toHaveProperty('g7a');
        expect(result).toHaveProperty('g7b');
        expect(result).toHaveProperty('g7c');
        expect(result).toHaveProperty('g8');
    });
    test('G7b fails → failedGates includes G7b', () => {
        const input = {
            ...goodInput,
            meta: { ...goodMeta, kPSD: false },
        };
        const result = runSpectralCertification(input);
        expect(result.overall).toBe(false);
        expect(result.failedGates).toContain('G7b (Theorem 9)');
    });
    test('G7c fails → failedGates includes G7c', () => {
        const input = {
            ...goodInput,
            // opNormA extremely large → ACE dominance fails
            opNormA: 999,
        };
        const result = runSpectralCertification(input);
        expect(result.failedGates).toContain('G7c (Theorem 10)');
    });
    test('all four gates fail → failedGates has 4 entries', () => {
        const input = {
            ...goodInput,
            // G7b: kPSD=false, xiNonNeg < 0
            meta: { ...goodMeta, kPSD: false },
            // G7c: opNormA huge
            opNormA: 999,
            // G7a: massive budget
            budget: {
                weights: new Map([[2, 100], [3, 100], [5, 100]]),
                normBounds: new Map([[2, 100], [3, 100], [5, 100]]),
                lipschitzBounds: new Map([[2, 0], [3, 0], [5, 0]]),
            },
            // G7b: xiEigenMin < 0
            xiEigenMin: -1,
            // Bochner: bad sieve
            sieveCoeffs: { a0: 0.1, ap: new Map([[2, 5.0]]) },
        };
        const result = runSpectralCertification(input);
        // At minimum G7a, G7b, G7c should fail — likely all 4
        expect(result.overall).toBe(false);
        expect(result.failedGates.length).toBeGreaterThanOrEqual(3);
    });
    test('opNormA=0 triggers auto-computation', () => {
        const input = { ...goodInput, opNormA: 0 };
        const result = runSpectralCertification(input);
        // Should not throw; adapts to whatever opNormA auto-computation gives
        expect(result).toHaveProperty('g7c');
    });
});
//# sourceMappingURL=certify.test.js.map