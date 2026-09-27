import ADR.Core

/-! # Lexical Formalization Primitives for ADR Claim Ladders

Shared helpers used across ADR-0158..ADR-0168 to bind claim-level invariants
to machine-checkable predicates without `sorry`.

These primitives provide:
- Token classification for governance-relevant lexical categories
- Claim ladder ceiling semantics (Modeled / Implemented / Assessed / Accepted / Certified)
- L0 plane tags (Civic / Computational / Research)
- Dollar-cap and threshold predicates (dual-control, kill-switch arithmetic)
- Artifact link construction shorthand -/

open ADR

namespace ADR.Lex

/-- Governance L0 plane classification. -/
inductive L0Plane where
  | Civic      : L0Plane
  | Computational : L0Plane
  | Research   : L0Plane
  deriving DecidableEq, Repr, Inhabited

/-- Claim ladder ceiling for an inventory at the gate. -/
inductive ClaimCeiling where
  | Modeled     : ClaimCeiling
  | Implemented : ClaimCeiling
  | Assessed    : ClaimCeiling
  | Accepted    : ClaimCeiling
  | Certified   : ClaimCeiling
  deriving DecidableEq, Repr, Inhabited

instance : ToString ClaimCeiling where
  toString
    | .Modeled     => "Modeled"
    | .Implemented => "Implemented"
    | .Assessed    => "Assessed"
    | .Accepted    => "Accepted"
    | .Certified   => "Certified"

/-- Ordering on claim ladder: ceiling must not exceed the permitted level. -/
def ClaimCeiling.le (c ceiling : ClaimCeiling) : Bool :=
  match c, ceiling with
  | .Modeled,     _           => true
  | .Implemented, .Implemented => true
  | .Implemented, .Assessed    => true
  | .Implemented, .Accepted   => true
  | .Implemented, .Certified  => true
  | .Assessed,    .Assessed   => true
  | .Assessed,    .Accepted   => true
  | .Assessed,    .Certified  => true
  | .Accepted,    .Accepted   => true
  | .Accepted,    .Certified  => true
  | .Certified,   .Certified  => true
  | _, _ => false

/-- Dollar-cap threshold for dual-control authorization (ADR-0160, ADR-0157). -/
abbrev DualControlThreshold : Nat := 2500

/-- Node capacity halt boundary (ADR-0152, ADR-0154, ADR-0157, ADR-0168). -/
abbrev NodeCap : Nat := 12

/-- Kill-switch fail count that pauses draws (ADR-0157, ADR-0160). -/
abbrev KillSwitchFailCount : Nat := 2

/-- Check whether a dollar amount exceeds the dual-control threshold. -/
def exceedsDualControl (amount : Nat) : Bool :=
  amount > DualControlThreshold

/-- Check whether a node count exceeds the cap. -/
def exceedsNodeCap (nodes : Nat) : Bool :=
  nodes > NodeCap

/-- Check whether kill-switch has tripped (two consecutive failures). -/
def killSwitchTripped (consecutiveFails : Nat) : Bool :=
  consecutiveFails >= KillSwitchFailCount

/-- Artifact link construction with explicit kind. -/
def artLink (kind : ArtifactKind) (desc uri : String) : ArtifactLink :=
  ⟨uri, kind, desc⟩

/-- Convenience: a Lean declaration link. -/
def leanLink (desc uri : String) : ArtifactLink :=
  artLink .LeanDeclaration desc uri

/-- Convenience: a specification doc link. -/
def specLink (desc uri : String) : ArtifactLink :=
  artLink .SpecificationDoc desc uri

/-- Convenience: a source file link. -/
def srcLink (desc uri : String) : ArtifactLink :=
  artLink .SourceFile desc uri

/-- Convenience: a git commit link. -/
def gitLink (desc uri : String) : ArtifactLink :=
  artLink .GitCommit desc uri

end ADR.Lex
