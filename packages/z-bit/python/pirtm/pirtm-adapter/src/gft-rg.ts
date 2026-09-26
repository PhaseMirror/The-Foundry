/**
 * GFT Renormalization Epoch Layer — Meta-Relativity Phase 6
 * ADR-093 (PM-2606)
 *
 * Running vacuum parameters G(k), Λ(k) from the Wetterich FRG equation
 * and GFT beta functions for prime-gate epoch unlock conditions.
 *
 * Running ansatz:
 *   Λ(H) = Λ₀ + ν H²           (running cosmological constant)
 *   G(H)  = G₀ / (1 + ω H²)    (running Newton constant)
 *
 * Observation bounds (DESI Y1 + Planck + GWTC-4.0):
 *   |ν| ≤ 0.01 H₀²
 *   |ω| ≤ 0.01 H₀²
 *
 * Epoch unlock condition:
 *   |βλ₆(k_e)| < β_threshold  AND  |η| < η_max = 0.1
 */

import { isPrime } from './proof.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Normalized Hubble constant squared (Phase Mirror dimensionless units) */
const H0_SQUARED = 1.0;

/** Maximum running-parameter magnitude (observational bound) */
const RUNNING_PARAM_BOUND = 0.01 * H0_SQUARED;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RunningVacuumParams = {
  Lambda0: number;   // bare cosmological constant
  nu: number;        // running ν (cosmological)
  G0: number;        // bare Newton constant
  omega: number;     // running ω (gravitational)
};

export type GFTBetaResult = {
  betaLambda4: number;
  betaLambda6: number;
  eta: number;
  atFixedPoint: boolean;
};

export type EpochUnlockCondition = {
  prime: number;
  scale: number;
  betaConverged: boolean;
  gaussianRegime: boolean;
  unlockApproved: boolean;
  reason: string;
};

// ---------------------------------------------------------------------------
// Running vacuum
// ---------------------------------------------------------------------------

/**
 * Running cosmological constant at Hubble scale H:
 *   Λ(H) = Λ₀ + ν H²
 */
export function runningLambda(params: RunningVacuumParams, H: number): number {
  return params.Lambda0 + params.nu * H * H;
}

/**
 * Running Newton constant at Hubble scale H:
 *   G(H) = G₀ / (1 + ω H²)
 *
 * Throws if denominator ≤ 0 (unphysical parameter regime).
 */
export function runningG(params: RunningVacuumParams, H: number): number {
  const denom = 1 + params.omega * H * H;
  if (denom <= 0) {
    throw new Error(
      `runningG: denominator = ${denom} ≤ 0 — ω H² too large (omega=${params.omega}, H=${H})`,
    );
  }
  return params.G0 / denom;
}

/**
 * Map PIRTM epoch prime pₑ and exponent σ to RG scale:
 *   k_e = k₀ · pₑ^{−σ}
 */
export function epochToScale(prime: number, sigma: number, k0: number = 1.0): number {
  if (prime <= 1) throw new Error(`epochToScale: prime=${prime} must be > 1`);
  if (sigma <= 0) throw new Error(`epochToScale: sigma=${sigma} must be > 0`);
  return k0 * Math.pow(prime, -sigma);
}

// ---------------------------------------------------------------------------
// GFT beta functions
// ---------------------------------------------------------------------------

/**
 * Sextic melonic beta function (Wetterich / Litim truncation):
 *   βλ₆ ≈ −2η λ₆ + 24 λ₆² I₃(0)
 *
 * where the Litim threshold integral at zero momentum is:
 *   I₃(0) = 1 / (1 + m̄²)³
 */
export function betaLambda6(lambda6: number, eta: number, mbar2: number): number {
  const I3 = 1 / Math.pow(1 + mbar2, 3);
  return -2 * eta * lambda6 + 24 * lambda6 * lambda6 * I3;
}

/**
 * Quartic melonic beta function (Ward-constrained approximation):
 *   βλ₄ ≈ −η λ₄ (1 − λ₄ π²/(1 + m̄²))²
 */
export function betaLambda4(lambda4: number, eta: number, mbar2: number): number {
  const factor = 1 - (lambda4 * Math.PI * Math.PI) / (1 + mbar2);
  return -eta * lambda4 * factor * factor;
}

// ---------------------------------------------------------------------------
// Epoch unlock
// ---------------------------------------------------------------------------

/**
 * Evaluate the GFT epoch unlock condition for a prime gate.
 *
 * Approval requires:
 *   1. prime is actually prime
 *   2. |βλ₆(k_e)| < betaThreshold  (GFT flow converged)
 *   3. |η| < etaMax = 0.1           (Gaussian regime)
 */
export function checkEpochUnlockCondition(
  prime: number,
  sigma: number,
  lambda4: number,
  lambda6: number,
  eta: number,
  mbar2: number,
  options: {
    betaThreshold?: number;
    etaMax?: number;
    k0?: number;
  } = {},
): EpochUnlockCondition {
  const { betaThreshold = 0.01, etaMax = 0.1, k0 = 1.0 } = options;

  if (!isPrime(prime)) {
    return {
      prime,
      scale: 0,
      betaConverged: false,
      gaussianRegime: false,
      unlockApproved: false,
      reason: `${prime} is not prime — epoch unlock refused`,
    };
  }

  const scale = epochToScale(prime, sigma, k0);
  const bl6 = betaLambda6(lambda6, eta, mbar2);
  const betaConverged = Math.abs(bl6) < betaThreshold;
  const gaussianRegime = Math.abs(eta) < etaMax;
  const unlockApproved = betaConverged && gaussianRegime;

  let reason: string;
  if (unlockApproved) {
    reason =
      `Prime ${prime} approved: |βλ₆|=${Math.abs(bl6).toExponential(4)} < ${betaThreshold}, ` +
      `|η|=${Math.abs(eta).toFixed(4)} < ${etaMax} ✓`;
  } else if (!betaConverged) {
    reason =
      `Prime ${prime} blocked: |βλ₆|=${Math.abs(bl6).toExponential(4)} ≥ ${betaThreshold} (GFT flow not converged)`;
  } else {
    reason =
      `Prime ${prime} blocked: |η|=${Math.abs(eta).toFixed(4)} ≥ ${etaMax} (non-Gaussian phase)`;
  }

  return { prime, scale, betaConverged, gaussianRegime, unlockApproved, reason };
}

// ---------------------------------------------------------------------------
// Observational bounds validation
// ---------------------------------------------------------------------------

/**
 * Validate running vacuum parameters against current observational bounds:
 *   |ν| ≤ 0.01 H₀²  (DESI Y1 + Planck)
 *   |ω| ≤ 0.01 H₀²  (GWTC-4.0 GW propagation)
 */
export function validateRunningVacuumBounds(params: RunningVacuumParams): {
  valid: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  if (Math.abs(params.nu) > RUNNING_PARAM_BOUND) {
    violations.push(
      `|ν| = ${Math.abs(params.nu)} exceeds DESI observational bound (≤ ${RUNNING_PARAM_BOUND})`,
    );
  }
  if (Math.abs(params.omega) > RUNNING_PARAM_BOUND) {
    violations.push(
      `|ω| = ${Math.abs(params.omega)} exceeds GW propagation bound (≤ ${RUNNING_PARAM_BOUND})`,
    );
  }
  return { valid: violations.length === 0, violations };
}
