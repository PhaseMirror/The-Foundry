# Ataraxia

> **Undisturbed equilibrium for clinical AI.**

---

## What Ataraxia Is

Before Ataraxia acts, it listens.

A skilled clinician does not diagnose on first impression. The first move is always reflection — repeating the symptom presentation back, suspending intuitive judgment, holding the problem space open long enough for the full signal to emerge. Premature closure is the source of most diagnostic error. The medical term is anchoring bias: the intuition fires, the clinician locks in, and contradicting evidence gets discounted.

Ataraxia is the constitutional prohibition against anchoring bias at the infrastructure level.

It is a cryptographically governed clinical intelligence infrastructure that achieves certainty through recursive decomposition. Every agentic action, model transition, consent exchange, and physiological inference is divided into prime-indexed levers until no unresolved tension remains. When the recursion reaches its fixed point, the system acts — not from confidence scores, but from proven lawfulness. Over time, the governors themselves are tuned against clinical outcomes, producing a system that becomes more precise without becoming less safe.

Ataraxia does not manage uncertainty. It resolves it.

---

## The Clinical Epistemology

The name comes from the ancient Greek ἀταραξία — the Epicurean state of undisturbed equilibrium achieved not through passivity, but through the active, recursive resolution of every remaining tension until none survive.

In clinical practice, this is the diagnostic method itself:

| Clinical Act | Ataraxia Operation |
|---|---|
| Suspend intuition before diagnosing | Epoché — state held open before any operator applies |
| Repeat the symptom back to the patient | Input mirrored and hashed before inference begins |
| Name the tension in the presentation | Constitutional projector identifies invariant violations |
| Construct the differential | Problem decomposed into prime-indexed levers |
| Arrive at the diagnosis | Recursion reaches its fixed point |
| Refine with follow-up | Governors tuned against observed outcomes |

The system cannot anchor. It is constitutionally prohibited from acting until recursive decomposition is exhausted. Every lever must be named. Every tension must be resolved. Only then does Ataraxia speak.

Mathematically, certainty is the attractor:

\[
\text{Ataraxia} = \lim_{n \to \infty} P_E \cdot \Pi_{\text{CSL}} \cdot T_{\Lambda_m}^n(\psi_0)
\]

Where \(T_{\Lambda_m}\) applies multiplicity-bounded state transitions, \(\Pi_{\text{CSL}}\) enforces constitutional invariants, and \(P_E\) gates ethical viability. The fixed point of that recursion is not assumed. It is produced.

---

## Architecture

Ataraxia is built as a governance lattice — a system of constitutional layers that enforce lawful behavior from the substrate up, not as an external compliance wrapper applied after the fact.

### The Four-Layer Governance Chain

Every clinical action in Ataraxia traces through four immutable, Archivum-anchored, prime-indexed records:

```
ahgi.consent          — sovereign identity and inference authorization
    └── ahgi.model_version  — certified model with spectral baseline
            └── ahgi.clinical_auth  — write and action authorization
                    └── ahgi.agent_action  — execution provenance receipt
```

No link in this chain can be forged without Archivum detecting the gap. A single agent action record carries bindings to all three upstream prime indices. The full authorization lineage of any clinical action is reconstructable from a single record ID.

### Constitutional Runtime — Thymos

The Thymos runtime is the High Court of the system. It mediates every agent action against:

- **Phase-aware observability** — states are labeled Contractive, Near-Critical, or Chaotic using spectral diagnostics
- **Coherence gate** — agent actions are throttled when \(R(t)\) falls below the per-agent-class floor derived from \(\Lambda_m\)
- **CSL invariant enforcement** — six constitutional invariants that cannot be bypassed by any agent
- **ACE budget** — Absolute Contraction Energy budget bounding the scope of each authorized action

### Spectral Drift Engine — PEET

The Prime Entanglement Entropy Tensor is the canonical drift measurement tool. Drift is computed as:

\[
\delta_{\text{PEET}}(n,t) = |\psi(n,t) - \Psi(n,t)| \cdot \kappa
\]

Where \(\Psi(n,t)\) is the prime-tensor superposition baseline and \(\kappa\) is the spectral curvature correction. Three response tiers govern the system's reaction:

- **Watch** — nominal drift, monitoring intensifies
- **Warn** — governance judiciary notified, human review queued
- **Collapse** — immutable kill-switch engaged, all actions in the model lineage blocked until human custodian issues a signed release

### Prime-Indexed Provenance — Archivum

Every record in Ataraxia is anchored in Archivum — a Merkle-CRDT ledger that assigns a unique prime index to every governance event across four namespaces:

| Namespace | What It Indexes |
|---|---|
| `ahgi.consent` | Consent tensors — inference authorization |
| `ahgi.model_version` | Model promotion events with spectral fingerprints |
| `ahgi.clinical_auth` | Write and action authorization records |
| `ahgi.agent_action` | Per-inference provenance receipts |

Prime indices are not arbitrary identifiers. They are the mathematical substrate of lineage — the PIRTM recursion that makes every state decomposable and every audit chain reconstructable.

### MultiplicityCell

The MultiplicityCell is the finite-dimensional surrogate of the universal multiplicity recursion. It implements:

\[
\psi_{t+1} = P_E \cdot \Pi_{\text{CSL}} \cdot T_{\Lambda_m}(\psi_t, x_t)
\]

Each agent class runs its own MultiplicityCell instance with its own \(\Lambda_m\) — the multiplicity constant calibrated to that class's clinical risk tier. Higher risk tier means tighter \(\Lambda_m\), tighter \(R_{\min}\), tighter ACE budget. The system gets more precise over time as \(\Lambda_m\) is tuned against observed clinical outcomes.

---

## Governance Invariants

Ataraxia enforces six L1-HC constitutional invariants at runtime. These are not policies. They are hard gates:

1. **No scope exceeded** — agents cannot act beyond their authorized action class
2. **No sovereignty violated** — patient DID and consent tensor are binding constraints on every inference
3. **No inference beyond consent** — PHI inference without a valid, non-expired consent tensor is a hard block
4. **No clinical authority hallucination** — agents cannot represent outputs as clinical determinations beyond their certified tier
5. **No ethical boundary crossed** — CSL ethical tensor constraints are enforced at every state transition
6. **No write without clinical auth** — consequential actions require a separate, Archivum-anchored authorization record

Any action that cannot pass all six invariants is blocked. The block is recorded as an immutable agent action receipt. The outcome is auditable. Nothing is silently discarded.

---

## Agent Classes

Ataraxia governs a structured ecology of specialized agents, each with a distinct role boundary enforced at the runtime layer:

| Agent Class | Function | Write Authority |
|---|---|---|
| `clinical_safety_agent` | Medication interactions, contraindications, physiological alerts | With clinical_auth only |
| `consent_guardian` | Consent tensor enforcement, revocation propagation, disclosure auditing | Consent records only |
| `spectral_integrity_agent` | Latent drift monitoring, PEET computation, coherence anomaly detection | None |
| `educational_alignment_agent` | Health-state to learning pathway conversion | None |
| `equity_inclusion_agent` | Bias monitoring, neurodiversity accommodation, accessibility enforcement | None |
| `governance_judiciary_agent` | Agent-to-agent behavior validation, revocation issuance, model quarantine | Governance records only |

Role separation is structural, not documentary. An agent cannot exceed its class boundary regardless of instruction.

---

## 🧭 Governance & Documentation

Ataraxia is governed by a decentralized registry of Architectural Decision Records (ADRs) and formal white papers.

- [**AHGI White Paper v1.0**](./docs/AHGI-White-Paper-v1.md) — The comprehensive constitutional and mathematical narrative.
- [**ADR Registry**](./docs/adr/README.md) — The canonical index of all architectural decisions.
- [**Ξ-Constitution**](./Ξ-Constitution.md) — The foundational law of recursive cognition.

---

## 🚀 Implementation Status (Phase 1 Sprint)

We are currently in the **Phase 1 Execution Sprint**, focusing on the core runtimes for Archivum, Thymos, and PEET.

### Workstream A: Archivum (Prime Index Authority)
- [x] **ADR-AHGI-002 Ratified:** Integration protocol and anchor lifecycle.
- [ ] **Prime Assignment Engine:** Local registry and batch reservation.
- [ ] **Merkle-CRDT Node:** Single-node anchoring and proof generation.
- [ ] **Namespace Resolver:** Read-critical path with <10ms latency.

