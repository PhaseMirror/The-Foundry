# ADR-RML-004: document `Governance/architecture/YantraUniverse.md` has 41 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/architecture/YantraUniverse.md` (mtime 2026-06-29 21:32:23Z)
- 39 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 2 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `737149ab00091e77`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `coend` | theorem | L87 | DOC_STALE | update the document | (none) |
| `meta` | theorem | L235 | DOC_STALE | update the document | (none) |
| `y` | theorem | L235 | DOC_STALE | update the document | (none) |
| `meta` | theorem | L237 | DOC_STALE | update the document | (none) |
| `y` | theorem | L237 | DOC_STALE | update the document | (none) |
| `invalid` | theorem | L241 | DOC_STALE | update the document | (none) |
| `s` | theorem | L241 | DOC_STALE | update the document | (none) |
| `yantra` | theorem | L261 | DOC_STALE | update the document | (none) |
| `g` | theorem | L261 | DOC_STALE | update the document | (none) |
| `raph` | theorem | L261 | DOC_STALE | update the document | (none) |
| `d` | theorem | L261 | DOC_STALE | update the document | (none) |
| `recursive` | theorem | L271 | DOC_STALE | update the document | (none) |
| `f` | theorem | L271 | DOC_STALE | update the document | (none) |
| `low` | theorem | L271 | DOC_STALE | update the document | (none) |
| `yantra` | theorem | L293 | DOC_STALE | update the document | (none) |
| `g` | theorem | L293 | DOC_STALE | update the document | (none) |
| `raph` | theorem | L293 | DOC_STALE | update the document | (none) |
| `d` | theorem | L293 | DOC_STALE | update the document | (none) |
| `meta` | theorem | L311 | DOC_STALE | update the document | (none) |
| `y` | theorem | L311 | DOC_STALE | update the document | (none) |
| `invalid` | theorem | L315 | DOC_STALE | update the document | (none) |
| `s` | theorem | L315 | DOC_STALE | update the document | (none) |
| `f` | theorem | L323 | DOC_STALE | update the document | (none) |
| `sefer` | theorem | L377 | DOC_STALE | update the document | (none) |
| `y` | theorem | L377 | DOC_STALE | update the document | (none) |
| `hekhalot` | theorem | L377 | DOC_STALE | update the document | (none) |
| `r` | theorem | L377 | CODE_STALE | update the math/code | `rust/atlas/atlas_utqc/crates/tqc-mtc/src/lib.rs` |
| `sefer` | theorem | L381 | DOC_STALE | update the document | (none) |
| `y` | theorem | L381 | DOC_STALE | update the document | (none) |
| `nit` | theorem | L397 | DOC_STALE | update the document | (none) |
| `py` | theorem | L397 | DOC_STALE | update the document | (none) |
| `valid` | theorem | L415 | CODE_STALE | update the math/code | `rust/uor/r4/crates/uor-r4-graph-format/tests/stage2.rs` |
| `s` | theorem | L415 | DOC_STALE | update the document | (none) |
| `invalid` | theorem | L415 | DOC_STALE | update the document | (none) |
| `s` | theorem | L415 | DOC_STALE | update the document | (none) |
| `recursive` | theorem | L585 | DOC_STALE | update the document | (none) |
| `f` | theorem | L585 | DOC_STALE | update the document | (none) |
| `low` | theorem | L585 | DOC_STALE | update the document | (none) |
| `su3` | theorem | L585 | DOC_STALE | update the document | (none) |
| `c` | theorem | L585 | DOC_STALE | update the document | (none) |
| `urvature` | theorem | L585 | DOC_STALE | update the document | (none) |

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
