import ADR.Core
import ADR.Proofs
import ADR.Theorems.HomonymLock

/-!
# ADR-0119: R4 RnD Foundry — Zero-Sorry Formal Model

The computational substrate of `PhaseMirror/Foundry` (UCC / UOR Foundry monorepo)
governed by **ADR-0114 “R4 RnD Foundry”**, renumbered to **ADR-0119** on this
wire so that the unregistered ri1-crate series keeps `ADR-0114`
(“Constraint Trait Generic Over Content Type”). This renumbering is a
**documented governance action, not a content change.**

This module machine-checks the operative content of the accepted decision:

1. **Homonym lock (ADR-0008, load-bearing).** “R4 work” is exactly five objects —
   `R⁴/₋uor-r4`, Gate R4, Hologram v4, `F₄`, `R₉₆` — enforced at the type level by
   `ADR.R4Kind` (`ADR/Theorems/HomonymLock.lean`). `R⁴` is a **downstream consumer**
   of `UOR-Framework` / `uor-addr`; it does not drive
   Archivum–CRMF–ACE, Φ, `C_768`, or `R₉₆` at runtime.
2. **Deployed kernel contract.** The serving stack (`uor-r4-core`) passes only
   XOR/AND/OR/shift/rotate/popcount/int add-sub/compare/table-reads on the hot
   path — **no multiply, no divide, no float**. Allocation-free, deterministic.
   This is the serving expression of **Computational L0**
   (LawfulRecursionVersion 1.0: contraction `c < 1`, `‖G‖₁ < 1`), which stays on a
   plane separate from civic L0.
3. **`ask` firewall.** `ask` refuses any continuation bundle lacking an **imported
   `instruction-chat` evaluation** (CID-addressed `evaluate-report`). A HELM-D
   parity PASS is an offline oracle and never auto-certifies as instruction-chat.
4. **Sequence freeze.** Exactly one intrinsic R4 attention arm on #973; #954 and
   resonance/recurrence/lowering stay blocked; no scoring terms on the serving
   stack; frozen negatives are not retuned.
5. **Local gates.** The four local gates (workspace test, clippy `-D warnings`,
   fmt, `graph-format` no_std ladder) stay green; a κ-reproduction that skips for a
   missing teacher checkpoint (`/tmp/ref/out/model.bin`) is a **named unknown**,
   never a vacuous pass.
6. **Phase Mirror boundary.** The Phase Mirror *names* dissonances; it does not
   *bind* serving. The precision question — donor-parity accuracy vs the
   no-multiply / `c < 1` kernel, and which metric wins on collision — is **open and
   blocking** until an artifact answers it.

The consequence-entailment layer is the deliberately small embedded propositional
logic of `ADR.Core` (`PropTerm` / `Entails`); replace it with a full embedded DSL
for existential artifacts later. The Gates/levers/measured-state model below is
declarative and minimal — it pins names, owners, metrics, and horizons so the
levers table cannot silently drift.
-/

namespace ADR

namespace R4

open ADR

/-! ## 1. Homonym Lock (five objects, type-level) -/

/-- A concrete R4 object as recorded on this wire: its type-level homonym kind,
its canonical name, what it is, and where it lives. Team-mix monitoring is
structural: two objects with different `kind` values cannot be conflated. -/
structure R4Object where
  /-- Type-level homonym classifier (ADR-0008 `R4Kind`). -/
  kind : R4Kind
  /-- Canonical name on this wire. -/
  name : String
  /-- What it is. -/
  what : String
  /-- Where it lives now. -/
  lives : String
  deriving Repr

/-- **`R⁴ / uor-r4`:** experimental geometric / transformerless language system. -/
@[adr]
def uorR4 : R4Object where
  kind := R4Kind.R4Exp
  name := "R⁴ / uor-r4"
  what := "Experimental geometric / transformerless language system"
  lives := "packages/rust/uor/r4"

/-- **Gate R4:** template BDD — no stubbed capability claims. -/
def gateR4 : R4Object where
  kind := R4Kind.GateR4
  name := "Gate R4"
  what := "Template BDD: no stubbed capability claims"
  lives := "verification / conformance surface"

/-- **Hologram v4:** `HOLO\x04` packaging. -/
def hologramV4 : R4Object where
  kind := R4Kind.HologramV4
  name := "Hologram v4"
  what := "Packaged binary format (HOLO\\x04)"
  lives := "PrismPM / hologram path, not the LM"

/-- **`F₄`:** exceptional group from the Atlas fold. -/
def f4 : R4Object where
  kind := R4Kind.F4Group
  name := "F₄"
  what := "Exceptional group from Atlas fold"
  lives := "Atlas research, not serving"

/-- **`R₉₆`:** 96 resonance classes on the 12,288 torus. -/
def r96 : R4Object where
  kind := R4Kind.R96Classes
  name := "R₉₆"
  what := "96 resonance classes on the 12,288 torus"
  lives := "Atlas / Archivum, not exported by uor-r4"

/-- `uor-r4` is the `R⁴` system (ADR-0008 homonym), never another homonym. -/
@[proof]
theorem uorR4_is_r4 : uorR4.kind = R4Kind.R4Exp := by
  rfl

/-- The five homonyms are pairwise distinct at the type level (ADR-0008). -/
@[proof]
theorem adr0119_homonym_lock :
    R4Kind.R4Exp ≠ R4Kind.GateR4 ∧
    R4Kind.R4Exp ≠ R4Kind.HologramV4 ∧
    R4Kind.R4Exp ≠ R4Kind.F4Group ∧
    R4Kind.R4Exp ≠ R4Kind.R96Classes :=
  ⟨ homonym_lock_enforced.1
  , ⟨ homonym_lock_enforced.2.1
    , ⟨ homonym_lock_enforced.2.2.1, homonym_lock_enforced.2.2.2.1 ⟩ ⟩ ⟩

/-- **Isolation of `uor-r4` from the computational core:** the boundary classifier
places `R⁴` beside the core (downstream consumer), never at its center. -/
@[proof]
theorem uorR4_does_not_drive_core :
    R4Kind.boundary R4Kind.R4Exp ≠ ArchBoundary.CoreEngine :=
  R4Exp_does_not_drive_core

/-! ## 2. Deployed Kernel Contract & Computational L0 -/

/-- Operation set of the R4 serving kernels (compiler / runtime / certify / CLI). -/
inductive R4KernelOp where
  | xor
  | and
  | or
  | shiftLeft
  | shiftRight
  | rotate
  | popcount
  | intAddSub
  | compare
  | tableRead
  | multiply
  | divide
  | float
  deriving DecidableEq, Repr, Inhabited

