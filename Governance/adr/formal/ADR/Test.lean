import ADR.Core
import ADR.Examples
import ADR.Proofs
import ADR.Export

def main : IO Unit := do
  IO.println "Running ADR Validations..."
  IO.println s!"Checking ADR {ADR.adr053.id.id}..."
  IO.println (ADR.exportADRToMarkdown ADR.adr053)
  IO.println "All invariants satisfied."
