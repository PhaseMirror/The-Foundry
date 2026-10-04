<!-- Fragment ID: CERTIFY-CONSTANTS-GATE-SPEC -->
<!-- Version: 0.1 (4 October 2026) -->
<!-- Status: Draft. Normative determinations incomplete. Blocks adoption. -->

# Spec: `certify_commutator` — the ZMOS commutator-bound gate

**Fragment ID:** `CERTIFY-CONSTANTS-GATE-SPEC`
**Version:** 0.1 (4 October 2026)
**Status:** **Draft — normative determinations incomplete (§9). Blocks adoption of any artifact depending on this gate.**
**Specifies:** `packages/rust/pirtm-monitor/src/certify_constants.rs:127–137`
**Exists because:** the implementation disagrees with its own documentation, and no specification exists to disagree with. See §0.

**Verifiable Anchor Command (the specified file)**
`sha256sum packages/rust/pirtm-monitor/src/certify_constants.rs`
**Output:** recorded in the sidecar `CertifyConstants-Gate-Spec.md.sha256` — which digests this spec, not the target. To bind the target, read its digest from §7.1 at the commit you are reviewing.

---

## 0. Why this document precedes any harness

A checker verifies an implementation against a specification. Where the specification is derived from the implementation, the checker is a circular oracle: it re-confirms what the code already says and cannot detect a mismatch between code and intent, because intent was never independently stated.

That is the present condition. The only prose describing this gate is the doc comment at `certify_constants.rs:124–126`, which is **part of the artifact under test**. No Lean statement exists (`Foundations/UOR/Structures.lean:614–616, 800` declares only `commutatorValue : Option P.Decimal` and a `Commutator` observable — types carrying an optional decimal, with no norm identity, no bound, and no theorem). So a Kani or Lean harness written today would check the implementation against itself.

**Order of work: spec (this document) → harness → proof.** The harness is downstream of §9 being closed.

**Discipline.** Where this tree does not determine an answer, this spec records the gap and marks it blocking. It does **not** substitute a plausible value. In particular §5 declines to state a value for `C_MAX`, because the only candidate values on tree are unsourced literals and laundering one of them into a normative requirement would convert an undocumented constant into a documented error.

### 0.1 Claim scope by tree

Findings in this spec differ in whether they travel. `main`'s tip is `c7187410`. Every path cited below was checked with `git ls-tree main -- <path>`.

| Finding | Path scope | Travels? |
|---|---|---|
| Two `certify_constants.rs` copies enforcing `4.0` and `2.71` | `packages/rust/pirtm-monitor/`, `packages/rust/monitor/` | **yes — on `main`** |
| Two manifests both declaring package and binary `pirtm-monitor` | as above | **yes — on `main`** |
| `cargo` cannot load the `packages/` workspace; member `phase-mirror-surface` absent | `packages/Cargo.toml` on `main`, directory absent | **yes — on `main`** |
| Frobenius at L131 vs spectral at L126; non-strict gate at L132 | `packages/rust/pirtm-monitor/` | **yes — on `main`** |
| Core gate strict: `c < 1` | `Governance/docs/Ξ-Constitutional-Core.md` | **yes — on `main`** |
| Core discharge `κ < 1/M` ⟹ `c ≤ κM < 1` | `Governance/multiplicity/Multiplicity_Lawful_Recursion.tex` | **yes — on `main`** |
| No Lean specification of the gate | `Foundations/UOR/Structures.lean` | **yes — on `main`** |
| A **third** `certify_constants.rs` copy | `packages/PIRTM/rust/pirtm-monitor/` | **no — local-tree only** |
| A **third** gate G3 (ADR-073, TS `contractivity_score`) | `packages/multiplicity-crypto/` | **no — local-tree only** |

A finding marked *local-tree only* is a claim about branch `adr/0139-lexlean-declared-submodule` and is not checkable from `main`. It is recorded so a reader holding that branch can verify it, and it carries no weight for a reader who is not.

---

## 1. Scope

In scope: `certify_commutator`, its bound constant, its strictness, its error path, its packaging, and its relationship to any other contractivity gate.

Out of scope: `certify_alpha` (shares the module and the unsourced-constant pattern, but is a separate unit); `certify_commutator`'s numerical conditioning; the κ schedule in `lib.rs`. The gate's input path is settled by inspection — it takes a `usize` and returns an `f64`, materialising the matrix before measuring it, so it is navigate-then-verify and raises no residue-access, subtree-folding, or succinct-encoding question.

---

## 2. The unit under specification

