/**
 * Time-Sieve Module — Meta-Relativity Phase 3
 * ADR-090 (PM-2603)
 *
 * Implements B = F⁻¹ Mₘ F on L²(ℝ): a Fourier multiplier with prime-locked symbol
 *
 *   m(ω) = a₀ + Σₚ aₚ cos(ω log p)
 *
 * Positivity (Bochner condition): m(ω) ≥ 0 ⟺ a₀ ≥ Σ|aₚ|
 *
 * The essential spectral band is ess ran(m) = [mMin, mMax] where
 *   mMin = a₀ − Σ|aₚ|
 *   mMax = a₀ + Σ|aₚ|
 */
import type { ValidationResult } from '../src/interfaces.js';
/**
 * Prime-locked Fourier multiplier coefficients.
 *   a0  — constant term
 *   ap  — prime → coefficient map (aₚ in the paper)
 */
export type TimeSieveCoefficients = {
    a0: number;
    ap: Map<number, number>;
};
/**
 * Essential spectral band of m(ω) and its positivity status.
 */
export type TimeSieveBands = {
    mMin: number;
    mMax: number;
    /** True iff Bochner condition holds: a₀ ≥ Σ|aₚ| */
    isPositive: boolean;
    /** Σ|aₚ| — the L1 budget consumed */
    l1BudgetUsed: number;
};
/**
 * Evaluate the Fourier multiplier symbol at frequency ω:
 *   m(ω) = a₀ + Σₚ aₚ cos(ω log p)
 */
export declare function evaluateSymbol(coeffs: TimeSieveCoefficients, omega: number): number;
/**
 * Compute the essential spectral band [mMin, mMax] and Bochner status.
 *
 *   mMin = a₀ − Σ|aₚ|
 *   mMax = a₀ + Σ|aₚ|
 *
 * The band contains ess ran(m(ω)) for all ω ∈ ℝ.
 */
export declare function computeEssentialBand(coeffs: TimeSieveCoefficients): TimeSieveBands;
/**
 * Bochner positivity check: m(ω) ≥ 0 for all ω ∈ ℝ iff a₀ ≥ Σ|aₚ|.
 *
 * This is the condition required for Theorem 9 (contraction generator).
 */
export declare function verifyBochnerPositivity(coeffs: TimeSieveCoefficients): boolean;
/**
 * Sample m(ω) over a finite grid and return numerical min/max.
 *
 * @param coeffs - time-sieve coefficients
 * @param gridSize - number of sample points (default 1000)
 * @param range    - [ωMin, ωMax] (default [0, 4π])
 */
export declare function sampleSymbolBands(coeffs: TimeSieveCoefficients, gridSize?: number, range?: [number, number]): {
    sampledMin: number;
    sampledMax: number;
};
/**
 * Canonical paper sieve (Table 2, Starobinsky-inflation sector):
 *   a₀ = 0.3
 *   aₚ = 0.4 / p²
 *
 * Analytical band:
 *   mMin ≈ a₀ − Σ|aₚ|  (computed from the given prime set)
 *   For primes {2,3,5}: Σaₚ ≈ 0.4(1/4 + 1/9 + 1/25) ≈ 0.4×0.3511 ≈ 0.1405
 *   → mMin ≈ 0.1595,  mMax ≈ 0.4405  (more primes → tighter band)
 *
 * With only {2,3,5} the paper quotes [0.12, 0.48] (rounding on ∞ sum).
 * The canonical sieve uses the supplied prime set.
 */
export declare function canonicalPaperSieve(primes: number[]): TimeSieveCoefficients;
/**
 * Validate a TimeSieveCoefficients object for use in a PIRTM module.
 *
 * Checks:
 *   1. a0 > 0 (constant term must be positive for positivity margin)
 *   2. Bochner condition: m(ω) ≥ 0  (a0 ≥ Σ|ap|)
 *   3. L1 budget finite
 */
export declare function validateTimeSieve(coeffs: TimeSieveCoefficients): ValidationResult;
//# sourceMappingURL=timesieve.d.ts.map