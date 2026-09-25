import AdrLedger.Core
import AdrLedger.Proofs

namespace AdrLedger

def id_adr005 := "ADR-005"
def id_pm_pweh := "PM-PWEH-001"

/-- Step 1: Both are published. -/
def step1 : Ledger :=
  [Event.publish id_pm_pweh, Event.publish id_adr005]

/-- Step 2: ADR-005 is accepted. PM-PWEH-001 stays proposed pending dual-seat. -/
def step2 : Ledger :=
  Event.accept id_adr005 :: step1

theorem step2_valid : Valid step2 := by
  apply Valid.accept
  · apply Valid.publish
    · apply Valid.publish
      · exact Valid.nil
      · rfl
    · rfl
  · rfl

/-- Proof that ADR-005 is accepted in step2. -/
theorem adr005_is_accepted : getStatus id_adr005 step2 = some Status.accepted :=
  rfl

/-- Proof that PM-PWEH-001 is ONLY proposed in step2. -/
theorem pm_pweh_is_proposed : getStatus id_pm_pweh step2 = some Status.proposed :=
  rfl

end AdrLedger
