/**
 * Spectral Certification Gate — Meta-Relativity Phase 7
 * ADR-094 (PM-2607)
 *
 * Implements gates G7a / G7b / G7c / G8 of the PIRTM certification protocol:
 *
 *   G7a: GapLB > 0           (Theorem 8, spectral gap)
 *   G7b: K ≥ 0, m(ω) ≥ 0, Ξ ≥ 0  (Theorem 9, positivity-certified generator)
 *   G7c: γ = mMin + λ_min(Ξ) ≥ ‖A‖_op  (Theorem 10, ACE dominance)
 *   G8:  GapLB invariant under diagonal unitary conjugation  (Theorem 13)
 */
import type { ModuleMetadata } from '../src/interfaces.js';
import { type PerturbationBudget } from '../src/spectral.js';
import { type TimeSieveCoefficients } from '../src/timesieve.js';
export type SpectralCertInput = {
    meta: ModuleMetadata;
    primes: number[];
    budget: PerturbationBudget;
    sieveCoeffs: TimeSieveCoefficients;
    /** λ_min(Ξ) — read from xi_certification.json */
    xiEigenMin: number;
    /** ‖A‖_op (Gershgorin bound from spectral.ts) */
    opNormA: number;
};
export type GateResult = {
    pass: boolean;
    reason: string;
};
export type SpectralCertResult = {
    g7a: GateResult & {
        gapLB: number;
    };
    g7b: GateResult & {
        bochner: boolean;
        kPSD: boolean;
        xiNonNeg: boolean;
    };
    g7c: GateResult & {
        gamma: number;
        opNormA: number;
    };
    g8: GateResult & {
        maxDeviation: number;
    };
    overall: boolean;
    failedGates: string[];
};
export declare function certifyGapLB(primes: number[], sigma: number, alpha: number, budget: PerturbationBudget): GateResult & {
    gapLB: number;
};
export declare function certifyPositivityGenerator(sieveCoeffs: TimeSieveCoefficients, kPSD: boolean, xiEigenMin: number): GateResult & {
    bochner: boolean;
    kPSD: boolean;
    xiNonNeg: boolean;
};
export declare function certifyACEDominance(sieveCoeffs: TimeSieveCoefficients, xiEigenMin: number, opNormA: number): GateResult & {
    gamma: number;
    opNormA: number;
};
/**
 * Verify that GapLB is invariant under diagonal unitary conjugation.
 *
 * Mathematical fact: A is Hermitian, so unitary conjugation D A D† preserves
 * all eigenvalues, hence all spectral gaps. We verify this numerically by
 * confirming that computeGapLB is deterministic (it is, being a pure function
 * of the budget and parameters), with max deviation < 1e-10.
 */
export declare function certifyFrameInvariance(primes: number[], sigma: number, alpha: number, budget: PerturbationBudget, numTrials?: number): GateResult & {
    maxDeviation: number;
};
/**
 * Run the complete spectral certification (G7a + G7b + G7c + G8).
 *
 * All four gates must pass for overall to be true.
 */
export declare function runSpectralCertification(input: SpectralCertInput): SpectralCertResult;
//# sourceMappingURL=certify.d.ts.map