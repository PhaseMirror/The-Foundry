# ADR-RML-039: document `Governance/engines/iacfl/iacfl_phased_dev_blueprint.md` has 10 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/engines/iacfl/iacfl_phased_dev_blueprint.md` (mtime 2026-05-22 14:46:46Z)
- 9 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 1 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `7f12f854cef069c7`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `iacfl` | theorem | L19 | DOC_STALE | update the document | (none) |
| `run` | theorem | L218 | CODE_STALE | update the math/code | `rust/monitor/src/lib.rs` |
| `targeted_adversarial` | theorem | L219 | DOC_STALE | update the document | (none) |
| `full_axiom_report` | theorem | L258 | DOC_STALE | update the document | (none) |
| `rng` | theorem | L291 | DOC_STALE | update the document | (none) |
| `random_inputs_2d` | theorem | L292 | DOC_STALE | update the document | (none) |
| `random_inputs_4d` | theorem | L293 | DOC_STALE | update the document | (none) |
| `boundary_inputs_4d` | theorem | L294 | DOC_STALE | update the document | (none) |
| `acfl_reference_vectors` | theorem | L295 | DOC_STALE | update the document | (none) |
| `test_inverted_conjunction_equals_standard_disjunction` | theorem | L305 | DOC_STALE | update the document | (none) |

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
