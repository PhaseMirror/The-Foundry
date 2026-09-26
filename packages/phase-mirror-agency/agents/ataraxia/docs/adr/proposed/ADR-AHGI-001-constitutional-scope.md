# ADR-AHGI-001: Agentic Healthcare Governance Infrastructure (AHGI) Constitutional Scope

- Status: proposed
- Date: 2026-05-25
- Owners: Governance Lead
- Tags: [architecture]

---

## Context

PhaseMirror-HQ's Ξ-Constitution defines L0 invariants for the Phase Mirror 
ecosystem. A subset of deployments operates in healthcare contexts governed by 
HIPAA, GDPR, FDA PCCP, and NIST AI RMF. These contexts require behavioral 
constraints beyond general Phase Mirror governance — specifically:

- Every agentic action must carry cryptographic provenance
- Every model transition must be bounded by certified stability conditions
- Every inference involving physiological data must be consent-gated
- Every recursive process must remain coherence-bounded per the PIRTM runtime

This ADR establishes AHGI as a governance sublattice operating within — and 
never superseding — the Phase Mirror Ξ-Constitution.

---

## Decision

AHGI is ratified as a constitutional extension of the Phase Mirror governance 
lattice with the following binding constraints:

### L1-HC Invariants (Healthcare Extension of L0)

**L1-HC-1: Provenance is non-optional.**  
No healthcare agent action may execute without emitting a prime-indexed 
provenance receipt. Receipts are immutable once emitted.

**L1-HC-2: Consent precedes inference.**  
No inference over PHI (Protected Health Information) may proceed without a 
valid, non-expired consent tensor for the subject DID. Absence of consent 
tensor = hard block, not soft warning.

**L1-HC-3: Coherence floor is enforced.**  
Agent actions are throttled when the system coherence estimator R(t) falls 
below R_min. Throttling is a gate, not a log entry. Coherence binding is strictly required for all physiological and behavioral data streams.

**L1-HC-4: Scope boundaries are structural.**  
Clinical Safety Agents may not write. Consent Guardians may not infer. 
Spectral Integrity Agents may not act on patient data directly. Role 
separation is enforced at the runtime layer, not by policy document alone.

**L1-HC-5: Explainability receipts are load-bearing.**  
Any inference result delivered to a human clinician or patient must carry 
a human-readable explainability receipt. Results without receipts are 
blocked at the output layer.

**L1-HC-6: Revocation propagates immediately.**  
Consent revocation must propagate to all active agent sessions within one 
TTL cycle. Sessions that cannot confirm revocation receipt are suspended.

---

## Resolution of Key Gaps

### 1. Prime Index Authority
Prime indices for consent tensors are assigned exclusively by the **Archivum** registry. The Archivum DID is the canonical `registry_did` for all AHGI consent tensors. This integrates directly with the Λᵖ-Archivum Merkle-CRDT to guarantee immutability and lineage synchronization.

Assignment protocol:
1. Consent Fabric requests next available prime from Archivum.
2. Archivum returns `prime_n` with attestation signature.
3. Consent tensor is assembled with `prime_n` and `lineage_hash = SHA-256(Archivum record for prime_{n-1})`.
4. Issued consent tensor is submitted back to Archivum for anchoring.

Offline behavior and Constitutional SLA Parameters:
If Archivum is unreachable, consent issuance is BLOCKED. Existing active consents with valid TTL continue to operate. Offline caching and prime reservation degrade gracefully but are strictly bound by the following ratified SLA parameters, measured from the **time of last successful Archivum sync**:
- `crl_max_age_hours: 24`
- `offline_prime_cache_depth: 500` (primes pre-reserved per node)
- `reconciliation_deadline_hours: 48` (hours post-reconnect before audit flag triggers)

### 1.5. Archivum Namespace Partitioning
To prevent prime collisions across AHGI ecosystem components, Archivum anchors records across four distinct namespaces, enabling the specification to act as a single robust ADR:
- `ahgi.consent`: Consent tensors
- `ahgi.clinical_auth`: Clinical write authorization records (CATs)
- `ahgi.model_version`: Model promotion events with spectral fingerprints
- `ahgi.agent_action`: Per-inference provenance receipts

### 2. Clinical Write Authorization
The Consent Tensor explicitly excludes `write` operations. To prevent this from becoming an attack surface, write operations are governed by a separate, complementary artifact: the **Clinical Authorization Tensor (CAT)**. The CAT requires cryptographic countersignatures from a licensed clinician or an authorized Clinical Safety Agent. Consent Tensors enable *read and infer*; CATs enable *write and mutate*.

### 3. Mandatory Coherence Binding
The `coherence_binding` is **strictly mandatory** in the Consent Tensor. Any consent covering `phi.physiological_signal` or `phi.behavioral` data must bind to a coherence gate. Optionality weakens the governance claim; therefore, it is structurally enforced by the runtime.

---

## Scope Boundaries

### In Scope
- All agents operating on PHI or physiological signals
- All model promotion events in healthcare-tagged deployments
- All consent exchange protocols (QR, NFC, DIDComm)
- All spectral drift monitoring of healthcare-facing models
- All federated learning rounds involving patient cohort data
- The Archivum Prime Registry namespaces and anchoring
- The Clinical Authorization Tensor (CAT) lifecycle

### Out of Scope
- General Phase Mirror agents not touching healthcare data
- Educational content generation not linked to physiological state
- Administrative tooling (scheduling, billing) not involving inference

---

## Governance Topology

```text
Ξ-Constitution (L0)
    └── AHGI Constitutional Layer (L1-HC)
            ├── Consent Fabric (DID/VC/Consent Tensor)
            ├── PIRTM Provenance Engine & Prime Registry
            ├── Clinical Authorization Tensor (CAT) Governance
            ├── Coherence Gate (R(t) enforcer)
            ├── CSL Runtime (ethical gating)
            ├── Spectral Drift Sentinel
            └── Agent Judiciary (revocation + quarantine)
```

Each sublayer reports violations upward. Violations at any layer 
that cannot be resolved in-layer escalate to the Agent Judiciary.

---

## Compliance Bindings

| Regulation     | AHGI Mechanism                          | Gap to Close              |
|----------------|-----------------------------------------|---------------------------|
| HIPAA          | Consent tensor + provenance receipts    | Audit log retention policy |
| GDPR Art. 22   | Explainability receipts on all decisions| Right-to-explanation SLA  |
| FDA PCCP       | Coherence gate + spectral drift bounds  | Formal PCCP document      |
| NIST AI RMF    | CSL runtime + governance judiciary      | RMF profile mapping       |
| EU AI Act      | Ethical tensor constraints              | Conformity assessment plan |

---

## Consequences

**Positive:**
- Every healthcare agent action is cryptographically traceable
- Consent revocation has mechanical force, not just legal force
- Regulatory audits become artifact retrieval, not reconstruction

**Negative:**
- Provenance emission adds latency per inference step (~2–8ms estimated)
- Consent tensor validation adds a synchronous pre-flight check
- Teams must instrument existing agents before deploying in HC contexts

---

## Open Questions

1. What is the maximum acceptable latency budget for consent tensor 
   pre-flight in real-time clinical alert scenarios?
2. Does R_min vary by agent class or is it a single system-wide floor?
3. Who holds the Agent Judiciary role in the first 90 days — human or 
   automated quorum?

---

## Review Required By
- Math Runtime Lead (coherence gate parameters)
- Identity/Schemas Lead (consent tensor schema ratification)
- Legal/Regulatory (HIPAA/GDPR/PCCP binding review)
- Clinical Safety Advisor (L1-HC-4 role separation validation)