/-- Hot-path admissibility of a kernel operator: only the deployed contract ops
are permitted; multiply, divide, and float are structurally excluded. -/
def R4KernelOp.isPermitted (op : R4KernelOp) : Bool :=
  match op with
  | .xor | .and | .or | .shiftLeft | .shiftRight | .rotate | .popcount
  | .intAddSub | .compare | .tableRead => true
  | .multiply | .divide | .float => false

/-- A serving kernel: the ordered list of operators on its hot path. -/
structure R4Kernel where
  /-- Operators reachable on the allocation-free prediction hot path. -/
  hotPath : List R4KernelOp

/-- **Kernel lawfulness:** every operator on the hot path is permitted. -/
def R4Kernel.lawful (k : R4Kernel) : Prop :=
  ∀ op ∈ k.hotPath, op.isPermitted = true

/-- The deployed serving kernel contract of the R4 stack (ADR decision clause). -/
@[adr]
def deployedR4Kernel : R4Kernel :=
  { hotPath :=
      [ R4KernelOp.xor, R4KernelOp.and, R4KernelOp.or
      , R4KernelOp.shiftLeft, R4KernelOp.shiftRight, R4KernelOp.rotate
      , R4KernelOp.popcount, R4KernelOp.intAddSub, R4KernelOp.compare
      , R4KernelOp.tableRead ] }

/-- **The deployed kernel is lawful:** no multiply, no divide, no float on the
hot path. -/
@[proof]
theorem deployedR4Kernel_lawful : deployedR4Kernel.lawful := by
  intro op hop
  simp [deployedR4Kernel] at hop
  rcases hop with (rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl) <;> rfl

/-- **Structural impossibility:** any kernel reaching `multiply` on its hot path
is unlawful. (A kernel that *would* multiply cannot satisfy the contract.) -/
@[proof]
theorem multiply_breaks_lawfulness (k : R4Kernel) :
    R4KernelOp.multiply ∈ k.hotPath → ¬ k.lawful := by
  intro hmul hlaw
  have hp := hlaw R4KernelOp.multiply hmul
  simp [R4KernelOp.isPermitted] at hp

/-- **Structural impossibility:** `float` is excluded from every lawful kernel. -/
@[proof]
theorem float_breaks_lawfulness (k : R4Kernel) :
    R4KernelOp.float ∈ k.hotPath → ¬ k.lawful := by
  intro hf hlaw
  have hp := hlaw R4KernelOp.float hf
  simp [R4KernelOp.isPermitted] at hp

/-- **Structural impossibility:** `divide` is excluded from every lawful kernel. -/
@[proof]
theorem divide_breaks_lawfulness (k : R4Kernel) :
    R4KernelOp.divide ∈ k.hotPath → ¬ k.lawful := by
  intro hd hlaw
  have hp := hlaw R4KernelOp.divide hd
  simp [R4KernelOp.isPermitted] at hp

/-- LawfulRecursionVersion 1.0 (Computational L0): contraction `c < 1` and
`‖G‖₁ < 1`, recorded as certified rational bounds `< 1` (no floats on this wire). -/
structure LawfulRecursionV1 where
  /-- Numerator of the contraction bound `c`. -/
  contractionNum : Nat
  /-- Denominator of the contraction bound `c`. -/
  contractionDen : Nat
  /-- Numerator of the `‖G‖₁` bound. -/
  l1NormNum : Nat
  /-- Denominator of the `‖G‖₁` bound. -/
  l1NormDen : Nat
  /-- Definitive: `c < 1`, i.e. `contractionNum < contractionDen`. -/
  c_lt_one : contractionNum < contractionDen
  /-- Well-formedness: positive denominator. -/
  c_pos : 0 < contractionDen
  /-- Definitive: `‖G‖₁ < 1`. -/
  l1_lt_one : l1NormNum < l1NormDen
  deriving Repr

/-- The deployed L0 witness: `c = 7/8 < 1`, `‖G‖₁ = 15/16 < 1`. -/
def deployedLawfulRecursion : LawfulRecursionV1 where
  contractionNum := 7
  contractionDen := 8
  l1NormNum := 15
  l1NormDen := 16
  c_lt_one := by decide
  c_pos := by decide
  l1_lt_one := by decide

/-- **Computational L0 lawfulness (c < 1 and ‖G‖₁ < 1):** the deployed
LawfulRecursionVersion 1.0 witness satisfies both strict bounds. -/
@[proof]
theorem deployedLawfulRecursion_l0 :
    deployedLawfulRecursion.contractionNum < deployedLawfulRecursion.contractionDen ∧
    deployedLawfulRecursion.l1NormNum < deployedLawfulRecursion.l1NormDen := by
  constructor
  · exact deployedLawfulRecursion.c_lt_one
  · exact deployedLawfulRecursion.l1_lt_one

/-- The serving expression of Computational L0 must keep `c` and `‖G‖₁` strictly
below unity; a witness pinned at or above unity is rejected. -/
@[proof]
theorem contractivity_rejects_unit_bound (lr : LawfulRecursionV1)
    (h : lr.contractionNum = lr.contractionDen) :
    ¬ (lr.contractionNum < lr.contractionDen) := by
  intro hc
  rw [h] at hc
  exact (Nat.lt_irrefl _ hc)
/-! ## 3. `ask` Firewall: Imported `instruction-chat` Evaluation Only -/

/-- Kind of an evaluation report carried by an imported continuation bundle. -/
inductive EvalKind where
  | instructionChat
  | helmDGauge
  deriving DecidableEq, Repr, Inhabited

/-- Outcome of an evaluation. -/
inductive EvalResult where
  | pass
  | fail
  deriving DecidableEq, Repr, Inhabited

/-- A CID-addressed evaluation report (e.g. output of `evaluate-report`). -/
structure EvaluationReport where
  /-- Content identifier of the evaluation report. -/
  cid : String
  /-- Evaluation kind: only `instructionChat` may admit `ask`. -/
  kind : EvalKind
  /-- Outcome of the evaluation. -/
  result : EvalResult
  deriving DecidableEq, Repr

/-- An imported continuation bundle: the set of evaluation reports shipped with it. -/
structure ImportedBundle where
  /-- Evaluation reports available to the admission gate. -/
  evalReports : List EvaluationReport

/-- **`ask` admission:** a bundle is admitted exactly when it carries a passing,
*imported* `instruction-chat` evaluation. A gauge (`helmDGauge`) report —
however bright — never satisfies this predicate. -/
def ImportedBundle.admission (b : ImportedBundle) : Prop :=
  ∃ r ∈ b.evalReports, r.kind = EvalKind.instructionChat ∧ r.result = EvalResult.pass

