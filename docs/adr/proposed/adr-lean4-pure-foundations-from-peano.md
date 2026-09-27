# ADR-PEANO-001: Pure Lean 4.33 Core — Redefine All Foundations from Peano Axioms

- Status: proposed
- Date: 2026-08-25
- Owners: Multiplicity Formal Methods Team
- Tags: lean4, foundations, peano, real-analysis, number-theory, formal-verification
- Depends On: ADR-0001 (Production-grade Lean 4 proof of Zeta-Schrödinger dynamics)
- Phase: phase-1
- See-Also: `Foundry/lean-toolchain` (lean4:v4.33.0-rc1), `Foundry/lakefile.lean`

---

## 1. Context

The Multiplicity project already operates under a **no-Mathlib, no-sorry** policy for its formal verification layer (established in ADR-0001). The current Lean 4 proof artifacts in `Foundry/lean/`, `PhaseMirror/`, and `Governance/ADR/formal/` depend on ad-hoc definitions scattered across individual project modules. There is no unified, ground-up reconstruction of standard mathematical objects from the Peano axioms.

This ADR proposes a multi-month effort to **rebuild the entire mathematical foundation stack** inside pure Lean 4.33 core — meaning:

- **Peano axioms** as the sole starting point (no `Nat` from core library; redefine inductively)
- **Natural numbers** (`Nat`) with full induction, recursion, ordering, and arithmetic
- **Integers** (`Int`) as an additive quotient of `Nat × Nat`
- **Rationals** (`Rat`) as a quotient of `Int × Nat`
- **Reals** (`Real`) via Dedekind cuts or Cauchy sequences, with field axioms
- **Complex numbers** (`Complex`) as `Real × Real` with multiplication
- **`Finset`**, `Multiset`, `Finsupp` — finite combinatorics from scratch
- **`Nat.Prime`**, divisibility, GCD, lcm, Euclid's lemma, FTA
- All associated lemmas: commutativity, associativity, distributivity, ordering, absolute value, min/max, floor/ceil

The motivation is threefold:

1. **Auditability** — Every proof step traces to axioms we control, not to opaque Mathlib internals.
2. **Constitutional alignment** — The Ξ-Constitution requires that all runtime behavior be derivable from explicitly stated mathematical contracts. Mathlib is a black box.
3. **Downstream unification** — The PIRTM dialect, Zeta-Schrödinger dynamics, spectral governance, and all project-specific proofs need a shared foundation they can all import without conflicts.

---

## 2. Decision

We will build a self-contained Lean 4.33 library called **`Multiplicity.Foundations`** that reconstructs the standard mathematical stack from Peano axioms. The library will be the *only* source of mathematical definitions and lemmas for all formal verification work in the Multiplicity organization.

### 2.1 Architecture

```
Multiplicity.Foundations
├── Peano          -- Inductive Nat, Peano axioms as axioms or inductive
├── Nat            -- Arithmetic, ordering, divisibility, primes, FTA
├── Int            -- Quotient construction, ring structure
├── Rat            -- Field of fractions, ordering
├── Real           -- Dedekind cuts, field + ordered field + Archimedean
├── Complex        -- Algebraically closed field
├── Finset         -- Finite sets, card, powerset, bindings
├── Multiset       -- Quotient of List by permutation
├── Order          -- Lattice, Boolean algebra, complete lattice
├── Algebra        -- Groups, rings, fields, modules, vector spaces
├── Analysis       -- Metric spaces, sequences, limits, continuity
└── NumberTheory   -- Primes, FTA, Euler totient, modular arithmetic
```

### 2.2 Constraints

