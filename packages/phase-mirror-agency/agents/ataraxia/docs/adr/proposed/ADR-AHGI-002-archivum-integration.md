# ADR-AHGI-002: Archivum Integration Protocol & Anchor Lifecycle

- Status: proposed
- Date: 2026-05-26
- Owners: @core-architecture
- Tags: [architecture]

---

## Context

Following the ratification of **ADR-AHGI-001**, the Λᵖ-Archivum Merkle-CRDT is the constitutional Prime Index Authority for the PhaseMirror-HQ AHGI sublattice. Four distinct namespaces (`ahgi.consent`, `ahgi.model_version`, `ahgi.clinical_auth`, `ahgi.agent_action`) are structurally partitioned. 

With the schema dependency chain bound to Archivum anchors, the operational integration between the execution runtime and the Archivum registry must be codified. Specifically, we must resolve the latency impact of cryptographic anchoring, the lifecycle of batch prime reservations for high-volume agents, the performance SLAs of the namespace resolver, and the ultimate fallback for cross-namespace collisions.

---

## Decision

The AHGI runtime shall integrate with Archivum under the following architectural protocols:

### 1. Hybrid Anchoring Model (Synchronous vs. Asynchronous)
To balance real-time audit integrity against the latency constraints of tier_1 and tier_2 models, anchoring modes are **differentiated by `action_class`**:

*   **Synchronous Anchoring:** Execution is blocked until the Archivum anchor is confirmed. Mandatory for all consequential mutations and clinical operations.
    *   *Applies to:* `write_fhir_resource`, `update_medication_order`, `trigger_emergency_protocol`, `modify_care_plan`, `revoke_consent`, `quarantine_agent`.
*   **Asynchronous Anchoring with Local WAL:** Execution proceeds optimistically against a local Write-Ahead Log (WAL). The Archivum anchor is confirmed in the background. If the node fails, the WAL enables recovery. Audit integrity is eventual but cryptographically guaranteed.
    *   *Applies to:* `inference`, `coherence_check`, `drift_scan`, `explainability_receipt_generation`.
*   **Enforcement:** The schema field `archivum_anchor.anchor_mode` must explicitly reflect the mode used. Any outcome other than `success` (e.g., `blocked_*`, `failed_*`) forces a synchronous anchor to ensure immutable failure logging.

### 2. Batch Prime Reservation Lifecycle
To support the `offline_prime_cache_depth: 500` SLA parameter and avoid per-action round trips for high-volume inferences, agents pre-reserve blocks of prime indices. The lifecycle is strictly enforced:

*   **RESERVED:** Block of $N$ primes is allocated by Archivum to a specific Agent DID with an explicit `reservation_expires_at` timestamp.
*   **CONSUMED:** Agent executes an action, assigns a prime from the block, and writes it to the local WAL.
*   **RECONCILED:** Local WAL successfully syncs with Archivum; the consumed prime is formally anchored.
*   **ARCHIVED:** The reservation block is fully consumed and successfully synced.
*   **ORPHANED (Reclamation Protocol):** If a node fails or disconnects and the `reservation_expires_at` passes, any unanchored primes in the reserved block are swept by Archivum and marked `VOID_ORPHANED`. This ensures no silent gaps in the sequence space. Voided primes cannot be reclaimed; sequence continuity is maintained via the void tombstone.

### 3. Namespace Resolver SLA
The Namespace Resolver is a read-critical path component invoked on every certification pre-flight check. It answers: *"Is this prime index unique within this namespace, and does it belong to this node's reservation block?"*

*   **Availability SLA:** 99.999% uptime.
*   **Latency Budget:**
    *   Local CRDT Cache Hit: **< 5ms**
    *   Network Consensus Query: **< 50ms**
*   **Failure Mode:** If the resolver exceeds the latency budget or becomes unavailable, the agent must fail-close (resulting in `blocked_confirmation_timeout`), unless operating under a verified active offline cache window (`crl_max_age_hours < 24`).

### 4. Cross-Namespace Prime Collision Detection
The namespace partition prevents logical collisions, but physical split-brain anomalies in the Merkle-CRDT must have a defined resolution matrix. If a prime collision is detected within or across namespaces:

1.  **Hard Halt:** The affected nodes or agent instances are immediately suspended (`quarantine_agent`).
2.  **Judiciary Escalation:** An automated escalation is dispatched to the Governance Judiciary agent.
3.  **Cryptographic Audit:** A Merkle proof audit is triggered to isolate the split-brain root cause.
4.  **Resolution:** The conflicting records are flagged `tainted`. The Governance Judiciary must manually (or via a quorum of CSA agents) issue a superseding record resolving the conflict before the nodes can rejoin the active quorum.

---

## Consequences

**Positive:**
- High-frequency inferences are decoupled from network latency via the WAL.
- Clinical writes retain absolute synchronous audit guarantees.
- Orphaned primes from crashed pods no longer corrupt the lineage chain.

**Negative:**
- The local WAL introduces state complexity for stateless agent pods; pods must mount persistent volumes or guarantee WAL flushing before termination.
- Hybrid anchoring requires the orchestrator to dynamically branch logic based on the `action_class` enum.

---

## Review Required By
- Core Runtime Lead (Thymos execution branching)
- Infra Lead (Local WAL persistence strategy)
- Governance Judiciary (Collision escalation matrix)