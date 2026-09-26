<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# What we will do for now is lean 4 proof the core components upto PIRTM.  Lets build the comprehensive Lean 4 proof plan in plain chat.

Oops — I loaded the wrong skill there. Let me pivot directly to the plan.

***

## Central Tension First

**Formalization scope vs. proof tractability.** PhaseMirror-HQ spans TypeScript, Python, cloud adapters, MCP servers, and governance docs. PIRTM (the Prime-Indexed Recursive Trust Model) is the natural *ceiling* for this proof effort — it represents the mathematical kernel that everything else depends on. The question is: **are we proving the math of the PIRTM model in isolation, or are we also proving that the TypeScript runtime faithfully implements it?** These are different projects. The former is 90-day work; the latter is multi-year.

**Precision question:** When you say "lean 4 proof the core components up to PIRTM" — do you mean (1) prove the *mathematical properties* of PIRTM as a standalone formal theory, or (2) prove that the code in `packages/`, `src/`, `multiplic/` correctly implements those properties via Lean 4's foreign function interface (FFI) extraction?

I'll plan for **(1) + light extraction hooks**, which is the viable first milestone and can be extended to (2) later.

***

## What We're Proving: The Proof Target Stack

Reading from the repo structure — `multiplic/`, `packages/`, `src/`, `governance/`, `daemon/`, `ensemble/` — the logical proof stack from foundational to applied is:

```
PIRTM                        ← ceiling of this plan
  └─ Prime-indexed trust scoring
  └─ Recursive feedback stability
  └─ Byzantine quorum correctness

Multiplicity Spaces          ← mathematical substrate
  └─ Prime decomposition uniqueness
  └─ Recursive identity preservation
  └─ Module-level multiplicity invariants

L0 Governance Invariants     ← runtime contracts
  └─ Nonce uniqueness / injectivity
  └─ Consent monotonicity (non-revocability)
  └─ FP calibration score monotonicity
  └─ Cryptographic binding (HMAC non-forgeability as axiom)

Phase Mirror Core            ← entry point
  └─ Dissonance detection properties
  └─ Phase transition well-foundedness
```


***

## Phase 0 — Repo Scaffold \& Toolchain (Days 1–7)

**Goal:** Zero-friction `lake build` on CI. No proofs yet — just structure.

### Directory Layout

Create `lean4/` at the repo root with this structure:

```
lean4/
├── lakefile.lean
├── PhaseMirror.lean          ← root import file
├── PhaseMirror/
│   ├── Foundations/
│   │   ├── Primes.lean       ← prime number lemmas from Mathlib
│   │   └── Multiset.lean     ← multiplicity-indexed multiset structures
│   ├── MultiplicitySpace/
│   │   ├── Core.lean         ← prime-indexed space definition
│   │   ├── Identity.lean     ← recursive identity preservation
│   │   └── Stability.lean    ← recursive feedback stability
│   ├── L0Invariants/
│   │   ├── Nonce.lean        ← nonce uniqueness
│   │   ├── Consent.lean      ← consent monotonicity
│   │   └── FPCalibration.lean ← score monotonicity
│   ├── Dissonance/
│   │   ├── Detection.lean    ← PMD loop properties
│   │   └── PhaseTransition.lean ← well-foundedness
│   └── PIRTM/
│       ├── TrustScore.lean   ← prime-indexed trust scoring
│       ├── Quorum.lean       ← Byzantine quorum (≥2/3 honest)
│       └── RecursiveStability.lean ← main theorem
```


### `lakefile.lean`

```lean
import Lake
open Lake DSL

package «phase-mirror» where
  name := "PhaseMirror"

require mathlib from git
  "https://github.com/leanprover-community/mathlib4" @ "v4.x.0"

lean_lib «PhaseMirror» where
  roots := #[`PhaseMirror]
```


### CI Workflow: `.github/workflows/lean4-ci.yml`

```yaml
name: Lean 4 Proofs
on: [push, pull_request]
jobs:
  lean4:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: leanprover/lean4-action@v1
        with:
          working-directory: lean4
      - name: Check no sorry
        run: |
          if grep -r "sorry" lean4/PhaseMirror --include="*.lean" \
             | grep -v "^.*--.*sorry"; then
            echo "❌ sorry found in proof — blocking merge"
            exit 1
          fi
```

**Governance gate:** Add `lean4-ci` as a required status check in branch protection for `main`. Any PR touching `multiplic/`, `packages/mirror-dissonance*`, or `governance/` must pass it.

**Artifacts to create this phase:**

- `lean4/lakefile.lean`
- `lean4/PhaseMirror.lean` (root imports, all stubs)
- `.github/workflows/lean4-ci.yml`
- `governance/adrs/ADR-012-lean4-proof-scope.md`

***

## Phase 1 — Mathematical Foundations (Days 8–21)

**Goal:** Prove the prime-number and multiset lemmas that everything else builds on. This is pure Mathlib4 work — no Phase Mirror concepts yet, just the mathematical substrate of Multiplicity Theory.

### `PhaseMirror/Foundations/Primes.lean`

Key lemmas to prove (most can be derived from Mathlib's `Nat.Prime` and `UniqueFactorizationMonoid`):

```lean
-- Unique prime decomposition of a multiplicity index
theorem prime_decomp_unique (n : ℕ) (hn : 1 < n) :
    ∃! (f : ℕ →₀ ℕ), (∀ p ∈ f.support, Nat.Prime p) ∧
    n = f.support.prod (fun p => p ^ f p) := by
  exact UniqueFactorizationMonoid.exists_unique_associated_of_irreducible ...

