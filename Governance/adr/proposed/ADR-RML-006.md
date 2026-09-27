# ADR-RML-006: document `Governance/Archive_and_Drafts/characteristic_1_constructions.md` has 35 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/Archive_and_Drafts/characteristic_1_constructions.md` (mtime 2026-06-23 18:21:51Z)
- 15 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 20 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `f69dcc58a68fae37`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `n` | theorem | L35 | CODE_STALE | update the math/code | `rust/moonshine/src/prime_word.rs` |
| `k` | theorem | L37 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `h` | theorem | L163 | DOC_STALE | update the document | (none) |
| `k` | theorem | L384 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `ring` | theorem | L454 | DOC_STALE | update the document | (none) |
| `ring` | theorem | L466 | DOC_STALE | update the document | (none) |
| `ring` | theorem | L487 | DOC_STALE | update the document | (none) |
| `ring_uor` | theorem | L492 | DOC_STALE | update the document | (none) |
| `ring` | theorem | L492 | DOC_STALE | update the document | (none) |
| `ring` | theorem | L497 | DOC_STALE | update the document | (none) |
| `push_cast` | theorem | L497 | DOC_STALE | update the document | (none) |
| `ring_uor` | theorem | L502 | DOC_STALE | update the document | (none) |
| `ring_uor` | theorem | L506 | DOC_STALE | update the document | (none) |
| `den_pos` | theorem | L506 | DOC_STALE | update the document | (none) |
| `n` | theorem | L519 | CODE_STALE | update the math/code | `rust/moonshine/src/prime_word.rs` |
| `m` | theorem | L520 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `m` | theorem | L521 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `ring_uor` | theorem | L526 | DOC_STALE | update the document | (none) |
| `n` | theorem | L546 | CODE_STALE | update the math/code | `rust/moonshine/src/prime_word.rs` |
| `k` | theorem | L546 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `m` | theorem | L547 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `n` | theorem | L574 | CODE_STALE | update the math/code | `rust/moonshine/src/prime_word.rs` |
| `k` | theorem | L586 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `k` | theorem | L586 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `propext` | theorem | L589 | DOC_STALE | update the document | (none) |
| `s` | theorem | L671 | DOC_STALE | update the document | (none) |
| `m` | theorem | L688 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `m` | theorem | L689 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `x` | theorem | L689 | CODE_STALE | update the math/code | `rust/atlas/uor-framework/foundation/src/bridge/proof.rs` |
| `m` | theorem | L690 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `m` | theorem | L690 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `z` | theorem | L690 | DOC_STALE | update the document | (none) |
| `k` | theorem | L702 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |
| `x` | theorem | L703 | CODE_STALE | update the math/code | `rust/atlas/uor-framework/foundation/src/bridge/proof.rs` |
| `q` | theorem | L721 | CODE_STALE | update the math/code | `rust/ace-zk/src/ffi.rs` |

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
