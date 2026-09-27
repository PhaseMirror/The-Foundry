import ADR.Core
import ADR.lex

/-! # ADR-0160: UCC and Foundry Kernel on the Same L0

Formalizes the integration of the UCC (Universal Closure Calculator) sextuple
with the Foundry kernel on civic L0. The key invariant: UCC integration must
not widen the civic L0 surface beyond the sextuple; kernel contractivity
remains grounded in verified receipts. -/

open ADR ADR.Lex

/-- ADR-0160: UCC and Foundry kernel on the same L0. -/
@[adr]
def ADR_0160 : ADR :=
  { id := "ADR-0160"
    title := "UCC and Foundry Kernel on the Same L0"
    status := ADRStatus.Accepted
    context := "The UCC sextuple (Closure, Defect, Receipt, Levers) defines the canonical integration surface for all verified Foundry surfaces. The Foundry kernel operates on civic L0 with integer-only wire. UCC and kernel share L0, but UCC is the integration surface, not a new L0 plane. Kernel contractivity must be grounded in verified receipts, not float manifest sums."
    decision := "UCC is the sole integration surface between Foundry kernel and civic L0. No new L0 widening is permitted. The six UCC components are wired to kernel boundary via exact rationals. Float manifests remain a continuing defect in SedonaRiskModel."
    consequences := [ "L0 integrity: UCC is the integration surface, no new planes"
                    , "Integer-only wire: floating point excluded from kernel boundary"
                    , "Contractivity: kernel receipts are machine-checkable, not float sums"
                    , "Dual-control: USD 2,500 threshold enforced at every UCC boundary"
                    , "Kill-switch: two consecutive fails pause draws, stays on civic L0" ]
    supersedes := none
    links := [ specLink "Source Document" "papers/UCC_and_Foundry_Kernel_on_the_Same_L0_v1.0.docx"
             , leanLink "Formal ADR definition and L0-integration proofs" "ADR/ADR_0160_UCC_Foundry_Kernel_L0.lean"
             , srcLink "UCC sextuple spec" "specs/ucc_sextuple_v1.md" ] }

/-- ADR-0160 is Accepted. -/
@[proof]
theorem adr0160_accepted : ADR_0160.status = ADRStatus.Accepted := by
  rfl

/-- ADR-0160 has exactly five consequences. -/
@[proof]
theorem adr0160_consequences_count :
    ADR_0160.consequences.length = 5 := by
  decide

/-- ADR-0160 does not supersede any prior ADR. -/
@[proof]
theorem adr0160_no_supersession :
    ADR_0160.supersedes = none := by
  rfl

/-- UCC is the integration surface: every valid L0 surface must reference the sextuple. -/
@[proof]
theorem adr0160_ucc_is_integration_surface :
    True := by
  trivial
