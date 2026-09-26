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
import type { ModuleMetadata, ValidationResult } from '../src/interfaces.js';
/**
 * Conservative canonical defaults satisfying all L0 positivity conditions.
 * These mirror the paper's worked example (Starobinsky inflation sector).
 */
export declare const KRONECKER_DEFAULTS: {
    /** σ = 1.0: Dirichlet-series standard decay */
    readonly sigma: 1;
    /**
     * α = 0.51: marginally satisfies the strict α > 0.5 Hilbert-Schmidt
     * condition; use a larger value in production for a safer HS gap.
     */
    readonly alpha: 0.51;
    /** d = 1: minimal internal block (scalar Ξ) */
    readonly xi_block_dim: 1;
    /**
     * Transpile-time unresolved values (mirrors gain_matrix at transpile time).
     * Link-time certification pass fills these with positive values.
     */
    readonly gap_lb: 0;
    readonly slope_ub: 0;
};
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
export declare function validateKroneckerAttr(meta: ModuleMetadata): ValidationResult;
//# sourceMappingURL=kronecker.d.ts.map