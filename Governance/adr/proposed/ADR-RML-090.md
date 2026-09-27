# ADR-RML-090: document `Governance/roadmaps/DEPLOYMENT_AUDIT_REPORT_PRE_SEPOLIA.md` has 3 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/roadmaps/DEPLOYMENT_AUDIT_REPORT_PRE_SEPOLIA.md` (mtime 2026-06-29 21:32:23Z)
- 3 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 0 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `d668a452e3712790`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `aa0c52c1aed52ec29a284269f5d5ca43b384bbea5ed72f57813a2ef97e56a3a1` | theorem | L13 | DOC_STALE | update the document | (none) |
| `f01477acfc3c8c9051a517ede1a7b06a4308f0ac9ca26d7108f01d0986fc009f` | theorem | L14 | DOC_STALE | update the document | (none) |
| `b40faae7db6966d416d34c8799c5b0e8a1acca348e48e2f015b2fbbdee99c18d` | theorem | L18 | DOC_STALE | update the document | (none) |

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