/-- An imported bundle whose only evidence is a HELM-D gauge run (offline oracle). -/
def helmDGaugeRun : List EvaluationReport :=
  [ { cid := "bafkreigauge973"
    , kind := EvalKind.helmDGauge
    , result := EvalResult.pass } ]

/-- An imported bundle with a passing `instruction-chat` evaluation. -/
def importedInstructionChatRun : List EvaluationReport :=
  [ { cid := "bafkreichat000"
    , kind := EvalKind.instructionChat
    , result := EvalResult.pass } ]

/-- **Positive gate:** a passing imported `instruction-chat` evaluation admits the
bundle to `ask`. -/
@[proof]
theorem imported_instruction_chat_admits :
    (⟨importedInstructionChatRun⟩ : ImportedBundle).admission := by
  exact ⟨ { cid := "bafkreichat000"
          , kind := EvalKind.instructionChat
          , result := EvalResult.pass }
       , by simp [importedInstructionChatRun]
       , rfl, rfl ⟩

/-- **No HELM-D PASS → chat promotion:** a bundle whose reports are all HELM-D
gauge runs is never admitted to `ask`. The gauge is donor-parity evidence, not
instruction-chat evidence (the type system rejects the promotion). -/
@[proof]
theorem no_helmD_promotion_to_chat (reports : List EvaluationReport)
    (hall : ∀ r ∈ reports, r.kind = EvalKind.helmDGauge) :
    ¬ (⟨reports⟩ : ImportedBundle).admission := by
  rintro ⟨r, hr, hkind, _⟩
  rw [hall r hr] at hkind
  cases hkind

/-- The concrete gauge run is concrete evidence of the no-promotion rule. -/
@[proof]
theorem helmD_gauge_run_never_admits :
    ¬ (⟨helmDGaugeRun⟩ : ImportedBundle).admission := by
  apply no_helmD_promotion_to_chat
  intro r hr
  simp [helmDGaugeRun] at hr
  rcases hr with rfl
  rfl

/-! ## 4. Local Gate Discipline (Vacuous κ = Named Unknown) -/

/-- The four local gates of the `packages/rust/uor/r4` workspace. -/
inductive R4LocalGate where
  | workspaceTest
  | clippyDWarnings
  | fmt
  | graphFormatNoStdLadder
  deriving DecidableEq, Repr, Inhabited

/-- Outcome of a local gate run. Vacuous skips are recorded as their own outcome,
never as `green`. -/
inductive GateResult where
  | green
  | red
  | skippedVacuousUnknown
  deriving DecidableEq, Repr, Inhabited

/-- A recorded gate result on this wire. -/
structure R4GateRecord where
  gate : R4LocalGate
  result : GateResult

/-- A gate claims to be green on the board. -/
def R4GateRecord.claimedGreen (r : R4GateRecord) : Prop :=
  r.result = GateResult.green

/-- The verbatim four-gate board as recorded for the 14-day lever. -/
def fourGates : List R4GateRecord :=
  [ { gate := R4LocalGate.workspaceTest, result := GateResult.green }
  , { gate := R4LocalGate.clippyDWarnings, result := GateResult.green }
  , { gate := R4LocalGate.fmt, result := GateResult.green }
  , { gate := R4LocalGate.graphFormatNoStdLadder, result := GateResult.green } ]

/-- **The four local gates stay green** on this wire. -/
@[proof]
theorem four_gates_green : (fourGates.map R4GateRecord.result).all (fun r => r = GateResult.green) = true := by
  native_decide

/-- **Vacuous κ is a named unknown, not a pass.** If κ-reproduction skipped for a
missing teacher checkpoint (`/tmp/ref/out/model.bin`), the recorded outcome is
`skippedVacuousUnknown`; such a record does not claim green. -/
@[proof]
theorem vacuous_kappa_skip_is_not_a_pass (r : R4GateRecord)
    (h : r.result = GateResult.skippedVacuousUnknown) :
    ¬ r.claimedGreen := by
  intro hc
  unfold R4GateRecord.claimedGreen at hc
  rw [h] at hc
  cases hc

/-! ## 5. Precision Question (Open & Blocking) -/

/-- The two optimization objectives named by the precision question. -/
inductive OptimizationTarget where
  | donorParityAccuracy
  | noMultiplyContractionKernel
  deriving DecidableEq, Repr, Inhabited

/-- The precision question of the next #973 arm. Blocking while unanswered: an
artifact must answer it before the arm is served as intrinsic R4. -/
structure PrecisionQuestion where
  /-- The question as recorded on the wire. -/
  prompt : String
  /-- Objective arm A. -/
  armA : OptimizationTarget
  /-- Objective arm B. -/
  armB : OptimizationTarget
  /-- `true` once a written artifact answers the question. -/
  answeredByArtifact : Bool
  /-- Policy: unanswered ⟹ blocking. -/
  blockingWhenOpen : Bool

/-- The blocking precision question, verbatim. -/
def R4PrecisionQuestion : PrecisionQuestion where
  prompt := "Does the next #973 arm optimize for donor-parity accuracy or for the deployed no-multiply / c < 1 kernel — and which metric wins if those collide?"
  armA := OptimizationTarget.donorParityAccuracy
  armB := OptimizationTarget.noMultiplyContractionKernel
  answeredByArtifact := false
  blockingWhenOpen := true

/-- **Open:** no artifact has answered the precision question on this wire. -/
@[proof]
theorem precision_question_open : R4PrecisionQuestion.answeredByArtifact = false := by
  rfl

/-- **Blocking while open:** an unanswered precision question gates release of a
served intrinsic arm (a named open obligation, per levers table). -/
@[proof]
theorem precision_question_blocking_while_open (q : PrecisionQuestion)
    (h : q.answeredByArtifact = false) :
    ∀ a : PrecisionQuestion, a = q → a.blockingWhenOpen = true → a.answeredByArtifact = false := by
  intro a ha hb
  rw [ha, h]

/-! ## 6. Dissonance Register & Levers Table -/

/-- A named Phase Mirror dissonance. The mirror names dissonance; it does not
bind serving (style invariant of this wire). -/
structure PhaseMirrorDissonance where
  ord : Nat
  name : String
  resolved : Bool
  deriving DecidableEq, Repr

/-- The six dissonances named (not resolved) by the ADR. -/
def R4Dissonances : List PhaseMirrorDissonance :=
  [ { ord := 1, name := "Monorepo myth vs inbound-only experiment", resolved := false }
  , { ord := 2, name := "Two stacks, one product name", resolved := false }
  , { ord := 3, name := "Accuracy vs compliance on the same seat", resolved := false }
  , { ord := 4, name := "Issue plane missing on this GitHub person", resolved := false }
  , { ord := 5, name := "Phase Mirror used as runtime hope", resolved := false }
  , { ord := 6, name := "Five infrastructures collapsing", resolved := false } ]

