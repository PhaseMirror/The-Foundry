namespace UCC.Core

inductive ADRStatus where
  | Proposed
  | Accepted
  | Deprecated
  | Superseded
  deriving Repr, DecidableEq

structure ArtifactLink where
  url : String
  description : String
  deriving Repr

structure ADR where
  id : String
  title : String
  status : ADRStatus
  context : String
  decision : String
  consequences : List String
  supersedes : Option String
  links : List ArtifactLink
  deriving Repr

/-- Defines the valid, reconstructible history of an ADR chain. -/
inductive ADRHistory : List ADR → Prop where
  | init (a : ADR) : 
      a.status = ADRStatus.Proposed → 
      ADRHistory [a]
  | accept (a a' : ADR) (rest : List ADR) (h : ADRHistory (a :: rest)) :
      a'.id = a.id →
      a.status = ADRStatus.Proposed →
      a'.status = ADRStatus.Accepted →
      ADRHistory (a' :: a :: rest)
  | supersede (a a' : ADR) (rest : List ADR) (h : ADRHistory (a :: rest)) :
      a.status = ADRStatus.Accepted →
      a'.status = ADRStatus.Superseded →
      a'.supersedes = some a.id →
      ADRHistory (a' :: a :: rest)

end UCC.Core