```rust
pub fn certify_commutator(grid_n: usize) -> Result<f64, CertError>
```

| | |
|---|---|
| Input | `grid_n: usize` — uniform discretisation size |
| Output (Ok) | `f64` — the measured norm, per §3 |
| Output (Err) | `CertError`, formatted `"Commutator norm {} exceeds C_MAX {}"` |
| Side effects | none; no I/O, no global mutation |
| Determinism | pure function of `grid_n`; no randomness, no clock, no I/O |
| Construction | `D = diag(log p_i)` over the first `grid_n` primes; `H_m` a Fourier multiplier; `comm = DH_m − H_m D` |

---

## 3. Norm identity — DETERMINED

The gate measures the **Frobenius norm** of the commutator matrix:

$$\lVert [D, H_m]\rVert_F \;=\; \sqrt{\sum_{i,j} a_{ij}^2}$$

implemented at `certify_constants.rs:131`. The doc comment at L126 names the **spectral (operator) norm**, which the code does not compute.

Since Frobenius is the $\ell^2$ norm of the singular values and $\sigma_{\max}^2 \le \sum_i \sigma_i^2$, we have $\lVert A\rVert_F \ge \lVert A\rVert_{\mathrm{op}}$. Therefore:

- **What a pass asserts.** `norm <= C_MAX` at L132 establishes $\lVert A\rVert_{\mathrm{op}} \le \lVert A\rVert_F < C_{\max}$. The operator norm clears the bound. *Normative: a pass is sound for the spectral claim.*
- **What a fail asserts.** Nothing. A matrix may satisfy $\lVert A\rVert_F \ge C_{\max}$ while $\sigma_{\max} < C_{\max}$. *Normative: a fail is inconclusive about the spectral claim.*
- **Asymmetry.** The gate is one-sided. It cannot accept what the operator norm would reject; it can reject what the operator norm would accept. **Risk direction is liveness (spurious halt), not divergence.**
- **Magnitude of the false-reject rate** depends on the singular-value spread and is not determined by this tree: near rank-one, $\lVert A\rVert_F \approx \lVert A\rVert_{\mathrm{op}}$ and the gap is negligible; flat spectrum, $\lVert A\rVert_F \approx \sqrt{n}\,\lVert A\rVert_{\mathrm{op}}$.

**Normative requirement N-1.** The returned `f64` shall be documented as the Frobenius norm, and the doc comment at L126 corrected. Any consumer matching this value against an operator-norm budget is comparing incommensurable quantities and must not do so without converting.

**Normative requirement N-2.** If the *intent* was an operator-norm certificate, the implementation is wrong and must compute $\sigma_{\max}$ — not merely relabel the Frobenius value. §9 item 2 must be answered before N-2 can be discharged, because the intent is not recorded anywhere on tree.

---

## 4. Strictness — DETERMINED

The gate is **non-strict**: `if norm <= C_MAX` (L132). A value exactly equal to `C_MAX` **passes**.

This is in deliberate contrast to the Core's own gate, which is **strict**: `sup_p λ_p (L_{A,p} + L_{B,p} + L_{E,p}) = c < 1` (`Governance/docs/Ξ-Constitutional-Core.md:34`), discharged as $\kappa < 1/M$ yielding $c \le \kappa M < 1$ (`Governance/multiplicity/Multiplicity_Lawful_Recursion.tex:592–596`). Both halves of the Core's condition are strict; the borderline $\kappa M = 1$ **fails**.

**Normative requirement N-3.** The strictness of this gate shall be stated as a deliberate choice and justified against the Core's strict gate, or changed to match. At present the difference is undocumented, so a reader cannot tell whether non-strictness is a decision or an oversight.

---

## 5. What `C_MAX` is — **UNDETERMINED. BLOCKING.**

Three values exist on tree for the same constant:

| Path | `C_MAX` | Its own doc comment says |
|---|---|---|
| `packages/rust/pirtm-monitor/src/certify_constants.rs:26` | `4.0` | `C ≤ 2.71` (L8) |
| `packages/PIRTM/rust/pirtm-monitor/src/certify_constants.rs:26` | `4.0` | `C ≤ 2.71` (L8) |
| `packages/rust/monitor/src/certify_constants.rs:26` | `2.71` | `C ≤ 2.71` (L8) |

