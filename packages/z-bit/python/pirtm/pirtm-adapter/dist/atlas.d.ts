/**
 * Production Operator Atlas — Meta-Relativity Phase 8
 * ADR-095 (PM-2608)
 *
 * Canonical mapping from U = A⊗I + I⊗B + I⊗E to PIRTM runtime attributes
 * and Theorem 13 (frame invariance) attestation report.
 */
import type { SpectralCertResult } from '../src/certify.js';
export type OperatorAtlasEntry = {
    /** Mathematical symbol (e.g. 'σ', 'A', 'γ') */
    symbol: string;
    /** Human-readable description */
    description: string;
    /** Corresponding PIRTM metadata attribute name */
    pirtmAttr: string;
    /** State/certification field path */
    stateField: string;
    /** Gate that certifies this quantity (null if not directly gated) */
    gateId: string | null;
    /** Theorem that governs this quantity (null if none) */
    theoremRef: string | null;
};
/**
 * Static operator atlas: 12 entries covering every mathematical component
 * of the Meta-Relativity × Spin-Foam PIRTM integration (ADR-087 program).
 */
export declare const OPERATOR_ATLAS: readonly OperatorAtlasEntry[];
export type FrameInvarianceReport = {
    theorem: 'Theorem 13';
    certResult: Pick<SpectralCertResult, 'g8'>;
    /** Cross-reference to Ξ-Constitution Article I §1 spectral axiom */
    xiConstitutionRef: 'Article I §1';
    /** Cross-reference to analog_sovereignty.yaml sovereignty constraint */
    analogSovereigntyRef: 'sovereignty_constraint.mirror_must_not_yield';
    /** ISO timestamp if certified, null otherwise */
    certifiedAt: string | null;
};
/**
 * Build the Theorem 13 frame-invariance attestation report from a completed
 * spectral certification result.
 *
 * Binds the gate G8 outcome to the Ξ-Constitution and Analog Sovereignty
 * governance references required by ADR-085 + ADR-095.
 */
export declare function buildFrameInvarianceReport(certResult: SpectralCertResult): FrameInvarianceReport;
/**
 * Verify that every PIRTM attribute in the atlas has a corresponding field
 * in the provided metadata or state-fields object.
 *
 * Returns { complete: true } when no atlas entries are missing coverage,
 * or { complete: false, missing: [...symbols] } otherwise.
 */
export declare function validateAtlasCompleteness(meta: Record<string, unknown>, stateFields: Record<string, unknown>): {
    complete: boolean;
    missing: string[];
};
//# sourceMappingURL=atlas.d.ts.map