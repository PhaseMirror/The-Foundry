# Dissonance Register

Canonical machine-readable form: `compliance/governance/DISSONANCE-REGISTER.json`
This file is the rendering. Enforced by `python3 scripts/verify_governance_gates.py`.

A **dissonance** here is a gap between a claim the repository makes and an
artifact that exists on this tree. Naming one is a diagnostic act; per
`ADR/R4.lean:432-456` it is not by itself a resolution. An entry counts as
`resolved` only when a physical artifact exists **and** a command on this tree
proves it.

Severity vocabulary is `Foundations/Dissonance/Core.lean` (`Critical | High |
Medium | Low`). Lever vocabulary is `ADR/R4.lean` (`owner | lever | metric |
horizon`), rendered below as *Owner / Horizon / Proof*.

Proof-debt entries (`sorry`, admitted axioms) are **not** here. They live in
`state/alp_sorry_manifest.json`. The checker reports **13** manifested
`sorry`/`admit` sites in build scope, all anchored to their declaration, plus
**37** unmanifested sites in the `attic/` archive (D-16). An earlier revision of
this file claimed the checker "passes clean: zero sorry/admit tactics", which
was false — see D-15 for why it reported zero.

## Summary

| id | dissonance | severity | status | owner | horizon |
|----|-----------|----------|--------|-------|---------|
| D-01 | CI governance gate had never executed | Critical | **resolved** | Foundry maintainer | closed |
| D-02 | L0 small-gain term in Harmonia is a tautology | Critical | open — precision question | Formal steward | 28d |
| D-03 | Hilbert–Pólya operator is not contractive | Critical | open — left red on purpose | Formal steward | 28d |
| D-04 | `pirtm-core` could not be built at all | High | **resolved** | Compiler owner | closed |
| D-05 | `harmonia.rs` outside the compilation graph | High | **resolved** | Compiler owner | closed |
| D-06 | PIRTM type-gate suite was dead, API-drifted | High | **resolved** | Compiler owner | closed |
| D-07 | `SquarefreeComposite` accepted 0, 1 and primes | High | **resolved** | Compiler owner | closed |
| D-08 | Both lake manifests had `fixedToolchain: false` | High | **resolved** | Foundry maintainer | closed |
| D-09 | Two `lean-toolchain` pins disagreed | High | **resolved** | Foundry maintainer | closed |
| D-10 | 31 ADR `ArtifactLink`s point at absent files | Medium | open — baselined | Formal steward | 90d |
| D-11 | ADR-049-A gate can never be vacuous-ok | Medium | open — decision needed | Formal steward | 28d |
| D-12 | AGENTS.md described a tree that does not exist | Medium | **resolved** | Foundry maintainer | closed |
| D-13 | PM loop reports a stale sorry count | Low | open | Formal steward | 90d |
| D-14 | `lean/lakefile.toml` is dead config | Low | open | Formal steward | 90d |
| D-15 | Sorry scanner reported PASSED with 13 untracked sorries | Critical | **resolved** | Formal steward | closed |
| D-16 | `attic/` holds 37 unmanifested sorry sites | Medium | open — reported, not scored | Formal steward | 90d |
| D-17 | 3 `pirtm-core` test targets import a deleted `pirtm_rs` API | High | open — quarantined | Compiler owner | 28d |

## The root cause

D-01 is the load-bearing entry. **The CI governance gate had never run green**,
because every workflow referenced a directory layout that does not exist on
this tree:

- `ci.yml` → `packages/Echonomics`, `packages/PIRTM`
- `governed_toolchain.yml` → `PIRTM/`, `PIRTM/rust`, `PIRTM/pirtm-governed-toolchain`

Both workflows failed at their first `cd`. No workflow verified
`lean --version` against `lean-toolchain`, and no workflow referenced
`fixedToolchain`. A permanently-red gate trains everyone to ignore red, so
nothing downstream was ever observed: D-03 through D-09 are all direct
consequences of a gate that could not fail for the right reason.

