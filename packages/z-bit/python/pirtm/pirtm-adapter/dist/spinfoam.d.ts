/**
 * Spin-Foam Noise Kernel Integration — Meta-Relativity Phase 5
 * ADR-092 (PM-2605)
 *
 * EPRL/GFT stochastic-foam noise kernel → Phase Mirror CSL drift budget.
 *
 * Cumulant scaling (Section 4 of Spin_Foam_Microfoundations):
 *   C₂ ~ O(1)            (Gaussian, normalization)
 *   C₃ ~ (ℓP/M)²  ≈ 10⁻¹⁰
 *   C₄ ~ (ℓP/M)⁴  ≈ 10⁻²⁰
 *
 * where ℓP/M ≈ 10⁻⁵ (Starobinsky inflation, M ≈ 1.3 × 10⁻⁵ Mₚ).
 *
 * Drift bound (Einstein-Langevin, comoving volume):
 *   σ_foam(t) ≤ √(C₂ · t)
 *
 * Non-Gaussianity tolerance:
 *   f_NL = C₃ / P_ζ²  must satisfy  |f_NL| < 0.5  (Phase Mirror constitutional limit)
 */
/** ℓP/M ratio from Starobinsky inflation fit (M ≈ 1.3 × 10⁻⁵ Mₚ) */
export declare const PLANCK_SUPPRESSION = 0.00001;
/** Phase Mirror constitutional f_NL tolerance (Ξ-Constitution Article I) */
export declare const FNL_TOLERANCE = 0.5;
/** Primordial scalar power spectrum amplitude (Planck 2018 best-fit) */
export declare const P_ZETA_CANONICAL = 2.1e-9;
/**
 * EPRL/GFT spin-foam cumulants.
 *   C2 — Gaussian (O(1))
 *   C3 — first non-Gaussian cumulant (~10⁻¹⁰)
 *   C4 — second non-Gaussian cumulant (~10⁻²⁰)
 */
export type SpinFoamCumulants = {
    C2: number;
    C3: number;
    C4: number;
};
export type NoiseKernelBoundResult = {
    driftBound: number;
    totalBudget: number;
    withinBudget: boolean;
    reason: string;
};
export type FNLCheckResult = {
    fNL: number;
    tolerance: number;
    pass: boolean;
    reason: string;
};
/**
 * Canonical spin-foam cumulants from Starobinsky inflation sector:
 *   C₂ = leadingFactor (default 1)
 *   C₃ = leadingFactor × (ℓP/M)²
 *   C₄ = leadingFactor × (ℓP/M)⁴
 */
export declare function canonicalCumulants(leadingFactor?: number): SpinFoamCumulants;
/**
 * Foam diffusive drift bound (1σ envelope):
 *   σ_foam(t) = √(C₂ · t)
 *
 * This upper-bounds the standard deviation of field fluctuations sourced
 * by the EPRL spin-foam noise kernel over proper time t.
 */
export declare function foamDiffusiveDriftBound(C2: number, t: number): number;
/**
 * Compute the primordial non-Gaussianity parameter f_NL:
 *   f_NL = C₃ / P_ζ²
 *
 * where P_ζ is the dimensionless scalar power spectrum amplitude.
 */
export declare function computeFNL(C3: number, Pzeta?: number): number;
/**
 * Compute the combined drift budget with foam contribution.
 *
 *   totalBudget = cognitiveDriftBound − safetyFactor × σ_foam(t)
 *
 * Positive value means there is remaining budget after accounting for foam drift.
 */
export declare function computeTotalDriftBudget(cognitiveDriftBound: number, C2: number, t: number, safetyFactor?: number): number;
/**
 * Check non-Gaussianity tolerance:
 *   |f_NL| < tolerance  (default tolerance = 0.5, Phase Mirror constitutional limit)
 */
export declare function checkNonGaussianityTolerance(fNL: number, tolerance?: number): FNLCheckResult;
/**
 * Compute the noise kernel bound and determine whether the drift budget is met.
 *
 * Combines:
 *   1. foam diffusive drift bound:  σ_foam = √(C₂ · t)
 *   2. non-Gaussianity check:       |f_NL| < tolerance
 *   3. total drift budget:          cognitiveDriftBound − safetyFactor×σ_foam ≥ 0
 */
export declare function computeNoiseKernelBound(cumulants: SpinFoamCumulants, t: number, cognitiveDriftBound: number, safetyFactor?: number): NoiseKernelBoundResult;
/**
 * Audit foam drift — integration point for drift-audit.ts (ADR-092 §3).
 *
 * Returns a structured record suitable for appending to the drift audit log.
 */
export declare function auditFoamDrift(t: number, cognitiveDelta: number, cumulants?: SpinFoamCumulants, safetyFactor?: number): {
    t: number;
    cognitiveDelta: number;
    foamDrift: number;
    budgetRemaining: number;
    compliant: boolean;
    fNLCheck: FNLCheckResult;
    timestamp: string;
};
//# sourceMappingURL=spinfoam.d.ts.map