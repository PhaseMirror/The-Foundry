# Thymos × PEET Interface Specification

**Version:** 1.0.0  
**Status:** Approved for Harness Implementation  
**Dependencies:** ADR-AHGI-003, ADR-AHGI-004

---

## 1. Interface Boundary & Operational Contract

This specification formalizes the exact boundary between the **Thymos Runtime** (which handles execution, ACE budgeting, and ethical projection) and the **PEET Drift Engine** (which handles spectral baseline anchoring and drift calculation). 

The boundary is strictly defined by a one-way publish/subscribe interaction model:
*   **PEET** is the sole mathematical authority on drift ($\delta_{\text{PEET}}$). It computes and publishes the signal. It does not enforce governance.
*   **Thymos** is the sole operational authority on governance. It consumes the PEET signal and routes it into the $P_E$ coherence gate. It does not compute drift.

---

## 2. The PEET Signal Payload

Every PEET emission must conform to the following schema structure. Thymos will reject any payload that lacks these required fields.

```json
{
  "session_id": "<uuid>",
  "peet_delta": "<float>",
  "drift_tier": "<nominal | watch | warn | collapse>",
  "computed_at": "<datetime ISO 8601>",
  "baseline_prime_index": "<integer>",
  "kappa": "<float>"
}
```

---

## 3. The Four Core Properties

### Property 1: Signal Freshness Contract (Staleness Budget)
Thymos enforces a strict age limit on asynchronous, cached PEET signals to ensure the coherence gate does not operate on stale drift data.

*   **For `tier_1` / `tier_2` models:** `age(peet_signal) ≤ 2000ms` $\rightarrow$ Accept cached.
*   **For `tier_3` / `tier_4` models:** `age(peet_signal) ≤ 500ms` $\rightarrow$ Accept cached.
*   **Staleness Breach Fallback:** If the cached signal is older than the budget, Thymos drops the cache and forces a synchronous PEET re-computation on the critical path.
*   **Latency Violation:** If the synchronous re-computation duration exceeds the `max_latency_ms` defined in the active `clinical_auth`, Thymos must **fail-close**. The action outcome is recorded as `blocked_coherence`.

### Property 2: Consumption Binding
There is a strict separation of concerns.
*   Thymos must never attempt to recalculate $\delta_{\text{PEET}}$ or redefine the tier bounds.
*   PEET must never attempt to halt an execution thread directly. PEET publishes `collapse`; Thymos reads `collapse` and executes the halt/debit logic.

### Property 3: Session Binding (Anti-Injection Invariant)
Thymos must perform a rigorous cross-check between the `session_id` in the PEET payload and the active agent session executing the inference.
*   If `peet_signal.session_id != active_agent.session_id`, Thymos must reject the signal.
*   This prevents cross-session signal injection, ensuring an adversarial agent cannot submit a low-drift signal from a stable session to bypass the coherence gate in a chaotic session.

### Property 4: Archivum Binding
The PEET signal attributes consumed by Thymos must be immutably recorded in the terminal `agent_action` record.
*   The `agent_action.telemetry.peet_delta` field must equal `peet_signal.peet_delta`.
*   The `agent_action.certification_checks.drift_check_passed.drift_status` must reflect `peet_signal.drift_tier`.
*   This guarantees that the exact spectral state at the moment of the clinical decision is permanently auditable and mathematically reconstructable.

---

## 4. Test Harness Integration Requirements

Implementation teams must construct their test harnesses to explicitly validate these four properties prior to merging into the `main` branch. 

*   **Core Runtime (Thymos):** Ensure the MultiplicityCell test harness includes explicit tests for Property 1 (Fails-close on timeout) and Property 3 (Rejects cross-session injection).
*   **Spectral Team (PEET):** Ensure the threshold validation harness confirms that the payload structure matches Section 2 perfectly and that $\kappa$ is immutable per model lineage.