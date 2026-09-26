# Next Steps — The Commander

> Phases 1–4 complete. Phase 5 in progress.
> This document covers **Phase 5: PhaseSpace OS Surface**.

---

## How to Read This Document

- **Owner** — role responsible for completion
- **Metric** — how you know it is done. No metric = not done
- **Horizon** — target window (7 / 30 / 60 / 90 days)
- **Artifact** — the file or ADR that must change

Steps are sequenced. Do not start N+1 until N's metric is met.
NEXT_STEPS.md must be updated in the same commit that closes the step's primary artifact.

---

## Completed — Phase 4

| Step | Description | Commit |
|------|-------------|--------|
| Step 9 [DONE 2026-05-22] | TUI foundation: ratatui, shared async state, SSE liveness | `69978cd` |
| Step 10 [DONE 2026-05-22] | TUI detail view: trust, ALP, last SAT, last witness SHA | `cfbb6aba` |
| Step 11 [DONE 2026-05-22] | pscmd compose: Sigma compiler, unified IR, ADR-WF-001 | `e8905466` |
| Step 12 [DONE 2026-05-22] | LAN sync design: ADR-ARCH-001, ReplicationConfig, L0 test | `f8aea87` |

---

## Completed — Phase 5

| Step | Description | Commit |
|------|-------------|--------|
| Step 13 [DONE 2026-05-22] | Operator Profiles: ProfileViolation, execution-time rejection, ADR-PROF-001 | `7cd9981` |
| Step 14 [DONE 2026-05-22] | LAN replication: ReplicaPushLoop, QuarantineStore, /archivum/replicate, 7 tests | `eea2ea0` |
| Step 15 [DONE 2026-05-22] | lever_manifest.yaml deprecation: capability-gap trigger, DeprecationWarning, migration guide | `39451e0` |
| Step 16 [DONE 2026-05-22] | Constitution versioning: SHA-256 hash pinning, STALE deactivation, ADR-PROF-002 | `db049eb1` |
| Step 17 [DONE 2026-05-22] | Dashboard Integration: fan-in UnifiedEvent bus, broadcast fan-out, SSE alignment | `532ec8c5` |
| MKT Constants [DONE 2026-05-22] | ADR-MATH-001: ALPHA_K=(π−1)/2 authoritative, SU(2) identity verified 1e-10, Python/Rust harness | `f7a9b867` |

---

## Phase 5: Active

### Step 18 — Operator Profile Creation & Multi-Node Setup

- **Owner**: commander-cli (Rust)
- **Metric**: `pscmd profile create <id>` initializes a valid, pinned profile. TUI allows switching between multiple local profiles. Replication logic is wired to use the active profile's `operator_id` in the witness record.
- **Horizon**: 14 days
- **Artifact**: `crates/commander-cli/src/profile.rs`, `crates/commander-core/src/sync/replication.rs`

---

## Deferred to Phase 6

| Tension | Condition for scheduling |
|---------|--------------------------|
| GitHub write-access escalation | Requires operator profile + explicit ALP rule |
| External-trust witness audit export | Requires separate export policy ADR |
| pscmd compose REPL surface | Depends on Step 15 deprecation adoption metrics |
| pscmd sync quarantine-list TUI panel | CLI surface exists; TUI panel deferred |
| agiOS substrate migration (sigma_kernel) | Blocked on γ_K formal definition (Canonical Axis Theorem) |

---

## Governance Invariants (non-negotiable)

1. Every workflow execution produces exactly one `UnifiedWitness` committed to `state/archivum/witnesses.jsonl`.
2. Every MCP tool call passes through the ALP policy gate before any process is spawned.
3. `cargo test --workspace` must pass on every commit to `main`.
4. Any change to schema types, transport semantics, or ALP policy requires an ADR update before the PR merges.
5. stdio transport is never removed or degraded. HTTP/SSE is additive only.
6. Operator profiles may narrow permissions but never widen them beyond the foundation constitution.
7. Replicated witnesses carry the originating `node_id` and are verified by the Primary's ALP gate before admission to the canonical ledger.
8. Replicated witnesses must be verified by the Primary's ALP gate before being admitted to the canonical ledger.
9. Profile activation requires `foundation_hash` to match SHA-256 of committed `constitution.json`. Hash mismatch deactivates the profile.
10. No MKT constant may be hardcoded as a numeric literal. All values derived from `ALPHA_K = (π−1)/2` per ADR-MATH-001.

---

*Update this file in the same commit that closes each step's primary artifact.*
