# ADR-RML-033: document `Governance/adr/ADR-042-MOC-Certificate-Integration.md` has 11 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/adr/ADR-042-MOC-Certificate-Integration.md` (mtime 2026-06-29 21:32:24Z)
- 11 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 0 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `302becc01d341eda`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `validate_l0_invariants` | theorem | L42 | DOC_STALE | update the document | (none) |
| `proof_hash` | theorem | L48 | DOC_STALE | update the document | (none) |
| `signature` | theorem | L49 | DOC_STALE | update the document | (none) |
| `signer_pubkey` | theorem | L49 | DOC_STALE | update the document | (none) |
| `validate_l0_invariants` | theorem | L50 | DOC_STALE | update the document | (none) |
| `signature` | theorem | L50 | DOC_STALE | update the document | (none) |
| `prime_decomposition` | theorem | L57 | DOC_STALE | update the document | (none) |
| `spectral_radius_num` | theorem | L57 | DOC_STALE | update the document | (none) |
| `spectral_radius_den` | theorem | L57 | DOC_STALE | update the document | (none) |
| `critical` | theorem | L59 | DOC_STALE | update the document | (none) |
| `recalibrate_l0_invariants` | theorem | L59 | DOC_STALE | update the document | (none) |

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
