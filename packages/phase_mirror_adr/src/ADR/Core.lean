-/!\n## Core ADR Model Definitions
- This module defines the core data structures and basic invariants for Architecture Decision Records (ADRs).
- It follows the strict contract for Phase Mirror production deployment.
-/

import Std.Data.List.Basic
import Std.Data.Option.Basic
import Lean

open Std

/-- Identifier type for ADRs. Using `Nat` for simplicity; can be replaced by UUID strings. -/
abbrev ADRId := Nat

/-- Links to external artifacts (e.g., Git commits, documents). -/
structure ArtifactLink where
  label : String
  url   : String
deriving Repr, Inhabited

/-- Enumeration of possible ADR statuses. -/
inductive ADRStatus where
  | Proposed
  | Accepted
  | Deprecated
  | Superseded
  deriving Repr, Inhabited, DecidableEq

/-- Main ADR record. -/
structure ADR where
  id            : ADRId
  title         : String
  status        : ADRStatus
  context       : String
  decision      : String
  consequences  : List String
  supersedes    : Option ADRId
  links         : List ArtifactLink
  deriving Repr, Inhabited

namespace ADR

/-- Helper to retrieve the status of an ADR. -/
@[simp] def getStatus (a : ADR) : ADRStatus := a.status

/-- Predicate: An ADR is immutable after being Accepted unless superseded. -/
@[simp] def isImmutable (a : ADR) : Bool :=
  match a.status with
  | ADRStatus.Accepted => true
  | _ => false

end ADR
