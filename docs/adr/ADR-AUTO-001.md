# ADR-AUTO-001: Rust + Kani Self-Governing Automation Crate for Phase Mirror

- Status: accepted
- Date: 2026-08-01
- Owners: Multiplicity Foundation
- Tags: #automation, #kani, #rust, #self-governance, #kilo-mcp, #phase-mirror

## 1. Context

Phase Mirror development today relies on manual invocation of governance gates (L0 invariants, Triple-Lock, Archivum WAL, Kani proofs) scattered across shell scripts, CI workflows, and human review. The methodology is sound, but the enforcement is not automated end-to-end. Every change to the bounded architecture boundary between `Prime/` and the root `PhaseMirror/` orchestrator requires an ad-hoc checklist rather than a machine-verified pipeline.

Additionally, Kilo (the AI coding assistant) is configured via `.kilo/` but has no machine-checked contract for how it may mutate Phase Mirror artifacts. There is no Rust-level enforcement that Kilo-triggered actions pass through the same L0/L1/Triple-Lock sequence that human-triggered actions must pass through.

The project already contains:
- A production `InvariantConsistencyOracle` (L0 bitmask validator) in `packages/phase-mirror-gpt/src/validator.rs`
- A `TripleLockSuite` in `packages/phase-mirror-gpt/src/triple_lock.rs`
- A `SemanticPolicy` (L1 hot-reloadable scanner) in `packages/phase-mirror-gpt/src/domain_invariants.rs`
- Extensive Kani harnesses under `Prime/rust/*/tests/kani_*.rs`
- An `adr_rust` crate with ADR status transitions and acyclic supersession proofs

What is missing is a **first-class automation crate** that reuses these exact components to govern its own development loop, verified with Kani, and triggered by Kilo via MCP.

## 2. Decision

We will create a new workspace crate `packages/phase-mirror-automation` that:

1. **Applies Phase Mirror governance to Phase Mirror development**: Every automated action (cargo build, cargo test, cargo kani, git commit, file mutation) is an `OracleEvent` evaluated by `InvariantConsistencyOracle`, gated by `SemanticPolicy`, and certified by `TripleLockSuite`.
2. **Is verified by Kani**: The automation engine's core contracts (L0 outcome determinism, Triple-Lock witness chain integrity, policy scan completeness) have `#[kani::proof]` harnesses.
3. **Is triggered by Kilo via MCP**: Kilo's `.kilo/command/` definitions emit MCP tool calls that the automation crate intercepts as stdio input, validates, and executes only after governance admission.
4. **Governs itself**: The crate's own source mutations are subject to the same pipeline. No bypass path exists.

### Target Architecture

```
Kilo (.kilo/command/*.md)
  → MCP stdio → phase-mirror-automation (Rust binary)
    ├── L0Validator.validate_invariants(ctx, tier)
    ├── SemanticPolicy.scan(draft_plan)
    ├── TripleLockSuite.verify(mission_id, draft_plan, ctx)
    │     ├── Genius: hash draft plan
    │     ├── Guardian: L0 + L1 + compliance floor
    │     └── Examiner: witness hash + Archivum commit + chain link
    ├── KaniRunner::verify_proofs() → cargo kani --target-dir
    └── AutomationEngine::execute_admitted(action)
          ├── cargo build --release
          ├── cargo test
          ├── git commit
          └── witness persisted to Λ-Archivum
```

### Crate Layout

```
packages/phase-mirror-automation/
├── Cargo.toml
├── src/
│   ├── lib.rs
│   ├── governance.rs      # L0Validator + SemanticPolicy re-exports / adapters
│   ├── triple_lock.rs     # TripleLockSuite wrapper with automation-specific witness schema
│   ├── kani_runner.rs     # Spawns `cargo kani`, parses CBOR/test results, returns Admission outcome
│   ├── kilo_mcp.rs        # Stdio MCP server: tools/execute, tools/verify, tools/kani
│   ├── witness.rs         # Witness types + Archivum persistence for automation events
│   └── automation.rs      # Action enum + execute_admitted dispatch
└── tests/
    └── kani_automation.rs  # #[kani::proof] harnesses for governance contracts
```

