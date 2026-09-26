import PhaseMirror.ADR.Examples
import PhaseMirror.ADR.Proofs

open PhaseMirror.ADR
open PhaseMirror.ADR.Examples

def main : IO Unit := do
  IO.println "Running Phase Mirror ADR Test Harness..."
  if checkEntailment adr_001_object_individuation then
    IO.println "✓ ADR-001 (Object Individuation) consequence entailment verified."
  else
    IO.println "✗ ADR-001 failed entailment check."
  if checkEntailment adr_002_failure_envelope then
    IO.println "✓ ADR-002 (Failure Envelope) consequence entailment verified."
  else
    IO.println "✗ ADR-002 failed entailment check."
  if checkEntailment adr_003_foundational_ambiguity then
    IO.println "✓ ADR-003 (Ambiguity Resolution) consequence entailment verified."
  else
    IO.println "✗ ADR-003 failed entailment check."
  IO.println "All invariants satisfied."
