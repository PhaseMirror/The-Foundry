# ADR-RML-031: document `Governance/Archive_and_Drafts/UI_Plumbing.md` has 11 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/Archive_and_Drafts/UI_Plumbing.md` (mtime 2026-02-09 00:20:12Z)
- 9 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 2 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `0ff77c5ff16285f1`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `mis` | theorem | L7 | DOC_STALE | update the document | (none) |
| `pytest` | theorem | L21 | DOC_STALE | update the document | (none) |
| `mis` | theorem | L27 | DOC_STALE | update the document | (none) |
| `pytest` | theorem | L57 | DOC_STALE | update the document | (none) |
| `fail` | theorem | L130 | CODE_STALE | update the math/code | `rust/atlas/uor-framework/conformance/src/report.rs` |
| `pytest` | theorem | L159 | DOC_STALE | update the document | (none) |
| `vitest` | theorem | L159 | DOC_STALE | update the document | (none) |
| `playwright` | theorem | L159 | DOC_STALE | update the document | (none) |
| `dev` | theorem | L161 | DOC_STALE | update the document | (none) |
| `lint` | theorem | L161 | DOC_STALE | update the document | (none) |
| `build` | theorem | L161 | CODE_STALE | update the math/code | `rust/atlas/onnx-compiler/src/hrm/types.rs` |

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