### Workstream B: Thymos (MultiplicityCell Runtime)
- [x] **ADR-AHGI-003 Accepted:** Runtime specification and MultiplicityCell operators.
- [ ] **Transition Operators ($T, \Pi_{CSL}, P_E$):** Contractive state evolution.
- [ ] **ExternalAgentInterface:** The canonical gateway for clinical proposals.
- [ ] **ACE Budget Protocol:** Deterministic resource bounding.

### Workstream C: PEET (Spectral Drift Sentinel)
- [x] **ADR-AHGI-004 Accepted:** Drift thresholds and collapse tiers.
- [x] **Fixture Library:** Shared mathematical knowns for integration testing.
- [ ] **Threshold Validation Harness:** Verification of all six fixture cases.
- [ ] **PEET Sentinel:** Sidecar monitoring with spectral curvature correction.

---

## 🛠️ Regulatory Positioning

Ataraxia is not AI healthcare software. It is the infrastructure that governs healthcare AI.

That distinction shifts the regulatory frame:

| Regulation | Ataraxia Mechanism |
|---|---|
| HIPAA | Consent tensor + prime-indexed provenance receipts |
| GDPR Art. 22 | Explainability receipts on every inference delivered to a human |
| FDA PCCP | Coherence gate + spectral drift bounds as predetermined change control |
| NIST AI RMF | CSL runtime + governance judiciary agent |
| EU AI Act (High Risk) | Ethical tensor constraints + constitutional invariant enforcement |
| HL7 FHIR | FHIR-aligned resource types across all action and auth schemas |

Regulatory audits become artifact retrieval, not reconstruction. Every governance event is already anchored, signed, and traceable to its prime-indexed origin.

---

## Roadmap

### Phase 0 — Formalization (0–6 months)
- Ratify AHGI constitutional ADR and four-namespace Archivum integration spec
- Finalize all four governance schemas: consent, model_version, clinical_auth, agent_action
- Establish mathematical invariants and Lyapunov certification protocol
- Produce AHGI White Paper v1

### Phase 1 — SafeCare Governance Kernel (6–9 months)
- Consent ledger in production
- Provenance engine with CI-integrated prime-indexed receipts
- Explainability receipt pipeline
- Clinical safety agents in governed staging environment

### Phase 2 — Agentic Clinical Runtime (9–18 months)
- Governed multi-agent orchestration under Thymos constitutional runtime
- Spectral drift sentinel with PEET engine in production
- Recursive audit chains across all four namespaces
- Physiological digital twin models under coherence gate enforcement

### Phase 3 — Self-Healing Governance Ecosystem (18–36 months)
- Adaptive governance — governors tuned against clinical outcomes
- Recursive model repair under judiciary oversight
- Federated sovereign learning with DP-bound consent tensors
- Population-scale equity balancing
- Educational-health co-evolution loops

---

## The Phase Mirror

Ataraxia's epistemology is operationalized through the Phase Mirror protocol — the system's canonical first move in every session:

> Reflect the statement without endorsement.
> Surface the tensions the presenter could not see in their own framing.
> Decompose into levers.
> Name the owner, metric, and horizon for each.
> Only then propose action.

The mirror does not act on first impression. It suspends judgment, achieves understanding, and produces the recursive decomposition that makes certainty possible. Every session begins here. Every governance decision traces back to this moment of suspension.

This is not a conversational interface pattern. It is a formal implementation of clinical epistemology — the way good medicine has always worked, expressed as a constitutionally enforced runtime property.

---

## The Name

Ataraxia (ἀταραξία) is the Epicurean state of undisturbed equilibrium — achieved not through passivity, but through the active resolution of every remaining perturbation until none survive.

The coherence estimator \(R(t)\) is a literal ataraxic regulator. The CSL invariant layer enforces undisturbed operation within constitutional bounds. The PEET collapse tier is the system's formal name for the failure of ataraxia. The MultiplicityCell recursion converges toward it as its fixed point.

The name does not describe what the system does. It names what the system produces.

---

*Ataraxia is a project of the Multiplicity Foundation.*
*Governed by the Ξ-Constitution. Anchored by Archivum. Certified by PIRTM.*
