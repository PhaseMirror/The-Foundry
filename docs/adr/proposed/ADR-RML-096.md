# ADR-RML-096: document `Governance/adr/ADR-008-Cryptographic-Verification-Boundary.md` has 2 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/adr/ADR-008-Cryptographic-Verification-Boundary.md` (mtime 2026-06-29 21:32:24Z)
- 0 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 2 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `638423a9b7a0b96b`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `sequence` | theorem | L47 | CODE_STALE | update the math/code | `rust/uor/r4/uor_standards/uor-addr/crates/uor-addr/src/asn1/value.rs` |
| `validate_schema` | theorem | L47 | CODE_STALE | update the math/code | `rust/ace-certify/src/telemetry_contract.rs` |

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