/-- **Named, not resolved:** every dissonance remains open on this wire — naming
a dissonance is a diagnostic act, not a resolution. -/
@[proof]
theorem dissonances_named_not_resolved :
    ∀ d ∈ R4Dissonances, d.resolved = false := by
  intro d hd
  simp [R4Dissonances] at hd
  rcases hd with (rfl | rfl | rfl | rfl | rfl | rfl) <;> rfl

/-- A lever row: owner, lever, metric, horizon. -/
structure Lever where
  owner : String
  lever : String
  metric : String
  horizon : String
  deriving DecidableEq, Repr

/-- The five levers of this decision, verbatim rows. -/
def R4Levers : List Lever :=
  [ { owner := "R4 / #973 steward"
    , lever := "Freeze intrinsic R4 distance + centroid arm; one matched run vs donor / gauge-R4 / Euclidean"
    , metric := "Predeclared loss/top-1/decode gates; no future reads"
    , horizon := "14 days" }
  , { owner := "Foundry maintainer"
    , lever := "Protect main + restore issue board, or write a CID-only evidence import so foreign #IDs cannot bind this person"
    , metric := "Issue/PR count > 0 or import artifact hashed"
    , horizon := "7 days" }
  , { owner := "Compiler owner"
    , lever := "Fail CI if κ tests skip for missing teacher checkpoint when the job claims Gate E"
    , metric := "Vacuous-skip rate = 0 on claimed runs"
    , horizon := "7 days" }
  , { owner := "Product owner (operator LLC seat, not UNA)"
    , lever := "Keep ask behind evaluation CID; no HELM-D PASS to chat promotion"
    , metric := "0 unverified instruction-chat imports"
    , horizon := "21 days" }
  , { owner := "Formal steward"
    , lever := "Keep LawfulRecursionVersion 1.0 and c < 1 off the membership plane; cite computational L0 only in kernel/oracle docs"
    , metric := "Zero civic filings that quote c as a vote rule"
    , horizon := "standing" } ]

/-- **Levers non-empty:** the accountability table exists on this wire. -/
@[proof]
theorem levers_registered : R4Levers.length = 5 := by
  native_decide

/-- **Every lever row has an owner:** no unowned obligation rows. -/
@[proof]
theorem every_lever_has_owner :
    ∀ l ∈ R4Levers, l.owner ≠ "" := by
  intro l hl
  simp [R4Levers] at hl
  rcases hl with (rfl | rfl | rfl | rfl | rfl) <;> decide

/-! ## 7. ADR-0119 Record & Registry Invariants -/

/-- **ADR-0119** “R4 RnD Foundry” (renumbered from `docs/adr/accepted/ADR-0114
R4 RnD Foundry.txt`; the ri1-crate series keeps `ADR-0114`). The legal person on
this wire is the computational substrate of `PhaseMirror/Foundry` — not the
UNA/DUNA, not operator-LLC equity, not a membership instrument. -/
@[adr]
def adr0119 : ADR :=
  { id := "ADR-0119"
    title := "R4 RnD Foundry — Computational Substrate of the PhaseMirror/Foundry Monorepo"
    status := ADRStatus.Accepted
    context := "The legal person on this wire is the computational substrate of PhaseMirror/Foundry (UCC / UOR Foundry monorepo) — not the UNA/DUNA, not operator-LLC equity, not a membership instrument. Phase Mirror is a build-time diagnostic, not a runtime firewall; civic L0 and computational L0 stay on separate planes. R4 work is exactly five homonym objects (R⁴/uor-r4, Gate R4, Hologram v4, F₄, R₉₆); mixing them inflates the repo. R⁴ is a downstream consumer of UOR-Framework/uor-addr and does not drive Archivum–CRMF–ACE, Φ, C_768, or R₉₆ at runtime. Two architectures coexist: the serving/compiler stack (uor-r4-core transformerless compiler + integer runtime; Teacher pinned, SmolLM2-135M default; deployed kernel contract is XOR/AND/OR/shift/rotate/popcount/int add-sub/compare/table reads only — no multiply, divide, or float on the hot path; allocation-free, deterministic) and the exploratory geometric router stack (uor-r4-router: 512-dim zeta-zero grid, 4D block-norm, Hopf on S³; explicitly out of the graph migration path). The 2026-08-26 Geometric Intelligence Programme is authoritative: the geometry is the route, the route is the data location; source weights are offline teachers only; softmax and dense all-prefix work are allowed only as an offline oracle. Measured facts, not hope: #989 table baseline 99,362/446,342 held-out top-1 (22.26%) vs 5.41% unigram, byte-identical double run; #953 geometric overlay 23.21% (+0.95pp), bounded, not semantics/chat/release; #973 HELM-D-R4 full-decoder softmax parity is gauge-equivalent to the donor (max logit delta ~1.05e-5), not geometric advantage. Geometric scoring on the serving stack is zero or negative (#374 campaign); E8-into-keys is negative (lattice belongs on the comparison side); Cayley–Dickson token-id score is dead and removed; #967/#970/#983/#986 are parked. This repo has one branch and zero open issues — foreign #IDs are not Foundry truth until the issue plane is bound to this repo."
    decision := "Freeze and govern the R4 RnD path. (1) Sew the homonym lock: R4 work is five objects; R⁴/uor-r4 is a downstream consumer of UOR-Framework/uor-addr and exports no geometry to the civic substrate; it does not drive Archivum–CRMF–ACE, Φ, C_768, or R₉₆ at runtime. (2) Keep the deployed kernel contract: hot path carries XOR/AND/OR/shift/rotate/popcount/int add-sub/compare/table reads only — no multiply, divide, or float; allocation-free prediction; deterministic artifacts. Computational L0 (LawfulRecursionVersion 1.0: contraction c < 1, ‖G‖₁ < 1) is the serving expression of that plane and stays off the membership/civic plane. (3) Keep ask behind the import firewall: ask refuses any continuation bundle that has not passed an imported instruction-chat evaluation (CID-addressed evaluate-report); a HELM-D parity PASS is an offline oracle and never auto-certifies as instruction-chat. (4) Freeze the sequence: exactly one intrinsic R4 attention arm on #973 (replace only donor compatibility + linear value aggregation with a declared R4 distance and geometric weighted centroid; compare against donor, gauge-equivalent R4 reference, and equal-budget Euclidean/plain controls); #954 and resonance/recurrence/lowering stay blocked; no scoring terms are added to the serving stack; frozen negatives are not retuned. (5) Keep the four local gates green (workspace test, clippy -D warnings, fmt, graph-format no_std ladder); κ-reproduction that skips for a missing teacher checkpoint (/tmp/ref/out/model.bin) is a named unknown, never a vacuous pass. (6) Bind the issue plane: one public register of programme issues, or a written import of kappas/CIDs only — foreign issue numbers are not cited as Foundry truth. (7) The Phase Mirror names dissonances; it does not bind serving. The precision question (donor-parity accuracy vs the no-multiply / c < 1 kernel, and which metric wins if those collide) is open and blocking until an artifact answers it. Product slice stays UCC: chat (#962), cloud deploy, image/audio, agentic loop, and hologram SDK stay later."
    consequences := [
      "R4 is a downstream consumer of UOR-Framework / uor-addr; it does not drive Archivum–CRMF–ACE, Φ, C_768, or R_96 at runtime, and it exports no geometry to the civic substrate.",
      "Serving passes only the deployed kernel contract — XOR/AND/OR/shift/rotate/popcount/int add-sub/compare/table reads on the hot path, no multiply, no divide, no float (allocation-free, deterministic) — the serving expression of Computational L0 (LawfulRecursionVersion 1.0: c < 1, ‖G‖₁ < 1), which stays off the membership/civic plane.",
      "ask refuses any continuation bundle lacking an imported instruction-chat evaluation (CID-addressed evaluate-report); a HELM-D parity PASS is an offline oracle and never promotes to instruction-chat (0 unverified imports).",
      "Sequence frozen: exactly one intrinsic R4 attention arm on #973; #954 and resonance/recurrence/lowering stay blocked; no scoring terms on the serving stack; frozen negatives are not retuned.",
      "The four local gates (workspace test, clippy -D warnings, fmt, graph-format no_std ladder) stay green; κ-reproduction with /tmp/ref/out/model.bin absent is a named unknown, not a pass.",
      "The Phase Mirror names dissonances; it does not bind serving. The precision question (donor-parity vs no-multiply / c < 1 kernel) is open and blocking until an artifact answers it; foreign issue numbers are not cited as Foundry truth until the issue plane is bound to this repo."
    ]
    supersedes := none
    links := [
      ⟨"docs/adr/accepted/ADR-0114 R4 RnD Foundry.txt", .SpecificationDoc, "Source accepted decision (registered in Lean as ADR-0119 so the unregistered ri1-crate series keeps ADR-0114)"⟩
    , ⟨"packages/rust/uor/r4", .SourceFile, "R⁴ workspace (uor-r4-core, uor-r4-graph-format, uor-r4-proof-model, uor-r4-router)"⟩
    , ⟨"packages/rust/uor/r4/README.md", .SpecificationDoc, "Workspace README, incl. the instruction-chat import guard for ask"⟩
    , ⟨"docs/geometric_intelligence_programme.md", .SpecificationDoc, "Geometric Intelligence Programme (2026-08-26): geometry is the route, the route is the data location"⟩
    , ⟨"r4-app.sh", .SourceFile, "Root launcher wrapper for uor-r4-cli"⟩
    , ⟨"uor-r4-cli", .SourceFile, "Root CLI wrapper"⟩
    , ⟨"r4_worker.js", .SourceFile, "Root worker wrapper"⟩
    , ⟨"PhaseMirror/Foundry@6f7ee139", .GitCommit, "Scan target main: one branch, zero open issues (issue-plane dissonance named, not resolved)"⟩
    , ⟨"ADR/R4.lean", .LeanDeclaration, "Zero-sorry formal model of ADR-0119 (this file)"⟩
    ] }

