# ADR-RML-028: document `Governance/adr/accepted/ADR-120-Lean4-ADR-Scaffolding.md` has 13 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/adr/accepted/ADR-120-Lean4-ADR-Scaffolding.md` (mtime 2026-07-25 13:11:08Z)
- 11 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 2 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `1cf735247e2ff925`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `evalProp` | theorem | L105 | DOC_STALE | update the document | (none) |
| `accepted_is_immutable_without_override` | theorem | L144 | DOC_STALE | update the document | (none) |
| `isAcyclic` | theorem | L153 | DOC_STALE | update the document | (none) |
| `adr118Context` | theorem | L169 | DOC_STALE | update the document | (none) |
| `adr118Decision` | theorem | L170 | DOC_STALE | update the document | (none) |
| `adr118Consequence1` | theorem | L171 | DOC_STALE | update the document | (none) |
| `adr118_entailment` | theorem | L173 | DOC_STALE | update the document | (none) |
| `adr118` | theorem | L177 | DOC_STALE | update the document | (none) |
| `exportADRToMarkdown` | theorem | L201 | DOC_STALE | update the document | (none) |
| `context` | theorem | L247 | CODE_STALE | update the math/code | `rust/atlas/uor-framework/foundation/src/user/state.rs` |
| `decision` | theorem | L247 | CODE_STALE | update the math/code | `rust/governance/src/phase_mirror/report.rs` |
| `entailment_proof` | theorem | L249 | DOC_STALE | update the document | (none) |
| `supersedes` | theorem | L256 | DOC_STALE | update the document | (none) |

## Decision (the lever)
Apply each row's lever in the direction given by its triage class. A claim is
resolved when a re-run flips it to GOLDEN (it resolves to a `sorry`-free
declaration).

## Consequences
- **Positive**: the drift between stated intent and developed reality is
  surfaced with a single deterministic direction per claim.
- **Negative / Constraints**: triage is timestamp-based; a `touch` without a
  content change may mis-classify (mitigated: sorry-free resolutions are always
  GOLDEN).
- **Verification Strategy**: re-run `scripts/recursive_phase_mirror.py --once`;
  resolved claims must exit this document's cluster.

## Links
- Master index: `Governance/adr/proposed/ADR-Plan-Recursive-Phase-Mirror-Loop.md`
- State ledger: `state/recursive_phase_mirror.json`
- ADR: `Governance/adr/accepted/ADR-232-Recursive-Phase-Mirror-Loop-on-Prime.md`
