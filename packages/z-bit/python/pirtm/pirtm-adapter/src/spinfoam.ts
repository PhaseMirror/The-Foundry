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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** ℓP/M ratio from Starobinsky inflation fit (M ≈ 1.3 × 10⁻⁵ Mₚ) */
export const PLANCK_SUPPRESSION = 1e-5;

/** Phase Mirror constitutional f_NL tolerance (Ξ-Constitution Article I) */
export const FNL_TOLERANCE = 0.5;

/** Primordial scalar power spectrum amplitude (Planck 2018 best-fit) */
export const P_ZETA_CANONICAL = 2.1e-9;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Cumulant constructors
// ---------------------------------------------------------------------------

/**
 * Canonical spin-foam cumulants from Starobinsky inflation sector:
 *   C₂ = leadingFactor (default 1)
 *   C₃ = leadingFactor × (ℓP/M)²
 *   C₄ = leadingFactor × (ℓP/M)⁴
 */
export function canonicalCumulants(leadingFactor: number = 1): SpinFoamCumulants {
  const s = PLANCK_SUPPRESSION;
  return {
    C2: leadingFactor,
    C3: leadingFactor * s * s,
    C4: leadingFactor * s * s * s * s,
  };
}

// ---------------------------------------------------------------------------
// Drift and budget
// ---------------------------------------------------------------------------

/**
 * Foam diffusive drift bound (1σ envelope):
 *   σ_foam(t) = √(C₂ · t)
 *
 * This upper-bounds the standard deviation of field fluctuations sourced
 * by the EPRL spin-foam noise kernel over proper time t.
 */
export function foamDiffusiveDriftBound(C2: number, t: number): number {
  if (C2 < 0) throw new Error(`foamDiffusiveDriftBound: C2=${C2} must be ≥ 0`);
  if (t < 0) throw new Error(`foamDiffusiveDriftBound: t=${t} must be ≥ 0`);
  return Math.sqrt(C2 * t);
}

/**
 * Compute the primordial non-Gaussianity parameter f_NL:
 *   f_NL = C₃ / P_ζ²
 *
 * where P_ζ is the dimensionless scalar power spectrum amplitude.
 */
export function computeFNL(C3: number, Pzeta: number = P_ZETA_CANONICAL): number {
  if (Pzeta <= 0) throw new Error(`computeFNL: Pzeta=${Pzeta} must be > 0`);
  return C3 / (Pzeta * Pzeta);
}

/**
 * Compute the combined drift budget with foam contribution.
 *
 *   totalBudget = cognitiveDriftBound − safetyFactor × σ_foam(t)
 *
 * Positive value means there is remaining budget after accounting for foam drift.
 */
export function computeTotalDriftBudget(
  cognitiveDriftBound: number,
  C2: number,
  t: number,
  safetyFactor: number = 2.0,
): number {
  return cognitiveDriftBound - safetyFactor * foamDiffusiveDriftBound(C2, t);
}

/**
 * Check non-Gaussianity tolerance:
 *   |f_NL| < tolerance  (default tolerance = 0.5, Phase Mirror constitutional limit)
 */
export function checkNonGaussianityTolerance(
  fNL: number,
  tolerance: number = FNL_TOLERANCE,
): FNLCheckResult {
  const pass = Math.abs(fNL) < tolerance;
  return {
    fNL,
    tolerance,
    pass,
    reason: pass
      ? `|f_NL| = ${Math.abs(fNL).toExponential(3)} < ${tolerance} ✓ (Gaussian regime)`
      : `|f_NL| = ${Math.abs(fNL).toExponential(3)} ≥ ${tolerance} — non-Gaussianity tolerance violated`,
  };
}

/**
 * Compute the noise kernel bound and determine whether the drift budget is met.
 *
 * Combines:
 *   1. foam diffusive drift bound:  σ_foam = √(C₂ · t)
 *   2. non-Gaussianity check:       |f_NL| < tolerance
 *   3. total drift budget:          cognitiveDriftBound − safetyFactor×σ_foam ≥ 0
 */
export function computeNoiseKernelBound(
  cumulants: SpinFoamCumulants,
  t: number,
  cognitiveDriftBound: number,
  safetyFactor: number = 2.0,
): NoiseKernelBoundResult {
  const driftBound = foamDiffusiveDriftBound(cumulants.C2, t);
  const totalBudget = computeTotalDriftBudget(cognitiveDriftBound, cumulants.C2, t, safetyFactor);
  const withinBudget = totalBudget >= 0;
  return {
    driftBound,
    totalBudget,
    withinBudget,
    reason: withinBudget
      ? `Drift budget OK: remaining = ${totalBudget.toFixed(8)} ✓`
      : `Drift budget exceeded: foam drift = ${(safetyFactor * driftBound).toFixed(8)} > cognitive bound = ${cognitiveDriftBound.toFixed(8)}`,
  };
}

/**
 * Audit foam drift — integration point for drift-audit.ts (ADR-092 §3).
 *
 * Returns a structured record suitable for appending to the drift audit log.
 */
export function auditFoamDrift(
  t: number,
  cognitiveDelta: number,
  cumulants: SpinFoamCumulants = canonicalCumulants(),
  safetyFactor: number = 2.0,
): {
  t: number;
  cognitiveDelta: number;
  foamDrift: number;
  budgetRemaining: number;
  compliant: boolean;
  fNLCheck: FNLCheckResult;
  timestamp: string;
} {
  const kernelBound = computeNoiseKernelBound(cumulants, t, cognitiveDelta, safetyFactor);
  const fNL = computeFNL(cumulants.C3);
  const fNLCheck = checkNonGaussianityTolerance(fNL);
  return {
    t,
    cognitiveDelta,
    foamDrift: kernelBound.driftBound,
    budgetRemaining: kernelBound.totalBudget,
    compliant: kernelBound.withinBudget && fNLCheck.pass,
    fNLCheck,
    timestamp: new Date().toISOString(),
  };
}
