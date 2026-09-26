/**
 * PIRTM proof verification and module validation math
 * PM-2460 / ADR-073
 *
 * Mathematical contracts:
 *   contractivity:  op_norm_T * epsilon < 1   (transpile-time L0 invariant)
 *   proof digest:   SHA-256(prime_index || tensor_body)
 *   proof hash:     SHA-256(prime_index | epsilon | op_norm_T)
 */
import type { ModuleMetadata, ValidationResult, PirtmProof } from '../src/interfaces.js';
/**
 * Miller-Rabin primality test (deterministic for n < 3.2 × 10¹⁸, covers all
 * practical prime-gate indices used by Phase Mirror).
 */
export declare function isPrime(n: number): boolean;
/**
 * Induced ∞-norm of a matrix (max absolute row sum).
 * This is an upper bound on the spectral norm (largest singular value),
 * and is the norm used by the PIRTM contractivity check.
 */
export declare function computeOpNorm(matrix: number[][]): number;
/**
 * L0 contractivity invariant: op_norm_T * epsilon < 1.
 * Must pass at transpile time before any higher-layer analysis proceeds.
 */
export declare function validateOpNormT(opNormT: number, epsilon: number): boolean;
/**
 * Cryptographic digest binding prime_index to a tensor body string.
 * Returns 0x-prefixed 64-char hex.
 */
export declare function computePrimeIndexDigest(primeIndex: number, tensorInput: string): string;
/**
 * Proof-of-binding hash: ties (prime_index, epsilon, op_norm_T) into a
 * single 64-char hex digest stored in the !pirtm_proof section.
 */
export declare function computeProofHash(primeIndex: number, epsilon: number, opNormT: number): string;
/**
 * Verify a PirtmProof packet against its declared parameters.
 * Runs four deterministic checks:
 *   1. proof hex format  (0x + 64 hex chars)
 *   2. prime_index positive integer
 *   3. contractivity    (op_norm_T * epsilon < 1)
 *   4. proof hash integrity (recompute and compare)
 */
export declare function verifyProof(proof: PirtmProof): ValidationResult;
/**
 * Validate a PIRTM module's binding parameters.
 * This is the transpile-time gate: must pass before any higher-layer
 * analysis (spectral, link-time) runs.
 */
export declare function validatePirtmModule(metadata: ModuleMetadata): ValidationResult;
//# sourceMappingURL=proof.d.ts.map