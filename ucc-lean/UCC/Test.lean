import UCC.Core
import UCC.Proofs
open UCC.Core

-- 1. Valid Proposal
def adr_v1_proposed : ADR := {
  id := "UCC-001", title := "Adopt Lean 4 for Closure", status := ADRStatus.Proposed,
  context := "G=0 environment requires formal verification.",
  decision := "Implement UCC in Lean 4 without mathlib.",
  consequences := ["Strict formal proofs required", "No external dependencies"],
  supersedes := none, links := []
}

theorem proof_init : ADRHistory [adr_v1_proposed] := 
  ADRHistory.init adr_v1_proposed rfl

-- 2. Valid Acceptance
def adr_v1_accepted : ADR := { adr_v1_proposed with status := ADRStatus.Accepted }

theorem proof_accept : ADRHistory [adr_v1_accepted, adr_v1_proposed] := 
  ADRHistory.accept adr_v1_proposed adr_v1_accepted [] proof_init rfl rfl rfl

def testMain : IO Unit := do
  IO.println "Running UCC Test Harness..."
  IO.println s!"Validating ADR: {adr_v1_accepted.id}"
  IO.println "All proofs type-checked successfully."