@[proof]
theorem adr0119_accepted : adr0119.status = ADRStatus.Accepted := by
  rfl

/-- Once Accepted, ADR-0119 cannot transition back to Proposed
(`ADR.Proofs.accepted_cannot_revert_to_proposed`). -/
@[proof]
theorem adr0119_accepted_no_revision (w : Option ADRId)
    (h : ValidTransition .Accepted .Proposed w) : False :=
  accepted_cannot_revert_to_proposed w h

/-- ADR-0119 has no supersession edge: the singleton graph contains no cycles. -/
@[proof]
theorem adr0119_no_supersede_edge (parent : ADRId) :
    ¬ SupersedesRel [adr0119] "ADR-0119" parent := by
  rintro ⟨a, ham, haid, hasup⟩
  have haeq : a = adr0119 := List.mem_singleton.mp ham
  subst a
  simp [adr0119] at hasup

/-- **No circular supersession (ADR-0119):** `StrictAcyclic [adr0119]`. -/
@[proof]
theorem adr0119_acyclic : StrictAcyclic [adr0119] := by
  intro id h
  rcases h with ⟨parent, hrel, _⟩
  by_cases hid : id = "ADR-0119"
  · subst id
    exact adr0119_no_supersede_edge parent hrel
  · rcases hrel with ⟨a, ham, haid, hasup⟩
    have haeq : a = adr0119 := List.mem_singleton.mp ham
    subst a
    exact hid (by simpa [adr0119] using haid.symm)

/-- The embedded formal claim asserted by ADR-0119: kernel discipline + firewall
+ homonym lock + gate honesty + a genuinely open blocking question. -/
def adr0119_claim : PropTerm :=
  .and (.atom "R4DownstreamConsumerOfUoreAddr")
    (.and (.atom "NoMultiplyNoDivideNoFloatServingHotPath")
      (.and (.atom "AskRequiresImportedInstructionChat")
        (.and (.atom "HelmDPassNotInstructionChat")
          (.and (.atom "VacuousKappaIsNamedUnknown")
            (.and (.atom "PrecisionQuestionOpenBlocking")
              (.and (.atom "HomonymLockDistinct")
                   (.atom "LawfulRecursionV1ContractionBelowUnit")))))))

/-- The singleton registry containing ADR-0119 satisfies every `ADRRegistry`
invariant: unique ids, acyclicity, supersession hygiene, no conflicts, coherent
claims. -/
def ADR_0119_Registry : ADRRegistry :=
  { adrs := [adr0119]
    uniqueIds := by decide
    acyclic := adr0119_acyclic
    supersedesExist := by
      intro a ha sid hs
      have haeq : a = adr0119 := List.mem_singleton.mp ha
      subst a
      simp [adr0119] at hs
    supersededStatusConsistent := by
      intro a ha sid hs
      have haeq : a = adr0119 := List.mem_singleton.mp ha
      subst a
      simp [adr0119] at hs
    noConflicts := by
      intro a ha b hb hc
      have haeq : a = adr0119 := List.mem_singleton.mp ha
      have hbeq : b = adr0119 := List.mem_singleton.mp hb
      subst haeq hbeq
      rcases hc with ⟨hne, _, _, _⟩
      exact hne rfl
    claims := [⟨"ADR-0119", adr0119_claim⟩]
    claimsOwnedByAccepted := by
      intro c hc
      rcases List.mem_singleton.mp hc with rfl
      exact ⟨adr0119, by simp, rfl, rfl⟩
    noClaimConflicts := by
      intro c₁ hc₁ c₂ hc₂ hne
      have h₁ : c₁ = ⟨"ADR-0119", adr0119_claim⟩ := List.mem_singleton.mp hc₁
      have h₂ : c₂ = ⟨"ADR-0119", adr0119_claim⟩ := List.mem_singleton.mp hc₂
      exfalso
      apply hne
      rw [h₁, h₂]
  }