Resolution: `scripts/verify_governance_gates.py` now makes each of those
claims falsifiable, `ci.yml` builds the real trees, and
`governed_toolchain.yml` was retired with its intent absorbed into `ci.yml`.

## The second load-bearing entry

D-15 is the same failure shape as D-01, one layer down. `check_adr_sorry.py`
scanned `['ADR', 'Care', 'PirtmAuthBoundary']` — two of those three roots **do
not exist** on this tree — while omitting `Foundations/`, which holds 2108
`.lean` files and every one of the 13 manifested sorries. It walked the one
genuinely clean directory, found nothing, and printed `PASSED`. The 13 live
sorries appeared only as a `WARNING` behind a zero exit code, so any caller
checking the return code saw green while `lake build` warned
`declaration uses 'sorry'` at `Foundations/Kappa/Examples.lean:75,143,153`.

The pass condition was effectively *"the directory I forgot to scan contains no
debt"*. The scan roots now track the lakefile's live roots, a missing required
root is a hard failure rather than a silently smaller sweep, ghosts and anchor
drift are failures instead of warnings, and `verify_governance_gates.py`
consumes the scanner's JSON so there is one tokenizer rather than two that
disagree.

## What was deliberately *not* changed

Three items are open because the correct fix is a design decision with a named
owner, not a repair. Fixing them silently would be the simulation-as-proof
failure the methodology forbids.

**D-02 — the tautological small-gain gate.** `harmonia.rs:132` computes
`λ_eff = 0.97 · 1/(1 + |Δ|·0.03) ≤ 0.97` for every reachable input, so the
`λ_eff < 1.0` test at line 134 can never fail. *Precision question:* should
`λ_eff` be a function of the operator norm in a way that can exceed 1.0, or is
the 0.97 ceiling intended with the `+1.03` norm slack as the real gate? If the
former, what is the correct small-gain form? The defect is pinned by
falsifiable tests `defect_l0_small_gain_term_is_tautological` and
`defect_self_transition_is_always_contractive`, so a repair forces a ledger
update rather than passing silently.

**D-03 — the Hilbert–Pólya contractivity claim is false.**
`build_hp_operator(&[2,3], cutoff=2)` has Frobenius norm² = 2.0204, and the
test asserting `< 1.0` fails. It is left **red on purpose**: relaxing the
assertion to match the observed value would convert a false claim into a
passing test. *Precision question:* is the cutoff-2 operator intended to be
contractive? If so the construction is wrong; if not, the L0 claim attached to
it must be withdrawn.

**D-11 — the ADR-049-A gate.** The ADR's stated scope is paths whose *names*
contain seal/Groth16/on-chain; the drop-in greps file *contents*. On this tree
that is 197 files versus 8, and 856 of 978 token matches are Rust's `Sealed`
trait pattern rather than SNARK sealing. The two honest repairs point opposite
ways — gate on names, or keep the content scan and accept permanent red — so
the choice is escalated rather than taken. The gate *logic* is sound: all 7
isolated fixtures behave as specified, including empty-allowlist fails-closed,
the 5087 cap boundary, and nested manifest paths.

## Metric

`python3 scripts/verify_governance_gates.py` — 15 gates, currently 15/15.
It fails on: a workflow `cd` that does not resolve, disagreeing governed
toolchain pins, a resolved `lean` that does not match its pin, any **new**
missing ADR `ArtifactLink` beyond the 31 baselined in
`adr-link-baseline.json`, a required sorry-scan root that has gone missing, any
unmanifested `sorry`/`admit` in build scope, any ghost entry or drifted
file+line anchor in the sorry manifest, and the register's own invariants
(severity vocabulary, proof command per resolved entry, escalation per open
Critical, owner and horizon per entry).

`fixedToolchain` is enforced indirectly rather than by a `!= true` comparison:
`lake` rewrites that key, so the gate instead asserts the resolved `lean`
version equals the `lean-toolchain` pin, which is the property `fixedToolchain`
is supposed to guarantee. Both manifests now record `"fixedToolchain": true`,
which is stable across `lake build`.
