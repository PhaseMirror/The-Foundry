import { describe, expect, test } from '@jest/globals';
import { executePirtm, validateOpNormT, computeOpNorm, computePrimeIndexDigest, computeProofHash, validatePirtmModule, verifyProof, } from './index';
// ---------------------------------------------------------------------------
// validateOpNormT — contractivity invariant
// ---------------------------------------------------------------------------
describe('validateOpNormT', () => {
    test('passes when op_norm_T * epsilon < 1', () => {
        expect(validateOpNormT(0.8, 0.5)).toBe(true); // 0.4 < 1
        expect(validateOpNormT(0.1, 0.1)).toBe(true);
    });
    test('fails when product >= 1', () => {
        expect(validateOpNormT(1.0, 1.0)).toBe(false);
        expect(validateOpNormT(2.0, 0.5)).toBe(false); // 1.0 not < 1
        expect(validateOpNormT(1.5, 0.9)).toBe(false);
    });
    test('fails on zero or negative inputs', () => {
        expect(validateOpNormT(0, 0.5)).toBe(false);
        expect(validateOpNormT(0.5, 0)).toBe(false);
        expect(validateOpNormT(-0.5, 0.5)).toBe(false);
    });
    test('fails when epsilon >= 1', () => {
        expect(validateOpNormT(0.5, 1.0)).toBe(false);
        expect(validateOpNormT(0.5, 1.5)).toBe(false);
    });
});
// ---------------------------------------------------------------------------
// computeOpNorm — induced ∞-norm
// ---------------------------------------------------------------------------
describe('computeOpNorm', () => {
    test('returns max absolute row sum', () => {
        const M = [[0.3, 0.2], [0.1, 0.4]];
        // row 0: 0.5, row 1: 0.5 → max = 0.5
        expect(computeOpNorm(M)).toBeCloseTo(0.5);
    });
    test('handles empty matrix', () => {
        expect(computeOpNorm([])).toBe(0);
    });
    test('uses absolute values', () => {
        const M = [[-0.6, 0.1]];
        expect(computeOpNorm(M)).toBeCloseTo(0.7);
    });
});
// ---------------------------------------------------------------------------
// computePrimeIndexDigest
// ---------------------------------------------------------------------------
describe('computePrimeIndexDigest', () => {
    test('returns 0x-prefixed 64-char hex', () => {
        const d = computePrimeIndexDigest(7, 'hello');
        expect(d).toMatch(/^0x[0-9a-f]{64}$/i);
    });
    test('is deterministic for same inputs', () => {
        const d1 = computePrimeIndexDigest(7, 'logic');
        const d2 = computePrimeIndexDigest(7, 'logic');
        expect(d1).toBe(d2);
    });
    test('differs for different prime_index', () => {
        const d1 = computePrimeIndexDigest(7, 'logic');
        const d2 = computePrimeIndexDigest(11, 'logic');
        expect(d1).not.toBe(d2);
    });
});
// ---------------------------------------------------------------------------
// validatePirtmModule
// ---------------------------------------------------------------------------
describe('validatePirtmModule', () => {
    const valid = { primeIndex: 7, epsilon: 0.5, opNormT: 0.8 };
    test('passes for valid module', () => {
        const result = validatePirtmModule(valid);
        expect(result.valid).toBe(true);
        expect(result.reason).toBeUndefined();
    });
    test('fails for non-integer prime_index', () => {
        const result = validatePirtmModule({ ...valid, primeIndex: 7.5 });
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('prime_index_valid');
    });
    test('fails for epsilon out of range', () => {
        expect(validatePirtmModule({ ...valid, epsilon: 0 }).valid).toBe(false);
        expect(validatePirtmModule({ ...valid, epsilon: 1.0 }).valid).toBe(false);
    });
    test('fails when contractivity violated', () => {
        const result = validatePirtmModule({ ...valid, opNormT: 3.0 }); // 3.0 * 0.5 = 1.5 >= 1
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('contractivity');
    });
});
// ---------------------------------------------------------------------------
// verifyProof
// ---------------------------------------------------------------------------
describe('verifyProof', () => {
    function makeProof(overrides = {}) {
        const primeIndex = 7;
        const epsilon = 0.5;
        const opNormT = 0.8;
        const proofHash = computeProofHash(primeIndex, epsilon, opNormT);
        const proof = computePrimeIndexDigest(primeIndex, 'test-logic');
        return { proof, primeIndex, epsilon, opNormT, proofHash, publicSignals: {}, ...overrides };
    }
    test('passes for a well-formed proof', () => {
        expect(verifyProof(makeProof()).valid).toBe(true);
    });
    test('fails on bad proof hex format', () => {
        const result = verifyProof(makeProof({ proof: 'not-hex' }));
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('proof_hex_format');
    });
    test('fails on hash mismatch', () => {
        const result = verifyProof(makeProof({ proofHash: 'deadbeef' }));
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('proof_hash_integrity');
    });
    test('fails when contractivity violated', () => {
        const p = makeProof({ opNormT: 5.0 });
        // recompute hash for the bad params to isolate the contractivity check
        p.proofHash = computeProofHash(p.primeIndex, p.epsilon, p.opNormT);
        const result = verifyProof(p);
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('contractivity');
    });
});
// ---------------------------------------------------------------------------
// executePirtm — integration
// ---------------------------------------------------------------------------
describe('executePirtm', () => {
    test('returns certified proof with correct meta', async () => {
        const result = await executePirtm('multiplicity/articles/test-article.md', 'logic-ops', { x: 42 });
        expect(result.meta.mode).toBe('pirtm');
        expect(result.meta.certified).toBe(true);
        expect(result.proof).toMatch(/^0x[0-9a-f]{64}$/i);
        expect(result.publicSignals).toHaveProperty('digest');
        expect(result.publicSignals).toHaveProperty('primeIndex');
    });
    test('meta includes epsilon and opNormT', async () => {
        const result = await executePirtm('path/to/module.md', 'logic-body', {});
        expect(result.meta.epsilon).toBeGreaterThan(0);
        expect(result.meta.opNormT).toBeGreaterThan(0);
        expect(result.meta.opNormT * result.meta.epsilon).toBeLessThan(1);
    });
});
//# sourceMappingURL=index.test.js.map