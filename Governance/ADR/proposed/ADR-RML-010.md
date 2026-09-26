# ADR-RML-010: document `Governance/adr/accepted/ADR-003-sovereign-stack-implementation.md` has 27 stale claim(s)
## Status
Proposed

## Triage (time-aware phase mirror)
- Document: `Governance/adr/accepted/ADR-003-sovereign-stack-implementation.md` (mtime 2026-07-20 19:44:03Z)
- 27 claim(s) DOC_STALE — implementation newer than the document → **update the document**
- 0 claim(s) CODE_STALE — document newer than the implementation → **update the math/code**
- Verdict signature: `22b4ee7a59236200`

## Context (claim-by-claim mirror)
| Claim | Kind | Line | Triage | Lever | Evidence |
|-------|------|------|--------|-------|----------|
| `phase_mirror_wasm` | theorem | L20 | DOC_STALE | update the document | (none) |
| `verify_resonance_buffer` | theorem | L20 | DOC_STALE | update the document | (none) |
| `run_gik_diagnostic` | theorem | L20 | DOC_STALE | update the document | (none) |
| `wasm_bindgen` | theorem | L20 | DOC_STALE | update the document | (none) |
| `verify_ledger` | theorem | L21 | DOC_STALE | update the document | (none) |
| `evaluate_esi_risk` | theorem | L21 | DOC_STALE | update the document | (none) |
| `check_governed_bridge` | theorem | L21 | DOC_STALE | update the document | (none) |
| `evaluate_governed_bridge` | theorem | L22 | DOC_STALE | update the document | (none) |
| `contractive_successor_one` | theorem | L24 | DOC_STALE | update the document | (none) |
| `phase_mirror_wasm` | theorem | L115 | DOC_STALE | update the document | (none) |
| `timestamp_ms` | theorem | L131 | DOC_STALE | update the document | (none) |
| `no_std` | theorem | L137 | DOC_STALE | update the document | (none) |
| `no_std` | theorem | L139 | DOC_STALE | update the document | (none) |
| `chrono` | theorem | L150 | DOC_STALE | update the document | (none) |
| `attest_cross_surface_mission` | theorem | L185 | DOC_STALE | update the document | (none) |
| `attest_cross_surface_mission` | theorem | L189 | DOC_STALE | update the document | (none) |
| `mission_json` | theorem | L201 | DOC_STALE | update the document | (none) |
| `phase_mirror_wasm` | theorem | L214 | DOC_STALE | update the document | (none) |
| `attest_cross_surface_mission` | theorem | L217 | DOC_STALE | update the document | (none) |
| `pm_archivum` | theorem | L232 | DOC_STALE | update the document | (none) |
| `espflash` | theorem | L282 | DOC_STALE | update the document | (none) |
| `phase_mirror_wasm` | theorem | L321 | DOC_STALE | update the document | (none) |
| `espflash` | theorem | L323 | DOC_STALE | update the document | (none) |
| `esp32` | theorem | L323 | DOC_STALE | update the document | (none) |
| `esp32s2` | theorem | L323 | DOC_STALE | update the document | (none) |
| `esp32s3` | theorem | L323 | DOC_STALE | update the document | (none) |
| `attest_cross_surface_mission` | theorem | L324 | DOC_STALE | update the document | (none) |

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
