# ADR-RML-005: document `Governance/adr/accepted/Seventeen green tests.md` has 40 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/adr/accepted/Seventeen green tests.md` (mtime 2026-07-01 10:02:23Z)
- 8 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 32 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `ed59983b97afe6a8`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `q` | theorem | L9 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `r` | theorem | L9 | CODE_STALE | update the math/code | `rust/atlas/atlas_utqc/crates/tqc-mtc/src/lib.rs` |
| `r` | theorem | L15 | CODE_STALE | update the math/code | `rust/atlas/atlas_utqc/crates/tqc-mtc/src/lib.rs` |
| `q` | theorem | L16 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `q` | theorem | L16 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `q` | theorem | L16 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `q` | theorem | L16 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `q` | theorem | L16 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `q` | theorem | L18 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `state` | theorem | L18 | CODE_STALE | update the math/code | `rust/governance/src/self_modification/kill_switch.rs` |
| `q` | theorem | L18 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `r` | theorem | L20 | CODE_STALE | update the math/code | `rust/atlas/atlas_utqc/crates/tqc-mtc/src/lib.rs` |
| `q` | theorem | L20 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `q` | theorem | L22 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `t` | theorem | L45 | DOC_STALE | update the document | (none) |
| `q` | theorem | L45 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `r` | theorem | L45 | CODE_STALE | update the math/code | `rust/atlas/atlas_utqc/crates/tqc-mtc/src/lib.rs` |
| `num_bigint` | theorem | L47 | DOC_STALE | update the document | (none) |
| `q` | theorem | L47 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `r` | theorem | L49 | CODE_STALE | update the math/code | `rust/atlas/atlas_utqc/crates/tqc-mtc/src/lib.rs` |
| `q` | theorem | L55 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `q` | theorem | L55 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `generate_proof` | theorem | L57 | CODE_STALE | update the math/code | `rust/goldilocks-pro/src/pell_vdf.rs` |
| `output` | theorem | L57 | CODE_STALE | update the math/code | `rust/atlas/uor-framework/foundation/src/bridge/trace.rs` |
| `q` | theorem | L57 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `r` | theorem | L57 | CODE_STALE | update the math/code | `rust/atlas/atlas_utqc/crates/tqc-mtc/src/lib.rs` |
| `verify_proof` | theorem | L57 | CODE_STALE | update the math/code | `rust/goldilocks-pro/src/pell_vdf.rs` |
| `modpow` | theorem | L57 | CODE_STALE | update the math/code | `rust/air-mr64/src/executor.rs` |
| `generate_proof` | theorem | L61 | CODE_STALE | update the math/code | `rust/goldilocks-pro/src/pell_vdf.rs` |
| `verify_proof` | theorem | L61 | CODE_STALE | update the math/code | `rust/goldilocks-pro/src/pell_vdf.rs` |
| `r` | theorem | L105 | CODE_STALE | update the math/code | `rust/atlas/atlas_utqc/crates/tqc-mtc/src/lib.rs` |
| `mul_quad` | theorem | L115 | CODE_STALE | update the math/code | `rust/goldilocks-pro/src/pell_vdf.rs` |
| `t` | theorem | L116 | DOC_STALE | update the document | (none) |
| `valid_consensus` | theorem | L119 | DOC_STALE | update the document | (none) |
| `consensus_with_vdf_safe` | theorem | L134 | DOC_STALE | update the document | (none) |
| `pell_vdf` | theorem | L144 | DOC_STALE | update the document | (none) |
| `aggregate_witness` | theorem | L144 | DOC_STALE | update the document | (none) |
| `consensus_verifier` | theorem | L144 | DOC_STALE | update the document | (none) |
| `generate_proof` | theorem | L158 | CODE_STALE | update the math/code | `rust/goldilocks-pro/src/pell_vdf.rs` |
| `verify_proof` | theorem | L158 | CODE_STALE | update the math/code | `rust/goldilocks-pro/src/pell_vdf.rs` |

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
