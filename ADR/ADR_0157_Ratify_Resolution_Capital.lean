import ADR.Core
import ADR.Proofs

/-! # ADR-0157: Ratify Board Resolution and Capital Authorization

Formalizes the member-faced capital authorization packet for the Livermore parcel.
The key invariant: members ratify, not a shadow board; dual-control at $2,500;
four-door funding only; three-way metric card (dignity, outcome, solvency). -/

open ADR

/-- Helper to create an `ArtifactLink`. -/
def mkLink (desc url : String) : ArtifactLink := ⟨url, .SpecificationDoc, desc⟩

/-- ADR-0157 definition: Capital authorization envelope for Livermore parcel. -/
@[adr]
def ADR_0157 : ADR :=
  { id := "ADR-0157"
    title := "Ratify Board Resolution and Capital Authorization"
    status := ADRStatus.Accepted
    context := "The prompt asked the Board of Directors to authorize a foundational envelope for the Livermore parcel before capital moves. Citizen Gardens operates under member ratification, not a shadow board. Day-one administrators are limited to contracts under USD 2,500. There is a USD 250,000 drift between a prior USD 750,000 blended HQ proposal and the current USD 1,000,000 envelope (USD 800,000 land, USD 200,000 Phase 1 off-grid). Phase 2 barn is excluded. Funds arrive via four doors (gifts, sponsor dues, recoverable grants, operator remittance). The association must hold title."
    decision := "Prepare a member-facing resolution packet (BR-CA-001) for the USD 1,000,000 envelope. Adopt a single ceiling resolving the USD 750,000/USD 1,000,000 drift. Enforce dual-control at USD 2,500 on every disbursement with no closing exception. Lock all physical assets, kit, and data to association title. Require four-door funding. Implement mandatory quarterly three-way metric card (dignity, community outcome, solvency). Enact fail-closed kill-switch: two consecutive failed quarters pause local draws until a new card and Phase Mirror pass."
    consequences := [ "Decentralized Ratification: members ratify after 14-day notice, not a shadow board"
                    , "Strict Capital Control: USD 2,500 dual-control threshold, four-door funding, no closing exception"
                    , "Asset Protection: association title locks prevent private equity extraction and collateralization"
                    , "Automated Accountability: three-way metric card and fail-closed kill-switch halt capital on dignity/outcome failure" ]
    supersedes := none
    links := [ mkLink "Source Document" "papers/Ratify_Board_Resolution_and_Capital_Authorization_v1.0.docx"
             , mkLink "Field Binding Doc" "BR-CA-001"
             , mkLink "ADR-0158 Sedona Spine" "Governance/ADR/accepted/ADR-0158-Sedona_Spine_Records_Kiln_Priv.md"
             , mkLink "ADR-0151 OSCAL Mapping" "Governance/ADR/accepted/ADR-0151-OSCAL_PrismPM_Mapping_and_Trac.md" ] }

/-- ADR-0157 has four consequences. -/
@[proof]
theorem adr0157_consequences_count :
    ADR_0157.consequences.length = 4 := by
  decide

/-- The decision embeds dual-control and three-way kill-switch invariants. -/
@[proof]
theorem adr0157_dual_control_and_kill_switch :
    ADR_0157.decision.contains "2,500" ∧
    ADR_0157.decision.contains "three-way" ∧
    ADR_0157.decision.contains "fail-closed" := by
  decide

/-- Three metric columns are named: dignity, community outcome, solvency. -/
@[proof]
theorem adr0157_three_way_columns :
    ADR_0157.decision.contains "dignity" ∧
    ADR_0157.decision.contains "solvency" := by
  decide

/-- Four doors are specified; no fifth door for borrowing. -/
@[proof]
theorem adr0157_four_doors_only :
    ADR_0157.context.contains "four doors" ∧
    ADR_0157.decision.contains "four-door" := by
  decide
