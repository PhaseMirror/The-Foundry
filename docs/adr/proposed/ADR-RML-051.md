# ADR-RML-051: document `Governance/Archive_and_Drafts/Phase 2 — API Client & Zustand Stores_ Comprehensi.md` has 7 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/Archive_and_Drafts/Phase 2 — API Client & Zustand Stores_ Comprehensi.md` (mtime 2026-02-10 00:38:44Z)
- 6 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 1 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `e6b4982aa20cbe21`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `fetch` | theorem | L126 | DOC_STALE | update the document | (none) |
| `axios` | theorem | L126 | DOC_STALE | update the document | (none) |
| `any` | theorem | L2080 | DOC_STALE | update the document | (none) |
| `details` | theorem | L2080 | DOC_STALE | update the document | (none) |
| `config` | theorem | L2089 | CODE_STALE | update the math/code | `rust/atlas/hologram-app/src/lib.rs` |
| `steps` | theorem | L2091 | DOC_STALE | update the document | (none) |
| `any` | theorem | L2173 | DOC_STALE | update the document | (none) |

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
