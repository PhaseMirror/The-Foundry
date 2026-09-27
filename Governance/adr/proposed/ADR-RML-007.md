# ADR-RML-007: document `Governance/research/I have successfully integrated the agi-os-twin and.md` has 34 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/research/I have successfully integrated the agi-os-twin and.md` (mtime 2026-06-29 21:32:23Z)
- 26 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 8 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `5938bccd3d19bfa6`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `test_track2_clinical_diagnostic_trace` | theorem | L69 | CODE_STALE | update the math/code | `rust/agi-os-twin/src/lib.rs` |
| `goldilocks` | theorem | L72 | DOC_STALE | update the document | (none) |
| `prover` | theorem | L72 | DOC_STALE | update the document | (none) |
| `prover` | theorem | L80 | DOC_STALE | update the document | (none) |
| `prover` | theorem | L82 | DOC_STALE | update the document | (none) |
| `test_track2_clinical_diagnostic_trace` | theorem | L84 | CODE_STALE | update the math/code | `rust/agi-os-twin/src/lib.rs` |
| `prover` | theorem | L93 | DOC_STALE | update the document | (none) |
| `prover` | theorem | L102 | DOC_STALE | update the document | (none) |
| `run_diagnostic_trace` | theorem | L110 | CODE_STALE | update the math/code | `rust/agi-os-twin/src/clinical_validation.rs` |
| `test_track2_clinical_diagnostic_trace` | theorem | L112 | CODE_STALE | update the math/code | `rust/agi-os-twin/src/lib.rs` |
| `ethical_drift_delta_c` | theorem | L543 | DOC_STALE | update the document | (none) |
| `exponential_drift_baseline` | theorem | L544 | DOC_STALE | update the document | (none) |
| `epsilon_0` | theorem | L545 | DOC_STALE | update the document | (none) |
| `events` | theorem | L546 | CODE_STALE | update the math/code | `rust/core/src/audit.rs` |
| `details` | theorem | L556 | DOC_STALE | update the document | (none) |
| `prime_support` | theorem | L564 | CODE_STALE | update the math/code | `rust/plst/src/prime_encoding.rs` |
| `prime_decomposed_state` | theorem | L592 | DOC_STALE | update the document | (none) |
| `contractivity_c` | theorem | L599 | DOC_STALE | update the document | (none) |
| `contractivity_c` | theorem | L605 | DOC_STALE | update the document | (none) |
| `compliant` | theorem | L608 | DOC_STALE | update the document | (none) |
| `ethical_drift_delta_c` | theorem | L612 | DOC_STALE | update the document | (none) |
| `exponential_drift_baseline` | theorem | L612 | DOC_STALE | update the document | (none) |
| `constitutional_state` | theorem | L763 | DOC_STALE | update the document | (none) |
| `ethical_drift_delta_c` | theorem | L771 | DOC_STALE | update the document | (none) |
| `exponential_drift_baseline` | theorem | L771 | DOC_STALE | update the document | (none) |
| `enforce_contractivity` | theorem | L851 | CODE_STALE | update the math/code | `rust/echo-kernel/src/contractivity.rs` |
| `enforce_contractivity` | theorem | L1074 | CODE_STALE | update the math/code | `rust/echo-kernel/src/contractivity.rs` |
| `omega_region` | theorem | L1081 | DOC_STALE | update the document | (none) |
| `omega_region` | theorem | L1200 | DOC_STALE | update the document | (none) |
| `omega_region` | theorem | L1215 | DOC_STALE | update the document | (none) |
| `attestation_ttl_max` | theorem | L1444 | DOC_STALE | update the document | (none) |
| `refresh_jitter` | theorem | L1444 | DOC_STALE | update the document | (none) |
| `fail_closed_on_registry_unreachable` | theorem | L1444 | DOC_STALE | update the document | (none) |
| `critical_endpoints_require_fresh_attestation` | theorem | L1444 | DOC_STALE | update the document | (none) |

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
