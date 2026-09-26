# ADR-RML-024: document `Governance/engines/crmf/DNA KEY + CRMF + ΛProof.md` has 11 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/engines/crmf/DNA KEY + CRMF + ΛProof.md` (mtime 2026-05-22 14:46:46Z)
- 10 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 1 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `b6f84ad91e64a67b`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `nbf` | theorem | L177 | DOC_STALE | update the document | (none) |
| `bindings` | theorem | L217 | DOC_STALE | update the document | (none) |
| `expiry` | theorem | L301 | DOC_STALE | update the document | (none) |
| `nullifier` | theorem | L303 | DOC_STALE | update the document | (none) |
| `nbf` | theorem | L305 | DOC_STALE | update the document | (none) |
| `transform_id` | theorem | L309 | DOC_STALE | update the document | (none) |
| `parameters` | theorem | L311 | DOC_STALE | update the document | (none) |
| `scores` | theorem | L329 | DOC_STALE | update the document | (none) |
| `mode` | theorem | L329 | DOC_STALE | update the document | (none) |
| `version` | theorem | L333 | CODE_STALE | update the math/code | `rust/atlas/onnx-compiler/src/lib.rs` |
| `signature` | theorem | L345 | DOC_STALE | update the document | (none) |

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
