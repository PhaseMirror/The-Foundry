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
import type { ModuleMetadata, ValidationResult } from '../src/interfaces.js';
/**
 * Diagonal entry of D_σ at prime p:  (D_σ)_pp = p^{−σ}
 */
export declare function diagonalEntry(p: number, sigma: number): number;
/**
 * Off-diagonal Gram-kernel entry:  K_pq = p^{−α} q^{−α} h(log p − log q)
 *
 * Throws if alpha ≤ 0.5 — the Hilbert-Schmidt condition requires strict α > 1/2.
 */
export declare function gramKernelEntry(p: number, q: number, alpha: number, h?: (t: number) => number): number;
/**
 * Build the full N×N prime-spectral basis matrix A = Dσ + K.
 *
 * Entry [i][j]:
 *   i === j → p_i^{−σ} + K_pp  (diagonal)
 *   i !== j → K_pq              (off-diagonal)
 */
export declare function buildPrimeSpectralBasis(primes: number[], sigma: number, alpha: number, h?: (t: number) => number): number[][];
/**
 * Hilbert-Schmidt norm of K:  ‖K‖_HS = √( Σ_{p,q} K_pq² )
 *
 * Finite iff α > 1/2 — this is the convergence condition.
 */
export declare function computeHSNorm(primes: number[], alpha: number, h?: (t: number) => number): number;
/**
 * Gershgorin estimate of ‖A‖_op: maximum absolute row sum.
 * This is an upper bound on the spectral radius.
 */
export declare function computeOpNormMatrix(A: number[][]): number;
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
export declare function verifyPositiveSemidefinite(A: number[][]): boolean;
/**
 * Full prime-spectral basis validation gate (adapter integration point).
 *
 * Reads sigma and alpha from meta; validates Hilbert-Schmidt, PSD, and
 * caches kPSD on the meta object.
 *
 * Returns a ValidationResult — throws on hard constraint violation (alpha ≤ 0.5).
 */
export declare function validatePrimeSpectralBasis(meta: ModuleMetadata, primes?: number[]): ValidationResult;
/**
 * Perturbation budget for a set of primes:
 *   weights     — |wₚ| weights for each prime
 *   normBounds  — bₚ = ‖δAₚ‖  (operator-norm bound on perturbation at p)
 *   lipschitzBounds — Lₚ (Lipschitz constant for the p-th component)
 */
export type PerturbationBudget = {
    weights: Map<number, number>;
    normBounds: Map<number, number>;
    lipschitzBounds: Map<number, number>;
};
/**
 * Zero budget (no perturbations) — convenience factory for tests and defaults.
 */
export declare function zeroBudget(primes: number[]): PerturbationBudget;
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
export declare function computeGapLB(primes: number[], sigma: number, alpha: number, budget: PerturbationBudget): number;
/**
 * Compute the slope upper bound (Theorem 8).
 *
 *   SlopeUB = Σₚ |wₚ| Lₚ
 */
export declare function computeSlopeUB(budget: PerturbationBudget): number;
/**
 * Certify spectral attributes against the full Theorem 9/10 contract.
 *
 * Writes gap_lb and slope_ub back onto meta (link-time resolution).
 * Returns a ValidationResult for gate integration.
 */
export declare function certifySpectralAttributes(meta: ModuleMetadata, primes: number[], budget: PerturbationBudget): ValidationResult;
//# sourceMappingURL=spectral.d.ts.map