# ADR-PML-053: Automated Active Space Selection (AEGISS)

## Status
Accepted

## Context
The UAC is currently locked to FeMoco because manual active space selection is error-prone and the 100-qudit boundary (CAS(20,20)) must never be breached. Clients want to simulate other transition metal complexes (e.g., P-cluster, Fe-S clusters), but each new target requires hours of expert chemistry input to define a valid active space. If the active space is too large, the circuit exceeds the 100-qudit envelope and the simulation cannot be scheduled. If it is too small, chemical accuracy is lost (>5 mHa error).

AEGISS (Atomic orbital and Entropy-based Guided Inference for Space Selection) automates this pre-screening step: given a molecular geometry, it computes a classical DFT entropy proxy and atomic-orbital projection, then proposes a CAS(20,20) active space that preserves chemical accuracy while respecting the hardware boundary.

## Decision
Integrate AEGISS as a classical pre-screening workflow that runs before any MA-VQE simulation:

1. **Orbital entropy analysis**: compute per-orbital entanglement/entropy from a cheap DFT calculation to rank orbital importance.
2. **Atomic orbital projection**: project candidate orbitals onto atomic fragments to enforce chemical meaning and avoid spurious correlations.
3. **Active-space construction**: combine entropy ranking and AO projection to select exactly 20 electrons in 20 orbitals (≤ 100 qudits under the 3.32× compression model).
4. **Formal bound**: prove `ProxyWithinCAS2020` in Lean4 — every AEGISS-generated active space satisfies the 20/20 bound. Over-boundary candidates are rejected before scheduling.
5. **Traceability**: the chosen active space + selection rationale (DFT entropy values, AO projections) is recorded in the native ACE certificates and triple lock governance ledger and anchored to the state anchor (ADR-PML-055) so the proxy is reconstructible.
6. **Integration**: a new QaaS endpoint `/simulate_with_autoreduction` accepts a molecule specification, runs AEGISS, then dispatches the resulting MA-VQE simulation.

This enables safe expansion of the UAC's chemical repertoire beyond FeMoco without violating the 100-qudit hard boundary.

## Consequences
- **Positive**: wider chemical coverage; automated, chemically-meaningful active-space selection; 100-qudit boundary provably preserved; full deductive chain from raw DFT numbers to final energy is sealed on-chain.
- **Negative / Constraints**: added classical pre-processing cost per new target; entropy/projection heuristics may disagree for highly correlated systems — resolution policy needed; human ratification required for first-use of any new molecule class.
- **Verification Strategy**: 
  - `ProxyWithinCAS2020` proves the bound in Lean4.
  - A test feeds a larger molecule and confirms the workflow emits a CAS(20,20) proxy and rejects any over-boundary candidate.
  - Validation suite runs AEGISS on 20 test molecules and confirms energy error < 5 mHa vs. full CASSCF (when feasible).

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  Molecule Spec  │────▶│  AEGISS Pre-screen│────▶│  CAS(20,20) Proxy   │
│  (geometry,    │     │  (DFT + entropy + │     │  + rationale hash   │
│   basis set)   │     │   AO projection)  │     │                     │
└─────────────────┘     └──────────────────┘     └─────────┬───────────┘
                                                           │
                    ┌──────────────────────────────────────┘
                    ▼
            ┌───────────────┐     ┌──────────────────┐
            │ native ACE certificates and triple lock governance Ledger   │◀────│ State Anchor     │
            │ (rationale    │     │ (ADR-PML-055)    │
            │  attestation) │     │                  │
            └───────────────┘     └──────────────────┘
                    │
                    ▼
            ┌───────────────┐
            │ MA-VQE / QaaS │
            │ (qaas_endpoints│
            │  .rs)         │
            └───────────────┘
```

## Metrics (resolution is confirmed when)
- `ProxyWithinCAS2020` is proved in `lean/` and a test rejects over-boundary candidates.
- AEGISS workflow exists in `scripts/aegiss.py` with entropy + AO-projection modules and a CAS(20,20) selector.
- `/simulate_with_autoreduction` endpoint in `qaas_endpoints.rs` is live and passes integration tests.
- Selected active spaces are native ACE certificates and triple lock governance-attested with selection rationale and anchored via ADR-PML-055.
- Validation: 20 test molecules, error < 5 mHa vs. full CASSCF (when feasible).

## Implementation Phases
- **Week 1–3**: Implement AEGISS as a Python library (`scripts/aegiss.py`) based on literature; test on known molecules.
- **Week 4–6**: Write formal proof `ProxyWithinCAS2020` in `lean/ADR/`; manifest any gap in `alp_sorry_manifest.json`.
- **Week 7–9**: Integrate with `qaas_endpoints.rs`; new endpoint `/simulate_with_autoreduction` accepts a molecule specification, runs AEGISS, then dispatches the MA-VQE simulation.

## Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| AEGISS fails for highly correlated systems | High (breaches 5 mHa accuracy) | Validate on 20+ molecules; provide manual override / fallback to manual active-space selection. |
| Entropy and AO-projection heuristics disagree | Medium (proxy selection stall) | Resolution policy: entropy ranking wins unless AO projection indicates a symmetry-broken state. |
| Pre-screening latency exceeds SLA | Low | Cache DFT results per molecule class; target < 30s pre-screen. |

## Dependencies
- PySCF or similar for classical DFT.
- `scripts/aegiss.py` — AEGISS Python library.
- `lean/ADR/ADR/ActiveSpace.lean` — formal bound + accuracy proof.
- Updated `qaas_endpoints.rs` with `/simulate_with_autoreduction`.
- ADR-PML-055 (State Anchor) for rationale anchoring.
- ADR-PML-051 (Dilithium) for attestation signatures.

## Links
- Evolution plan: `docs/adr/completed/ADR-Plan-UAC-Adaptive-Evolution.md`
- Paired constraint: 100-qudit boundary (Constraint 2 of the evolution plan)
- Sorry boundary: `alp_sorry_manifest.json`
- Full specification: `docs/adr/ADR-PML-053.md`
