# ADR-PML-052: Predictive Thermal Scheduler & Quantum Anomaly Detection

**Status:** Proposed  
**Date:** 2026-07-25  
**Authors:** `the-publisher`, `the-commander`, `the-examiner`  
**Dependencies:** ADR‑PML‑055 (State Anchor), ADR‑PML‑051 (Post‑Quantum Signatures), ADR‑PML‑050 (Batch ZK Proofs)  
**Cross‑cutting:** Impacts FPGA orchestration, governance logging, and formal verification

---

## Context

The UAC currently employs a **reactive** anomaly detection system (Isolation Forest) that triggers `SIG_GOV_KILL` only after a thermal or entropy breach has occurred. This reactive approach leads to abrupt session terminations, reduced throughput, and potential loss of computational work. 

With the state anchor (ADR‑PML‑055) providing immutable audit trails and Dilithium signatures (ADR‑PML‑051) securing post‑quantum provenance, we can now safely introduce **predictive** and **quantum‑enhanced** intelligence into the governance layer. The goal is to shift from reaction to **anticipation**, reducing `QuantumM::Collapse` events and improving overall system resilience, while maintaining mathematical verifiability.

---

## Decision

We will implement two complementary adaptive mechanisms:

### 1. Predictive Thermal Scheduler (LSTM)

- A **Long Short‑Term Memory** (LSTM) neural network will be trained on historical Prometheus telemetry (utilization, error rates, session counts, thermal slope) to forecast aggregate FPGA utilization 60 seconds into the future.
- If the forecasted utilization exceeds `0.85` with confidence > 0.9, the orchestrator **pre‑emptively** shifts low‑priority sessions from `d=16` to `d=8`, preventing the breach.
- The LSTM model is retrained weekly on the latest native ACE certificates and triple lock governance‑archived telemetry to adapt to hardware drift.

### 2. Quantum Variational Circuit (VQC) Anomaly Detection

- A **parameterized quantum circuit** (4–6 qubits) is trained on the 5D telemetry vector (`entropy`, `unstable_rate`, `utilization`, `d16_frac`, `thermal_slope`) to produce an anomaly score.
- The VQC is executed on a classical simulator (Pennylane) for development; its parameters are optimized via hybrid classical‑quantum training.
- If the VQC score falls below a learned threshold (calibrated to match the Isolation Forest’s false‑positive rate), it triggers `SIG_GOV_KILL` via the same escalation protocol.
- The VQC runs as a sidecar service, shadowing the Isolation Forest initially; after validation, it becomes the primary detector, with the Isolation Forest as fallback.

Both models are integrated with the **State Anchor (ADR‑PML‑055)** : every prediction, confidence score, and resulting action (throttle or kill) is logged as a `governance` event and anchored in the daily Merkle root. All AI‑driven decisions are signed with Dilithium (ADR‑PML‑051) to ensure future‑proof auditability.

---

## Consequences

**Positive:**
- **Reduced session terminations** – proactive throttling prevents abrupt `QuantumM::Collapse`, preserving throughput.
- **Enhanced anomaly sensitivity** – VQC can detect subtle non‑linear patterns that classical models may miss.
- **Immutable AI audit trail** – all predictions are anchored on‑chain, providing full transparency.
- **Graceful degradation** – if a model fails (e.g., LSTM confidence is low), the system reverts to reactive mechanisms.

**Negative:**
- **Increased operational complexity** – two new models require training pipelines, monitoring, and periodic retraining.
- **Formal verification challenge** – proving properties of neural networks and quantum circuits is non‑trivial; we will rely on statistical bounds (e.g., Hoeffding) and **formalized confidence thresholds** rather than exact functional equivalence.
- **Training data dependency** – models are only as good as the historical data; we must ensure representative coverage of all operational modes.

**Neutral:**
- **Latency overhead** – LSTM inference adds ~50 ms; VQC inference ~100 ms (simulated). Both are acceptable given the benefits.

---

## Gates & Success Criteria

The ADR will transition from **Proposed** to **Accepted** only when the following gates are satisfied and formally proven in Lean4:

| **Gate** | **Description** | **Verification Method** |
| :--- | :--- | :--- |
| **G‑LSTM‑1** | LSTM model trained on ≥7 days of operational telemetry. | Training script logs; accuracy metrics. |
| **G‑LSTM‑2** | Forecast error (MAE) < 0.02 on held‑out test set. | Statistical test (t‑test). |
| **G‑LSTM‑3** | Pre‑emptive throttling reduces `QuantumM::Collapse` by ≥50% in simulation. | Simulated load test. |
| **G‑VQC‑1** | VQC trained on 5D telemetry; achieves false‑positive rate < 0.1% on test set. | ROC analysis. |
| **G‑VQC‑2** | VQC sidecar integrated and runs in shadow mode for ≥48 hours with no false positives. | Log analysis. |
| **G‑VQC‑3** | Formal proof (in Lean4) that the VQC threshold is set such that false‑positive probability is bounded by Hoeffding’s inequality. | Lean theorem. |
| **G‑INT‑1** | LSTM and VQC are integrated with NATS and the state anchor; all predictions are logged. | End‑to‑end test. |
| **G‑INT‑2** | Complete end‑to‑end integration test passes (simulated load, VQC triggers kill on synthetic anomalies). | Test harness. |