## 3. Implementation Plan

### Phase 1: Crate Scaffolding & Governance Adapters (Days 1-2)

**Action:** Create `packages/phase-mirror-automation` with `Cargo.toml` and module stubs.

**Target Artifacts:**
- `packages/phase-mirror-automation/Cargo.toml` — workspace member, depends on `phase-mirror-gpt` (re-exported governance types) and `kani`
- `packages/phase-mirror-automation/src/lib.rs` — module declarations
- `packages/phase-mirror-automation/src/governance.rs` — thin wrapper around `phase-mirror-gpt::validator` and `phase-mirror-gpt::domain_invariants`

**Acceptance Criteria:**
- `cargo build -p phase-mirror-automation` succeeds from workspace root
- `cargo test -p phase-mirror-automation` passes unit tests for L0 adapter and policy adapter

### Phase 2: Triple-Lock & Witness Persistence (Days 3-4)

**Action:** Implement `triple_lock.rs` and `witness.rs` using the exact `TripleLockSuite` pattern from `phase-mirror-gpt`.

**Target Artifacts:**
- `packages/phase-mirror-automation/src/triple_lock.rs` — `AutomationTripleLockSuite` wrapping `phase-mirror-gpt::triple_lock::TripleLockSuite`
- `packages/phase-mirror-automation/src/witness.rs` — `AutomationWitness` struct + `Archivum` append using `phase-mirror-gpt::archivum::ArchivumLedger`

**Acceptance Criteria:**
- A fake `BuildAction` passes Triple-Lock and produces a witness hash
- Witness is appended to `MASTER_REGISTRY.md` with chain linking
- `cargo test -p phase-mirror-automation -- --test-threads=1` passes async witness tests

### Phase 3: Kani Verification Harnesses (Days 5-7)

**Action:** Write `tests/kani_automation.rs` with `#[kani::proof]` functions proving:
1. L0 outcome is deterministic for identical `EvaluationContext` and `GovernanceTier`
2. `SemanticPolicy::scan` returns `true` iff the draft contains a forbidden pattern
3. `AutomationAction` admission implies witness hash chain integrity

**Target Artifacts:**
- `packages/phase-mirror-automation/tests/kani_automation.rs`

**Acceptance Criteria:**
- `cargo kani -p phase-mirror-automation` completes with 0 verification failures
- Harnesses run in under 5 minutes on the local workstation (8-core, 32GB RAM)

### Phase 4: Kilo MCP Integration (Days 8-10)

**Action:** Implement `kilo_mcp.rs` as a stdio MCP server that exposes:
- `tools/execute` — admit and run an automation action
- `tools/verify` — run L0 + L1 + Triple-Lock without side effects
- `tools/kani` — run Kani proofs and return witness

**Target Artifacts:**
- `packages/phase-mirror-automation/src/kilo_mcp.rs`
- `.kilo/command/automate.md` — Kilo command definition
- `.kilo/kilo.jsonc` — register `phase-mirror-automation` as MCP server

**Acceptance Criteria:**
- Kilo can invoke `tools/verify` and receive a `VERIFIED` witness
- Kilo can invoke `tools/execute` and see `cargo build --release` output
- Kilo can invoke `tools/kani` and receive proof results

### Phase 5: Self-Governing CI Loop (Days 11-14)

**Action:** Wire the automation crate into a local watchdog that:
1. Watches `packages/phase-mirror-gpt/src/` for mutations
2. On change, automatically runs L0 + L1 + Triple-Lock on the diff
3. Runs `cargo test -p phase-mirror-gpt`
4. Runs `cargo kani -p phase-mirror-gpt`
5. Commits only if all gates pass, with a witness hash in the commit message

