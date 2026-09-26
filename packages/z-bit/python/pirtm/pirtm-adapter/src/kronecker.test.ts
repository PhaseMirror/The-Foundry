/**
 * Tests for ADR-088: Kronecker-Sum Type Extensions
 */

import { describe, expect, test } from '@jest/globals';
import { validateKroneckerAttr, KRONECKER_DEFAULTS } from './kronecker';
import type { ModuleMetadata } from './interfaces';

// ---------------------------------------------------------------------------
// KRONECKER_DEFAULTS
// ---------------------------------------------------------------------------

describe('KRONECKER_DEFAULTS', () => {
  test('sigma is 1.0', () => {
    expect(KRONECKER_DEFAULTS.sigma).toBe(1.0);
  });

  test('alpha is 0.51 (strictly > 0.5)', () => {
    expect(KRONECKER_DEFAULTS.alpha).toBeGreaterThan(0.5);
  });

  test('xi_block_dim is 1', () => {
    expect(KRONECKER_DEFAULTS.xi_block_dim).toBe(1);
  });

  test('gap_lb is 0 (transpile-time unresolved)', () => {
    expect(KRONECKER_DEFAULTS.gap_lb).toBe(0);
  });

  test('slope_ub is 0 (transpile-time unresolved)', () => {
    expect(KRONECKER_DEFAULTS.slope_ub).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// validateKroneckerAttr — sigma
// ---------------------------------------------------------------------------

describe('validateKroneckerAttr — sigma', () => {
  test('accepts sigma > 0', () => {
    const meta: ModuleMetadata = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8, sigma: 1.0 };
    const result = validateKroneckerAttr(meta);
    expect(result.valid).toBe(true);
  });

  test('rejects sigma = 0', () => {
    const meta: ModuleMetadata = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8, sigma: 0 };
    const result = validateKroneckerAttr(meta);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('sigma_positive');
  });

  test('rejects negative sigma', () => {
    const meta: ModuleMetadata = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8, sigma: -0.5 };
    const result = validateKroneckerAttr(meta);
    expect(result.valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateKroneckerAttr — alpha (critical: HS condition)
// ---------------------------------------------------------------------------

describe('validateKroneckerAttr — alpha (HS condition)', () => {
  test('accepts alpha = 0.51 (boundary + epsilon)', () => {
    const meta: ModuleMetadata = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8, alpha: 0.51 };
    const result = validateKroneckerAttr(meta);
    expect(result.valid).toBe(true);
  });

  test('rejects alpha = 0.5 exactly (boundary must be strict)', () => {
    const meta: ModuleMetadata = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8, alpha: 0.5 };
    const result = validateKroneckerAttr(meta);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('alpha_hilbert_schmidt');
  });

  test('rejects alpha = 0.49 (below HS condition)', () => {
    const meta: ModuleMetadata = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8, alpha: 0.49 };
    const result = validateKroneckerAttr(meta);
    expect(result.valid).toBe(false);
  });

  test('accepts alpha = 2.0 (well inside HS region)', () => {
    const meta: ModuleMetadata = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8, alpha: 2.0 };
    const result = validateKroneckerAttr(meta);
    expect(result.valid).toBe(true);
  });

  test('failure detail mentions Hilbert-Schmidt condition', () => {
    const meta: ModuleMetadata = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8, alpha: 0.5 };
    const result = validateKroneckerAttr(meta);
    const check = result.checks.find(c => c.name === 'alpha_hilbert_schmidt')!;
    expect(check.detail).toContain('Hilbert-Schmidt');
  });
});

// ---------------------------------------------------------------------------
// validateKroneckerAttr — xi_block_dim
// ---------------------------------------------------------------------------

describe('validateKroneckerAttr — xi_block_dim', () => {
  test('accepts xi_block_dim = 1', () => {
    const meta: ModuleMetadata = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8, xi_block_dim: 1 };
    expect(validateKroneckerAttr(meta).valid).toBe(true);
  });

  test('accepts xi_block_dim = 10', () => {
    const meta: ModuleMetadata = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8, xi_block_dim: 10 };
    expect(validateKroneckerAttr(meta).valid).toBe(true);
  });

  test('rejects xi_block_dim = 0', () => {
    const meta: ModuleMetadata = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8, xi_block_dim: 0 };
    expect(validateKroneckerAttr(meta).valid).toBe(false);
  });

  test('rejects non-integer xi_block_dim', () => {
    const meta: ModuleMetadata = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8, xi_block_dim: 1.5 };
    expect(validateKroneckerAttr(meta).valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateKroneckerAttr — gap_lb, slope_ub
// ---------------------------------------------------------------------------

describe('validateKroneckerAttr — gap_lb and slope_ub', () => {
  test('accepts gap_lb = 0 (transpile-time unresolved)', () => {
    const meta: ModuleMetadata = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8, gap_lb: 0 };
    expect(validateKroneckerAttr(meta).valid).toBe(true);
  });

  test('accepts gap_lb = 0.42 (link-time resolved)', () => {
    const meta: ModuleMetadata = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8, gap_lb: 0.42 };
    expect(validateKroneckerAttr(meta).valid).toBe(true);
  });

  test('rejects negative gap_lb', () => {
    const meta: ModuleMetadata = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8, gap_lb: -0.1 };
    expect(validateKroneckerAttr(meta).valid).toBe(false);
  });

  test('accepts slope_ub = 0', () => {
    const meta: ModuleMetadata = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8, slope_ub: 0 };
    expect(validateKroneckerAttr(meta).valid).toBe(true);
  });

  test('rejects negative slope_ub', () => {
    const meta: ModuleMetadata = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8, slope_ub: -1 };
    expect(validateKroneckerAttr(meta).valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateKroneckerAttr — undefined attributes pass through
// ---------------------------------------------------------------------------

describe('validateKroneckerAttr — undefined attributes', () => {
  test('passes when none of the Kronecker attrs are set', () => {
    const meta: ModuleMetadata = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8 };
    expect(validateKroneckerAttr(meta).valid).toBe(true);
  });

  test('only validates attributes that are present', () => {
    const meta: ModuleMetadata = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8, sigma: 0.3 };
    const result = validateKroneckerAttr(meta);
    expect(result.checks).toHaveLength(1);
    expect(result.checks[0].name).toBe('sigma_positive');
  });
});
