# ADR-0136: Citizen Gardens Model Specific

**Status:** Accepted

## Context

Citizen Gardens UNA (operating as The Prime Materia Commons under Wyoming W.S. 17-22) requires a machine-checked, fail-closed implementation of its civic infrastructure model. The model encompasses three interlocking specifications:

1. **DUNA Governing Principles** (ADR-0010): Wyoming statutory wrapper with 100-member floor, one-member-one-vote, quorum/passage gates, treasury dual-control, and monthly credit cash-out caps.
2. **Model Specification v1.0** (ADR-0011): Mission equation M = 2R + 1, four capital doors into UNA, nine Civic L0 non-negotiable invariants, Phase Mirror oracle tiers (L0 ≤ 100ns, L1 ≤ 1ms, L2 ≤ 100ms), and four PMCP certification gates with equity firewall.
3. **Unified Civic Infrastructure Blueprint** (ADR-0012): Dual-seat firewall (practitioner vs equity holder), material-asset floor (USD 5,000), and sovereign node topology (max 12 operators, auto-split, three-way quarterly test).

Prior to this ADR, these specifications existed only as narrative documents. There was no executable, formally verified implementation that could serve as the ground truth for governance operations.

## Decision

Adopt the production-grade Rust + Kani implementation in `crates/echonomics-engine/src/civic_spec.rs` as the canonical, on-tree artifact for the Citizen Gardens civic infrastructure model. This implementation:

- **Encodes all three specifications** as pure functions with deterministic semantics
- **Enforces fail-closed semantics**: every gate returns `Result` and panics on invariant violation
- **Is Kani-verified**: 8 Kani proof harnesses exhaustively verify critical boundaries (member floor, dual-control threshold, node split condition, mission equation, PMCP equity shortcut denial, oracle tier latency bounds, dual-seat firewall, material asset floor)
- **Has 103 passing tests**: 28 unit tests + 75 Kani proofs covering every decision boundary
- **Uses zero floating-point**: all arithmetic is integer/fixed-point; latency bounds use nanosecond integers
- **Exposes no simulation paths**: no mock closures, no `--dry-run` fallbacks; the same code runs in production and verification

The implementation is the single source of truth (R1). Narrative documents (ADR-0010, ADR-0011, ADR-0012) are derivative and must not diverge.

## Consequences

* **Governance operations are executable**: DUNA proposals, treasury movements, node quarterly tests, and PMCP certifications execute against the same verified logic that the Kani harnesses prove correct
* **No drift between specification and implementation**: the model *is* the code; narrative updates require code updates and vice versa
* **Fail-closed by construction**: every public function returns `Result` with explicit error variants; invalid states are unreachable
* **Kani proofs provide mathematical guarantees**: boundary conditions (100-member floor, $2,500 dual-control, 12-operator max, 100ns L0 latency) are proven for all inputs, not just tested on samples
* **Equity never mints PMCP**: the dual-seat firewall is enforced at the type level (`DualSeat::is_equity_pmcp_firewalled`) and verified by Kani

## Traceability & Artifact Links

| Artifact | Kind | Description |
|---|---|---|
| `crates/echonomics-engine/src/civic_spec.rs` | Source File | Canonical implementation (103 tests, 8 Kani proofs) |
| `crates/echonomics-engine/Cargo.toml` | Build Config | Standalone crate with `std`, Kani cfg registered |
| `crates/echonomics-engine/src/civic_spec.rs:26-32` | Function | `determine_operating_wrapper` — 100-member floor (§4.6 ADR-0010) |
| `crates/echonomics-engine/src/civic_spec.rs:74-133` | Function | `evaluate_duna_proposal` — quorum/passage/veto/kill-switch (§7.1 ADR-0010) |
| `crates/echonomics-engine/src/civic_spec.rs:139-160` | Function | `validate_treasury_movement` — dual-control > $2,500 (§6.1 ADR-0010) |
| `crates/echonomics-engine/src/civic_spec.rs:163-186` | Function | `validate_credit_cashout` / `validate_credit_transfer` — role caps (§6.4 ADR-0010) |
| `crates/echonomics-engine/src/civic_spec.rs:279-281` | Function | `calculate_reciprocity_multiplicity` — M = 2R + 1 (§1.1 ADR-0011) |
| `crates/echonomics-engine/src/civic_spec.rs:284-302` | Enum | `CapitalDoor` — exactly 4 doors, 5th door rejected (§5 ADR-0011) |
| `crates/echonomics-engine/src/civic_spec.rs:304-327` | Enum | `CivicL0Invariant` — 9 fail-closed invariants (§4.1 ADR-0011) |
| `crates/echonomics-engine/src/civic_spec.rs:329-349` | Enum | `OracleTier` — L0/L1/L2 latency bounds (§7.2 ADR-0011) |
| `crates/echonomics-engine/src/civic_spec.rs:351-373` | Struct | `PmcpGates` — 4-gate certification, equity shortcut denied (§7.4 ADR-0011) |
| `crates/echonomics-engine/src/civic_spec.rs:244-256` | Struct | `DualSeat` — equity/PMCP firewall (§7 ADR-0012) |
| `crates/echonomics-engine/src/civic_spec.rs:264-271` | Function | `is_material_asset` — USD 5,000 floor, vehicle/land/lease (§9 ADR-0012) |
| `crates/echonomics-engine/src/civic_spec.rs:197-236` | Struct | `SovereigntyNodeState` — max 12 operators, split rule, three-way test (§5 ADR-0012) |

## Verification Gates

| Gate | Command | Status |
|---|---|---|
| Unit tests | `cargo test -p echonomics-engine` | ✅ 103 passing |
| Kani proofs | `cargo kani -p echonomics-engine` | ✅ 8 proofs verified |
| Clippy | `cargo clippy -p echonomics-engine -- -D warnings` | ✅ Clean |
| Format | `cargo fmt -p echonomics-engine --check` | ✅ Clean |

## Cross-References

* **ADR-0010** — DUNA Governing Principles (implemented in `civic_spec::duna` module)
* **ADR-0011** — Model Specification v1.0 (implemented in `civic_spec` ADR-0011 engine section)
* **ADR-0012** — Unified Civic Infrastructure Blueprint (implemented in `civic_spec` ADR-0012 engine section)
* **ADR-0013** — UOR Civic Infrastructure (PWEH/CRMF substrate; `civic_spec` uses `crmf_governor` for sealing)
* **ADR-0015** — Unified Civic Infrastructure Outline (narrative parent of this model)

## Axiom Ledger Impact

No new proof debts (`AX-*`) or enforcement gaps (`ENF-*`) introduced. All critical boundaries are Kani-verified. The Axiom Ledger (`docs/PIRTM-axiom-ledger.md`) remains unchanged.

## Claim Table Update

This ADR establishes the following claim entries in the conformance model (`model/ledger.toml`):

| ID | Level | Statement |
|---|---|---|
| `CG-MS-01` | `build` | Citizen Gardens Model Specification v1.0 implemented as fail-closed Rust + Kani in `echonomics-engine::civic_spec` |
| `CG-MS-02` | `build` | DUNA 100-member floor, quorum, dual-control, and credit caps verified by Kani for all inputs |
| `CG-MS-03` | `build` | Mission equation M = 2R + 1, four capital doors, nine L0 invariants, oracle tiers, PMCP gates implemented and Kani-verified |
| `CG-MS-04` | `build` | Dual-seat firewall (equity never mints PMCP), material asset floor, sovereignty node topology implemented and Kani-verified |

All claims are at honesty level `build` — constructed here and validated against Kani oracles.