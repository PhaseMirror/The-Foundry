# ADR-0028: Pro-Tier Spectral Certification & ZetaBridge

> **Status**: Proposed  
> **Date**: 2026-06-09  
> **Authors**: Gemini CLI  
> **Spec Reference**: Phase 2: Pro-tier spectral certification

---

## Problem Statement

Phase 1 established a constitutional foundation for environment and artifact integrity. However, "Pro-tier" certification requires cross-spectral validation (linking prime frequencies to zeta zero distributions) to ensure high-tier stability certificates. Without this, the system cannot detect "spectral drift" or "GUE degeneracy" which are prerequisites for Tier 4 Recovery.

---

## Solution

Implement the **4-stage Spectral Veto** and the **ZetaBridge** authoritative source.

1.  **ZetaBridge**: A dedicated bridge that manages `p_i` (prime frequencies) and `gamma_k` (zeta zeros). It is responsible for emitting `SpectralWitness` artifacts.
2.  **4-Stage Veto Logic (`pro_certified()`)**:
    *   **Stage 1 (Banach)**: $q < 1 - \epsilon$ (Stability check).
    *   **Stage 2 (Scale)**: $N_0 \ge 64$ (Production scale check).
    *   **Stage 3 (Gap)**: $\Delta_{pz} > N_0^{-(0.5 + \epsilon)}$ (Spectral gap guard).
    *   **Stage 4 (Recovery)**: GUE-spacing (Wigner-Dyson) surrogate check for Tier 4 promotion.
3.  **Witness Preservation**: Append `zero_spacings`, `GUE_stats`, and `bridge_hashes` to `unified_witness_final.json`.

---

## Consequences

### Positive

- **Spectral Integrity**: Guaranteed alignment between prime and zeta strata.
- **Hierarchical Veto**: Immediate failure (Exit 110–113) for specific spectral pathologies.
- **Forensic Richness**: Full witness preservation for subsequent prover verification.

### Negative

- **Complexity**: Requires numerical analysis (GUE variance) within the validation gate.
- **Performance**: $N_0=64$ scale requirement may increase validation time.

---

## Rationale

This approach follows the **Witness Preservation Invariant** established in the broader project context. By routing all spectral queries through a Merkle-sealed `ZetaBridge`, we ensure that the "Path of Integrity" is maintained from the Rust engine to the CLI artifacts.

---

## Acceptance Criteria

- [ ] `ZetaBridge` implements `__setattr__` guards and Merkle validation.
- [ ] `certify_pro_state` correctly executes the 4-stage veto.
- [ ] `m validate` returns Exit 110–113 on specific spectral failures.
- [ ] `unified_witness_final.json` contains the `SpectralWitness` shard.

---

## References

- [ADR-0001: Constitutional Pipeline Completion](./ADR-0001-constitutional-pipeline-completion.md)
- [ADR-0002: Constitutional Runbook Verification](./ADR-0002-constitutional-runbook-verification.md)