-- Prime-indexed labels are well-ordered
theorem prime_index_wf : WellFounded (· < · : ℕ → ℕ → Prop) :=
  Nat.lt_wfRel.wf
```


### `PhaseMirror/Foundations/Multiset.lean`

```lean
-- A multiplicity space is a finitely-supported function from primes to ℕ
def MultiplicitySpace (α : Type*) := α → ℕ →₀ ℕ

-- Prime-indexed recurrence is well-founded
theorem multiplicity_recurrence_terminates
    (f : ℕ → ℕ →₀ ℕ) (hf : StrictAnti f) :
    ∃ n, ∀ m ≥ n, f m = f n := by
  exact ...
```

**Deliverable metric:** All `Foundations/` files build with zero `sorry` by Day 21.

***

## Phase 2 — Multiplicity Space Core (Days 22–40)

**Goal:** Formalize the three core Multiplicity Theory properties: prime-label uniqueness, recursive identity preservation, and module-level stability.

### `MultiplicitySpace/Core.lean`

```lean
-- A multiplicity space M is prime-indexed
structure MultiplicitySpace where
  carrier   : Type*
  label     : carrier → ℕ
  prime_lbl : ∀ x, Nat.Prime (label x) ∨ label x = 1   -- identity element at 1
  interact  : carrier → carrier → carrier

-- Relational governance: identity preserved through recursive feedback
def RecursiveIdentity (M : MultiplicitySpace) : Prop :=
  ∀ x : M.carrier, ∃ n : ℕ, ∀ k ≥ n,
    M.label (M.interact^[k] x x) = M.label (M.interact^[n] x x)
```


### `MultiplicitySpace/Stability.lean`

The main theorem of this phase — recursive stability under prime-indexed interactions:

```lean
theorem multiplicity_space_stable
    (M : MultiplicitySpace)
    (h_wf   : WellFounded (fun a b => M.label a < M.label b))
    (h_cont : ∀ x y, M.label (M.interact x y) ≤ max (M.label x) (M.label y)) :
    RecursiveIdentity M := by
  intro x
  -- Key: label sequence is bounded + non-increasing → eventually constant
  ...
