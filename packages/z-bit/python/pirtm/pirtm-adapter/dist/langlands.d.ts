/**
 * Langlands Automorphy Layer
 * ADR-083 (PM-2505): Article I — symmetry and modular coherence
 *
 * Mathematical contracts:
 *   crt_coherence:   ∀i≠j: gcd(p_i, p_j) = 1  (coprime residue classes)
 *   l_function:      opNormT_i * epsilon_i < spectralRadiusMax  (L-value proxy)
 *   symmetry_block:  G[i][i] * epsilon_i < 1  ∧  G[i][j] < √(ε_i * ε_j)
 *
 * These are operational proxies for the Langlands correspondence;
 * see ADR-083 for the full arithmetic expansion roadmap.
 */
export type ModuleBinding = {
    /** p_i — must be prime */
    primeIndex: number;
    /** ε_i ∈ (0,1) */
    epsilon: number;
    /** ‖T_i‖ */
    opNormT: number;
};
export type LanglandsCheck = {
    name: string;
    passed: boolean;
    detail?: string;
};
export type LanglandsResult = {
    coherent: boolean;
    reason?: string;
    checks: LanglandsCheck[];
};
/**
 * All module pairs must be coprime: gcd(p_i, p_j) = 1 for i ≠ j.
 *
 * This is the CRT (Chinese Remainder Theorem) coherence condition — each
 * module occupies a distinct residue class, enabling unambiguous lifting.
 */
export declare function checkCRTCoherence(modules: ModuleBinding[]): LanglandsResult;
/**
 * Per-module L-function proxy: opNormT_i * epsilon_i < spectralRadiusMax
 *
 * This is a conservative approximation of |L(s, π_i)| at the critical strip.
 * The product opNormT * epsilon must remain strictly below the spectral bound.
 */
export declare function checkLFunctionBound(modules: ModuleBinding[], spectralRadiusMax?: number): LanglandsResult;
/**
 * Per-module diagonal contractivity and geometric-mean coupling bound:
 *   G[i][i] * epsilon_i < 1        (diagonal contractivity)
 *   G[i][j] < √(ε_i * ε_j)        (off-diagonal coupling bound)
 *
 * gainMatrix[i][j] is the coupling weight from module i to module j.
 * gainMatrix must be square and match modules.length.
 */
export declare function checkSymmetryBlock(modules: ModuleBinding[], gainMatrix: number[][]): LanglandsResult;
/**
 * Composite Langlands coherence check: CRT + L-function + symmetry block.
 *
 * Returns coherent=false on the first failing sub-check; all sub-checks
 * are still run so the caller receives a full diagnostic report.
 */
export declare function checkLanglandsCoherence(modules: ModuleBinding[], gainMatrix: number[][], spectralRadiusMax?: number): LanglandsResult;
//# sourceMappingURL=langlands.d.ts.map