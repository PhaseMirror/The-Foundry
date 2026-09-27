# ADR-RML-011: document `Governance/research/self‑contained Lean 4 projects.md` has 24 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/research/self‑contained Lean 4 projects.md` (mtime 2026-06-23 18:21:51Z)
- 18 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 6 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `9a450ba942edbc38`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `import` | theorem | L7 | CODE_STALE | update the math/code | `rust/uor/r4/src/main.rs` |
| `lean` | theorem | L7 | DOC_STALE | update the document | (none) |
| `roots` | theorem | L20 | CODE_STALE | update the math/code | `rust/atlas/atlas-embeddings-v2/src/lib.rs` |
| `import` | theorem | L22 | CODE_STALE | update the math/code | `rust/uor/r4/src/main.rs` |
| `w` | theorem | L32 | CODE_STALE | update the math/code | `rust/resolvent-verify/src/lib.rs` |
| `JointSystem.weighted_norm` | theorem | L35 | DOC_STALE | update the document | (none) |
| `JointSystem.ρX` | theorem | L52 | DOC_STALE | update the document | (none) |
| `JointSystem.ρΛ` | theorem | L55 | DOC_STALE | update the document | (none) |
| `JointSystem.C₁` | theorem | L58 | DOC_STALE | update the document | (none) |
| `JointSystem.C₂` | theorem | L61 | DOC_STALE | update the document | (none) |
| `joint_contraction` | theorem | L70 | DOC_STALE | update the document | (none) |
| `JointSystem.weighted_dist` | theorem | L81 | DOC_STALE | update the document | (none) |
| `roots` | theorem | L159 | CODE_STALE | update the math/code | `rust/atlas/atlas-embeddings-v2/src/lib.rs` |
| `joint_contraction` | theorem | L275 | DOC_STALE | update the document | (none) |
| `joint_contraction` | theorem | L314 | DOC_STALE | update the document | (none) |
| `h_outer` | theorem | L368 | DOC_STALE | update the document | (none) |
| `h_inner` | theorem | L368 | DOC_STALE | update the document | (none) |
| `w` | theorem | L368 | CODE_STALE | update the math/code | `rust/resolvent-verify/src/lib.rs` |
| `nlinarith` | theorem | L368 | DOC_STALE | update the document | (none) |
| `o` | theorem | L375 | DOC_STALE | update the document | (none) |
| `h_outer` | theorem | L377 | DOC_STALE | update the document | (none) |
| `h_inner` | theorem | L377 | DOC_STALE | update the document | (none) |
| `h_outer` | theorem | L379 | DOC_STALE | update the document | (none) |
| `h_inner` | theorem | L379 | DOC_STALE | update the document | (none) |

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