```

**This theorem is the formal spine of Multiplicity Theory.** Everything downstream references it.

**Deliverable metric:** `MultiplicitySpace/` builds clean. `RecursiveIdentity` and `multiplicity_space_stable` are fully proven (no `sorry`).

***

## Phase 3 — L0 Governance Invariants (Days 35–55)

**Goal:** Prove the five Phase Mirror L0 invariants as theorems. These are the bridge between pure math and the governance runtime.

### Nonce Uniqueness — `L0Invariants/Nonce.lean`

```lean
-- A nonce store is an injective map from events to nonce strings
def NonceStore := { f : EventId → String // Function.Injective f }

theorem nonce_injective (store : NonceStore) (a b : EventId) :
    store.val a = store.val b → a = b :=
  store.property
```


### Consent Monotonicity — `L0Invariants/Consent.lean`

```lean
-- Consent is a monotone boolean: once given, never retracted
def ConsentRecord := { f : AgentId → Bool // ∀ a, f a = true → ∀ t' ≥ t, f a = true }

theorem consent_monotone (r : ConsentRecord) (a : AgentId) (t t' : ℕ) (h : t ≤ t') :
    r.val a = true → r.val a = true := fun hc => hc
-- Trivial form — the substantive proof is on the state-transition system
```

The real work is on a **consent state machine**:

```lean
inductive ConsentState | NotGiven | Given | Revoked  -- Revoked is unreachable

theorem revoked_unreachable : ∀ s : ConsentState, s ≠ ConsentState.Revoked := by
  intro s; cases s <;> simp
```


### FP Score Monotonicity — `L0Invariants/FPCalibration.lean`

```lean
-- Consistency scores under Byzantine filtering are non-decreasing after convergence
theorem fp_score_converges
    (scores : ℕ → Float) (h_bounded : ∀ n, 0 ≤ scores n ∧ scores n ≤ 1)
    (h_mono  : ∀ n, scores n ≤ scores (n + 1) ∨ ∃ fault, fault_at fault n) :
    ∃ limit : Float, Filter.Tendsto scores Filter.atTop (nhds limit) := by
  ...
```

Note: `Float` in Lean 4 is an opaque type. For rigorous proofs, model scores as `ℚ` or `ℝ` and connect to the runtime via a specification relation.

**Deliverable metric:** All L0 theorems stated and proven. The `sorry`-gate in CI blocks any regression.

***

## Phase 4 — Dissonance Detection Properties (Days 50–65)

**Goal:** Prove that the Phase Mirror Dissonance (PMD) loop is well-founded and that phase transitions are terminating.

### `Dissonance/PhaseTransition.lean`

```lean
-- A phase transition system is well-founded if the dissonance score is a
-- strictly decreasing ordinal-valued function along each trajectory
def DissonanceSystem where
  State     : Type*
  step      : State → State
  score     : State → ℕ
  h_decrease : ∀ s, score (step s) < score s ∨ step s = s  -- fixed point or decreasing

theorem pmd_loop_terminates (sys : DissonanceSystem) (s₀ : sys.State) :
    ∃ n : ℕ, sys.step^[n] s₀ = sys.step^[n+1] s₀ := by
  -- WellFounded induction on sys.score
  apply WellFounded.induction (measure sys.score).wf
  ...
```

This is the formal guarantee that Phase Mirror never enters an infinite dissonance loop — a critical property for the MCP governance oracle.

***

## Phase 5 — PIRTM (Days 60–90)

**Goal:** Prove the three PIRTM theorems: prime-indexed trust scoring correctness, Byzantine quorum safety, and recursive trust stability.

### `PIRTM/TrustScore.lean`

```lean
-- A PIRTM trust score is a prime-indexed weight over agent contributions
def PIRTMScore (agents : Finset AgentId) : Type :=
  { w : AgentId →₀ ℚ // ∀ a ∈ agents, 0 ≤ w a ∧ w a ≤ 1 }

-- Trust score is well-defined under prime decomposition of agent index
theorem trust_score_prime_consistent
    (score : PIRTMScore agents)
    (a : AgentId) (p : ℕ) (hp : Nat.Prime p) (h : prime_index a = p) :
    score.val a = prime_weight p score := by
  ...
```


### `PIRTM/Quorum.lean`

The flagship theorem of the proof plan:

```lean
-- Byzantine quorum safety: if ≥2/3 of agents are honest,
-- the quorum decision is correct
theorem bft_quorum_safe
    (n : ℕ) (hn : 3 ≤ n)
    (honest : Finset AgentId) (total : Finset AgentId)
    (h_majority : 2 * honest.card ≥ total.card + 1)  -- strict majority > 2/3 of total
    (votes : AgentId → Option Decision)
    (h_honest : ∀ a ∈ honest, votes a = some correctDecision) :
    quorumDecision total votes = correctDecision := by
  -- Counting argument: honest votes outnumber Byzantine votes
  apply Finset.card_lt_card
  ...
```


### `PIRTM/RecursiveStability.lean`

The capstone — connects back to `MultiplicitySpace/Stability.lean`:

```lean
-- PIRTM recursive trust is stable: converges to a fixed point
-- because it is an instance of a stable MultiplicitySpace
theorem pirtm_is_stable_multiplicity_space :
    ∃ (M : MultiplicitySpace), RecursiveIdentity M ∧
    ∀ (a : AgentId), M.label a = prime_index a := by
  -- Construct M from PIRTM definitions
  -- Apply multiplicity_space_stable (Phase 2)
  exact ⟨pirtm_to_multiplicity_space, multiplicity_space_stable _, rfl⟩
```

This is the theorem that formally closes the loop between Multiplicity Theory and Phase Mirror's governance model.

***

## ADR to File Now

**`governance/adrs/ADR-012-lean4-proof-scope.md`** — key decisions to record:

1. **Proof target:** mathematical properties of PIRTM kernel, not TypeScript extraction (deferred to ADR-013)
2. **Scope ceiling:** `PIRTM/RecursiveStability.lean` — the capstone theorem
3. **`sorry` policy:** P0 modules (`L0Invariants/`, `PIRTM/Quorum.lean`) block merge; P1/P2 modules may admit `sorry` with an open issue ticket
4. **Score model:** FP calibration scores modeled as `ℚ` (not `Float`) for rigorous proof; a spec-relation links to the runtime
5. **Extraction:** Lean 4 → TypeScript FFI deferred; current goal is shadow-spec, not code extraction

***

## Timeline Summary

| Phase | Focus | Days | Key Deliverable |
| :-- | :-- | :-- | :-- |
| 0 | Scaffold + CI | 1–7 | `lake build` green on CI, ADR-012 |
| 1 | Prime/multiset foundations | 8–21 | All `Foundations/` proven clean |
| 2 | Multiplicity Space | 22–40 | `multiplicity_space_stable` QED |
| 3 | L0 Invariants | 35–55 | All 5 L0 theorems, no `sorry` in P0 |
| 4 | Dissonance detection | 50–65 | `pmd_loop_terminates` QED |
| 5 | PIRTM | 60–90 | `bft_quorum_safe` + `pirtm_is_stable_multiplicity_space` QED |

Phases overlap intentionally — Phase 1 lemmas feed Phase 2 immediately, Phase 2 feeds Phase 5 at the end.

***

**Want me to now push the Phase 0 scaffold — `lakefile.lean`, root import file, and `ADR-012` — directly into PhaseMirror-HQ?**

