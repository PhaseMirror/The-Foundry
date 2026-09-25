import ADR.Export
import ADR.Examples


open ADR.Examples
open ADR.Export

/-- Canonical human-readable output directory for the verified ADR set. The
per-ADR artifacts (`<id>.{md,html,json}`) land in `docs/adr/accepted/`; the
machine-readable `registry.json` is written to the parent `docs/adr/`. -/
def docsDir : System.FilePath := System.FilePath.mk "docs" / "adr" / "accepted"

/-- `adrExport`: regenerate `docs/adr/{README.md,registry.json,<id>.{md,html,json}}`
from the machine-checked `unifiedRegistry`. Deterministic; safe to run in CI. -/
def main : IO Unit := do
  exportADRSet unifiedRegistry docsDir
  IO.println s!"Exported {unifiedRegistry.adrs.length} ADRs to {docsDir}"