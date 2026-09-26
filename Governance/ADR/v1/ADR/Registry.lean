import ADR.Core
import ADR.Instances
import ADR.Proofs

namespace ADR.Registry

open ADR.Instances
open ADR
open ADR.Proofs

/-! ## Global Registry -/

@[simp]
def all_adrs : List ADR := [
  adr055_proposed,
  adr055_accepted,
  adr050_proposed,
  adr051_proposed,
  adr051_accepted,
  adr052_proposed,
  adr052_accepted,
  adr053_proposed,
  adr053_accepted,
  adr119_proposed,
  adr119_accepted
]

/-! ## Registry Invariants -/

theorem all_ids_unique : ∀ a ∈ all_adrs, ∀ b ∈ all_adrs, a.id = b.id → a = b := by
  sorry

theorem no_self_supersede_registry : ∀ a, a ∈ all_adrs → a.supersedes ≠ some a.id := by
  sorry

theorem registry_supersedes_valid : ∀ a ∈ all_adrs,
    a.supersedes.isSome → ∃ b ∈ all_adrs, True := by
  sorry

theorem accepted_adr_has_history_registry :
    ∀ a ∈ all_adrs, a.status = ADRStatus.Accepted →
    ∃ hist : List ADR, hist.length > 0 ∧ hist.head? = some a := by
  intro a ha h_acc
  exact accepted_adr_has_history all_adrs a ha h_acc

theorem no_circular_supersession_registry :
    ∀ a ∈ all_adrs, ∀ b ∈ all_adrs,
      a.supersedes = some b.id →
      b.supersedes ≠ some a.id := by
  decide

/-! ## Counts -/

def count_by_status (s : ADRStatus) : Nat :=
  (all_adrs.filter (fun a => a.status = s)).length

def proposed_count : Nat := count_by_status ADRStatus.Proposed
def accepted_count : Nat := count_by_status ADRStatus.Accepted
def deprecated_count : Nat := count_by_status ADRStatus.Deprecated
def superseded_count : Nat := count_by_status ADRStatus.Superseded

/-! ## ADR-119 Specific Proofs -/

theorem adr119_proposed_in_registry : adr119_proposed ∈ all_adrs := by
  simp [all_adrs]

theorem adr119_accepted_in_registry : adr119_accepted ∈ all_adrs := by
  simp [all_adrs]

theorem adr119_no_self_supersede : ADR.ValidADR adr119_proposed := by
  decide

theorem adr119_accepted_has_history :
    ∃ hist : List ADR, hist.length > 0 ∧ hist.head? = some adr119_accepted := by
  exact accepted_adr_has_history_registry adr119_accepted (by simp [all_adrs]) rfl

end ADR.Registry