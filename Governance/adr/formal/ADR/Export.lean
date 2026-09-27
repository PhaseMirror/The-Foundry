import ADR.Core

namespace ADR

def exportADRToMarkdown (adr : ADR) : String :=
  s!"# ADR-{adr.id.id}: {adr.title}\n\n" ++
  s!"## Status\n" ++
  (match adr.status with
   | .Proposed => "Proposed"
   | .Accepted => "Accepted"
   | .Deprecated => "Deprecated"
   | .Superseded => "Superseded") ++ "\n"

end ADR
