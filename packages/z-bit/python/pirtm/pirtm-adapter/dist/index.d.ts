/**
 * PIRTM adapter — public API surface
 * PM-2460 / ADR-073
 */
import type { ModuleMetadata } from '../src/interfaces.js';
export type { PirtmRequest, PirtmProof, ModuleMetadata, ValidationResult, ValidationCheck, PirtmStatus, } from '../src/interfaces.js';
export { computeOpNorm, validateOpNormT, computePrimeIndexDigest, computeProofHash, validatePirtmModule, verifyProof, isPrime, } from '../src/proof.js';
export { checkCRTCoherence, checkLFunctionBound, checkSymmetryBlock, checkLanglandsCoherence, } from '../src/langlands.js';
export type { ModuleBinding, LanglandsResult, LanglandsCheck } from '../src/langlands.js';
export { validateKroneckerAttr, KRONECKER_DEFAULTS } from '../src/kronecker.js';
export { diagonalEntry, gramKernelEntry, buildPrimeSpectralBasis, computeHSNorm, computeOpNormMatrix, verifyPositiveSemidefinite, validatePrimeSpectralBasis, computeGapLB, computeSlopeUB, certifySpectralAttributes, zeroBudget, } from '../src/spectral.js';
export type { PerturbationBudget } from '../src/spectral.js';
export { evaluateSymbol, computeEssentialBand, verifyBochnerPositivity, sampleSymbolBands, canonicalPaperSieve, validateTimeSieve, } from '../src/timesieve.js';
export type { TimeSieveCoefficients, TimeSieveBands } from '../src/timesieve.js';
export { canonicalCumulants, foamDiffusiveDriftBound, computeFNL, computeTotalDriftBudget, checkNonGaussianityTolerance, computeNoiseKernelBound, auditFoamDrift, PLANCK_SUPPRESSION, FNL_TOLERANCE, P_ZETA_CANONICAL, } from '../src/spinfoam.js';
export type { SpinFoamCumulants, NoiseKernelBoundResult, FNLCheckResult } from '../src/spinfoam.js';
export { runningLambda, runningG, epochToScale, betaLambda6, betaLambda4, checkEpochUnlockCondition, validateRunningVacuumBounds, } from '../src/gft-rg.js';
export type { RunningVacuumParams, GFTBetaResult, EpochUnlockCondition } from '../src/gft-rg.js';
export { certifyGapLB, certifyPositivityGenerator, certifyACEDominance, certifyFrameInvariance, runSpectralCertification, } from '../src/certify.js';
export type { SpectralCertInput, SpectralCertResult, GateResult } from '../src/certify.js';
export { OPERATOR_ATLAS, buildFrameInvarianceReport, validateAtlasCompleteness, } from '../src/atlas.js';
export type { OperatorAtlasEntry, FrameInvarianceReport } from '../src/atlas.js';
export type PirtmResult = {
    proof: string;
    publicSignals: Record<string, unknown>;
    meta: {
        path: string;
        mode: 'pirtm';
        primeIndex: number;
        epsilon: number;
        opNormT: number;
        certified: boolean;
    };
};
/**
 * Load PIRTM module artifacts from a compiled artifact path.
 * Production: reads the !pirtm_proof binary section from the .bc file.
 * Current: returns canonical defaults tied to the path digest.
 */
export declare function loadPirtmArtifacts(path: string): Promise<ModuleMetadata>;
/**
 * Execute a PIRTM view through the proof adapter.
 *
 * Sequencing (must not be reordered — L0 invariant):
 *   1. Load module artifacts  (transpile-time params)
 *   2. validatePirtmModule    (contractivity gate — fails closed)
 *   3. computePrimeIndexDigest
 *   4. verifyProof            (full packet verification)
 *   5. Return certified PirtmResult
 *
 * Throws if any gate fails (fail-closed per L0 invariant).
 */
export declare function executePirtm(viewPath: string, logic: string, context: Record<string, unknown>): Promise<PirtmResult>;
//# sourceMappingURL=index.d.ts.map