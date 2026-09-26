# ADR-027: Phased PIRTM Unification Plan

- **Status:** Proposed
- **Date:** 2026-04-15
- **Owners:** Lead Multiplicity Theorist, Eng
- **Related ADRs:** ADR-028, ADR-029, ADR-030
- **Systems:** Phase Mirror (Trust), PIRTM (Core), Meta-Ensembles, Citizen Gardens

---

## 1. Context

As Phase Mirror moves toward Phase 5 (Integration & Validation), three critical pillars have emerged that require formal architectural alignment:
1. **PIRTM as the Invariant Floor**: Establishing PIRTM as the non-negotiable mathematical substrate for all specialized models.
2. **Three-Factor Weight Model**: Refinement of the trust and reputation engine to account for inference provenance and kernel observability.
3. **Citizen Gardens Prototype**: Real-world validation of the governance methodology in a physical civic infrastructure.

This ADR defines the phased execution plan to unify these pillars into a coherent system.

---

## 2. Decision

We will implement the unification in three distinct phases, gated by specific architectural and code milestones.

### Phase 1: Invariant Bedrock (Foundation)
- **Objective**: Establish "PIRTM as the floor" across all domain models.
- **Key Artifacts**: 
  - [ADR-029](./ADR-029-pirtm-as-the-floor.md)
  - `SPEC-DOMAIN-MODELS.md` update: Inherit PIRTM invariants by default.
- **Gates**: No domain rule may override an L0 check.

### Phase 2: Trust & Weight Refinement (Implementation)
- **Objective**: Deploy the three-factor weight model ($w_i = T_i \cdot c_i \cdot r_i$) and monoidal ensemble aggregation.
- **Key Artifacts**:
  - [ADR-028](./ADR-028-three-factor-weight-model.md)
  - TypeScript patch for `ContributionWeight` and `calculateContributionWeight`.
  - Python monoidal reduction in `ensemble_aggregator.py`.
  - L0 guard in `ByzantineFilter`.
- **Gates**: 100% backward compatibility for existing PIRTM-native callers; successful monoidal reduction of pairwise commutators.

### Phase 3: Civic Validation (Prototype)
- **Objective**: Formalize Citizen Gardens as the living proof-of-concept for Phase Mirror governance.
- **Key Artifacts**:
  - [ADR-030](./ADR-030-citizen-gardens-governance-prototype.md)
  - Citizen Gardens Charter (encoding PMD operating loop).
- **Gates**: Demonstration of recursive stability between software and physical substrate.

---

## 3. Rationale

- **Math-First**: By anchoring all models to the PIRTM floor (ADR-029), we ensure semantic coherence across disparate domain lenses.
- **Epistemic Honesty**: The three-factor weight model (ADR-028) prevents the collapse of orthogonal concerns (provenance, observability, reputation), which is critical for trustworthy AI governance.
- **Empirical Proof**: Citizen Gardens (ADR-030) provides the real-world validation necessary to move from theory to generalizable civic infrastructure.

---

## 4. Phased Execution Roadmap

| Step | Owner | Artifact | Horizon | Status |
| :-- | :-- | :-- | :-- | :-- |
| 1 | Eng | TypeScript patch (ContributionWeight + factors) | 7 days | Ready |
| 2 | Eng | L0 guard in ByzantineFilter (ADR-028 §6) | 7 days | Ready |
| 3 | Lead | ADR-028 + SPEC-TRUST.md constitutional principle | 7 days | Ready |
| 4 | Eng | Monoidal reduction in ensemble_aggregator.py | 21 days | Safe |
| 5 | Eng + Lead | originRecord schema extension (attributedModels) | 21 days | Safe |
| 6 | Governance | ADR-029 (PIRTM is the Floor) | 30 days | Proposed |
| 7 | Lead | ADR-030 (Citizen Gardens Prototype) | 45 days | Proposed |

---

## 5. SWOT Analysis

### 5.1 Strengths
- Unified mathematical foundation ensures cross-model coherence.
- Clear separation of concerns in trust weighting.
- Real-world validation increases legitimacy for grants/partnerships.

### 5.2 Weaknesses
- Increased complexity in `calculateContributionWeight` parameters.
- Dependence on successful PIRTM cumulant deserialization.

### 5.3 Opportunities
- Stronger positioning for NSF and Cooperative AI Foundation grants.
- Generalization of the methodology for other federated communities.

### 5.4 Threats
- Potential for Tier-3 confidence floor (0.4) to suppress valid external signals.
- Complexity of managing physical/digital recursive governance.

---

## 6. RAID Log

### 6.1 Risks
- **R1**: Collapsing three-factor weights back into a scalar accidentally in downstream consumers. (Mitigation: Strong type checks and ADR-028 §6 enforcement).

### 6.4 Dependencies
- **D1**: ADR-028 depends on ADR-027 for the overarching strategy.
- **D2**: ADR-028 implementation depends on PIRTM cumulant fields (ADR-027/SPEC-PIRTM).

---

## 7. Impact
- **Code**: `mirror-dissonance`, `meta-ensembles`, `phase-mirror-oracle`.
- **Protocols**: Trust/Weighting API, Ensemble Aggregation (Monoidal).
- **Operational**: Transition to stratified trust model.
