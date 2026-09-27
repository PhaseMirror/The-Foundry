# ADR-RML-009: document `Governance/Archive_and_Drafts/Cloud Infrastructure.md` has 27 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/Archive_and_Drafts/Cloud Infrastructure.md` (mtime 2026-06-29 21:32:24Z)
- 27 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 0 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `d56e8643712a7339`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `google` | theorem | L20 | DOC_STALE | update the document | (none) |
| `google` | theorem | L46 | DOC_STALE | update the document | (none) |
| `google` | theorem | L56 | DOC_STALE | update the document | (none) |
| `multiplic` | theorem | L58 | DOC_STALE | update the document | (none) |
| `google` | theorem | L66 | DOC_STALE | update the document | (none) |
| `google` | theorem | L90 | DOC_STALE | update the document | (none) |
| `google` | theorem | L133 | DOC_STALE | update the document | (none) |
| `multiplic` | theorem | L134 | DOC_STALE | update the document | (none) |
| `google` | theorem | L146 | DOC_STALE | update the document | (none) |
| `dependabot` | theorem | L231 | DOC_STALE | update the document | (none) |
| `b98e2a2` | theorem | L231 | DOC_STALE | update the document | (none) |
| `pm2` | theorem | L265 | DOC_STALE | update the document | (none) |
| `multiplic` | theorem | L265 | DOC_STALE | update the document | (none) |
| `verify_recommendation_envelope` | theorem | L312 | DOC_STALE | update the document | (none) |
| `d7a656` | theorem | L312 | DOC_STALE | update the document | (none) |
| `verify_manifest` | theorem | L312 | DOC_STALE | update the document | (none) |
| `get_dir_hash` | theorem | L312 | DOC_STALE | update the document | (none) |
| `verify_recommendation_envelope` | theorem | L312 | DOC_STALE | update the document | (none) |
| `verify_recommendation_envelope` | theorem | L325 | DOC_STALE | update the document | (none) |
| `pirtm` | theorem | L327 | DOC_STALE | update the document | (none) |
| `get_dir_hash` | theorem | L329 | DOC_STALE | update the document | (none) |
| `get_dir_hash` | theorem | L331 | DOC_STALE | update the document | (none) |
| `verify_recommendation_envelope` | theorem | L339 | DOC_STALE | update the document | (none) |
| `get_dir_hash` | theorem | L340 | DOC_STALE | update the document | (none) |
| `verify_manifest` | theorem | L340 | DOC_STALE | update the document | (none) |
| `get_dir_hash` | theorem | L347 | DOC_STALE | update the document | (none) |
| `verify_recommendation_envelope` | theorem | L347 | DOC_STALE | update the document | (none) |

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