| Rule | Description |
|------|-------------|
| **Zero external deps** | `lakefile.lean` has no `require` directives. Lean 4.33 core only. |
| **Zero `sorry`** | CI runs `grep -r "sorry"` and fails on any hit. |
| **Zero `axiom`** (after Phase 1) | All axioms must be discharged or explicitly listed in `Axioms.lean` with justification. |
| **Backward-compatible names** | Definitions shadow core names where possible (e.g., `Nat.add` redefined to match core's API). |
| **Proof-only difference** | If a definition matches core's, keep the same signature and only replace the proof term. |

### 2.3 Phasing

| Phase | Scope | Duration | Gate |
|-------|-------|----------|------|
| **P1: Peano → Nat** | `Nat` inductive, `+`, `*`, `<`, `≤`, `dvd`, `gcd`, `lcm`, `Nat.Prime`, Euclid's lemma, FTA | 6–8 weeks | `Nat.prime_inf` compiles |
| **P2: Int → Rat** | `Int` quotient, `+`, `*`, negation, ordering, `Rat` field of fractions | 4–6 weeks | `Rat.field` instance compiles |
| **P3: Real** | Dedekind cuts, `Real.field`, `Real.orderedField`, Archimedean property | 8–12 weeks | `Real.archimedean` proved |
| **P4: Complex** | `Complex` as `Real × Real`, algebraic closure | 3–4 weeks | `Complex.algebraicallyClosed` |
| **P5: Finset / Multiset** | Finite combinatorics, `Finset.card`, `powerset`, `Finset.induction` | 4–6 weeks | `Finset.card_powerset` proved |
| **P6: Order / Algebra** | Lattices, Boolean algebras, groups, rings, fields, modules | 6–8 weeks | `Field` instance on `Real` and `Complex` |
| **P7: Analysis** | Metric spaces, sequences, limits, continuity, differentiability | 8–10 weeks | `Real连续性` chain compiles |
| **P8: Number Theory** | FTA, Euler's theorem, quadratic residues, modular forms scaffolding | 6–8 weeks | `Nat.prime_factorization_unique` |

### 2.4 Verification Strategy

- Every file must compile with `lake build` under `lean4:v4.33.0-rc1`.
- CI enforces `--reject-sorry` on all `.lean` files.
- A custom `lake test` target runs a `sorry`-detector and an `axiom`-detector.
- Each phase produces a `PHASE-N-COMPLETE.md` milestone file.
- Cross-references to upstream definitions are checked via `lean --run scripts/check_api_compat.py`.

---

## 3. Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| **Use Mathlib as-is** | Violates no-Mathlib policy. Mathlib's 180k+ lines are opaque to audit. API surface changes break downstream proofs. |
| **Fork Mathlib and strip** | Mathlib's architecture is deeply coupled to its own `init` hierarchy. Stripping it down is more work than rebuilding from Peano. |
| **Use Lean 4 core's built-in `Nat`/`Int`/`Real`** | Core definitions exist but are minimal. We need the full lemma inventory (FTA, prime factorization, field axioms on Real, etc.). The core `Real` is axiomatic with no constructive content. |
| **Use an existing lightweight library (e.g., `Std4`)** | `Std4` provides utilities but not the full mathematical stack. It also depends on core definitions we want to control. |
| **Defer to Phase 2** | Every downstream proof (spectral governance, Zeta-Schrödinger, PIRTM contractivity) needs this foundation *now*. Deferring creates a growing pile of ad-hoc re-definitions. |

---

## 4. Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| Lean 4.33.0-rc1 | Toolchain | Pinned in `lean-toolchain`. Must not change until P3 completes. |
| ADR-0001 (Zeta-Schrödinger) | Upstream | Existing proofs will need to re-import from `Multiplicity.Foundations` instead of ad-hoc modules. |
| PIRTM dialect ADR-004 | Downstream | Contractivity proofs depend on `Real` and operator norms from this library. |
| SpectralGovernor | Downstream | `spectral_gov.py` → Lean FFI bridge will consume proved theorems from this library. |
| `Foundry/lakefile.lean` | Build system | Will need a new `lean_lib Foundations` target. |

---

## 5. Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Scope creep** — The project is inherently large. | High | Strict phasing. No phase begins until the prior phase's gate passes. |
| **API incompatibility with core** — Redefining `Nat` may break existing proofs. | High | Use the same names and signatures as core. Only replace proof terms, not interfaces. Provide a `Compat` module for any unavoidable divergences. |
| **Performance regression** — Custom proofs may be slower to elaborate than Mathlib's optimized tactics. | Medium | Profile during P3 (Real). If Dedekind cuts are too slow, switch to Cauchy sequences with a fast equivalence proof. |
| **Team expertise** — Building real analysis from scratch requires deep Lean 4 and math knowledge. | High | Assign dedicated formal methods engineers. Pair junior members with experienced Lean users. |
| **Lean 4.33 instability** — RC1 may have bugs. | Medium | Pin to a specific commit. Test early on nightly builds. Have a rollback plan to 4.31. |
| **Downstream proof breakage** — Existing proofs import from scattered modules. | Medium | Migrate downstream proofs incrementally. Each phase includes a migration script for the modules it replaces. |

---

## 6. Consequences

### Positive

- **Single source of truth** — All mathematical objects and lemmas live in one auditable tree.
- **Constitutional compliance** — Every runtime behavior can be traced from axioms → definitions → lemmas → theorems → proofs.
- **Eliminates Mathlib drift** — No more breakage when Mathlib's API changes.
- **Reusable across the stack** — PIRTM, Zeta-Schrödinger, spectral governance, and all future formal work import from one library.
- **Audit trail** — Each phase's completion is a machine-checked milestone.

### Negative

- **Multi-month commitment** — 6–8 phases spanning 45–62 weeks of calendar time.
- **Duplication of effort** — We are rebuilding what Mathlib already provides, but under our control.
- **Maintenance burden** — Bug fixes and improvements to core mathematical proofs become our responsibility.
- **Short-term slowdown** — Existing proofs must be migrated, and downstream work is blocked until P1 completes.

### Neutral

- **Team skill development** — Engineers will gain deep expertise in Lean 4 and formal mathematics.
- **Community contribution** — If the library is clean and well-documented, it may be extractable as a standalone project.

---

## 7. Implementation Scaffolding

### 7.1 Proposed Directory Structure

```
Foundry/lean/Multiplicity/Foundations/
├── lakefile.lean
├── lean-toolchain              -- leanprover/lean4:v4.33.0-rc1
├── Multiplicity/Foundations/
│   ├── Axioms.lean             -- All explicit axioms listed here
│   ├── Peano/
│   │   ├── Inductive.lean      -- Nat inductive from Peano
│   │   ├── Axioms.lean         -- Peano axioms as Lean axioms (if needed)
│   │   └── Basic.lean          -- succ, pred, zero_ne_succ, etc.
│   ├── Nat/
│   │   ├── Arith.lean          -- +, *, pow, sub, div, mod
│   │   ├── Order.lean          -- <, ≤, max, min, decidable linear order
│   │   ├── Divisibility.lean   -- dvd, gcd, lcm, coprime
│   │   ├── Prime.lean          -- Nat.Prime, infinitely many primes, prime factorization
│   │   ├── FTA.lean            -- Fundamental Theorem of Arithmetic
│   │   └── Misc.lean           -- parity, choose, factorial, fib
│   ├── Int/
│   │   ├── Quotient.lean       -- Int = Nat × Nat / ~
│   │   ├── Arith.lean          -- +, *, neg, sub, abs
│   │   ├── Order.lean          -- <, ≤
│   │   └── Divisibility.lean   -- dvd, gcd, gcd_eq
│   ├── Rat/
│   │   ├── Quotient.lean       -- Rat = Int × Nat / ~
│   │   ├── Field.lean          -- +, *, inv, sub, div
│   │   └── Order.lean          -- <, ≤, abs
│   ├── Real/
│   │   ├── DedekindCut.lean    -- Dedekind cut definition
│   │   ├── Field.lean          -- +, *, inv, sub, div
│   │   ├── Order.lean          -- <, ≤, abs, sup, inf
│   │   ├── Archimedean.lean    -- Archimedean property
│   │   └── Completeness.lean   -- Least upper bound property
│   ├── Complex/
│   │   ├── Basic.lean          -- Complex = Real × Real
│   │   ├── Field.lean          -- +, *, conj, norm, inv
│   │   └── AlgebraicClosure.lean
│   ├── Finset/
│   │   ├── Basic.lean          -- Finset definition, toList, card
│   │   ├── Induction.lean      -- Finset.induction_on
│   │   ├── Powerset.lean       -- powerset, powersetLen
│   │   └── Bind.lean           -- Finset.bind, Finset.sup, Finset.inf
│   ├── Multiset/
│   │   ├── Basic.lean          -- Multiset = List / perm
│   │   ├── Card.lean
│   │   └── Count.lean
│   ├── Order/
│   │   ├── Lattice.lean
│   │   ├── BooleanAlgebra.lean
│   │   └── CompleteLattice.lean
│   ├── Algebra/
│   │   ├── Group.lean
│   │   ├── Ring.lean
│   │   ├── Field.lean
│   │   ├── Module.lean
│   │   └── VectorSpace.lean
│   ├── Analysis/
│   │   ├── Metric.lean
│   │   ├── Sequence.lean
│   │   ├── Limit.lean
│   │   ├── Continuity.lean
│   │   └── Differentiability.lean
│   └── NumberTheory/
│       ├── Euler.lean
│       ├── QuadraticResidue.lean
│       └── ModularArithmetic.lean
└── tests/
    ├── sorry_check.lean        -- CI: fails if any sorry found
    └── axiom_check.lean        -- CI: fails if any unjustified axiom found
```

### 7.2 CI Integration

```yaml
# .github/workflows/lean-foundations.yml
name: Lean Foundations CI
on: [push, pull_request]
jobs:
  foundations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install elan
        run: curl https://raw.githubusercontent.com/leanprover/elan/master/elan-init.sh | sh -s -- -y
      - name: Build foundations
        run: |
          cd Foundry/lean/Multiplicity/Foundations
          lake build
      - name: Check for sorry
        run: |
          ! grep -r "sorry" Foundry/lean/Multiplicity/Foundations/Multiplicity/
      - name: Check for unjustified axioms
        run: |
          lean --run Foundry/lean/Multiplicity/Foundations/tests/axiom_check.lean
      - name: Run test suite
        run: |
          cd Foundry/lean/Multiplicity/Foundations
          lake test
```

### 7.3 Key Entry Point

```lean
-- Foundry/lean/Multiplicity/Foundations/Multiplicity/Foundations.lean
-- Master import file for the entire foundations library.
-- Downstream projects import only this file.

import Multiplicity.Foundations.Peano.Inductive
import Multiplicity.Foundations.Nat.Arith
import Multiplicity.Foundations.Nat.Order
import Multiplicity.Foundations.Nat.Divisibility
import Multiplicity.Foundations.Nat.Prime
import Multiplicity.Foundations.Nat.FTA
import Multiplicity.Foundations.Int.Quotient
import Multiplicity.Foundations.Int.Arith
import Multiplicity.Foundations.Rat.Quotient
import Multiplicity.Foundations.Rat.Field
import Multiplicity.Foundations.Real.DedekindCut
import Multiplicity.Foundations.Real.Field
import Multiplicity.Foundations.Real.Order
import Multiplicity.Foundations.Real.Archimedean
import Multiplicity.Foundations.Complex.Basic
import Multiplicity.Foundations.Complex.Field
import Multiplicity.Foundations.Finset.Basic
import Multiplicity.Foundations.Finset.Induction
import Multiplicity.Foundations.Order.Lattice
import Multiplicity.Foundations.Algebra.Group
import Multiplicity.Foundations.Algebra.Ring
import Multiplicity.Foundations.Algebra.Field
import Multiplicity.Foundations.Analysis.Metric
import Multiplicity.Foundations.Analysis.Limit
import Multiplicity.Foundations.NumberTheory.Euler
```

---

## 8. Acceptance Criteria

| Gate | Criterion | How to verify |
|------|-----------|---------------|
| P1 complete | `Nat.prime_inf` (infinitely many primes) compiles without sorry | `lake build Multiplicity.Foundations.Nat.Prime` |
| P2 complete | `Rat.field` instance compiles | `lake build Multiplicity.Foundations.Rat.Field` |
| P3 complete | `Real.archimedean` proved | `lake build Multiplicity.Foundations.Real.Archimedean` |
| P4 complete | `Complex.algebraicallyClosed` | `lake build Multiplicity.Foundations.Complex.AlgebraicClosure` |
| P5 complete | `Finset.card_powerset` proved | `lake build Multiplicity.Foundations.Finset.Powerset` |
| P6 complete | `Field` instance on `Real` and `Complex` | `lake build Multiplicity.Foundations.Algebra.Field` |
| P7 complete | Metric space completeness for `Real` | `lake build Multiplicity.Foundations.Analysis.Metric` |
| P8 complete | `Nat.prime_factorization_unique` | `lake build Multiplicity.Foundations.Nat.FTA` |
| Full | CI passes: zero sorry, zero unjustified axioms, all modules compile | `lake build && lake test` in CI |

---

## 9. Migration Plan for Existing Proofs

Existing proofs in `Foundry/lean/`, `PhaseMirror/`, and `Governance/ADR/formal/` currently import from scattered ad-hoc modules. After each phase completes:

1. A migration script (`scripts/migrate_foundations_imports.py`) rewrites import statements.
2. Each migrated file must compile with `lake build` after rewriting.
3. Any proof that breaks due to API changes is tagged `# MIGRATION_NEEDED` and tracked in `MIGRATION_STATUS.md`.
4. No phase may be marked complete until all `# MIGRATION_NEEDED` tags from prior phases are resolved.

---

*Recorded in ADR-PEANO-001 — Pure Lean 4.33 Core: Redefine All Foundations from Peano Axioms.*
