import ADR.Core
import ADR.Proofs

/-! # ADR-0152: PIRTM and Foundry Kiln and Clay

Formalizes the jurisdictional split between computational L0 (PIRTM) and civic L0
(Foundry). The key invariant: contractivity bounds (c < 1, ||G||₁ < 1.0) are
computational L0, not civic bylaws; SIG_GOV_KILL stays with WardMonitor. -/

open ADR

/-- Helper to create an `ArtifactLink`. -/
def link_0152 (desc url : String) : ArtifactLink := ⟨url, .SpecificationDoc, desc⟩

/-- ADR-0152 definition: PIRTM research engine vs Foundry clay. -/
@[adr]
def ADR_0152 : ADR :=
  { id := "ADR-0152"
    title := "PIRTM and Foundry Kiln and Clay"
    status := ADRStatus.Accepted
    context := "PIRTM is the dynamical substrate (prime-indexed tensors, contractive bounds). Foundry is the open bench. Year-one product is UCC, not PIRTM. Calling them already certified architecture skips the claim ladder. Computational L0 stays off civic L0."
    decision := "Keep computational L0 off civic L0. Primes index primitives not members. Exact rationals at kernel boundary (ADR-001, N=1024). SIG_GOV_KILL stays WardMonitor. NODE_CAP = 12 is the halt."
    consequences := [ "Clean plane separation: computational vs civic L0"
                    , "No vote weight from exponents"
                    , "SIG_GOV_KILL reserved for WardMonitor"
                    , "Float in SedonaRiskModel named as continuing defect"
                    , "No Hall of Record until SS-001 split-ESI is built" ]
    supersedes := none
    links := [ link_0152 "Source Document" "papers/PIRTM_and_Foundry_Kiln_and_Clay_v1.0.docx"
             , link_0152 "ADR-0151 OSCAL Mapping" "Governance/ADR/accepted/ADR-0151-OSCAL_PrismPM_Mapping_and_Trac.md"
             , link_0152 "ADR-0153 Five-Step Loop" "Governance/ADR/accepted/ADR-0153-Phase_Mirror_Five_Step_Loop_an.md" ] }

/-- ADR-0152 is Accepted. -/
@[proof]
theorem adr0152_accepted : ADR_0152.status = ADRStatus.Accepted := by
  rfl

/-- ADR-0152 has exactly five consequences. -/
@[proof]
theorem adr0152_consequences_count :
    ADR_0152.consequences.length = 5 := by
  decide

/-- ADR-0152 does not supersede any prior ADR. -/
@[proof]
theorem adr0152_no_supersession :
    ADR_0152.supersedes = none := by
  rfl