**On `main` the count is two, not three.** The two rows above `packages/PIRTM/…` are present on `main` (`git ls-tree main -- packages/rust/monitor/src/certify_constants.rs` resolves; `packages/PIRTM/rust/pirtm-monitor/…` does not). The third copy is a **local-tree claim** on branch `adr/0139-lexlean-declared-submodule`, the same class as `8a0b6d9a`, and is recorded here only so a reader holding that branch can check it. The portable finding is two directories, one binary name, two enforced bounds.

**No derivation for either value exists on tree.** A search across `.rs`, `.md`, `.tex`, `.toml`, `.json`, and `.lean` for `2.71` returns the doc comments above and nothing else that is on topic; the remaining hits are coincidences (a sync statistic `492.718`, `exp 1 ≈ 2.7182818283` in a vendored Mathlib file, a substring of an npm integrity hash). `4.0` likewise has no derivation.

This resolves the question of whether the divergence is a transcription error or a substantive disagreement: **neither.** There is no common source to be a transcription of. Both values are unsourced literals, and one copy silently ships a bound 47.6% wider than another copy of the same file, under an identical comment naming the narrower figure.

The closest governance analogue on tree is a different mechanism and a different quantity: `Governance/q-calculator/The Mirror Dissonance Protocol.md:1211, 1439` defines an L0 commutator invariant with $\varepsilon_{\max} = 0.1$ as the "95th percentile of observed commutator norms during stable operation" — an empirical percentile established by observation, not an analytic certified bound, and not either candidate value.

**This spec therefore does not state what `C_MAX` is.** §9 item 1 must be answered by producing a derivation, after which the value and its provenance are recorded here.

---

## 6. Relationship to the Core's `c` — DETERMINED: independent conditions (two on `main`)

Three gates exist:

| # | Gate | Location | Form |
|---|---|---|---|
| G1 | Core contraction | `Ξ-Constitutional-Core.md:34` | $\sup_p \lambda_p (L_{A,p}+L_{B,p}+L_{E,p}) = c < 1$ — **strict** |
| G2 | This gate | `certify_constants.rs:132` | $\lVert[D,H_m]\rVert_F \le C_{\max}$ — **non-strict** |
| G3 | L0-5 contractivity score | `ts/src/feedback.ts:36–57`, per `packages/multiplicity-crypto/docs/ADR-073-Contractivity-Gate.md` (Accepted) — **local-tree only, absent from `main`** | `contractivity_score > 0 && contractivity_score <= 1.0` |

**These are independent safety properties, not implementations of one condition. On `main` there are two (G1, G2); G3 exists only on this working tree.** Evidence:

- `certify_commutator`'s output has no consumer. Its only call sites are `run_certification()` (L218), which `println!`s it, and the test at L233. `run_certification` is invoked from each crate's `src/main.rs:6` and is therefore a **binary entry point, not a ledger wire** — it prints a number and exits; nothing records it.
- No artifact on tree derives G1's $c$ from G2's `norm` — not as $c = \kappa\cdot\text{norm}$, not as $c = \text{norm}/C_{\max}$, not in any form. A search for any such derivation across `packages/`, `crates/`, and `src/` returns nothing.
- ADR-073 records "No per-channel ledger" logging $(\lambda_p, L_p, \lambda_p L_p, ACE_p, projector\_status)$, and orders that documentation referencing "c < 1 enforcement" be removed or qualified as "inequality implemented, not wired to Core ledger" absent tests. That is the ADR's own characterisation of G3, not an inference from it. **Both the ADR and the TypeScript it governs are absent from `main`** (`git ls-tree main` resolves neither), so on `main` this citation is unavailable and the gate count is two.

**Consequence.** Satisfying any one gate says nothing about the others. G2 passing does not discharge G1; G1's holding does not imply G2 passes. The reconciling artifact — a derivation relating them — does not exist.

**Normative requirement N-4.** Either a derivation relating G1, G2, and G3 shall be produced, or the three shall be declared independent in the documents that cite them, so that no reader infers a single condition from three conformances. Until then, "the contractivity gate is enforced" is an ambiguous sentence.

---

## 7. Build determinism

### 7.1 Two copies and two manifests on `main`; one binary name

`certify_constants.rs` exists at three paths on this tree, **two of them on `main`** (§5). Separately, **three** `Cargo.toml` files declare the package name `pirtm-monitor` and the binary name `pirtm-monitor`, **two of them on `main`**:

| Manifest | Package | Binary |
|---|---|---|
| `packages/rust/pirtm-monitor/Cargo.toml` | `pirtm-monitor` | `pirtm-monitor` |
| `packages/rust/monitor/Cargo.toml` | `pirtm-monitor` | `pirtm-monitor` |
| `packages/PIRTM/rust/pirtm-monitor/Cargo.toml` *(local-tree only)* | `pirtm-monitor` | `pirtm-monitor` |

