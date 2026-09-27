import ADR.Core
import ADR.Proofs

/-! # ADR-0153: Phase Mirror Five Step Loop and PWEH

Formalizes the five-step diagnostic loop (Extract, Map, Rank, Produce, Precision
Question) as distinct from the PWEH receipt spine. The key invariant: Phase
Mirror names dissonance, does not halt; SIG_GOV_KILL stays with WardMonitor;
BN254 + Ed25519 is pre-quantum, labeled as such. -/

open ADR

/-- Helper to create an `ArtifactLink`. -/
def link_0153 (desc url : String) : ArtifactLink := ⟨url, .SpecificationDoc, desc⟩

/-- ADR-0153 definition: Five-step Phase Mirror loop and PWEH receipt spine. -/
@[adr]
def ADR_0153 : ADR :=
  { id := "ADR-0153"
    title := "Phase Mirror Five Step Loop and PWEH"
    status := ADRStatus.Accepted
    context := "The five-step diagnostic loop extracts claims, maps cracks, produces levers, and asks one precision question. PWEH is a proposed receipt spine, not one coat with the Mirror. PM-HE-001 already refused a fused coat. Phase Mirror is build-time diagnostic; PWEH is proposed UCC spine."
    decision := "Keep five-step loop as diagnostic that names tension and pins an owner. Keep PWEH as proposed spine (PM-PWEH-001). SIG_GOV_KILL stays WardMonitor. BN254+Ed25519 labeled pre-quantum. Contractivity stays UCC. person_id out of prime ledger."
    consequences := [ "Clean separation: Mirror (diagnostic) and PWEH (receipt) are distinct machines"
                    , "No silent halts: SIG_GOV_KILL reserved for WardMonitor"
                    , "BN254+Ed25519 labeled pre-quantum"
                    , "Contractivity isolation: Mirror does not evaluate Lipschitz"
                    , "UnsignedCrmfEnvelope remains specification draft" ]
    supersedes := none
    links := [ link_0153 "Source Document" "papers/Phase_Mirror_Five_Step_Loop_and_PWEH_v1.0.docx"
             , link_0153 "Field Binding Doc" "PM-PWEH-001"
             , link_0153 "ADR-0154 Honesty Engine" "Governance/ADR/accepted/ADR-0154-Phase_Mirror_Honesty_Engine_an.md" ] }

/-- ADR-0153 is Accepted. -/
@[proof]
theorem adr0153_accepted : ADR_0153.status = ADRStatus.Accepted := by
  rfl

/-- ADR-0153 has exactly five consequences. -/
@[proof]
theorem adr0153_consequences_count :
    ADR_0153.consequences.length = 5 := by
  decide

/-- ADR-0153 does not supersede any prior ADR. -/
@[proof]
theorem adr0153_no_supersession :
    ADR_0153.supersedes = none := by
  rfl
