-/!\
## ADR Test Harness
- Executes example ADRs and validates invariants.
-/

import Std.Data.List.Basic
import Std.Data.Option.Basic
import Lean
import Mathlib.Tactic
import ADR.Core
import ADR.Proofs
import ADR.Examples

open ADR
open ADR.Proofs
open ADR.Examples

namespace ADR.Test

/-- Run all example proofs to ensure they type‑check. -/
#eval (example2_immutable rfl rfl rfl)

/-- Export examples to markdown as a sanity check. -/
def runExport : IO Unit := do
  let ads := [example1, example2, example3]
  ADR.Export.exportAll ads

#eval runExport

end ADR.Test
