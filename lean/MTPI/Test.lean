import MTPI.ADR
import MTPI.Proofs
import MTPI.Examples
import MTPI.ADR0169

open MTPI
open MTPI.Examples
open MTPI.Neuroplasticity
open MTPI.Neuroplasticity.Proofs

def main : IO Unit := do
  let adr := mtpi_adr_045
  if adr.status == ADRStatus.Accepted then
    IO.println "Test Passed: ADR-045 successfully anchored as Accepted & Verified."
  else
    IO.println "Test Failed: Invariant breached."

  let adapter := MTPI.Neuroplasticity.defaultAdapter
  if MTPI.Neuroplasticity.isRead adapter.cap then
    IO.println "Test Passed: EchoBraid adapter read-only capability verified."
  else
    IO.println "Test Failed: EchoBraid adapter lost read-only guarantee."

  let s0 : CognitiveState := { personId := "alice", epoch := 0, entropy := 10 }
  let s1 : CognitiveState := { personId := "alice", epoch := 1, entropy := 9 }
  if csc_tier4_gate s0 s1 = .accept then
    IO.println "Test Passed: CSC gate accepts non-expansion transition."
  else
    IO.println "Test Failed: CSC gate rejected valid transition."

  let s2 : CognitiveState := { personId := "alice", epoch := 1, entropy := 15 }
  if csc_tier4_gate s0 s2 = .veto then
    IO.println "Test Passed: CSC gate vetoes entropy expansion."
  else
    IO.println "Test Failed: CSC gate accepted CSL violation."

  if MTPI.Neuroplasticity.adr_0169.consequences.length = 5 then
    IO.println "Test Passed: ADR-0169 has exactly 5 consequences."
  else
    IO.println "Test Failed: ADR-0169 consequence count mismatch."

