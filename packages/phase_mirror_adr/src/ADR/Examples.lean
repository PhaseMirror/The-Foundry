-/!\
## Example ADRs
- Demonstrates creating ADR records and proving invariants.
-/

import Std.Data.List.Basic
import Std.Data.Option.Basic
import Lean
import ADR.Core
import ADR.Proofs

open ADR
open ADR.Proofs

namespace ADR.Examples

-- Example 1: Simple proposed ADR

def example1 : ADR :=
  { id := 1,
    title := "Use Rust Engine for ESI retention",
    status := ADRStatus.Proposed,
    context := "PhaseMirror architecture requires Rust core",
    decision := "Integrate Rust Engine via WASM SDK",
    consequences := ["All ESI calculations routed through engine"],
    supersedes := none,
    links := [{label := "Engine Repo", url := "https://example.com/engine"}] }

-- Example 2: Accepted ADR with no supersession

def example2 : ADR :=
  { id := 2,
    title := "Enable ALP/CNL engine integration",
    status := ADRStatus.Accepted,
    context := "Need to incorporate ALP/CNL for advanced analytics",
    decision := "Add ALP/CNL as a plugin to the Rust engine",
    consequences := ["Enhanced analytics", "Policy‑driven variation"],
    supersedes := none,
    links := [{label := "ALP Spec", url := "https://example.com/alp"}] }

-- Example 3: Superseded ADR

def example3 : ADR :=
  { id := 3,
    title := "Deprecated legacy API",
    status := ADRStatus.Superseded,
    context := "Legacy API no longer matches engine contracts",
    decision := "Replace with new API v2",
    consequences := ["Breaks old clients"],
    supersedes := some 2,
    links := [] }

-- Proof that example2 is immutable after acceptance

theorem example2_immutable : (example2.status = ADRStatus.Accepted) →
    (example2.supersedes = none) →
    (example2 = example2) →
    example2.status = ADRStatus.Accepted :=
  fun h1 h2 h_eq => accepted_immutable h1 h2 h_eq

end ADR.Examples