A build therefore produces a binary called `pirtm-monitor` whose certified bound is determined by **which directory the build was invoked from**, silently, with no diagnostic distinguishing 2.71 from 4.0.

### 7.2 The question cannot currently be settled by cargo

The intended check is `cargo tree -p pirtm-monitor | grep -E 'pirtm-monitor|monitor'`. On this tree it does not run:

```
$ cargo tree --offline            # from packages/rust/pirtm-monitor
error: failed to load manifest for workspace member
  `.../packages/phase-mirror-surface`
referenced by workspace at `.../packages/Cargo.toml`
Caused by: failed to read `.../packages/phase-mirror-surface/Cargo.toml`
Caused by: No such file or directory (os error 2)
```

`packages/Cargo.toml` is a second workspace root (declared, with a member list and an explicit `exclude` list) whose member `phase-mirror-surface` **does not exist on disk**. Unlike the other findings in this spec, this one is **on `main`** — the manifest is on `main` and the directory is absent there too, so the defect is portable rather than branch-local. Because `packages/rust/pirtm-monitor` lies beneath that root, every cargo invocation from it fails to load the workspace. `cargo metadata --offline --no-deps` fails identically.

So the link-time resolution question is not merely unanswered — it is currently **unaskable**, and the binary's provenance cannot be established by cargo at all.

**Normative requirement N-5.** The duplicated package and binary names shall be disambiguated, or the copies reduced to one with a generated constant, before any build of this binary is treated as certifying anything.

---

## 8. Test obligations the current suite does not meet

The suite contains one test for this gate:

```rust
#[test]
fn test_certify_commutator() {
    let res = certify_commutator(128).expect("Comm certification failed");
    assert!(res <= C_MAX);
}
```

and one production caller, `run_certification()`, whose comment reads `// Example parameters that satisfy the ledger thresholds.` (L214) and which invokes `certify_commutator(64)`.

Both invocations are asserted to **pass**. Consequently:

| Property | Status |
|---|---|
| Rejection path (`Err` constructed, message format) | **never exercised** |
| Non-strict boundary, `norm == C_MAX` exactly | **never exercised** — and §4 makes this a live question |
| Frobenius-fails / spectral-passes — the only case that distinguishes G2 from a spectral claim | **never exercised** |
| Sensitivity to `C_MAX` divergence, 2.71 vs 4.0 | **invisible**; the chosen inputs are selected to satisfy whichever value is compiled in |

**The gate as tested has never been observed to reject anything**, and the inputs are chosen such that its rejection behaviour would not be observable if it could not reject.

**Normative requirement N-6.** A test shall exist that drives the gate to its `Err` path and asserts the message; a test at the exact `norm == C_MAX` boundary; and a test distinguishing a Frobenius failure from an operator-norm pass.

---

## 9. Blocking determinations

This gate cannot be specified normatively, and no harness should be written, until each is answered.

| # | Question | Status |
|---|---|---|
| 1 | What derivation produces the commutator bound, and what is `C_MAX`? Neither 2.71 nor 4.0 has one on tree (§5). | **open — blocking** |
| 2 | Was the intent a spectral-norm certificate or a Frobenius bound? The doc comment says spectral, the code computes Frobenius, and no third artifact records the intent (§3, N-2). | **open — blocking** |
| 3 | Should the gate be strict or non-strict, and should it match the Core's strict gate? (§4, N-3) | **open** |
| 4 | Are the gates one condition or several? Determined: **two independent conditions on `main`** (G1, G2); **three** on this working tree, G3 being local-only. A derivation relating them would supersede that finding (§6). | **answered — two on `main`, three local, pending N-4** |
| 5 | Which of the three package copies is canonical? (§7) | **open — blocking** |
| 6 | Does the binary's provenance need to be recoverable at all, given §7.2 makes it currently unaskable? | **open** |

---

## 10. Non-authorization

Until §9 items 1, 2, and 5 are answered:

- No artifact may cite this gate as evidence that a commutator bound holds.
- No artifact may treat `C_MAX = 4.0` or `C_MAX = 2.71` as a certified value.
- No Cell, manifest, or receipt may record G2 as satisfying G1.
- No build of the `pirtm-monitor` binary may be treated as certifying the commutator bound, since the shipped bound is determined by build directory and is currently unverifiable by cargo.

This document is a specification draft. It creates no authority, discharges no defect, and attests to nothing beyond the on-tree facts it cites.