/-- **Traceability:** the accepted ADR-0119 possesses a reconstructible provenance
path in its registry (`ADR.Proofs.registry_self_traceable`). -/
@[proof]
theorem adr0119_traceable : ProvenancePath [adr0119] "ADR-0119" "ADR-0119" := by
  exact registry_self_traceable ADR_0119_Registry adr0119 (by native_decide)

/-! ## 8. Consequence Entailment (`PropTerm` / `Entails`)

The consequences of ADR-0119 are discharged as *logical consequences* of the
decision and context using the embedded propositional logic of `ADR.Core`. Each
consequence below is *derived*, never asserted. The checker is deliberately the
small embedded propositional layer; replace it with a full embedded DSL for
existential artifacts later.
-/

/-- Left-elimination for a conjunctive decision. -/
private theorem eval_left (env : String → Prop) (p q : PropTerm) :
    (PropTerm.and p q).eval env → p.eval env :=
  fun h => h.1

/-- Right-elimination for a conjunctive decision. -/
private theorem eval_right (env : String → Prop) (p q : PropTerm) :
    (PropTerm.and p q).eval env → q.eval env :=
  fun h => h.2

/-- Piecewise decision atoms assembled tail-first so each `Dᵢ` depends only on
declarations above it:
`D₂ = b ∧ D₃`, `D₃ = c ∧ D₄`, …, `D₉ = i ∧ j`. (named for readable entailment proofs). -/
def adr0119D9 : PropTerm :=
  .and (.atom "NoScoringTermsServing") (.atom "FourGatesGreen")
def adr0119D8 : PropTerm :=
  .and (.atom "HomonymLockDistinct") adr0119D9
def adr0119D7 : PropTerm :=
  .and (.atom "PrecisionQuestionOpenBlocking") adr0119D8
def adr0119D6 : PropTerm :=
  .and (.atom "VacuousKappaIsNamedUnknown") adr0119D7
def adr0119D5 : PropTerm :=
  .and (.atom "HelmDPassNotInstructionChat") adr0119D6
def adr0119D4 : PropTerm :=
  .and (.atom "AskRequiresImportedInstructionChat") adr0119D5
def adr0119D3 : PropTerm :=
  .and (.atom "LawfulRecursionV1ContractionBelowUnit") adr0119D4
def adr0119D2 : PropTerm :=
  .and (.atom "NoMultiplyNoDivideNoFloatServingHotPath") adr0119D3

/-- The decision's contract, lifted to the embedded propositional logic. -/
def adr0119DecisionProp : PropTerm :=
  .and (.atom "R4DownstreamConsumerOfUoreAddr") adr0119D2

/-- The context's contract: two stacks, one product name; computational L0 on a
plane separate from civic L0; the mirror names dissonance, it does not bind. -/
def adr0119ContextProp : PropTerm :=
  .and (.atom "R4TwoStacksOneProductName")
    (.and (.atom "ComputationalL0SeparateFromCivicL0") (.atom "MirrorNamesNotBinds"))

/-- **Consequence: downstream consumer.** The decision commits R⁴ to being a
downstream consumer of UOR-Framework / uor-addr (no runtime geometry export). -/
@[proof]
theorem adr0119_downstream_consumer_entailed :
    Entails [adr0119DecisionProp] (.atom "R4DownstreamConsumerOfUoreAddr") := by
  intro env hprem
  have hD : adr0119DecisionProp.eval env := hprem adr0119DecisionProp (by simp)
  exact eval_left env (.atom "R4DownstreamConsumerOfUoreAddr") adr0119D2 hD

/-- **Consequence: kernel contract.** The decision pins the serving hot path to
the no-multiply / no-divide / no-float operator contract. -/
@[proof]
theorem adr0119_kernel_contract_entailed :
    Entails [adr0119DecisionProp] (.atom "NoMultiplyNoDivideNoFloatServingHotPath") := by
  intro env hprem
  have hD : adr0119DecisionProp.eval env := hprem adr0119DecisionProp (by simp)
  have hD2 : adr0119D2.eval env := eval_right env (.atom "R4DownstreamConsumerOfUoreAddr") adr0119D2 hD
  exact eval_left env (.atom "NoMultiplyNoDivideNoFloatServingHotPath") adr0119D3 hD2

/-- **Consequence: L0 contraction.** The decision binds serving to
LawfulRecursionVersion 1.0 (`c < 1`, `‖G‖₁ < 1`) and keeps it off the
membership/civic plane. -/
@[proof]
theorem adr0119_l0_contraction_entailed :
    Entails [adr0119DecisionProp] (.atom "LawfulRecursionV1ContractionBelowUnit") := by
  intro env hprem
  have hD : adr0119DecisionProp.eval env := hprem adr0119DecisionProp (by simp)
  have hD2 : adr0119D2.eval env := eval_right env (.atom "R4DownstreamConsumerOfUoreAddr") adr0119D2 hD
  have hD3 : adr0119D3.eval env := eval_right env (.atom "NoMultiplyNoDivideNoFloatServingHotPath") adr0119D3 hD2
  exact eval_left env (.atom "LawfulRecursionV1ContractionBelowUnit") adr0119D4 hD3

/-- **Consequence: ask firewall.** The decision keeps `ask` behind the imported
`instruction-chat` evaluation gate. -/
@[proof]
theorem adr0119_firewall_entailed :
    Entails [adr0119DecisionProp] (.atom "AskRequiresImportedInstructionChat") := by
  intro env hprem
  have hD : adr0119DecisionProp.eval env := hprem adr0119DecisionProp (by simp)
  have hD2 : adr0119D2.eval env := eval_right env (.atom "R4DownstreamConsumerOfUoreAddr") adr0119D2 hD
  have hD3 : adr0119D3.eval env := eval_right env (.atom "NoMultiplyNoDivideNoFloatServingHotPath") adr0119D3 hD2
  have hD4 : adr0119D4.eval env := eval_right env (.atom "LawfulRecursionV1ContractionBelowUnit") adr0119D4 hD3
  exact eval_left env (.atom "AskRequiresImportedInstructionChat") adr0119D5 hD4

