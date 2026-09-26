# ADR-0xx: Lean 4 Formalization Mandate for L0 Invariants

**Status**: Draft  
**Date**: 2026-06-27  
**Owner**: Lean Formalization Lead  
**Related**: ADR-001..ADR-007, Porting TinyLlama.md, ADR-0xx-candle-integration.md

## Context

Sedona Spine L0 invariants require machine-checked guarantees: prime-indexed contractive operators under `Λ_m^op(t)`, failable constructors for successor/stratum predicates, witness preservation with full spectral arrays, and bounded recursion. The existing `Substrates/lean/PIRTM/Core.lean` module establishes the core skeleton, but formalization rigor demands explicit scope, binding rules, and CI gating.

## Decision

1. **Scope**: Minimal core only—`Expr`, `Stratum`, `multiplicityFunctor`, failable `try_successor`/`try_stratum_boundary`, `dist`, `IsContractive`, `WitnessPreserved`, `lambdaMOp`, and `FormalStabilityCertificate`.
2. **No external dependencies**: Zero Mathlib, zero sorries. Core primitives only (`Nat`, `inductive`, `Prop`, `Except`).
3. **Build tool**: Lake with `fixedToolchain: true` and zero package dependencies.
4. **Provenance binding**: `lake-manifest.json` hash is a first-class governance artifact hashed into every `ContractivityReceipt`.
5. **CI gate**: `sedona_spine_ci.yml` runs `lake build` on `Substrates/lean` paths; blocks merge on failure or proof gap.
6. **Integration**: Rust `try_*` constructors annotated with Lean spec references; `FormalStabilityCertificate` fields map 1:1 to `LambdaTrace` / `ContractivityReceipt` fields.

## Core Formalization (current state)

| Lean entity | Rust counterpart | MCP/CLI binding |
|-------------|------------------|-----------------|
| `Expr` | `phase-mirror-gpt::domain_invariants::SemanticPolicy` token | `HandoffEnvelope` payload |
| `Stratum` | `mirror.rs` governance tier | `GovernanceOutcome` enum |
| `multiplicityFunctor` | `validator.rs` permission bits | `EvaluationContext` |
| `try_successor` | `triple_lock.rs` lock attempt | `TripleLockWitness` |
| `try_stratum_boundary` | `archivum.rs` entry commit | `ArchivumEntry` |
| `dist` | L0 validator distance metric | `ValidationOutcome` |
| `IsContractive` | `contractivity.rs` `LambdaMOp` | `ContractivityReceipt::status` |
| `WitnessPreserved` | `witness.rs` `ZeroSpacings` emission | `GenerationWitness` |
| `lambdaMOp` | `contractivity.rs` `scale_residual` | `LambdaTrace` |
| `FormalStabilityCertificate` | `witness.rs` `GenerationWitness` | `contractivity_receipt.json` |

## Consequences

- Positive: Machine-checked contractivity theorem for Successor (`contractive_successor_one`); zero external assumptions; reproducible builds via Lake manifest.
- Negative: Current `dist` is structural (0/1); real tensor-distance deferred. `omega` tactic unavailable for non-linear arithmetic on full `Expr` variants—witness preservation for `stratumBoundary` currently relies on `simp` + contradiction.
- Risk: Full attention-layer contractivity under PIRTM may require retraining. Precision question from `Porting TinyLlama.md` remains open.

## Receipt linkage

```
proof_hash: LEAN_PROOF_HASH_108_CORE
lean_build_hash: <lake build output hash>
lean_manifest_hash: <lake-manifest.json sha256>
```

## Milestones

| Milestone | Owner | Horizon |
|-----------|-------|---------|
| Core.lean compiles zero sorries | Lean Formalization | Done |
| `contractive_successor_one` theorem proven | Lean Formalization | Done |
| Lake build + manifest hash stabilized | Lean Formalization | Done |
| Rust equivalence mapping documented | Compiler Engineering | 14 days |
| CI Lean gate active | DevOps | 7 days |
| Full attention contractivity theorem | Lean Formalization | 14 days |

## References

- `Substrates/lean/PIRTM/Core.lean`
- `Substrates/lean/lakefile.lean`
- `Substrates/lean/lake-manifest.json`
- `pirtm-candle/src/contractivity.rs`
- `docs/adr/Porting TinyLlama.md`
