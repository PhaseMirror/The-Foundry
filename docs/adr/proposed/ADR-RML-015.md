# ADR-RML-015: document `Governance/adr/accepted/adr_001_alp_cnl_agent_production_readiness.md` has 20 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/adr/accepted/adr_001_alp_cnl_agent_production_readiness.md` (mtime 2026-07-01 18:31:38Z)
- 19 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 1 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `39d1f0a26ad29580`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `alp` | theorem | L9 | DOC_STALE | update the document | (none) |
| `analyze` | theorem | L10 | CODE_STALE | update the math/code | `rust/core/src/spectral.rs` |
| `echobraid` | theorem | L10 | DOC_STALE | update the document | (none) |
| `alp` | theorem | L26 | DOC_STALE | update the document | (none) |
| `alp` | theorem | L26 | DOC_STALE | update the document | (none) |
| `echobraid` | theorem | L28 | DOC_STALE | update the document | (none) |
| `governance` | theorem | L30 | DOC_STALE | update the document | (none) |
| `cargo` | theorem | L39 | DOC_STALE | update the document | (none) |
| `node_modules` | theorem | L39 | DOC_STALE | update the document | (none) |
| `tsx` | theorem | L47 | DOC_STALE | update the document | (none) |
| `eslint` | theorem | L49 | DOC_STALE | update the document | (none) |
| `prettier` | theorem | L49 | DOC_STALE | update the document | (none) |
| `distroless` | theorem | L52 | DOC_STALE | update the document | (none) |
| `seccomp` | theorem | L65 | DOC_STALE | update the document | (none) |
| `governance` | theorem | L71 | DOC_STALE | update the document | (none) |
| `kubectl` | theorem | L75 | DOC_STALE | update the document | (none) |
| `governance` | theorem | L82 | DOC_STALE | update the document | (none) |
| `kubeconform` | theorem | L84 | DOC_STALE | update the document | (none) |
| `phase_mirror_archivum_entries` | theorem | L89 | DOC_STALE | update the document | (none) |
| `alp` | theorem | L114 | DOC_STALE | update the document | (none) |

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
