# ADR-0001: Constitutional Pipeline Completion

> **Status**: Accepted  
> **Date**: 2026-06-09  
> **Authors**: Gemini CLI  
> **Spec Reference**: Phase 1: Constitutional Pipeline Completion

---

## Problem Statement

To guarantee end-to-end reproducibility and ensure every developer and CI runner operates under the same mathematical and structural invariants, a formal constitutional pipeline is required. Without this, silent drift in environment variables and dependencies can lead to non-deterministic behavior and "Lineage Contradiction" states.

---

## Solution

Finalize the authoritative environment and establish a formal execution runbook. This includes:

1.  **Constitutional Environment (`gov/genesis.env`)**: Defining immutable `PYTHONPATH`, `LOG_LEVEL`, and `AGI_OS_ROOT`.
2.  **Genesis Seal (`artifacts/genesis_hashes.json`)**: A Merkle-signed registry of all manifests (Cargo, pnpm, etc.) and governance files.
3.  **Execution Runbook**: A 6-step process (Seal, Provision, Verify, Build, Audit, Snapshot) enforced by the CLI.

---

## Consequences

### Positive

- **Forensic Closure**: The pipeline ensures that every state transition is traceable and verifiable.
- **Environment Parity**: Dev, CI, and Production use the same constitutional invariants.
- **Rootless CI**: The `--ci-mode` shim allows verification in CI without requiring root privileges.

### Negative

- **Overhead**: Every change requires updating the genesis seal.
- **Strictness**: Drift will cause immediate failure (Exit 107), which may slow down quick experiments.

---

## Rationale

We chose a manifest-driven, Merkle-signed approach to ensure that the "Lineage" of the data and infrastructure is mathematically verifiable. This aligns with the requirement for p=7 Data Lineage and p=11 Infra Drift gates.

---

## Acceptance Criteria

- [ ] `gov/genesis.env` exists and contains required invariants.
- [ ] `m.sh seal-genesis` generates a valid `artifacts/genesis_hashes.json`.
- [ ] `./m.sh validate` passes p=7 lineage and Gherkin behavior gates.
- [ ] `artifacts/unified_witness_final.json` contains all required shards.

---

## References

- [ADR-0002: Constitutional Runbook Verification](./ADR-0002-constitutional-runbook-verification.md)
- [ADR-0003: CI Stub & Artifact Merge Guard](./ADR-0003-ci-stub-artifact-merge-guard.md)