**Target Artifacts:**
- `packages/phase-mirror-automation/src/automation.rs` — `watchdog()` and `execute_admitted()`
- `scripts/phase-mirror-automation` — launch script

**Acceptance Criteria:**
- Modifying `validator.rs` and running the watchdog triggers a governed commit
- Commit message contains `witness_hash: <sha256>` and `chain: <sha256>`
- If L0 fails, the watchdog emits a `Block` outcome and refuses to commit

## 4. Consequences

### Positive
- **Self-enforcing methodology**: Phase Mirror's own governance is no longer advisory; it is the only execution path for automated changes.
- **Kani-verified contracts**: The automation engine's admission logic is formally verified, not just unit-tested.
- **Kilo-native**: The automation crate speaks MCP stdio, so Kilo can trigger governed actions without shell scripts.
- **Local resource utilization**: The crate is designed for the local workstation (8-core, 32GB). Kani runs in parallel with `--threads N`. The watchdog uses `notify` (already in `phase-mirror-gpt` dependencies) for efficient filesystem polling.
- **Audit trail**: Every automated action produces a `UnifiedWitness` in `Λ-Archivum`, linking back to the mission ID and chain.

### Negative / Risk
- **Cold-start latency**: First `cargo kani` run on a crate is slow (symbolic execution). The watchdog should cache results and only re-verify changed crates.
- **Binary size**: Adding `phase-mirror-gpt` as a dependency pulls in `tokio`, `notify`, `toml`, `sha2`, `hex`, `anyhow`. The automation binary will be ~15-20MB stripped.
- **Circular dependency risk**: `phase-mirror-automation` depends on `phase-mirror-gpt`, but `phase-mirror-gpt` must not depend on `phase-mirror-automation`. Enforced by workspace topology.

### Neutral
- The crate does not replace existing CI; it augments local development. GitHub Actions remains the remote enforcement layer.
- `adr_rust` is reused for ADR lifecycle but is not a direct dependency; the automation crate serializes ADR status as JSON.

## 5. Security & Governance

This decision enforces the **Sedona Spine Mandate** on the development loop itself:

1. **Non-Bypassability:** Every Kilo-triggered mutation must pass through L0 + L1 + Triple-Lock. The automation crate is the only stdio MCP server registered in `.kilo/` for Phase Mirror actions. No direct `cargo build` invocation from Kilo commands is permitted without the MCP gate.
2. **Immutable Audit:** All automation decisions generate `AutomationWitness` entries in `Λ-Archivum`. The witness chain is appended to `MASTER_REGISTRY.md` atomically.
3. **Zero Drift:** The automation crate's governance adapters are thin wrappers around `phase-mirror-gpt` types, ensuring behavioral consistency. Kani proofs guarantee that adapter logic cannot diverge from the production oracle.

## 6. Dependencies

- `packages/phase-mirror-gpt` — L0 validator, Triple-Lock suite, SemanticPolicy, Archivum ledger
- `kani` (0.67.0) — formal verification harness
- `.kilo/kilo.jsonc` — Kilo configuration for MCP server registration
- `AGENTS.md` — future: add `phase-mirror-automation` to the agent allow-list

## 7. Promotion Criteria

| Criteria Type | Description | Target / Threshold | Status |
| :--- | :--- | :--- | :--- |
| **Compile** | `cargo build -p phase-mirror-automation` succeeds | 0 errors | ⬜ |
| **Unit Tests** | `cargo test -p phase-mirror-automation` | 100% pass | ⬜ |
| **Kani Proofs** | `cargo kani -p phase-mirror-automation` | 0 verification failures | ⬜ |
| **Kilo MCP** | Kilo invokes `tools/verify` and receives `VERIFIED` | End-to-end success | ⬜ |
| **Watchdog** | Local file change triggers governed commit with witness | Functional on `validator.rs` edit | ⬜ |
| **Witness Chain** | `MASTER_REGISTRY.md` chain integrity verified | No broken hashes | ⬜ |