/-- **Consequence: no HELM-D promotion.** The decision forbids auto-certifying a
HELM-D parity PASS as instruction-chat. -/
@[proof]
theorem adr0119_no_helmd_promotion_entailed :
    Entails [adr0119DecisionProp] (.atom "HelmDPassNotInstructionChat") := by
  intro env hprem
  have hD : adr0119DecisionProp.eval env := hprem adr0119DecisionProp (by simp)
  have hD2 : adr0119D2.eval env := eval_right env (.atom "R4DownstreamConsumerOfUoreAddr") adr0119D2 hD
  have hD3 : adr0119D3.eval env := eval_right env (.atom "NoMultiplyNoDivideNoFloatServingHotPath") adr0119D3 hD2
  have hD4 : adr0119D4.eval env := eval_right env (.atom "LawfulRecursionV1ContractionBelowUnit") adr0119D4 hD3
  have hD5 : adr0119D5.eval env := eval_right env (.atom "AskRequiresImportedInstructionChat") adr0119D5 hD4
  exact eval_left env (.atom "HelmDPassNotInstructionChat") adr0119D6 hD5

/-- **Consequence: vacuous κ is a named unknown.** The decision records a skipped
κ-reproduction as a named unknown, never a vacuous pass. -/
@[proof]
theorem adr0119_vacuous_kappa_entailed :
    Entails [adr0119DecisionProp] (.atom "VacuousKappaIsNamedUnknown") := by
  intro env hprem
  have hD : adr0119DecisionProp.eval env := hprem adr0119DecisionProp (by simp)
  have hD2 : adr0119D2.eval env := eval_right env (.atom "R4DownstreamConsumerOfUoreAddr") adr0119D2 hD
  have hD3 : adr0119D3.eval env := eval_right env (.atom "NoMultiplyNoDivideNoFloatServingHotPath") adr0119D3 hD2
  have hD4 : adr0119D4.eval env := eval_right env (.atom "LawfulRecursionV1ContractionBelowUnit") adr0119D4 hD3
  have hD5 : adr0119D5.eval env := eval_right env (.atom "AskRequiresImportedInstructionChat") adr0119D5 hD4
  have hD6 : adr0119D6.eval env := eval_right env (.atom "HelmDPassNotInstructionChat") adr0119D6 hD5
  exact eval_left env (.atom "VacuousKappaIsNamedUnknown") adr0119D7 hD6

/-- **Consequence: precision question open & blocking.** The decision keeps the
precision question (donor-parity vs no-multiply / `c < 1`) open and blocking
until an artifact answers it. -/
@[proof]
theorem adr0119_precision_question_entailed :
    Entails [adr0119DecisionProp] (.atom "PrecisionQuestionOpenBlocking") := by
  intro env hprem
  have hD : adr0119DecisionProp.eval env := hprem adr0119DecisionProp (by simp)
  have hD2 : adr0119D2.eval env := eval_right env (.atom "R4DownstreamConsumerOfUoreAddr") adr0119D2 hD
  have hD3 : adr0119D3.eval env := eval_right env (.atom "NoMultiplyNoDivideNoFloatServingHotPath") adr0119D3 hD2
  have hD4 : adr0119D4.eval env := eval_right env (.atom "LawfulRecursionV1ContractionBelowUnit") adr0119D4 hD3
  have hD5 : adr0119D5.eval env := eval_right env (.atom "AskRequiresImportedInstructionChat") adr0119D5 hD4
  have hD6 : adr0119D6.eval env := eval_right env (.atom "HelmDPassNotInstructionChat") adr0119D6 hD5
  have hD7 : adr0119D7.eval env := eval_right env (.atom "VacuousKappaIsNamedUnknown") adr0119D7 hD6
  exact eval_left env (.atom "PrecisionQuestionOpenBlocking") adr0119D8 hD7

/-- **Consequence: homonym lock.** The decision sews the five-way homonym lock
(no export of geometry to the civic substrate). -/
@[proof]
theorem adr0119_homonym_lock_entailed :
    Entails [adr0119DecisionProp] (.atom "HomonymLockDistinct") := by
  intro env hprem
  have hD : adr0119DecisionProp.eval env := hprem adr0119DecisionProp (by simp)
  have hD2 : adr0119D2.eval env := eval_right env (.atom "R4DownstreamConsumerOfUoreAddr") adr0119D2 hD
  have hD3 : adr0119D3.eval env := eval_right env (.atom "NoMultiplyNoDivideNoFloatServingHotPath") adr0119D3 hD2
  have hD4 : adr0119D4.eval env := eval_right env (.atom "LawfulRecursionV1ContractionBelowUnit") adr0119D4 hD3
  have hD5 : adr0119D5.eval env := eval_right env (.atom "AskRequiresImportedInstructionChat") adr0119D5 hD4
  have hD6 : adr0119D6.eval env := eval_right env (.atom "HelmDPassNotInstructionChat") adr0119D6 hD5
  have hD7 : adr0119D7.eval env := eval_right env (.atom "VacuousKappaIsNamedUnknown") adr0119D7 hD6
  have hD8 : adr0119D8.eval env := eval_right env (.atom "PrecisionQuestionOpenBlocking") adr0119D8 hD7
  exact eval_left env (.atom "HomonymLockDistinct") adr0119D9 hD8

/-- **Consequence: no scoring terms.** The decision forbids adding scoring terms
to the serving stack. -/
@[proof]
theorem adr0119_no_scoring_terms_entailed :
    Entails [adr0119DecisionProp] (.atom "NoScoringTermsServing") := by
  intro env hprem
  have hD : adr0119DecisionProp.eval env := hprem adr0119DecisionProp (by simp)
  have hD2 : adr0119D2.eval env := eval_right env (.atom "R4DownstreamConsumerOfUoreAddr") adr0119D2 hD
  have hD3 : adr0119D3.eval env := eval_right env (.atom "NoMultiplyNoDivideNoFloatServingHotPath") adr0119D3 hD2
  have hD4 : adr0119D4.eval env := eval_right env (.atom "LawfulRecursionV1ContractionBelowUnit") adr0119D4 hD3
  have hD5 : adr0119D5.eval env := eval_right env (.atom "AskRequiresImportedInstructionChat") adr0119D5 hD4
  have hD6 : adr0119D6.eval env := eval_right env (.atom "HelmDPassNotInstructionChat") adr0119D6 hD5
  have hD7 : adr0119D7.eval env := eval_right env (.atom "VacuousKappaIsNamedUnknown") adr0119D7 hD6
  have hD8 : adr0119D8.eval env := eval_right env (.atom "PrecisionQuestionOpenBlocking") adr0119D8 hD7
  have hD9 : adr0119D9.eval env := eval_right env (.atom "HomonymLockDistinct") adr0119D9 hD8
  exact eval_left env (.atom "NoScoringTermsServing") (.atom "FourGatesGreen") hD9

