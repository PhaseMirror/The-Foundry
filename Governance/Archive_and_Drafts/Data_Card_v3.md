# Data Card (v3)

## Files
- `Operator_Dashboard_v4_1.xlsx`
  - **Overview**: high-level status
  - **SessionLog**: timestamp, subject, protocol_id, notes
  - **Metrics**: CAI, GAFF, ZA, CI bounds
  - **Params**: θ/gain settings (α,β,γ,η,κ), thresholds (θ, C*, alive), and coupling w_ij
- `Step2_results_OU.csv`
  - Fields: `timestamp, subject, protocol, CAI, GAFF, ZA, CI_low, CI_high, notes`

## Sampling & Preprocessing
- HRV: 1–5 Hz; EEG: 250–500 Hz; pendulum tracking: ≥120 fps.
- Detrend, artifact removal; epoch alignment to protocol markers; blinded analysis where feasible.

## Metrics
- **CAI**: percentage of correctly predicted micro‑updates (rolling window).
- **GAFF**: guardrail fail frequency (events/hour).
- **ZA**: ⟨M⟩/ΔM estimator (semantic SNR) with bootstrap CI.

License: CC‑BY‑4.0. Replication encouraged; include preregistration and raw logs where possible.
