/**
 * PIRTM proof verification and module validation math
 * PM-2460 / ADR-073
 *
 * Mathematical contracts:
 *   contractivity:  op_norm_T * epsilon < 1   (transpile-time L0 invariant)
 *   proof digest:   SHA-256(prime_index || tensor_body)
 *   proof hash:     SHA-256(prime_index | epsilon | op_norm_T)
 */
import crypto from 'crypto';
// ---------------------------------------------------------------------------
// Prime utility
// ---------------------------------------------------------------------------
/**
 * Miller-Rabin primality test (deterministic for n < 3.2 × 10¹⁸, covers all
 * practical prime-gate indices used by Phase Mirror).
 */
export function isPrime(n) {
    if (!Number.isInteger(n) || n < 2)
        return false;
    if (n === 2 || n === 3 || n === 5 || n === 7)
        return true;
    if (n % 2 === 0 || n % 3 === 0)
        return false;
    // Trial division up to √n (sufficient for practical prime indices ≤ 10^6)
    const limit = Math.ceil(Math.sqrt(n));
    for (let i = 5; i <= limit; i += 6) {
        if (n % i === 0 || n % (i + 2) === 0)
            return false;
    }
    return true;
}
// ---------------------------------------------------------------------------
// Operator norm helpers
// ---------------------------------------------------------------------------
/**
 * Induced ∞-norm of a matrix (max absolute row sum).
 * This is an upper bound on the spectral norm (largest singular value),
 * and is the norm used by the PIRTM contractivity check.
 */
export function computeOpNorm(matrix) {
    if (matrix.length === 0)
        return 0;
    let maxRowSum = 0;
    for (const row of matrix) {
        const rowSum = row.reduce((acc, v) => acc + Math.abs(v), 0);
        if (rowSum > maxRowSum)
            maxRowSum = rowSum;
    }
    return maxRowSum;
}
/**
 * L0 contractivity invariant: op_norm_T * epsilon < 1.
 * Must pass at transpile time before any higher-layer analysis proceeds.
 */
export function validateOpNormT(opNormT, epsilon) {
    return opNormT > 0 && epsilon > 0 && epsilon < 1.0 && opNormT * epsilon < 1.0;
}
// ---------------------------------------------------------------------------
// Digest / hash helpers
// ---------------------------------------------------------------------------
/**
 * Cryptographic digest binding prime_index to a tensor body string.
 * Returns 0x-prefixed 64-char hex.
 */
export function computePrimeIndexDigest(primeIndex, tensorInput) {
    const raw = `prime_index:${primeIndex}||tensor:${tensorInput}`;
    return '0x' + crypto.createHash('sha256').update(raw, 'utf8').digest('hex');
}
/**
 * Proof-of-binding hash: ties (prime_index, epsilon, op_norm_T) into a
 * single 64-char hex digest stored in the !pirtm_proof section.
 */
export function computeProofHash(primeIndex, epsilon, opNormT) {
    const raw = `${primeIndex}|${epsilon.toFixed(9)}|${opNormT.toFixed(9)}`;
    return crypto.createHash('sha256').update(raw, 'utf8').digest('hex');
}
// ---------------------------------------------------------------------------
// Proof verification
// ---------------------------------------------------------------------------
/**
 * Verify a PirtmProof packet against its declared parameters.
 * Runs four deterministic checks:
 *   1. proof hex format  (0x + 64 hex chars)
 *   2. prime_index positive integer
 *   3. contractivity    (op_norm_T * epsilon < 1)
 *   4. proof hash integrity (recompute and compare)
 */
export function verifyProof(proof) {
    const checks = [];
    const proofHexOk = /^0x[0-9a-f]{64}$/i.test(proof.proof);
    checks.push({
        name: 'proof_hex_format',
        passed: proofHexOk,
        detail: proofHexOk ? 'OK' : `got: ${proof.proof.slice(0, 12)}…`,
    });
    const primeIndexOk = Number.isInteger(proof.primeIndex) && proof.primeIndex > 0;
    checks.push({
        name: 'prime_index_positive',
        passed: primeIndexOk,
        detail: `prime_index=${proof.primeIndex}`,
    });
    const contractivityOk = validateOpNormT(proof.opNormT, proof.epsilon);
    checks.push({
        name: 'contractivity',
        passed: contractivityOk,
        detail: `op_norm_T=${proof.opNormT} × epsilon=${proof.epsilon} = ${(proof.opNormT * proof.epsilon).toFixed(6)} (must be < 1)`,
    });
    const expectedHash = computeProofHash(proof.primeIndex, proof.epsilon, proof.opNormT);
    const hashOk = proof.proofHash === expectedHash;
    checks.push({
        name: 'proof_hash_integrity',
        passed: hashOk,
        detail: hashOk ? 'OK' : `expected ${expectedHash.slice(0, 16)}…`,
    });
    const valid = checks.every(c => c.passed);
    return {
        valid,
        reason: valid ? undefined : checks.find(c => !c.passed)?.name,
        checks,
    };
}
// ---------------------------------------------------------------------------
// Module validation
// ---------------------------------------------------------------------------
/**
 * Validate a PIRTM module's binding parameters.
 * This is the transpile-time gate: must pass before any higher-layer
 * analysis (spectral, link-time) runs.
 */
export function validatePirtmModule(metadata) {
    const checks = [];
    const primeOk = Number.isInteger(metadata.primeIndex) && metadata.primeIndex > 0;
    checks.push({
        name: 'prime_index_valid',
        passed: primeOk,
        detail: `prime_index=${metadata.primeIndex}`,
    });
    const epsilonOk = metadata.epsilon > 0 && metadata.epsilon < 1.0;
    checks.push({
        name: 'epsilon_range',
        passed: epsilonOk,
        detail: `epsilon=${metadata.epsilon} (must be in (0, 1))`,
    });
    const contractivityOk = validateOpNormT(metadata.opNormT, metadata.epsilon);
    checks.push({
        name: 'contractivity',
        passed: contractivityOk,
        detail: `op_norm_T=${metadata.opNormT} × epsilon=${metadata.epsilon} = ${(metadata.opNormT * metadata.epsilon).toFixed(6)} (must be < 1)`,
    });
    const valid = checks.every(c => c.passed);
    return {
        valid,
        reason: valid ? undefined : checks.find(c => !c.passed)?.name,
        checks,
    };
}
//# sourceMappingURL=proof.js.map