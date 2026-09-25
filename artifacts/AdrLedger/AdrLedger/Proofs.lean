import AdrLedger.Core

namespace AdrLedger

/-- Draft never hide-accepts. Proved without sorry. -/
theorem hide_draft_never_accepts : hideAccepts Wire.unboundDraft = false :=
  rfl

/-- Self-supersede is never valid. Proved by inversion of the Valid constructor. -/
theorem no_self_supersede (id : String) (h : Ledger) : ¬ Valid (Event.supersede id id :: h) := by
  intro v
  cases v with
  | supersede _ h_neq _ _ => 
    exact h_neq rfl

/-- If an ID is unknown, it cannot be accepted. -/
theorem unknown_cannot_accept (id : String) (h : Ledger) :
  getStatus id h = none → ¬ Valid (Event.accept id :: h) := by
  intro h_none v
  cases v with
  | accept _ h_status =>
    rw [h_none] at h_status
    contradiction

/-- Foreign events (events not targeting `id`) do not alter `id`'s status. -/
theorem foreign_event_survival (id foreign_id : String) (h : Ledger) (h_neq : foreign_id ≠ id) :
  getStatus id (Event.accept foreign_id :: h) = getStatus id h := by
  dsimp [getStatus]
  split
  · next h_eq => exact False.elim (h_neq h_eq)
  · rfl

end AdrLedger
