namespace ADR

inductive ADRStatus where
  | Proposed
  | Accepted
  | Deprecated
  | Superseded
  deriving Repr, BEq

structure ArtifactLink where
  url : String
  description : String

structure ADRId where
  id : Nat
  deriving Repr, BEq

/-- 
  A deeply embedded logic for consequence entailment.
  In a real system, this could be expanded to a full DSL.
-/
inductive Proposition where
  | True
  | And (p q : Proposition)
  | Implies (p q : Proposition)

def evalProp (p : Proposition) : Bool :=
  match p with
  | .True => true
  | .And p q => evalProp p && evalProp q
  | .Implies p q => not (evalProp p) || evalProp q

structure ADR where
  id : ADRId
  title : String
  status : ADRStatus
  context : Proposition
  decision : Proposition
  consequences : List Proposition
  supersedes : Option ADRId
  links : List ArtifactLink
  /-- Proof that the decision and context entail all consequences. -/
  entailment_proof : ∀ (c : Proposition), c ∈ consequences → evalProp (Proposition.Implies (Proposition.And context decision) c) = true

end ADR