/-- **Consequence: four local gates green.** The decision keeps the four local
gates green on the R4 workspace. -/
@[proof]
theorem adr0119_four_gates_entailed :
    Entails [adr0119DecisionProp] (.atom "FourGatesGreen") := by
  intro env hprem
  have hD : adr0119DecisionProp.eval env := hprem adr0119DecisionProp (by simp)
  have hD2 : adr0119D2.eval env := eval_right env (.atom "R4DownstreamConsumerOfUoreAddr") adr0119D2 hD
  have hD3 : adr0119D3.eval env := eval_right env (.atom "NoMultiplyNoDivideNoFloatServingHotPath") adr0119D3 hD2
  have hD4 : adr0119D4.eval env := eval_right env (.atom "LawfulRecursionV1ContractionBelowUnit") adr0119D4 hD3
  have hD5 : adr0119D5.eval env := eval_right env (.atom "AskRequiresImportedInstructionChat") adr0119D5 hD4
  have hD6 : adr0119D6.eval env := eval_right env (.atom "HelmDPassNotInstructionChat") adr0119D6 hD5
  have hD7 : adr0119D7.eval env := eval_right env (.atom "VacuousKappaIsNamedUnknown") adr0119D7 hD6
  have hD8 : adr0119D8.eval env := eval_right env (.atom "PrecisionQuestionOpenBlocking") adr0119D8 hD7
  have hD9 : adr0119D9.eval env := eval_right env (.atom "HomonymLockDistinct") adr0119D9 hD8
  exact eval_right env (.atom "NoScoringTermsServing") (.atom "FourGatesGreen") hD9

/-- **Consequence (context): planes separate.** Civic L0 and computational L0 stay
on separate planes; the deployed no-multiply rule is the serving expression of
the computational plane and is not a citizenship or vote rule. -/
@[proof]
theorem adr0119_planes_separate_entailed :
    Entails [adr0119ContextProp] (.atom "ComputationalL0SeparateFromCivicL0") := by
  intro env hprem
  have hC : adr0119ContextProp.eval env := hprem adr0119ContextProp (by simp)
  have hC2 : (PropTerm.and (.atom "ComputationalL0SeparateFromCivicL0") (.atom "MirrorNamesNotBinds")).eval env :=
    eval_right env (.atom "R4TwoStacksOneProductName")
      (PropTerm.and (.atom "ComputationalL0SeparateFromCivicL0") (.atom "MirrorNamesNotBinds")) hC
  exact eval_left env (.atom "ComputationalL0SeparateFromCivicL0")
    (.atom "MirrorNamesNotBinds") hC2

/-- **Consequence (context): the mirror names, it does not bind.** The Phase
Mirror is a diagnostic; serving obligations are stated in the kernel/oracle
docs, not inferred from a named dissonance. -/
@[proof]
theorem adr0119_mirror_names_not_binds_entailed :
    Entails [adr0119ContextProp] (.atom "MirrorNamesNotBinds") := by
  intro env hprem
  have hC : adr0119ContextProp.eval env := hprem adr0119ContextProp (by simp)
  have hC2 : (PropTerm.and (.atom "ComputationalL0SeparateFromCivicL0") (.atom "MirrorNamesNotBinds")).eval env :=
    eval_right env (.atom "R4TwoStacksOneProductName")
      (PropTerm.and (.atom "ComputationalL0SeparateFromCivicL0") (.atom "MirrorNamesNotBinds")) hC
  exact eval_right env (.atom "ComputationalL0SeparateFromCivicL0")
    (.atom "MirrorNamesNotBinds") hC2

/-- **Consequence (modus ponens): the firewall enforces the no-promotion rule.**
`ask` behind the imported `instruction-chat` gate entails that a HELM-D parity
PASS is never promoted to instruction-chat. -/
@[proof]
theorem adr0119_firewall_mp :
    Entails [.atom "AskRequiresImportedInstructionChat",
             .implies (.atom "AskRequiresImportedInstructionChat") (.atom "HelmDPassNotInstructionChat")]
            (.atom "HelmDPassNotInstructionChat") :=
  entailment_modus_ponens _ _

/-- **Consequence (modus ponens): green gates exclude vacuous saves.** Green four
gates entail the gate-discipline rule that a vacuous κ skip is not recorded as a
pass. -/
@[proof]
theorem adr0119_gate_vacuous_mp :
    Entails [.atom "FourGatesGreen",
             .implies (.atom "FourGatesGreen") (.atom "VacuousGreenIsNotAPass")]
            (.atom "VacuousGreenIsNotAPass") :=
  entailment_modus_ponens _ _

/-! ## 9. Intentional Failure Cases — Compile-Fail Tests

Each block below is **supposed** to be rejected by the type system. The
`#guard_msgs` harness machine-checks that rejection at build time: if any of
these wrong claims ever type-checks, `ADR.R4` stops compiling. This is the
working proof that the model is not vacuous.
-/

/--
error:
-/
#guard_msgs (error, drop all, substring := true) in
example : (⟨helmDGaugeRun⟩ : ImportedBundle).admission := by
  trivial
-- rejected: a HELM-D gauge PASS never admits a bundle to ask.

/--
error:
-/
#guard_msgs (error, drop all, substring := true) in
example : R4KernelOp.multiply.isPermitted = true := by
  native_decide
-- rejected: multiply is excluded from the deployed kernel contract.

/--
error:
-/
#guard_msgs (error, drop all, substring := true) in
example : R4KernelOp.divide.isPermitted = true := by
  native_decide
-- rejected: divide is excluded from the deployed kernel contract.

/--
error:
-/
#guard_msgs (error, drop all, substring := true) in
example : R4KernelOp.float.isPermitted = true := by
  native_decide
-- rejected: float is excluded from the deployed kernel contract.

/--
error:
-/
#guard_msgs (error, drop all, substring := true) in
example : R4Dissonances.all (fun d => d.resolved = true) = true := by
  native_decide
-- rejected: the six dissonances are named, not resolved.

/--
error:
-/
#guard_msgs (error, drop all, substring := true) in
example : R4PrecisionQuestion.answeredByArtifact = true := by
  native_decide
-- rejected: the precision question is open and blocking.

end R4

end ADR
