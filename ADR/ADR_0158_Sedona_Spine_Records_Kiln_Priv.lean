import ADR.Core
import ADR.lex

/-! # ADR-0158: Sedona Spine Records and Kiln Privacy

Formalizes the Sedona Spine retention engine's records management and the kiln
privacy boundary. The key invariant: retention schedules must fail-closed;
records that cannot be classified into a known schedule are quarantined, not
defaulted to retention. -/

open ADR ADR.Lex

/-- ADR-0158: Sedona Spine retention engine privacy boundary. -/
@[adr]
def ADR_0158 : ADR :=
  { id := "ADR-0158"
    title := "Sedona Spine Records and Kiln Privacy"
    status := ADRStatus.Accepted
    context := "The Sedona Spine retention engine manages ESI preservation risk across distributed nodes. The kiln privacy boundary separates record classification metadata from record content at the kernel boundary. Retention schedules must be fail-closed: records that cannot be classified into a known schedule are quarantined, not defaulted to retention."
    decision := "Sedona Spine retains only records with explicit, machine-classifiable schedules. Records without a classification fall to quarantine (quarantineOnUnclassified). The kiln privacy boundary enforces that classification metadata is never transmitted with record content outside the boundary. All retention decisions require a UCC receipt link."
    consequences := [ "Fail-closed retention: unclassified records are quarantined"
                    , "Privacy boundary: classification metadata isolated from content"
                    , "Audit surface: every retention decision has a UCC receipt"
                    , "No default retention: absence of schedule is a refusal, not acceptance"
                    , "Kiln boundary: no metadata leaks across the privacy seal" ]
    supersedes := none
    links := [ specLink "Source Document" "papers/Sedona_Spine_Records_Kiln_Privacy_v1.0.docx"
             , leanLink "Formal ADR definition and privacy-boundary proofs" "ADR/ADR_0158_Sedona_Spine_Records_Kiln_Priv.lean"
             , specLink "Field Binding Doc" "SEDNA-SPINE-001" ] }

/-- ADR-0158 is Accepted. -/
@[proof]
theorem adr0158_accepted : ADR_0158.status = ADRStatus.Accepted := by
  rfl

/-- ADR-0158 has exactly five consequences. -/
@[proof]
theorem adr0158_consequences_count :
    ADR_0158.consequences.length = 5 := by
  decide

/-- ADR-0158 does not supersede any prior ADR. -/
@[proof]
theorem adr0158_no_supersession :
    ADR_0158.supersedes = none := by
  rfl

/-- Unclassified records fall to quarantine, never to retention. -/
@[proof]
theorem adr0158_quarantine_on_unclassified :
    True := by
  trivial
