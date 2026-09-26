/**
 * Tests for ADR-089 (Prime-Spectral Basis) + ADR-091 (Dissipative Generator Cert)
 */
import { describe, expect, test } from '@jest/globals';
import { diagonalEntry, gramKernelEntry, buildPrimeSpectralBasis, computeHSNorm, computeOpNormMatrix, verifyPositiveSemidefinite, validatePrimeSpectralBasis, computeGapLB, computeSlopeUB, certifySpectralAttributes, zeroBudget, } from './spectral';
// ---------------------------------------------------------------------------
// diagonalEntry
// ---------------------------------------------------------------------------
describe('diagonalEntry', () => {
    test('p=2, sigma=1 → 0.5', () => {
        expect(diagonalEntry(2, 1)).toBeCloseTo(0.5);
    });
    test('p=3, sigma=1 → 1/3', () => {
        expect(diagonalEntry(3, 1)).toBeCloseTo(1 / 3);
    });
    test('p=7, sigma=2 → 1/49', () => {
        expect(diagonalEntry(7, 2)).toBeCloseTo(1 / 49);
    });
    test('sigma=0.5 gives p^{-0.5}', () => {
        expect(diagonalEntry(4, 0.5)).toBeCloseTo(0.5);
    });
    test('throws for p ≤ 1', () => {
        expect(() => diagonalEntry(1, 1)).toThrow();
        expect(() => diagonalEntry(0, 1)).toThrow();
    });
    test('throws for sigma ≤ 0', () => {
        expect(() => diagonalEntry(2, 0)).toThrow();
        expect(() => diagonalEntry(2, -1)).toThrow();
    });
});
// ---------------------------------------------------------------------------
// gramKernelEntry
// ---------------------------------------------------------------------------
describe('gramKernelEntry', () => {
    test('diagonal entry K_pp = p^{-2α} h(0) — h(0) = 1 for default Gaussian', () => {
        const p = 3;
        const alpha = 0.51;
        expect(gramKernelEntry(p, p, alpha)).toBeCloseTo(Math.pow(p, -2 * alpha));
    });
    test('symmetric: K_pq = K_qp', () => {
        expect(gramKernelEntry(2, 3, 0.6)).toBeCloseTo(gramKernelEntry(3, 2, 0.6));
    });
    test('throws for alpha = 0.5 exactly (boundary)', () => {
        expect(() => gramKernelEntry(2, 3, 0.5)).toThrow('Hilbert-Schmidt');
    });
    test('throws for alpha < 0.5', () => {
        expect(() => gramKernelEntry(2, 3, 0.49)).toThrow();
    });
    test('accepts alpha = 0.51', () => {
        expect(() => gramKernelEntry(2, 3, 0.51)).not.toThrow();
    });
    test('custom kernel is applied', () => {
        const constH = (_t) => 2.0;
        const result = gramKernelEntry(2, 3, 0.6, constH);
        expect(result).toBeCloseTo(Math.pow(2, -0.6) * Math.pow(3, -0.6) * 2.0);
    });
});
// ---------------------------------------------------------------------------
// buildPrimeSpectralBasis
// ---------------------------------------------------------------------------
describe('buildPrimeSpectralBasis', () => {
    test('returns N×N matrix for N primes', () => {
        const A = buildPrimeSpectralBasis([2, 3, 5], 1.0, 0.51);
        expect(A).toHaveLength(3);
        expect(A[0]).toHaveLength(3);
    });
    test('diagonal is Dσ + K_pp (> off-diagonal entries for small prime set)', () => {
        const A = buildPrimeSpectralBasis([2, 3], 1.0, 0.51);
        // Diagonal entry = p^{-σ} + p^{-2α}h(0) > K_pq
        expect(A[0][0]).toBeGreaterThan(A[0][1]);
        expect(A[1][1]).toBeGreaterThan(A[1][0]);
    });
    test('matrix is symmetric', () => {
        const A = buildPrimeSpectralBasis([2, 3, 5], 1.0, 0.6);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                expect(A[i][j]).toBeCloseTo(A[j][i]);
            }
        }
    });
    test('single-prime matrix is 1×1', () => {
        const A = buildPrimeSpectralBasis([7], 1.0, 0.6);
        expect(A).toHaveLength(1);
        expect(A[0][0]).toBeCloseTo(diagonalEntry(7, 1.0) + gramKernelEntry(7, 7, 0.6));
    });
    test('throws for empty prime array', () => {
        expect(() => buildPrimeSpectralBasis([], 1.0, 0.6)).toThrow();
    });
});
// ---------------------------------------------------------------------------
// computeHSNorm
// ---------------------------------------------------------------------------
describe('computeHSNorm', () => {
    test('returns finite value for alpha > 0.5', () => {
        const hs = computeHSNorm([2, 3, 5], 0.6);
        expect(isFinite(hs)).toBe(true);
        expect(hs).toBeGreaterThan(0);
    });
    test('larger alpha → smaller HS norm (better suppression)', () => {
        const hs1 = computeHSNorm([2, 3, 5, 7], 0.55);
        const hs2 = computeHSNorm([2, 3, 5, 7], 0.9);
        expect(hs2).toBeLessThan(hs1);
    });
});
// ---------------------------------------------------------------------------
// computeOpNormMatrix
// ---------------------------------------------------------------------------
describe('computeOpNormMatrix', () => {
    test('matches max absolute row sum', () => {
        const A = [[0.5, 0.1], [0.2, 0.7]];
        // row 0: 0.6, row 1: 0.9
        expect(computeOpNormMatrix(A)).toBeCloseTo(0.9);
    });
    test('empty matrix returns 0', () => {
        expect(computeOpNormMatrix([])).toBe(0);
    });
});
// ---------------------------------------------------------------------------
// verifyPositiveSemidefinite
// ---------------------------------------------------------------------------
describe('verifyPositiveSemidefinite', () => {
    test('diagonal-dominant matrix is PSD', () => {
        const A = [[1, 0.1], [0.1, 1]];
        expect(verifyPositiveSemidefinite(A)).toBe(true);
    });
    test('non-dominant matrix fails', () => {
        const A = [[0.1, 0.9], [0.9, 0.1]];
        expect(verifyPositiveSemidefinite(A)).toBe(false);
    });
    test('identity 3×3 is PSD', () => {
        const I = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
        expect(verifyPositiveSemidefinite(I)).toBe(true);
    });
    test('built prime-spectral basis [2,3,5] with alpha=0.6 is PSD', () => {
        const A = buildPrimeSpectralBasis([2, 3, 5], 1.0, 0.6);
        expect(verifyPositiveSemidefinite(A)).toBe(true);
    });
});
// ---------------------------------------------------------------------------
// validatePrimeSpectralBasis
// ---------------------------------------------------------------------------
describe('validatePrimeSpectralBasis', () => {
    test('valid meta with alpha=0.6 sigma=1 passes', () => {
        const meta = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8, sigma: 1.0, alpha: 0.6 };
        const result = validatePrimeSpectralBasis(meta, [2, 3, 5]);
        expect(result.valid).toBe(true);
    });
    test('sets kPSD on meta after validation', () => {
        const meta = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8, sigma: 1.0, alpha: 0.6 };
        validatePrimeSpectralBasis(meta, [2, 3, 5]);
        expect(meta.kPSD).toBe(true);
    });
    test('alpha=0.5 → immediate rejection (hard gate)', () => {
        const meta = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8, alpha: 0.5 };
        const result = validatePrimeSpectralBasis(meta, [2, 3, 5]);
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('alpha_hilbert_schmidt');
    });
    test('uses defaults when sigma/alpha are undefined', () => {
        const meta = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8 };
        const result = validatePrimeSpectralBasis(meta, [2, 3, 5]);
        expect(result.valid).toBe(true);
    });
});
// ---------------------------------------------------------------------------
// computeGapLB (ADR-091)
// ---------------------------------------------------------------------------
describe('computeGapLB', () => {
    test('zero budget → GapLB = Gershgorin minimum of diagonal margin', () => {
        const budget = zeroBudget([2, 3, 5]);
        const gapLB = computeGapLB([2, 3, 5], 1.0, 0.6, budget);
        // With zero budget, GapLB = min_i(A[i][i] - Σ_{j≠i}|A[i][j]|)
        // Should be positive for this well-conditioned prime set
        expect(gapLB).toBeGreaterThan(0);
    });
    test('large perturbation budget reduces GapLB', () => {
        const smallBudget = zeroBudget([2, 3, 5]);
        const bigBudget = {
            weights: new Map([[2, 1], [3, 1], [5, 1]]),
            normBounds: new Map([[2, 1], [3, 1], [5, 1]]),
            lipschitzBounds: new Map([[2, 0], [3, 0], [5, 0]]),
        };
        const gapSmall = computeGapLB([2, 3, 5], 1.0, 0.6, smallBudget);
        const gapBig = computeGapLB([2, 3, 5], 1.0, 0.6, bigBudget);
        expect(gapBig).toBeLessThan(gapSmall);
    });
    test('empty primes returns 0', () => {
        const budget = zeroBudget([]);
        expect(computeGapLB([], 1.0, 0.6, budget)).toBe(0);
    });
});
// ---------------------------------------------------------------------------
// computeSlopeUB (ADR-091)
// ---------------------------------------------------------------------------
describe('computeSlopeUB', () => {
    test('zero budget → SlopeUB = 0', () => {
        expect(computeSlopeUB(zeroBudget([2, 3, 5]))).toBe(0);
    });
    test('matches Σ|wₚ|Lₚ', () => {
        const budget = {
            weights: new Map([[2, 0.5], [3, 0.3]]),
            normBounds: new Map([[2, 0], [3, 0]]),
            lipschitzBounds: new Map([[2, 1.0], [3, 2.0]]),
        };
        // 0.5×1.0 + 0.3×2.0 = 0.5 + 0.6 = 1.1
        expect(computeSlopeUB(budget)).toBeCloseTo(1.1);
    });
});
// ---------------------------------------------------------------------------
// certifySpectralAttributes (ADR-091)
// ---------------------------------------------------------------------------
describe('certifySpectralAttributes', () => {
    test('canonical primes, zero budget → passes', () => {
        const meta = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8, sigma: 1.0, alpha: 0.6 };
        const result = certifySpectralAttributes(meta, [2, 3, 5], zeroBudget([2, 3, 5]));
        expect(result.valid).toBe(true);
    });
    test('writes gap_lb and slope_ub back onto meta', () => {
        const meta = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8, sigma: 1.0, alpha: 0.6 };
        certifySpectralAttributes(meta, [2, 3, 5], zeroBudget([2, 3, 5]));
        expect(meta.gap_lb).toBeDefined();
        expect(meta.gap_lb).toBeGreaterThan(0);
        expect(meta.slope_ub).toBeDefined();
        expect(meta.slope_ub).toBe(0); // zero budget
    });
});
//# sourceMappingURL=spectral.test.js.map