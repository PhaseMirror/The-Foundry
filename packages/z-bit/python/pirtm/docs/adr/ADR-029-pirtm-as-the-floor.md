# ADR-029: PIRTM as the Invariant Floor

- **Status:** Proposed
- **Date:** 2026-04-15
- **Owners:** Lead Multiplicity Theorist
- **Related ADRs:** ADR-027 (Plan), ADR-028 (Weights)
- **Systems:** PIRTM (Core), Meta-Ensembles, Phase Mirror (all models)

---

## 1. Context

As Phase Mirror scales to multiple specialized domain models (e.g., physics, governance, healthcare), there is a risk of semantic incoherence when aggregating findings into a federated consensus. Without a shared substrate, specialized rules could diverge into incompatible mathematical universes, making aggregation impossible.

PIRTM (Prime-Indexed Recursive Trust Framework) was designed as a foundation for such a system, but its role as the **non-negotiable invariant floor** for all domain models must be formalized.

---

## 2. Decision

We establish **PIRTM as the floor** for the entire Phase Mirror architecture.

### 2.1 Shared Invariant Bedrock
- All specialized domain models inherit PIRTM invariants by default.
- No domain-specific rule may override or suppress an L0 invariant check (e.g., schema hash, permission bits, nonce freshness).
- The PIRTM floor provides the shared mathematical universe that allows consensus aggregation to operate on report provenance without necessarily verifying all domain-specific content.

### 2.2 Layered Architecture
| Layer | Description | Varies Per Model? |
| :-- | :-- | :-- |
| **PIRTM invariants** | Prime-indexed recursive trust substrate | **No** — Shared |
| **L0 invariants** | Sub-100ns validation layer; fail-closed | **No** — Shared |
| **Domain rule set** | Specialized Phase Mirror model rules (Tier B) | **Yes** — Specific to domain |
| **PMD output** | Dissonance report from domain-colored findings | **Yes** — Specific to domain |
| **Consensus aggregation** | Consistency-weighted cross-model aggregation | **No** — Shared protocol |

---

## 3. Rationale

### 3.1 Recursive Stability
PIRTM’s prime-indexed recursive structure anchors the feedback loops between models, consensus, and calibration. Without this anchor, recursive updates across models could drift into incoherence. By making PIRTM the fixed point, every recursion preserves the prime-labeled interaction structure.

### 3.2 Semantic Coherence
Sharing the same PIRTM floor and L0 schema hash allows the aggregation layer to verify that all findings have passed the same invariant checks before they are compared. This prevents the semantic incoherence problem that typically plagues federated model aggregation.

---

## 4. Implementation

- **`SPEC-DOMAIN-MODELS.md` Update**: Add the following sentence to the L0 invariant section: *"All domain models inherit PIRTM invariants. No domain rule may override or suppress an L0 check."*
- **`DissonanceReport` Interface**: Define a shared contract for valid reports that all domain models must adhere to, ensuring compatibility with the aggregation layer.

---

## 5. Consequences

- **Positive**: 
  - Cross-model findings are guaranteed to be semantically coherent at the substrate level.
  - Verification of report provenance is simplified for the aggregation layer.
  - Specialized models can evolve and disagree while remaining in the same mathematical universe.
- **Negative**: 
  - Domain models are constrained by PIRTM invariants and cannot optimize by bypassing L0 checks.
  - Requires consistent adoption of the PIRTM substrate across all new models.

---

## 6. Open Questions

- **Attribution of Emergent Tensions**: When federated consensus produces a finding that no single model generated alone (an emergent signal), who is credited with the authorship? (Attributed to the architecture, the team collectively, or the contributing models?)
