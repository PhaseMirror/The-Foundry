/**
 * Kronecker-Sum Type Extensions — Meta-Relativity Phase 1
 * ADR-088 (PM-2601)
 *
 * Validates the five new attributes that extend pirtm.module for the
 * Meta-Relativity operator U = A⊗I + I⊗B + I⊗E:
 *
 *   sigma          — prime-diagonal exponent σ (A = Dσ + K)
 *   alpha          — Gram-kernel HS exponent α (strict α > 0.5)
 *   xi_block_dim   — dimension d of internal Ξ block
 *   gap_lb         — spectral gap lower bound (unresolved at transpile time)
 *   slope_ub       — slope upper bound (unresolved at transpile time)
 */

import type { ModuleMetadata, ValidationCheck, ValidationResult } from './interfaces.js';

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

/**
 * Conservative canonical defaults satisfying all L0 positivity conditions.
 * These mirror the paper's worked example (Starobinsky inflation sector).
 */
export const KRONECKER_DEFAULTS = {
  /** σ = 1.0: Dirichlet-series standard decay */
  sigma: 1.0,
  /**
   * α = 0.51: marginally satisfies the strict α > 0.5 Hilbert-Schmidt
   * condition; use a larger value in production for a safer HS gap.
   */
  alpha: 0.51,
  /** d = 1: minimal internal block (scalar Ξ) */
  xi_block_dim: 1,
  /**
   * Transpile-time unresolved values (mirrors gain_matrix at transpile time).
   * Link-time certification pass fills these with positive values.
   */
  gap_lb: 0,
  slope_ub: 0,
} as const;

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validate the Kronecker-Sum attributes of a PIRTM module.
 *
 * Rules:
 *   sigma       > 0           (positive decay exponent)
 *   alpha       > 0.5         (STRICT: open Hilbert-Schmidt condition)
 *   xi_block_dim ≥ 1, integer (at least scalar block)
 *   gap_lb      ≥ 0           (0 is valid at transpile time; link fills it)
 *   slope_ub    ≥ 0           (0 is valid at transpile time; link fills it)
 *
 * Attributes that are undefined are treated as not-yet-set and are skipped
 * (only present attributes are validated).
 */
export function validateKroneckerAttr(meta: ModuleMetadata): ValidationResult {
  const checks: ValidationCheck[] = [];

  if (meta.sigma !== undefined) {
    const ok = meta.sigma > 0;
    checks.push({
      name: 'sigma_positive',
      passed: ok,
      detail: ok
        ? `sigma=${meta.sigma} > 0 ✓`
        : `sigma=${meta.sigma} must be > 0`,
    });
  }

  if (meta.alpha !== undefined) {
    // Strict inequality: α > 0.5 — the Hilbert-Schmidt condition requires α > 1/2
    const ok = meta.alpha > 0.5;
    checks.push({
      name: 'alpha_hilbert_schmidt',
      passed: ok,
      detail: ok
        ? `alpha=${meta.alpha} > 0.5 ✓ (Hilbert-Schmidt condition satisfied)`
        : `alpha=${meta.alpha} violates Hilbert-Schmidt condition: must be strictly > 0.5`,
    });
  }

  if (meta.xi_block_dim !== undefined) {
    const ok = Number.isInteger(meta.xi_block_dim) && meta.xi_block_dim >= 1;
    checks.push({
      name: 'xi_block_dim_valid',
      passed: ok,
      detail: ok
        ? `xi_block_dim=${meta.xi_block_dim} ✓`
        : `xi_block_dim=${meta.xi_block_dim} must be a positive integer`,
    });
  }

  if (meta.gap_lb !== undefined) {
    const ok = meta.gap_lb >= 0;
    checks.push({
      name: 'gap_lb_non_negative',
      passed: ok,
      detail: ok
        ? `gap_lb=${meta.gap_lb} ≥ 0 ✓`
        : `gap_lb=${meta.gap_lb} must be ≥ 0`,
    });
  }

  if (meta.slope_ub !== undefined) {
    const ok = meta.slope_ub >= 0;
    checks.push({
      name: 'slope_ub_non_negative',
      passed: ok,
      detail: ok
        ? `slope_ub=${meta.slope_ub} ≥ 0 ✓`
        : `slope_ub=${meta.slope_ub} must be ≥ 0`,
    });
  }

  const valid = checks.length === 0 || checks.every(c => c.passed);
  return {
    valid,
    reason: valid ? undefined : checks.find(c => !c.passed)?.name,
    checks,
  };
}
