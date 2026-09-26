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
// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------
/**
 * Evaluate the Fourier multiplier symbol at frequency ω:
 *   m(ω) = a₀ + Σₚ aₚ cos(ω log p)
 */
export function evaluateSymbol(coeffs, omega) {
    let result = coeffs.a0;
    for (const [p, ap] of coeffs.ap) {
        result += ap * Math.cos(omega * Math.log(p));
    }
    return result;
}
/**
 * Compute the essential spectral band [mMin, mMax] and Bochner status.
 *
 *   mMin = a₀ − Σ|aₚ|
 *   mMax = a₀ + Σ|aₚ|
 *
 * The band contains ess ran(m(ω)) for all ω ∈ ℝ.
 */
export function computeEssentialBand(coeffs) {
    let l1 = 0;
    for (const [, ap] of coeffs.ap) {
        l1 += Math.abs(ap);
    }
    const mMin = coeffs.a0 - l1;
    const mMax = coeffs.a0 + l1;
    return {
        mMin,
        mMax,
        isPositive: mMin >= 0,
        l1BudgetUsed: l1,
    };
}
/**
 * Bochner positivity check: m(ω) ≥ 0 for all ω ∈ ℝ iff a₀ ≥ Σ|aₚ|.
 *
 * This is the condition required for Theorem 9 (contraction generator).
 */
export function verifyBochnerPositivity(coeffs) {
    return computeEssentialBand(coeffs).isPositive;
}
/**
 * Sample m(ω) over a finite grid and return numerical min/max.
 *
 * @param coeffs - time-sieve coefficients
 * @param gridSize - number of sample points (default 1000)
 * @param range    - [ωMin, ωMax] (default [0, 4π])
 */
export function sampleSymbolBands(coeffs, gridSize = 1000, range = [0, 4 * Math.PI]) {
    let min = Infinity;
    let max = -Infinity;
    const [wMin, wMax] = range;
    for (let i = 0; i < gridSize; i++) {
        const omega = wMin + (i / (gridSize - 1)) * (wMax - wMin);
        const val = evaluateSymbol(coeffs, omega);
        if (val < min)
            min = val;
        if (val > max)
            max = val;
    }
    return { sampledMin: min, sampledMax: max };
}
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
export function canonicalPaperSieve(primes) {
    return {
        a0: 0.3,
        ap: new Map(primes.map(p => [p, 0.4 / (p * p)])),
    };
}
/**
 * Validate a TimeSieveCoefficients object for use in a PIRTM module.
 *
 * Checks:
 *   1. a0 > 0 (constant term must be positive for positivity margin)
 *   2. Bochner condition: m(ω) ≥ 0  (a0 ≥ Σ|ap|)
 *   3. L1 budget finite
 */
export function validateTimeSieve(coeffs) {
    const checks = [];
    const a0ok = coeffs.a0 > 0;
    checks.push({
        name: 'a0_positive',
        passed: a0ok,
        detail: a0ok ? `a₀ = ${coeffs.a0} > 0 ✓` : `a₀ = ${coeffs.a0} must be > 0`,
    });
    const bands = computeEssentialBand(coeffs);
    checks.push({
        name: 'bochner_positive',
        passed: bands.isPositive,
        detail: bands.isPositive
            ? `m(ω) ≥ 0: mMin = ${bands.mMin.toFixed(6)} ≥ 0 ✓ (Bochner condition)`
            : `m(ω) < 0: mMin = ${bands.mMin.toFixed(6)} — Bochner condition violated (a₀ < Σ|aₚ|)`,
    });
    const l1ok = isFinite(bands.l1BudgetUsed);
    checks.push({
        name: 'l1_budget_finite',
        passed: l1ok,
        detail: `Σ|aₚ| = ${bands.l1BudgetUsed.toFixed(8)}`,
    });
    const valid = checks.every(c => c.passed);
    return {
        valid,
        reason: valid ? undefined : checks.find(c => !c.passed)?.name,
        checks,
    };
}
//# sourceMappingURL=timesieve.js.map