import PhaseMirror.ADR.Core
import PhaseMirror.ADR.Proofs

namespace PhaseMirror.ADR.Examples

def adr_001_object_individuation : ADR := {
  id := "ADR-001",
  title := "Procedure for Scientific Object Individuation",
  status := ADRStatus.Accepted,
  context := [
    "Linguistic behavior is an empirical domain with unresolved object-individuation problems.",
    "We need a procedure for deciding two results concern the same scientific object."
  ],
  decision := [
    "Object individuation is verified strictly by isomorphism of measured mathematical structures, not by shared informal engineering labels."
  ],
  consequences := [
    "Object individuation is verified strictly by isomorphism of measured mathematical structures, not by shared informal engineering labels.",
    "Linguistic behavior is an empirical domain with unresolved object-individuation problems."
  ],
  supersedes := none,
  links := []
}

def adr_002_failure_envelope : ADR := {
  id := "ADR-002",
  title := "Establishing the Failure Envelope and Intervention Scope",
  status := ADRStatus.Accepted,
  context := [
    "We must distinguish control of a label from control of a stable phenomenon.",
    "A standard prior stage is required that lets a proposed explanandum survive, restrict, fragment, or fail before mechanism discovery proceeds."
  ],
  decision := [
    "The failure envelope is established by observations showing the target mathematical structure fundamentally diverges from the empirical linguistic behavior."
  ],
  consequences := [
    "We must distinguish control of a label from control of a stable phenomenon."
  ],
  supersedes := none,
  links := []
}

def adr_003_foundational_ambiguity : ADR := {
  id := "ADR-003",
  title := "Separation of Methodological Conflation from Phenomenon",
  status := ADRStatus.Proposed,
  context := [
    "When a foundational ambiguity is stated in maximally threatening language, members of the field struggle to separate the insult from the methodological issue."
  ],
  decision := [
    "Foundational ambiguities must be re-stated strictly as constraints on the assumed mathematical structure."
  ],
  consequences := [
    "Foundational ambiguities must be re-stated strictly as constraints on the assumed mathematical structure."
  ],
  supersedes := none,
  links := []
}

theorem adr_001_entailed : ConsequencesEntailed adr_001_object_individuation := by
  intro c hc
  simp [adr_001_object_individuation, ConsequencesEntailed] at hc ⊢
  rcases hc with rfl | rfl
  · right
    simp
  · left
    simp

end PhaseMirror.ADR.Examples
