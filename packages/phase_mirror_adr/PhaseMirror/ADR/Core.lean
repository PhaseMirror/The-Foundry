namespace PhaseMirror.ADR

inductive ADRStatus where
  | Proposed
  | Accepted
  | Deprecated
  | Superseded
  deriving Repr, DecidableEq

structure ArtifactLink where
  url : String
  description : String
  deriving Repr, DecidableEq

structure ADR where
  id : String
  title : String
  status : ADRStatus
  context : List String
  decision : List String
  consequences : List String
  supersedes : Option String
  links : List ArtifactLink
  deriving Repr, DecidableEq

end PhaseMirror.ADR
