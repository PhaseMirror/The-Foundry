# Phase Mirror Audit: ri1-hybrid-engine

**Date**: 2026-09-21
**Scope**: `packages/Foundry/crates/ri1-hybrid-engine/ri1-hybrid-engine/`
**Workspace**: 9 crates (ri1-audio, ri1-cli, ri1-code, ri1-core, ri1-image, ri1-signal, ri1-symbolic, ri1-symbolic-meta, ri1-text)
**Foundry workspace member**: No — `crates/ri1-hybrid-engine` is not listed in `packages/Foundry/Cargo.toml` members. Falls under `crates/` ("legacy; not workspace members").
**Baseline tests**: 22 passed, 0 failed
**Post-resolution tests**: 22 passed, 0 failed
**Compiler warnings**: 14 (baseline) → 1 (post-resolution, Token.idx intentional)

---

## Audit Methodology

This audit surfaces productive contradictions and hidden assumptions in the ri1-hybrid-engine crate, converts them to ADRs, and tracks resolutions. The canonical ADRs are org-level markdown files at `packages/Foundry/docs/adr/ADR-0114.md` through `ADR-0118.md`. Crate-local `.tex` drafts under `docs/adr/` are superseded and retained as evidence only.

This document does NOT self-reference as proof of completion. It records what was found and what was done. Whether this constitutes Phase Mirror closure depends on governance decisions outside this crate's scope.

---

## Contradictions Surfaced

| ID | Contradiction | Severity | Org ADR |
|----|--------------|----------|---------|
| C-069 | README claims multimodal; `Constraint::check(&str)` is text-only | High | ADR-0114 |
| C-070 | Orchestrator stores history but never surfaces it | Medium | ADR-0115 |
| C-071 | tokio runtime dependency with zero async usage | Medium | ADR-0116 |
| C-072 | OperatorClass enum (30 variants) as taxonomy without dispatch | Low | ADR-0117 |
| C-073 | Orchestrator lacks doc comment despite meta-engine complexity | Low | ADR-0118 |

## Hidden Assumptions Named

| ID | Assumption | Implies |
|----|-----------|---------|
| H1 | "Multimodal" refers to generation, not constraint evaluation | Constraint text-only scope is intentional for now |
| H2 | last_meta_log/last_results were intended as debug buffers | No public API needed them yet |
| H3 | tokio was forward-looking, not currently needed | Synchronous orchestration is sufficient |
| H4 | OperatorClass variants are taxonomy labels | No match/dispatch on variants exists |
| H5 | Orchestrator doc comment predated meta-engine integration | Doc was never updated |

---

## ADRs

### Org-level (canonical)

| ADR | Title | File | Status |
|-----|-------|------|--------|
| ADR-0114 | Constraint Trait Generic Over Content Type | `docs/adr/ADR-0114.md` | Accepted |
| ADR-0115 | Orchestrator History via Interior Mutability | `docs/adr/ADR-0115.md` | Accepted |
| ADR-0116 | tokio Runtime Dependency Removed from ri1-core | `docs/adr/ADR-0116.md` | Accepted |
| ADR-0117 | OperatorClass as Documented Taxonomy | `docs/adr/ADR-0117.md` | Accepted |
| ADR-0118 | Orchestrator API Documentation | `docs/adr/ADR-0118.md` | Accepted |

### Crate-local (superseded, retained as evidence)

| ADR | File | Superseded By |
|-----|------|--------------|
| ADR-069 | `docs/adr/ADR-069-constraint-multimodal-contract.tex` | ADR-0114 |
| ADR-070 | `docs/adr/ADR-070-orchestrator-history-access.tex` | ADR-0115 |
| ADR-071 | `docs/adr/ADR-071-tokio-dependency-without-async.tex` | ADR-0116 |
| ADR-072 | `docs/adr/ADR-072-operatorclass-enum-as-taxonomy.tex` | ADR-0117 |
| ADR-073 | `docs/adr/ADR-073-orchestrator-doc-code-mismatch.tex` | ADR-0118 |

---

## Resolutions Applied

### ADR-0114: Constraint Trait Generic Over Content Type
**Resolution**: Changed `Constraint` to `Constraint<T = str>` with default `T = str`. Added `ConstraintResult::pass/fail/fail_soft` constructors. Added doc examples showing both text (`Constraint<str>`) and binary (`Constraint<[u8]>`) usage. Existing implementations unchanged.

### ADR-0115: Orchestrator History via Interior Mutability
**Resolution**: Wrapped `last_meta_log` and `last_results` in `RefCell`. Populated both fields in `evaluate()`, `evaluate_with_events()`, and `generate()`. Accessors `last_meta_events()` and `last_results()` now return cloned `Vec<T>` with actual accumulated data.

### ADR-0116: tokio Dependency Removed
**Resolution**: Removed `tokio` from `crates/ri1-core/Cargo.toml`. Verified all tests pass without it.

### ADR-0117: OperatorClass Taxonomy + Dead Code Cleanup
**Resolution**: Documented OperatorClass as taxonomy (not dispatch). Removed `op()`, `cond()`, `DeltaOutcome.irreversible`, `RuleViolation`. Added `operator_class_taxonomy_complete()` test confirming all 29 variants.

### ADR-0118: Orchestrator Documentation
**Resolution**: Added struct doc comment listing capabilities, meta-engine integration, and accessor methods. Added method doc comments for `last_meta_events()` and `last_results()`.

---

## Workspace Membership Status

ri1-hybrid-engine is NOT a Foundry workspace member. Key implications:

- Crate-local `.tex` ADRs cannot close Foundry governance
- No CI binding exists for this crate
- The crate is listed under `crates/` ("legacy; not workspace members") per `packages/Foundry/README.md`
- ADR-0114 through ADR-0118 are org-level at `docs/adr/` and recorded in `registry.json`

**Decision required**: Should ri1-hybrid-engine become a Foundry workspace member (added to `Cargo.toml` members, unified README, CI binding) or remain a nested non-member crate (ADR scope is crate-local only)?

---

## Compiler Warning Reduction

| Category | Before | After |
|----------|--------|-------|
| ri1-core lib | 2 warnings (unused events, dead last_results) | 0 |
| ri1-symbolic-meta lib | 5 warnings (op, cond, irreversible, RuleViolation, Token.idx) | 1 (Token.idx - intentional) |
| ri1-cli | 0 | 0 |
| Other crates | 0 | 0 |

---

## Test Results

### Baseline
- 22 tests passed, 0 failed
- 14 compiler warnings across workspace

### Post-Resolution
- 22 tests passed, 0 failed
- 1 compiler warning (Token.idx - intentional informational)

---

## Next Actions

| Owner | Action | Metric | Horizon |
|-------|--------|--------|---------|
| Governance steward | Determine workspace membership: member or archive | Cargo.toml members list | Immediate |
| Package maintainer | If member: add to Cargo.toml, unify README, bind CI | CI workflow URL | 30 days |
| Future audit | Evaluate if multimodal constraint evaluation (ADR-0114) is needed | ADR-0114 status | Future |
| Future audit | Populate Orchestrator history with bounded retention | ADR-0115 status | Future |
| Future audit | Re-add tokio via ADR when async orchestration needed | ADR-0116 status | Future |
