# ADR-028: Three-Factor Weight Model (Tier × Kernel × Reputation)

- **Status:** Accepted
- **Date:** 2026-04-14
- **Authors:** Lead Multiplicity Theorist
- **Related ADRs:** ADR-027 (Plan), ADR-029 (Floor)
- **Spec Reference:** `SPEC-TRUST.md §Kernel Observability`, `SPEC-PIRTM.md §Cumulant Primary Path`

---

## 1. Context

The legacy `ReputationEngine.calculateContributionWeight` collapsed three orthogonal concerns into a single scalar:
`weight = baseReputation × (1 + stakeMultiplier) × (1 + consistencyBonus)`

This is mathematically incorrect under the PIRTM framework because it conflates:
1. **Inference provenance** — how the operator Ξ(t) was derived (exact vs. approximate).
2. **Kernel observability** — how much of the inferred Ξ falls outside the observable subspace.
3. **Network reputation** — how reliably the organization has contributed historically.

Collapsing these concerns destroys epistemic provenance and makes it impossible to distinguish between a Tier-1 model with high kernel error and a Tier-2 model with low kernel error.

---

## 2. Decision

We define the **canonical contribution weight** as the product of three independent factors:

$$w_i^{\text{final}} = T_i \cdot c_i \cdot r_i$$

### 2.1 Inference Hierarchy (Tier Factor $T_i$)

| Tier | Method | $T_i$ | Source |
|------|--------|-------|--------|
| **Tier 1** | `cumulant-primary` | 1.0 | `.pirtm.bc` cumulant field (exact) |
| **Tier 2** | `pseudoinverse-secondary` | 0.7 | Prime-structured pseudoinverse (structured approx) |
| **Tier 3** | `moorpenrose-tertiary` | 0.4 | External models (generic approx) |

### 2.2 Kernel Confidence ($c_i$)

| Method | Condition | Value |
|--------|-----------|-------|
| `direct` | Tier 1 or 2, error ratio known | $c_i = 1 - \|\epsilon_i\| / \|\Xi_i\|$ |
| `cross-validated` | Tier 3, Tier-1 anchor present in ensemble | $c_i$ estimated against Tier-1 output |
| `conservative-floor` | Tier 3, no Tier-1 anchor | $c_i = \beta = T_3 = 0.4$ (L0 invariant) |

### 2.3 Network Reputation ($r_i$)
Calculated using the existing `ReputationEngine` formula:
`r_i = baseReputation × stakeMultiplier × consistencyBonus`

---

## 3. Rationale

### 3.1 Epistemic Honesty
PIRTM does not aggregate beliefs — it aggregates operator provenance under constraint. This decision ensures that the provenance of every signal is preserved in the weighting factor, allowing the system to honestly value contributions based on their mathematical origin.

### 3.2 Lie Algebra Closure
The PIRTM operator atlas generates a Lie algebra under the commutator bracket. This ensures that the additive combination of signals in the monoidal reduction is exact and requires no projection back onto the atlas.

---

## 4. L0 Invariant (Enforcement)

$\boxed{c_3 > \beta \;\Rightarrow\; \exists \text{ Tier-1 contribution in ensemble}}$

This invariant is enforced in `ByzantineFilter.prepareWeightedContributions` before any scoring. Violation results in an automatic downgrade to `conservative-floor`.

---

## 5. Implementation Strategy

- **TypeScript**: Extend `ContributionWeightFactors` and `ContributionWeight` interfaces with the new orthogonal factors.
- **Python**: Implement monoidal reduction in `ensemble_aggregator.py` using set union for provenance and additive signal combination in $B(H)$.
- **API**: `calculateContributionWeight` signature updated to accept `inferenceMethod`, `kernelErrorRatio`, and ensemble context.

---

## 6. Consequences

- **Positive**: Full operator provenance preserved; stratified trust model allows open participation without epistemic collapse.
- **Negative**: Increased API complexity; Tier-3 confidence floor may suppress some signals.
- **Migration**: Callers must be updated to pass `inferenceMethod` when available; 100% backward compatibility maintained via defaults.
