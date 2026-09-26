-/!\
## ADR Exporter
- Generates human‑readable markdown (and optionally HTML) files from proved ADRs.
- For production, hook this into CI to emit docs/ folder.
-/

import Std.Data.List.Basic
import Std.Data.Option.Basic
import Lean
import System
import ADR.Core
import ADR.Proofs

open Std
open System
open ADR

namespace ADR.Export

/-- Render a single ADR as markdown string. -/
def renderADR (a : ADR) : String :=
  let header := s!"## ADR ${a.id}: ${a.title}\n"
  let status := s!"**Status:** ${a.status}\n"
  let context := s!"**Context:** ${a.context}\n"
  let decision := s!"**Decision:** ${a.decision}\n"
  let cons := "**Consequences:**\n" ++ (a.consequences.map (fun c => "- " ++ c)).foldl (· ++ "\n" ++ ·) ""
  let links := "**Links:**\n" ++ (a.links.map (fun l => s!"- [${l.label}](${l.url})")).foldl (· ++ "\n" ++ ·) ""
  header ++ status ++ context ++ decision ++ cons ++ "\n" ++ links ++ "\n"

/-- Write a list of ADRs to `docs/` directory as separate markdown files. -/
def exportAll (ads : List ADR) : IO Unit := do
  let docsDir := "docs"
  IO.FS.createDirAll docsDir
  for a in ads do
    let content := renderADR a
    let filePath := s!"${docsDir}/ADR_${a.id}.md"
    IO.FS.writeFile filePath content
    pure ()

end ADR.Export
