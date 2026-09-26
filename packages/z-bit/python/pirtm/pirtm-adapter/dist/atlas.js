/**
 * Production Operator Atlas — Meta-Relativity Phase 8
 * ADR-095 (PM-2608)
 *
 * Canonical mapping from U = A⊗I + I⊗B + I⊗E to PIRTM runtime attributes
 * and Theorem 13 (frame invariance) attestation report.
 */
/**
 * Static operator atlas: 12 entries covering every mathematical component
 * of the Meta-Relativity × Spin-Foam PIRTM integration (ADR-087 program).
 */
export const OPERATOR_ATLAS = [
    {
        symbol: 'σ',
        description: 'Prime-diagonal exponent (A = Dσ + K)',
        pirtmAttr: 'sigma',
        stateField: 'meta.sigma',
        gateId: 'G4',
        theoremRef: null,
    },
    {
        symbol: 'α',
        description: 'Gram-kernel Hilbert-Schmidt exponent',
        pirtmAttr: 'alpha',
        stateField: 'meta.alpha',
        gateId: 'G4',
        theoremRef: null,
    },
    {
        symbol: 'A',
        description: 'Prime-sector block A = Dσ + K on ℓ²(P)',
        pirtmAttr: 'opNormT',
        stateField: 'spectral_cert.gap_lb',
        gateId: 'G7a',
        theoremRef: 'Theorem 8',
    },
    {
        symbol: 'B',
        description: 'Time-sieve B = F⁻¹MₘF on L²(ℝ)',
        pirtmAttr: 'sieve_mMin',
        stateField: 'spectral_cert.bochner_positive',
        gateId: 'G7b',
        theoremRef: 'Theorem 9',
    },
    {
        symbol: 'E=Ξ',
        description: 'Internal dynamics block on Cᵈ',
        pirtmAttr: 'xi_block_dim',
        stateField: 'xi_eigenvalue_min',
        gateId: 'G7b',
        theoremRef: 'Theorem 9',
    },
    {
        symbol: 'γ',
        description: 'ACE dominance bound γ = inf m(ω) + λ_min(Ξ)',
        pirtmAttr: 'ace_gamma',
        stateField: 'spectral_cert.ace_dominance',
        gateId: 'G7c',
        theoremRef: 'Theorem 10',
    },
    {
        symbol: 'C₂',
        description: 'Gaussian spin-foam cumulant',
        pirtmAttr: 'foam_C2',
        stateField: 'foam_drift.C2',
        gateId: 'G6',
        theoremRef: null,
    },
    {
        symbol: 'G(H)',
        description: 'Running Newton constant at Hubble scale H',
        pirtmAttr: 'running_G',
        stateField: 'running_vacuum.G0',
        gateId: null,
        theoremRef: null,
    },
    {
        symbol: 'Λ(H)',
        description: 'Running cosmological constant at Hubble scale H',
        pirtmAttr: 'running_Lambda',
        stateField: 'running_vacuum.Lambda0',
        gateId: null,
        theoremRef: null,
    },
    {
        symbol: 'βλ₆',
        description: 'GFT sextic melonic beta function',
        pirtmAttr: 'beta_lambda6',
        stateField: 'gft_rg.beta_lambda6',
        gateId: null,
        theoremRef: null,
    },
    {
        symbol: 'Δ',
        description: 'Spectral gap lower bound GapLB = δS − 2Σ|wₚ|bₚ',
        pirtmAttr: 'gap_lb',
        stateField: 'spectral_cert.gap_lb',
        gateId: 'G7a',
        theoremRef: 'Theorem 8',
    },
    {
        symbol: 'L',
        description: 'Slope upper bound SlopeUB = Σ|wₚ|Lₚ',
        pirtmAttr: 'slope_ub',
        stateField: 'spectral_cert.slope_ub',
        gateId: 'G7b',
        theoremRef: 'Theorem 8',
    },
];
/**
 * Build the Theorem 13 frame-invariance attestation report from a completed
 * spectral certification result.
 *
 * Binds the gate G8 outcome to the Ξ-Constitution and Analog Sovereignty
 * governance references required by ADR-085 + ADR-095.
 */
export function buildFrameInvarianceReport(certResult) {
    return {
        theorem: 'Theorem 13',
        certResult: { g8: certResult.g8 },
        xiConstitutionRef: 'Article I §1',
        analogSovereigntyRef: 'sovereignty_constraint.mirror_must_not_yield',
        certifiedAt: certResult.g8.pass ? new Date().toISOString() : null,
    };
}
// ---------------------------------------------------------------------------
// Atlas completeness validation
// ---------------------------------------------------------------------------
/**
 * Verify that every PIRTM attribute in the atlas has a corresponding field
 * in the provided metadata or state-fields object.
 *
 * Returns { complete: true } when no atlas entries are missing coverage,
 * or { complete: false, missing: [...symbols] } otherwise.
 */
export function validateAtlasCompleteness(meta, stateFields) {
    const missing = [];
    for (const entry of OPERATOR_ATLAS) {
        if (entry.pirtmAttr && !(entry.pirtmAttr in meta) && !(entry.pirtmAttr in stateFields)) {
            missing.push(entry.symbol);
        }
    }
    return { complete: missing.length === 0, missing };
}
//# sourceMappingURL=atlas.js.map