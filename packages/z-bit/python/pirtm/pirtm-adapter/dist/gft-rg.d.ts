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
export type RunningVacuumParams = {
    Lambda0: number;
    nu: number;
    G0: number;
    omega: number;
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
/**
 * Running cosmological constant at Hubble scale H:
 *   Λ(H) = Λ₀ + ν H²
 */
export declare function runningLambda(params: RunningVacuumParams, H: number): number;
/**
 * Running Newton constant at Hubble scale H:
 *   G(H) = G₀ / (1 + ω H²)
 *
 * Throws if denominator ≤ 0 (unphysical parameter regime).
 */
export declare function runningG(params: RunningVacuumParams, H: number): number;
/**
 * Map PIRTM epoch prime pₑ and exponent σ to RG scale:
 *   k_e = k₀ · pₑ^{−σ}
 */
export declare function epochToScale(prime: number, sigma: number, k0?: number): number;
/**
 * Sextic melonic beta function (Wetterich / Litim truncation):
 *   βλ₆ ≈ −2η λ₆ + 24 λ₆² I₃(0)
 *
 * where the Litim threshold integral at zero momentum is:
 *   I₃(0) = 1 / (1 + m̄²)³
 */
export declare function betaLambda6(lambda6: number, eta: number, mbar2: number): number;
/**
 * Quartic melonic beta function (Ward-constrained approximation):
 *   βλ₄ ≈ −η λ₄ (1 − λ₄ π²/(1 + m̄²))²
 */
export declare function betaLambda4(lambda4: number, eta: number, mbar2: number): number;
/**
 * Evaluate the GFT epoch unlock condition for a prime gate.
 *
 * Approval requires:
 *   1. prime is actually prime
 *   2. |βλ₆(k_e)| < betaThreshold  (GFT flow converged)
 *   3. |η| < etaMax = 0.1           (Gaussian regime)
 */
export declare function checkEpochUnlockCondition(prime: number, sigma: number, lambda4: number, lambda6: number, eta: number, mbar2: number, options?: {
    betaThreshold?: number;
    etaMax?: number;
    k0?: number;
}): EpochUnlockCondition;
/**
 * Validate running vacuum parameters against current observational bounds:
 *   |ν| ≤ 0.01 H₀²  (DESI Y1 + Planck)
 *   |ω| ≤ 0.01 H₀²  (GWTC-4.0 GW propagation)
 */
export declare function validateRunningVacuumBounds(params: RunningVacuumParams): {
    valid: boolean;
    violations: string[];
};
//# sourceMappingURL=gft-rg.d.ts.map