# ADR-0002: Constitutional Runbook Verification

> **Status**: Accepted  
> **Date**: 2026-06-09  
> **Authors**: Gemini CLI  
> **Spec Reference**: Phase 1 Execution: Constitutional Runbook Verification

---

## Problem Statement

A mechanism is needed to verify that a system (local or CI) satisfies the required architectural invariants (p=7 Lineage, p=11 Drift). Without a unified verification runbook, inconsistent checks across environments lead to "it works on my machine" syndromes.

---

## Solution

Establish a unified execution runbook with specific exit codes and artifact finality:

1.  **Runbook Steps**:
    - `Seal`: Establish Merkle trust root.
    - `Provision`: Setup system user and service files (`bootstrap`).
    - `Verify`: Run lineage and behavioral gates (`validate`).
    - `Build`: Execute manifest-driven builds.
    - `Audit`: Confirm no drift relative to seal (`check-drift`).
    - `Snapshot`: Generate telemetry (`status`).
2.  **UnifiedWitness Finality**: Merge all shards into `artifacts/unified_witness_final.json`.
3.  **Exit 107**: Explicitly reserve Exit 107 for "Lineage Contradiction" (drift detection).

---

## Consequences

### Positive

- **Deterministic Verification**: Clear path from fresh checkout to verified state.
- **Explicit Failure Modes**: Exit 107 immediately alerts operators to drift.
- **Artifact Evidence**: `unified_witness_final.json` provides forensic proof of compliance.

### Negative

- **Rigidity**: Systems must exactly match the genesis seal or fail.

---

## Rationale

Unified verification ensures that the foundation is stable before moving to higher-tier spectral certification. Using a shared `m.sh` entrypoint enforces the correct sequencing of gates.

---

## Acceptance Criteria

- [ ] `m.sh` implements all 6 runbook steps.
- [ ] CI pipeline executes the runbook successfully using `--ci-mode`.
- [ ] Drift detection returns Exit 107.
- [ ] `unified_witness_final.json` is produced with 5 required shards.

---

## References

- [ADR-0001: Constitutional Pipeline Completion](./ADR-0001-constitutional-pipeline-completion.md)
- [ADR-0003: CI Stub & Artifact Merge Guard](./ADR-0003-ci-stub-artifact-merge-guard.md)
