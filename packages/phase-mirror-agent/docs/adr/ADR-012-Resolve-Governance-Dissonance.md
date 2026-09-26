# ADR-012: Resolving Phase 7 Governance Dissonance

- Status: accepted
- Date: 2026-09-24
- Owners: Multiplicity Foundation
- Tags: #governance, #phase-7, #dissonance-resolution, #layer-b, #sedona-spine
- Phase: Phase 7 (Master Plan ADR-004)
- Related: ADR-004, ADR-008 (Governed Backplane), ADR-011, ADR-013 (formerly 008 ZK-Code)

## 1. Context

During a Phase Mirror audit leading up to the `v1.0.0` GA release (Phase 7), we identified critical discrepancies (dissonance) between the written architectural intent and the deployed implementation:

1. **Governance Collision:** Two distinct architectural decisions were assigned `ADR-008` (Governed Tool-Execution Backplane and Zero-Knowledge Code Verification). This breaks the formal chain of governance.
2. **Ghost Architecture in ADR-011:** `ADR-011` relies on Lean 4 formal proofs, `sedona_spine` WASM bindings, and PQC signatures. However, the deployable `phase-mirror-agent` (in `src/`) lacks any integration with these peer workspaces. The "GA Promotion" is mathematically hollow if the agent runs without these dependencies.
3. **Layer-B Assumption Hole:** `ADR-013` (ZK Code Verification) assumes that immutable git tags and CID anchoring are a hard blocker for Wyoming DAO personhood, yet the CI/CD pipeline (ADR-010) and master plan (ADR-004) don't enforce this.
4. **False Elimination of Stub Execution:** While ADR-008 claimed to eliminate "fake string receipts," `src/executor/mod.rs` continues to default to `simulated` execution, presenting a critical loophole where the runtime can silently pretend to execute side-effects in production if not explicitly overridden.

## 2. Decision

We mandate the following immediate corrective actions before the `v1.0.0` GA tag is issued:

1. **Re-index and Unify ADRs:** The conflicting ZK Code Verification ADR has been re-indexed to `ADR-013`. `docs/adr/README.md` must be updated to index `ADR-011`, `ADR-012` (this document), and `ADR-013`.
2. **Phase 7 Hard Blockers Added:** `v1.0.0` promotion is formally blocked until `phase-mirror-agent` explicitly depends on `sedona_spine` (Rust crate) and `phase_mirror_adr` (Lean 4 proofs).
3. **Simulated Executor Ban:** The `simulated` adapter must be stripped from the `default` fallback configuration. An unconfigured executor backplane must fail closed at boot (or execution) rather than simulating success.
4. **Layer-B Alignment:** We formally accept Layer-B state materialization as a prerequisite for `Phase 7`.

## 3. Consequences

### Positive
- Closes the governance loophole allowing stub executions in production.
- Aligns the engineering implementations with the legal/mathematical constraints of the Sedona Spine and Wyoming DAO frameworks.
- Resolves the numbering collision, maintaining an immutable and unambiguous governance ledger.

### Negative
- Delays the `v1.0.0` GA release until the `sedona_spine` crate is properly integrated into `phase-mirror-agent`.
- Increases configuration burden on operators who previously relied on the silent fallback to simulated executions during testing.
