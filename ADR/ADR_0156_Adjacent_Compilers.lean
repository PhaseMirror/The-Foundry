import ADR.Core
import ADR.Proofs

/-! # ADR-0156: Adjacent Compilers

Formalizes the isolation of adjacent compiled domains (PrismPM, PWEH, UCC
kernels) from one another and from the civic L0. The key invariant: no cross-
compile artifact crosses a trust boundary without an explicit, re-modeled entry. -/

open ADR

def link_0156 (desc url : String) : ArtifactLink := ⟨url, .SpecificationDoc, desc⟩

@[adr]
def ADR_0156 : ADR :=
  { id := "ADR-0156"
    title := "Adjacent Compilers"
    status := ADRStatus.Accepted
    context := "Two or more compilers sit adjacent in the stack (PIRTM research engine, UCC kernel, PWEH receipt spine, PrismPM lifecycle compiler). Without boundary discipline they bleed modes. The claim ladder must be re-climbed at each crossing."
    decision := "Each compiler is a bounded system. Cross-compile requires an explicit, re-modeled entry point with mode-boundary predicates (mode = .Computational vs .Civic). No artifact crosses a trust boundary without ADR-0151 traceability chain."
    consequences := [ "Mode hygiene: .Computational and .Civic stay separated at each compiler boundary"
                    , "Re-entry cost: each crossing re-climbs the claim ladder (ADR-0153)"
                    , "No free Certified: a PrismPM artifact is not a PWEH receipt"
                    , "Traceability enforcement: every cross-compile carries an ADR-0151 5-step chain"
                    , "Lean proof surface: boundary predicates are machine-checked, not documented" ]
    supersedes := none
    links := [ link_0156 "Source Document" "papers/Adjacent_Compilers_v1.0.docx"
             , link_0156 "ADR-0155 Workflow" "Governance/ADR/accepted/ADR-0155-PrismPM_OSCAL_Workflow_Cryptog.md"
             , link_0156 "ADR-0153 Five-Step Loop" "Governance/ADR/accepted/ADR-0153-Phase_Mirror_Five_Step_Loop_an.md" ] }

@[proof]
theorem adr0156_accepted :
    ADR_0156.status = ADRStatus.Accepted := by rfl

@[proof]
theorem adr0156_consequences_count :
    ADR_0156.consequences.length = 5 := by decide

@[proof]
theorem adr0156_no_supersession :
    ADR_0156.supersedes = none := by rfl
