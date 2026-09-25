import UCC.Core

namespace UCC.Export
open UCC.Core

def exportToMarkdown (a : ADR) : String :=
  s!"# ADR {a.id}: {a.title}\n" ++
  s!"**Status**: {repr a.status}\n\n" ++
  s!"## Context\n{a.context}\n\n" ++
  s!"## Decision\n{a.decision}\n\n" ++
  s!"## Consequences\n" ++ String.join (a.consequences.map (fun c => s!"- {c}\n"))

end UCC.Export
