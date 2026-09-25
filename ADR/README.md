# ADR Governance — Single Source of Truth

This directory is the **canonical home** of the Multiplicity formal ADR
governance system. It supersedes:

* `../../../adr_scaffolding/` (deleted) — the original lightweight scaffolding.
* `../Foundations/ADR/` (deleted) — a stale parallel stub layer that was
  never kept in sync with the canonical type.

All ADR code lives under the `ADR.*` namespace, declared in the lakefile:

```lean
lean_lib ADR where roots := #[`ADR]
lean_exe adrTest where root := `ADR.Test  -- @[test_driver]
```

## Layout

| File | Purpose |
|---|---|
| `Core.lean` | Foundational types: `ADRId`, `ADRStatus`, `ArtifactLink`, `ADR` structure, embedded propositional logic (`PropTerm`, `eval`, `evalB`, `Entails`, `Contradictory`), lifecycle state machine, supersession graph theory, registry coherence predicate. |
| `Proofs.lean` | Machine-checked theorems: immutability, acyclicity, traceability, consequence entailment, conflict symmetry. |
| `Examples.lean` | Production ADRs: `sampleADRList` (ADR-001 … ADR-010) + `allAcceptedADRs` (ADR-0013 … ADR-0028, ADR-0113, ADR-0119, ADR-0120), combined into `unifiedADRList` with verified `unifiedRegistry`. |
| `R4.lean` | Zero-sorry formal model of **ADR-0119** (R4 RnD Foundry, renumbered from `docs/adr/accepted/ADR-0114 R4 RnD Foundry.txt`): homonym lock, deployed kernel contract, `ask` import firewall, local gate discipline, precision question, dissonances/levers, consequence entailment, and the `ADR_0119_Registry` invariants. Ends with six live `#guard_msgs` compile-fail tests that machine-check the type system rejects the forbidden claims (HELM-D admission, multiply/divide/float, resolved dissonances, answered precision question). |
| `Sovereign.lean` | Zero-sorry formal model of **ADR-0120** (Sovereign Transaction Protocol v0.2, with ADR-0121 Experiment ZERO and ADR-0122 red-team closure): 14-stage reference pipeline, the required enumerations (`Representability`, `Admissibility`, `Epistemic`, `Validation`, `Promotion`), the ten normative rules as type-level theorems (UNREPRESENTABLE stops, DENY ≠ UNREPRESENTABLE, LOSSY carries ΔI, DEFER suspension, validation failure negative knowledge, dependency impact/STALE, PROTECTED_UNKNOWN policy, checkpoint integrity, context transparency, portable frontier), the event minimum schema with integrity-chained histories, the 10 red-team closures and 7 open implementation gates, consequence entailment, and the `ADR_0120_Registry` invariants. Ends with six live `#guard_msgs` compile-fail tests that machine-check the type system rejects the forbidden claims. |
| `Migrated.lean` | 9 ADRs (0040, 0041, 0043, 0057–0061, 0064) migrated from the old `adr_scaffolding/` into the canonical namespace. Each is a `def` in the `ADR.Migrated` namespace and discharges the full set of registry invariants. |
| `Export.lean` | Markdown/HTML/JSON export pipeline targeting `docs/adr/accepted/` (the canonical registry home), with `registry.json` and the ledger `README.md`. |
| `Test.lean` | `#[test_driver]` for `lake test`. Exercises: unified registry invariants via `unifiedRegistry`, consequence entailment, positive and negative cases, export determinism. |
| `Theorems/CareViability.lean` | Care Viability thresholds (aggregate audit + averaging blind spot). |
| `Theorems/HardwareInterlock.lean` | SystemVerilog `uac_safety_interlock.sv` ↔ Rust `InterlockClient` isomorphism. |
| `Theorems/Homestead_UCC_Care_Bridge.lean` | Homestead UCC ↔ Care bridge. |
| `Theorems/UacAlpBoundary.lean` | UAC/ALP boundary invariants. |
| `Theorems/HundianPauli.lean` | Hundian term-order / Pauli gate and `M = n_unpaired + 1` (ADR-0064). |

## Building & Testing

From the `packages/Foundry/` directory:

```bash
lake build ADR      # compile the canonical ADR library
lake test           # run the test driver (also re-exports docs/adr/accepted/)
```

From the repository root:

```bash
make adr-index       # regenerate docs/adr/README.md from docs/adr/registry.json (per-ADR .md lives in accepted/)
make adr-sorry-check # verify zero sorry tactics in ADR/ (ADR-0010)
make adr-verify      # unified gate: adr-index + adr-sorry-check + lean build + lake test
```

## Adding a New ADR

1. Edit `Examples.lean` (production ADRs) or `Migrated.lean` (re-located
   historical ADRs). Use the existing record declarations as templates.
2. If the new ADR asserts a propositional claim, add a `PropTerm` claim
   and add it to `sampleClaims` (or `mergedRegistry.claims`).
3. Re-run `lake test`. All invariants are discharged over `unifiedRegistry` (28 records).
4. Re-run `make adr-index` to regenerate `docs/adr/README.md` from `registry.json`.
5. Re-run `make adr-verify` for the full gate.

## Deprecated Shadow Scaffolds

Two legacy copies of the ADR model must **not** be used and are slated for
removal. They carry deprecation banners and are excluded from the CI gate:

| Path | Status | Why it is dangerous |
|---|---|---|
| `ADR/ADR/` | Deprecated (retained for reference) | Declares the *same* `ADR.*` namespace — importing it alongside the canonical modules causes duplicate-declaration clashes. Unreferenced by the build graph. |
| `pirtm/lean/Foundations/ADR/` | Deprecated (separate pirtm project) | Stale parallel stub layer; never synced with the canonical type. Not part of the Foundry Lake project. |

Canonical model: `ADR/Core.lean` (types + invariants), `ADR/Proofs.lean`
(registry theorems), `ADR/Properties.lean` (property-based/concurrency tests),
`ADR/Examples.lean` (records), `ADR/Export.lean` (Markdown/HTML).
