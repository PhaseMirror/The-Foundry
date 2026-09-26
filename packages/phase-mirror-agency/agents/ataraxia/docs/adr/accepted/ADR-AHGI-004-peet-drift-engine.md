# ADR-AHGI-004: PEET Drift Engine Specification

- Status: accepted
- Date: 2026-05-26
- Owners: @core-architecture
- Tags: [architecture]

---

## Context

The Prime-Encoded Entropic Telemetry (PEET) drift engine is the safeguard against semantic degradation in live models. The central tension in PEET is calibration: it must be sensitive enough to detect genuine model drift prior to clinical harm, but robust against false-positive "Collapse" events that trigger custodian holds and paralyze healthcare delivery.

This ADR specifies the baseline anchoring formulation, tier thresholds, the custodian hold protocol, and offline behavior for the PEET Engine.

---

## Decision

### 1. Baseline Anchoring ($\Psi(n,t)$)
The prime-tensor superposition baseline is defined as:
$$ \Psi(n,t) = \sum_{p \in \mathbb{P}} \frac{\sin(t/p + n)}{p} \cdot \kappa(t) $$

*   **Prime Set ($\mathbb{P}$):** The number of primes depends on the model's healthcare classification. `tier_1` models use the first $100$ primes. `tier_3` and `tier_4` models must utilize the first $500$ verified primes to ensure high-resolution baseline spectral mapping.
*   **Baseline Update Protocol:** $\Psi(n,t)$ is fixed at certification. Re-anchoring is permitted *without* full model re-certification only if the structural weights hash is identical and the update is an environmentally-triggered calibration (e.g., shifting baseline vitals in a specific hospital ward). All re-anchors must be countersigned by a `spectral_integrity_agent` and logged to Archivum.
*   **Spectral Curvature Correction ($\kappa$):** $\kappa(t)$ is **not** a global constant. It is a **per-model parameter** calibrated during stability certification to account for the specific topological curvature of the model's output space. Its derived formula is anchored in the `certification_report_hash`.

### 2. Tier Thresholds (Watch, Warn, Collapse)
The drift delta $\delta_{\text{PEET}}$ determines the alert tier. The provisional thresholds are ratified as constitutional defaults:

| Tier | $\delta_{\text{PEET}}$ Threshold | Action |
|---|---|---|
| **Watch** | $\delta \geq 0.05$ | Log flag, monitor subsequent inferences. |
| **Warn** | $\delta \geq 0.15$ | Alert `spectral_integrity_agent`, trigger heuristic re-evaluation. |
| **Collapse** | $\delta \geq 0.30$ | Immutable kill-switch triggered. Enter Custodian Hold. |

*   **Sunset Clause:** These provisional values expire exactly **90 days** post-clinical-pilot deployment. By that date, they must be replaced by empirically validated thresholds derived from clinical validation data, submitted via a superseding ADR.

### 3. Collapse Response — Custodian Hold Protocol
A Collapse-tier event triggers an immutable kill-switch and a custodian hold.

*   **Custodian DID Resolution:** The custodian DID is bound at model certification. It is retrieved via the `model_version.approval_chain` (specifically the `clinical_safety_advisor` role or an explicitly designated `model_custodian` DID).
*   **Hold Duration:** Holds persist **indefinitely** until cryptographically resolved. There is no automatic expiry or override.
*   **Release Condition:** The custodian must issue a signed release containing a completed, Archivum-anchored checklist. The checklist must verify:
    1. Analysis of the anomalous input vector.
    2. Confirmation of no adverse clinical impact.
    3. Corrective action taken (re-calibration, input filtering, or model demotion).
*   **Deputy Custodian Protocol:** To prevent a single point of human failure during emergencies, weekend shifts, or staffing gaps, the certification binding must include a secondary `deputy_custodian` DID. The deputy may issue a **conditional release** matching the above checklist. This conditional release is explicitly flagged, anchored in Archivum, and subject to mandatory post-hoc review by the Governance Judiciary within 72 hours.

### 4. Offline Drift Computation
During offline operation, PEET continues comparing execution against the locally cached baseline.

*   **Immediate Local Hold:** A Collapse-tier event during offline operation triggers the custodian hold **immediately** on the local node. The node does not wait for Archivum reconnection to halt inference. The event is queued to the local WAL for immediate propagation upon reconnect.
*   **Max Permissible Drift Accumulation:** Regardless of individual tier flags, if the cumulative offline spectral drift integral exceeds $\mathbf{0.20}$, the node enters strict **read-only mode**, halting all consequential mutations until the baseline is verified against the network.

---

## Consequences

**Positive:**
- PEET operates deterministically even in air-gapped environments.
- The 90-day sunset clause forces empirical calibration of the threshold bands.
- The Custodian Hold protocol ensures humans are kept tightly in the loop for systemic anomalies.

**Negative:**
- False-positive Collapses during offline operation will require manual administrative intervention, potentially disrupting local workflows during network outages.

---

## Review Required By
- Core Runtime Lead (Thymos × PEET Interface Boundary)
- Governance Judiciary (Threshold Sunset Clause Tracking)
sures humans are kept tightly in the loop for systemic anomalies.

**Negative:**
- False-positive Collapses during offline operation will require manual administrative intervention, potentially disrupting local workflows during network outages.

---

## Review Required By
- Core Runtime Lead (Thymos × PEET Interface Boundary)
- Governance Judiciary (Threshold Sunset Clause Tracking)