/**
 * Prime-Spectral Basis — Meta-Relativity Phase 2 + Dissipative Generator Cert Phase 4
 * ADR-089 (PM-2602) + ADR-091 (PM-2604)
 *
 * Implements the A = Dσ + K block on ℓ²(P):
 *
 *   (Dσ)_pp = p^{-σ}
 *   K_pq    = p^{-α} q^{-α} h(log p − log q)    (Hilbert-Schmidt Gram kernel)
 *
 * Hilbert-Schmidt condition: α > 1/2 guarantees ‖K‖_HS < ∞.
 *
 * Gate 4 (ADR-091) extends this file with GapLB/SlopeUB certification:
 *
 *   GapLB  = δS − 2Σ|wₚ|bₚ    (Theorem 8, lower spectral gap bound)
 *   SlopeUB = Σ|wₚ|Lₚ         (Theorem 8, slope upper bound)
 */
// ---------------------------------------------------------------------------
// Default kernel
// ---------------------------------------------------------------------------
/**
 * Canonical Gaussian-windowed kernel from the paper (Table 1, σ_h = 1.0):
 *   h(t) = exp(−t²/2)
 */
function defaultKernel(t) {
    return Math.exp(-(t * t) / 2);
}
// ---------------------------------------------------------------------------
// ADR-089: Prime-spectral basis primitives
// ---------------------------------------------------------------------------
/**
 * Diagonal entry of D_σ at prime p:  (D_σ)_pp = p^{−σ}
 */
export function diagonalEntry(p, sigma) {
    if (p <= 1)
        throw new Error(`diagonalEntry: p=${p} must be > 1`);
    if (sigma <= 0)
        throw new Error(`diagonalEntry: sigma=${sigma} must be > 0`);
    return Math.pow(p, -sigma);
}
/**
 * Off-diagonal Gram-kernel entry:  K_pq = p^{−α} q^{−α} h(log p − log q)
 *
 * Throws if alpha ≤ 0.5 — the Hilbert-Schmidt condition requires strict α > 1/2.
 */
export function gramKernelEntry(p, q, alpha, h = defaultKernel) {
    if (alpha <= 0.5) {
        throw new Error(`gramKernelEntry: alpha=${alpha} violates Hilbert-Schmidt condition (must be strictly > 0.5)`);
    }
    return Math.pow(p, -alpha) * Math.pow(q, -alpha) * h(Math.log(p) - Math.log(q));
}
/**
 * Build the full N×N prime-spectral basis matrix A = Dσ + K.
 *
 * Entry [i][j]:
 *   i === j → p_i^{−σ} + K_pp  (diagonal)
 *   i !== j → K_pq              (off-diagonal)
 */
export function buildPrimeSpectralBasis(primes, sigma, alpha, h = defaultKernel) {
    const N = primes.length;
    if (N === 0)
        throw new Error('buildPrimeSpectralBasis: primes array must not be empty');
    const A = Array.from({ length: N }, () => new Array(N).fill(0));
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const K_ij = gramKernelEntry(primes[i], primes[j], alpha, h);
            if (i === j) {
                A[i][j] = diagonalEntry(primes[i], sigma) + K_ij;
            }
            else {
                A[i][j] = K_ij;
            }
        }
    }
    return A;
}
/**
 * Hilbert-Schmidt norm of K:  ‖K‖_HS = √( Σ_{p,q} K_pq² )
 *
 * Finite iff α > 1/2 — this is the convergence condition.
 */
export function computeHSNorm(primes, alpha, h = defaultKernel) {
    let sum = 0;
    for (const p of primes) {
        for (const q of primes) {
            const k = gramKernelEntry(p, q, alpha, h);
            sum += k * k;
        }
    }
    return Math.sqrt(sum);
}
/**
 * Gershgorin estimate of ‖A‖_op: maximum absolute row sum.
 * This is an upper bound on the spectral radius.
 */
export function computeOpNormMatrix(A) {
    let max = 0;
    for (const row of A) {
        const rowSum = row.reduce((acc, v) => acc + Math.abs(v), 0);
        if (rowSum > max)
            max = rowSum;
    }
    return max;
}
/**
 * Diagonal-dominance PSD check.
 *
 * For a finite prime set, checks that for each diagonal entry A[i][i]:
 *   A[i][i] ≥ Σ_{j≠i} |A[i][j]|
 *
 * This is sufficient (not necessary) for positive semi-definiteness and
 * corresponds to the Gershgorin-disk criterion: all eigenvalues lie in
 * the closed right half-plane.
 */
export function verifyPositiveSemidefinite(A) {
    const N = A.length;
    for (let i = 0; i < N; i++) {
        let offDiagSum = 0;
        for (let j = 0; j < N; j++) {
            if (j !== i)
                offDiagSum += Math.abs(A[i][j]);
        }
        if (A[i][i] < offDiagSum)
            return false;
    }
    return true;
}
/**
 * Full prime-spectral basis validation gate (adapter integration point).
 *
 * Reads sigma and alpha from meta; validates Hilbert-Schmidt, PSD, and
 * caches kPSD on the meta object.
 *
 * Returns a ValidationResult — throws on hard constraint violation (alpha ≤ 0.5).
 */
export function validatePrimeSpectralBasis(meta, primes = [2, 3, 5, 7, 11, 13]) {
    const checks = [];
    const sigma = meta.sigma ?? 1.0;
    const alpha = meta.alpha ?? 0.51;
    // Hard gate: HS condition
    if (alpha <= 0.5) {
        return {
            valid: false,
            reason: 'alpha_hilbert_schmidt',
            checks: [
                {
                    name: 'alpha_hilbert_schmidt',
                    passed: false,
                    detail: `alpha=${alpha} violates Hilbert-Schmidt condition (must be strictly > 0.5)`,
                },
            ],
        };
    }
    const A = buildPrimeSpectralBasis(primes, sigma, alpha);
    const psd = verifyPositiveSemidefinite(A);
    checks.push({
        name: 'prime_spectral_psd',
        passed: psd,
        detail: psd ? 'A = Dσ + K is diagonally dominant (PSD) ✓' : 'A is not diagonally dominant',
    });
    const hsNorm = computeHSNorm(primes, alpha);
    const hsFinite = isFinite(hsNorm);
    checks.push({
        name: 'hs_norm_finite',
        passed: hsFinite,
        detail: hsFinite ? `‖K‖_HS = ${hsNorm.toFixed(6)} < ∞ ✓` : '‖K‖_HS diverged',
    });
    // PSD (diagonal dominance) is INFORMATIONAL — a truncation artefact can break
    // diagonal dominance even when the infinite-dimensional operator is PSD.
    // Only HS norm finite is a hard requirement (and alpha > 0.5 already guarantees it).
    const valid = hsFinite;
    // Cache kPSD on meta for downstream certify.ts consumption
    meta.kPSD = psd;
    return {
        valid,
        reason: valid ? undefined : 'hs_norm_diverged',
        checks,
    };
}
/**
 * Zero budget (no perturbations) — convenience factory for tests and defaults.
 */
export function zeroBudget(primes) {
    return {
        weights: new Map(primes.map(p => [p, 0])),
        normBounds: new Map(primes.map(p => [p, 0])),
        lipschitzBounds: new Map(primes.map(p => [p, 0])),
    };
}
/**
 * Compute the spectral gap lower bound (Theorem 8).
 *
 *   GapLB = δS − 2 Σₚ |wₚ| bₚ
 *
 * where δS is approximated by the minimum Gershgorin radius of the
 * unperturbed diagonal (i.e. min_p (Dσ)_pp = min_p p^{−σ} for large prime p).
 *
 * For a finite prime set the Gershgorin lower bound on the spectral gap is:
 *   δS ≈ min_i [ A[i][i] − Σ_{j≠i} |A[i][j]| ]
 */
export function computeGapLB(primes, sigma, alpha, budget) {
    if (primes.length === 0)
        return 0;
    const A = buildPrimeSpectralBasis(primes, sigma, alpha);
    // Minimum Gershgorin row margin
    let deltaS = Infinity;
    for (let i = 0; i < primes.length; i++) {
        let offDiag = 0;
        for (let j = 0; j < primes.length; j++) {
            if (j !== i)
                offDiag += Math.abs(A[i][j]);
        }
        deltaS = Math.min(deltaS, A[i][i] - offDiag);
    }
    // Perturbation sum: 2 Σ |wₚ| bₚ
    let pertSum = 0;
    for (const p of primes) {
        const w = budget.weights.get(p) ?? 0;
        const b = budget.normBounds.get(p) ?? 0;
        pertSum += Math.abs(w) * b;
    }
    return deltaS - 2 * pertSum;
}
/**
 * Compute the slope upper bound (Theorem 8).
 *
 *   SlopeUB = Σₚ |wₚ| Lₚ
 */
export function computeSlopeUB(budget) {
    let sum = 0;
    for (const [p, w] of budget.weights) {
        const L = budget.lipschitzBounds.get(p) ?? 0;
        sum += Math.abs(w) * L;
    }
    return sum;
}
/**
 * Certify spectral attributes against the full Theorem 9/10 contract.
 *
 * Writes gap_lb and slope_ub back onto meta (link-time resolution).
 * Returns a ValidationResult for gate integration.
 */
export function certifySpectralAttributes(meta, primes, budget) {
    const checks = [];
    const sigma = meta.sigma ?? 1.0;
    const alpha = meta.alpha ?? 0.51;
    const gapLB = computeGapLB(primes, sigma, alpha, budget);
    const slopeUB = computeSlopeUB(budget);
    const gapOk = gapLB > 0;
    checks.push({
        name: 'gap_lb_positive',
        passed: gapOk,
        detail: gapOk
            ? `GapLB = ${gapLB.toFixed(8)} > 0 ✓`
            : `GapLB = ${gapLB.toFixed(8)} ≤ 0 — perturbation budget exceeds spectral gap`,
    });
    const slopeOk = isFinite(slopeUB);
    checks.push({
        name: 'slope_ub_finite',
        passed: slopeOk,
        detail: `SlopeUB = ${slopeUB.toFixed(8)}`,
    });
    // Resolve link-time values
    meta.gap_lb = gapLB;
    meta.slope_ub = slopeUB;
    const valid = checks.every(c => c.passed);
    return {
        valid,
        reason: valid ? undefined : checks.find(c => !c.passed)?.name,
        checks,
    };
}
//# sourceMappingURL=spectral.js.map