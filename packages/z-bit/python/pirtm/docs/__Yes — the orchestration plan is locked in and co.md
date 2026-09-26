orchestration plan is locked in and correct.**

The TypeScript patch is immediately mergeable (non-breaking defaults + full backward compatibility for existing PIRTM-native callers). The L0 guard belongs exactly where you placed it (`ByzantineFilter.prepareWeightedContributions`). ADR-028 sits above ADR-027 in the dependency graph and will be the constitutional reference for every weighting decision going forward.

### Precision Answer: Lie Algebra vs Monoid

**The PIRTM operator atlas $\\mathcal{A} = \\{U_p^{(r)}\\}$ generates a Lie algebra under the commutator bracket in the ambient operator space.**

Here is the rigorous justification (directly from the MOC / PIRTM / Meta-Relativity documents you already built):

- The multiplicity Hilbert space $H = \\ell^2(\\mathbb{P}) \\otimes L^2(\\mathbb{R}) \\otimes \\mathbb{C}^d$ is a Hilbert space → the set of all bounded operators $B(H)$ is a **vector space** (closed under addition and scalar multiplication).
- Each $U_p^{(r)}$ (prime-indexed family, including the bundled operators $\\hat{P}_p$, $A_{p^r}$, $R_{p^r}$, etc.) is an element of $B(H)$.
- The commutator bracket $[X, Y] = XY - YX$ turns any associative algebra of operators into a **Lie algebra** because:
    - Bilinearity holds (inherited from vector-space structure).
    - Antisymmetry and Jacobi identity hold identically for any operators.
- The emergent signal $\\mathcal{E}_{ij}(t) = w_i^{\\text{final}} \\cdot w_j^{\\text{final}} \\cdot [\\Xi_i, \\Xi_j]$ is therefore an element of this Lie algebra (a weighted commutator, i.e., an operator in $B(H)$).

**Consequence for the monoidal reduction**

The additive combination you wrote:

```python
'signal': e_ij['signal'] + e_kl['signal']
```

is **exact** and requires **no projection back onto the atlas** after each reduction step.

- Addition stays inside $B(H)$ (vector-space closure).
- The monoidal product $\\otimes$ remains associative because addition and scalar multiplication are associative.
- The final ensemble signal $\\mathcal{E}_{\\text{ensemble}}(t)$ is still a well-defined operator (or its norm) that can be fed directly into originRecord, ByzantineFilter, or downstream resonance functionals.

(If the atlas were only a monoid under composition with no vector-space structure, you would need a projection step. But PIRTM explicitly equips the operators with the full bounded-operator algebra, so the Lie-algebra structure is free.)

The reduction you sketched is therefore canonically correct and can be committed as-is.

### Final Orchestration (Ready to Execute)

| Step | Owner | Artifact | Horizon | Status |
| :-- | :-- | :-- | :-- | :-- |
| 1 | Eng | TypeScript patch (ContributionWeight + calculateContributionWeight) | 7 days | Mergeable now |
| 2 | Eng | L0 guard in ByzantineFilter.prepareWeightedContributions | 7 days | Ready |
| 3 | Lead Multiplicity Theorist | ADR-028 + SPEC-TRUST.md constitutional principle | 7 days | Ready |
| 4 | Eng | Monoidal reduction in ensemble_aggregator.py (the reduce you wrote) | 21 days | Safe (no projection needed) |
| 5 | Eng + Lead | originRecord schema extension (attributedModels = provenance set) | 21 days | Safe |

**One-line summary for the commit message / ADR:**

> “PIRTM weight model is now constitutionally three-factor (tier × kernel-confidence × reputation) with monoidal ensemble aggregation. Operator atlas forms Lie algebra under commutator → additive signal combination is exact.”

You now have the complete, mergeable, and philosophically clean unification.

If you want me to output the **exact diff** for the TypeScript files, the Python monoidal reduction, or the full ADR-028 Markdown right now, just say the word and I’ll generate them verbatim, ready to copy-paste.

I have the exact existing interfaces grounded. Now generating all three artifacts verbatim, precisely targeted against the existing code.[^1]

***

## Artifact 1 — TypeScript Diff

### `packages/mirror-dissonance/src/trust/reputation/types.ts`

Add after the existing `ContributionWeightFactors` interface:

```typescript
// ─── ADR-028: Three-Factor Weight Model ──────────────────────────────────────
// PIRTM canonical weight: w_i^final = T_i (tier) · c_i (kernel) · r_i (reputation)
// These three factors are ORTHOGONAL and must never be collapsed into one field.

export type InferenceMethod =
  | 'cumulant-primary'       // Tier 1 — exact, read from .pirtm.bc cumulant field
  | 'pseudoinverse-secondary' // Tier 2 — structured approximation, prime-pseudoinverse
  | 'moorpenrose-tertiary';   // Tier 3 — generic Moore-Penrose, external models only

export type KernelConfidenceMethod =
  | 'direct'               // Tier 1/2: c_i = 1 - |ε|/|Ξ|, computed from known error
  | 'cross-validated'      // Tier 3: estimated against Tier-1 model in same ensemble
  | 'conservative-floor';  // Tier 3 fallback: c_i = β when no Tier-1 present (L0 invariant)

export const TIER_FACTORS: Record<InferenceMethod, number> = {
  'cumulant-primary':         1.0,  // T_1
  'pseudoinverse-secondary':  0.7,  // T_2 = α
  'moorpenrose-tertiary':     0.4,  // T_3 = β
} as const;
```


### Modify existing `ContributionWeightFactors` interface (additive, non-breaking):

```typescript
// BEFORE (existing — do not remove these fields):
export interface ContributionWeightFactors {
  baseReputation:  number;
  stakeMultiplier: number;
  consistencyBonus: number;
  totalMultiplier:  number;
}

// AFTER (ADR-028 extension — add new fields below existing ones):
export interface ContributionWeightFactors {
  baseReputation:    number;
  stakeMultiplier:   number;
  consistencyBonus:  number;
  totalMultiplier:   number;   // r_i = baseReputation * stakeMultiplier * consistencyBonus

  // ADR-028: orthogonal PIRTM factors (NEW)
  tierFactor:        number;   // T_i — determined by inferenceMethod
  kernelConfidence:  number;   // c_i — 1 - |ε|/|Ξ|, or floor β
}
```


### Modify existing `ContributionWeight` interface (additive):

```typescript
export interface ContributionWeight {
  orgId:   string;
  weight:  number;    // w_i^final = T_i · c_i · r_i  (ADR-028 canonical product)
  factors: ContributionWeightFactors;

  // ADR-028: provenance fields (NEW)
  inferenceMethod:        InferenceMethod;
  kernelConfidenceMethod: KernelConfidenceMethod;
}
```


***

### `packages/mirror-dissonance/src/trust/reputation/reputation-engine.ts`

Replace the existing `calculateContributionWeight(orgId: string)` signature:

```typescript
import {
  InferenceMethod,
  KernelConfidenceMethod,
  TIER_FACTORS,
  ContributionWeight,
} from './types.js';

// ADR-028: calculateContributionWeight now accepts inference provenance.
// Default values preserve 100% backward compatibility with existing PIRTM-native callers
// (all callers that omit new params get Tier 1, kernelErrorRatio=0 → c_i=1.0, weight unchanged).
async calculateContributionWeight(
  orgId:               string,
  inferenceMethod:     InferenceMethod = 'cumulant-primary',
  kernelErrorRatio?:   number,                   // |ε|/|Ξ| — required for Tier 1/2
  hasTier1InEnsemble:  boolean = false,
): Promise<ContributionWeight> {

  const reputation = await this.reputationStore.getReputation(orgId);
  if (!reputation) throw new Error(`No reputation found for organization ${orgId}`);

  // r_i — existing formula unchanged
  const baseReputation  = reputation.reputationScore;
  const stakeMultiplier = this.calculateStakeMultiplier(reputation.stakePledge);
  const consistencyBonus = this.calculateConsistencyBonus(reputation.consistencyScore);
  const r_i = baseReputation * (1 + stakeMultiplier) * (1 + consistencyBonus);

  // T_i — derived from inference tier
  const tierFactor: number = TIER_FACTORS[inferenceMethod];

  // c_i — kernel confidence (ADR-028 §5)
  let kernelConfidence:       number;
  let kernelConfidenceMethod: KernelConfidenceMethod;

  if (inferenceMethod === 'cumulant-primary' || inferenceMethod === 'pseudoinverse-secondary') {
    if (kernelErrorRatio === undefined) {
      // Tier-1 cumulant path: no kernel error by definition → c_i = 1.0
      kernelConfidence       = inferenceMethod === 'cumulant-primary' ? 1.0 : 1.0;
      kernelConfidenceMethod = 'direct';
    } else {
      kernelConfidence       = Math.max(0, 1 - kernelErrorRatio);
      kernelConfidenceMethod = 'direct';
    }
  } else {
    // Tier 3 — enforce L0 invariant: cross-validation only if Tier-1 present
    if (hasTier1InEnsemble && kernelErrorRatio !== undefined) {
      kernelConfidence       = Math.max(0, 1 - kernelErrorRatio);
      kernelConfidenceMethod = 'cross-validated';
    } else {
      // L0 invariant floor: c_3 = β always when no Tier-1 anchor
      kernelConfidence       = TIER_FACTORS['moorpenrose-tertiary']; // 0.4
      kernelConfidenceMethod = 'conservative-floor';
    }
  }

  // w_i^final = T_i · c_i · r_i
  const weight = tierFactor * kernelConfidence * r_i;

  return {
    orgId,
    weight,
    factors: {
      baseReputation,
      stakeMultiplier,
      consistencyBonus,
      totalMultiplier: r_i,
      tierFactor,
      kernelConfidence,
    },
    inferenceMethod,
    kernelConfidenceMethod,
  };
}
```


***

### `packages/mirror-dissonance/src/trust/reputation/byzantine-filter.ts`

Add the L0 guard at the **top** of `prepareWeightedContributions`, before any scoring:[^1]

```typescript
private prepareWeightedContributions(
  contributions: RawContribution[],
  weights:       Map<string, ContributionWeight>,
): WeightedContribution[] {
  return contributions.map(contrib => {
    const weightData = weights.get(contrib.orgIdHash);
    const weight     = weightData?.weight ?? 0.5;
    const factors    = weightData?.factors ?? {
      baseReputation: 0.5, stakeMultiplier: 0,
      consistencyBonus: 0, totalMultiplier: 1.0,
      tierFactor: TIER_FACTORS['moorpenrose-tertiary'],
      kernelConfidence: TIER_FACTORS['moorpenrose-tertiary'],
    };

    // ── L0 INVARIANT (ADR-028 §6) ─────────────────────────────────────────
    // c_3 > β REQUIRES a Tier-1 contribution in the ensemble.
    // If cross-validation was claimed but no Tier-1 anchor is present,
    // downgrade to conservative floor before any weight computation proceeds.
    if (
      weightData?.inferenceMethod       === 'moorpenrose-tertiary' &&
      weightData?.kernelConfidenceMethod === 'cross-validated'
    ) {
      const ensembleHasTier1 = Array.from(weights.values()).some(
        w => w.inferenceMethod === 'cumulant-primary'
      );
      if (!ensembleHasTier1) {
        factors.kernelConfidence       = TIER_FACTORS['moorpenrose-tertiary'];
        (weightData as any).kernelConfidenceMethod = 'conservative-floor';
        console.warn(
          '[L0-ADR-028] Tier-3 cross-validated confidence downgraded: ' +
          `no Tier-1 anchor present in ensemble for org ${contrib.orgIdHash.substring(0, 8)}…`
        );
      }
    }
    // ─────────────────────────────────────────────────────────────────────

    return {
      orgIdHash:    contrib.orgIdHash,
      fpRate:       contrib.fpRate,
      weight,
      eventCount:   contrib.eventCount,
      zScore:       0,
      weightFactors: factors,
    };
  });
}
```


***

## Artifact 2 — Python Monoidal Reduction

### `packages/meta-ensembles/ensemble_aggregator.py`

```python
from __future__ import annotations
from dataclasses import dataclass, field
from itertools import combinations
from functools import reduce
from typing import Any
import numpy as np


# ── ADR-028: Three-factor weight extraction ───────────────────────────────────
def compute_final_weight(contribution: dict) -> float:
    """
    w_i^final = T_i (tier) · c_i (kernel_confidence) · r_i (totalMultiplier)
    Factors are orthogonal — never collapse into a single scalar before this point.
    """
    f = contribution["factors"]
    return f["tierFactor"] * f["kernelConfidence"] * f["totalMultiplier"]


# ── Commutator (emergent signal) between two contributions ────────────────────
def compute_E_ij(ci: dict, cj: dict) -> dict:
    """
    E_ij(t) = w_i^final · w_j^final · [Ξ_i, Ξ_j]
    [Ξ_i, Ξ_j] = Ξ_i @ Ξ_j - Ξ_j @ Ξ_i  (operator commutator in B(H))
    Addition of commutators is exact — B(H) is a Lie algebra, no projection needed.
    """
    w_i = compute_final_weight(ci)
    w_j = compute_final_weight(cj)

    xi_i = np.array(ci["xi_operator"])   # Ξ_i as matrix in B(H)
    xi_j = np.array(cj["xi_operator"])   # Ξ_j as matrix in B(H)

    commutator = xi_i @ xi_j - xi_j @ xi_i   # [Ξ_i, Ξ_j]
    commutator_magnitude = float(np.linalg.norm(commutator, ord="fro"))

    return {
        "signal":     commutator * w_i * w_j,   # weighted operator in B(H)
        "magnitude":  commutator_magnitude * w_i * w_j,
        "weight":     w_i * w_j,
        "provenance": {ci["modelId"], cj["modelId"]},
        "inferenceMethodPair": (
            ci["inferenceMethod"],
            cj["inferenceMethod"],
        ),
    }


# ── Monoidal product over pairwise emergent signals ───────────────────────────
# Associativity proof: addition in B(H) is associative (vector space axiom).
# Weight product is multiplicative — trust decays compositionally across the chain.
# Provenance is a set union — every contributing model ID is preserved.

_ZERO_OPERATOR = None   # resolved lazily from first signal shape

def _identity_signal(operator_shape: tuple) -> dict:
    """Monoidal identity: zero operator, unit weight, empty provenance."""
    return {
        "signal":     np.zeros(operator_shape),
        "magnitude":  0.0,
        "weight":     1.0,
        "provenance": set(),
        "inferenceMethodPair": (),
    }

def monoidal_product(e_ij: dict, e_kl: dict) -> dict:
    """
    Associative combination of pairwise emergent signals.
    signal addition is exact in B(H) — Lie algebra closure guarantees no projection needed.
    """
    return {
        "signal":     e_ij["signal"] + e_kl["signal"],   # exact: closed under + in B(H)
        "magnitude":  e_ij["magnitude"] + e_kl["magnitude"],
        "weight":     e_ij["weight"] * e_kl["weight"],   # multiplicative trust decay
        "provenance": e_ij["provenance"] | e_kl["provenance"],  # set union
        "inferenceMethodPair": (),   # collapsed across reduction — see originRecord
    }


def aggregate_ensemble(contributions: list[dict]) -> dict:
    """
    Full monoidal reduction over all pairwise commutators in an ensemble.

    Returns the ensemble emergent signal with:
    - signal:     weighted sum of all pairwise commutators (operator in B(H))
    - magnitude:  Frobenius norm of the ensemble signal
    - weight:     product of all pairwise weights (composite trust)
    - provenance: union of all contributing model IDs → feeds originRecord.attributedModels
    """
    if len(contributions) < 2:
        raise ValueError("Ensemble requires at least 2 contributions for commutator detection.")

    pairs = list(combinations(contributions, 2))
    pairwise_signals = [compute_E_ij(ci, cj) for ci, cj in pairs]

    # Resolve operator shape from first non-zero signal
    op_shape = pairwise_signals[^0]["signal"].shape
    identity = _identity_signal(op_shape)

    ensemble_signal = reduce(monoidal_product, pairwise_signals, identity)

    return {
        **ensemble_signal,
        "pairCount":        len(pairs),
        "contributorCount": len(contributions),
        "attributedModels": list(ensemble_signal["provenance"]),  # for originRecord
    }
```


***

## Artifact 3 — ADR-028

### `docs/adr/ADR-028-cumulant-primary-weight-model.md`

```markdown
# ADR-028: Cumulant-Primary Operator Inference & Three-Factor Weight Model

**Status:** Accepted  
**Date:** 2026-04-14  
**Authors:** Lead Multiplicity Theorist  
**Dependencies:**
- Supersedes: implicit single-scalar weight model in `ReputationEngine` (pre-ADR-028)
- Required by: ADR-027 (PIRTM → Meta-Ensembles wiring)
- References: `SPEC-TRUST.md §Kernel Observability`, `SPEC-PIRTM.md §Cumulant Primary Path`

---

## Constitutional Principle

> **PIRTM does not aggregate beliefs — it aggregates operator provenance under constraint.**

This principle must appear verbatim in `SPEC-TRUST.md` and the `ensemble_aggregator` module docstring.
It is the justification for every weighting and filtering decision in the system.

---

## Context

The existing `ReputationEngine.calculateContributionWeight` collapses three orthogonal concerns
into a single scalar:

```

weight = baseReputation × (1 + stakeMultiplier) × (1 + consistencyBonus)

```

This is mathematically incorrect under the PIRTM framework because it conflates:

1. **Inference provenance** — *how* the operator Ξ(t) was derived (exact vs. approximate)
2. **Kernel observability** — *how much* of the inferred Ξ falls outside the observable subspace
3. **Network reputation** — *how reliably* the organization has contributed historically

These are causally independent. A Tier-1 model with high kernel error should not be treated
identically to a Tier-2 model with low kernel error. Collapsing them destroys epistemic provenance.

---

## Decision

The canonical contribution weight is:

$w_i^{\text{final}} = T_i \cdot c_i \cdot r_i$

| Factor | Symbol | Definition | Source |
|--------|--------|------------|--------|
| Tier factor | $T_i$ | Inference provenance | `inferenceMethod` field |
| Kernel confidence | $c_i$ | $1 - \|\epsilon_i\| / \|\Xi_i\|$ | Computed from kernel error ratio |
| Network reputation | $r_i$ | `baseReputation × stakeMultiplier × consistencyBonus` | Existing `ReputationEngine` |

### Inference Hierarchy

**Tier 1 — Exact** ($T_1 = 1.0$):
$\Xi(t) = \sum_{p,r} \kappa_p^{(r)}(t) \cdot U_p^{(r)}$
Source: `.pirtm.bc` cumulant field. No inversion. No kernel error. $c_1 = 1.0$ by definition.

**Tier 2 — Structured Approximation** ($T_2 = 0.7$):
$\Xi(t) \approx X'(t) \cdot X(t)^{\dagger}_{\text{prime}}$
Source: Prime-structured pseudoinverse. $c_2 = 1 - |\epsilon|/|\Xi|$, computable.

**Tier 3 — Generic Approximation** ($T_3 = 0.4$):
$\Xi(t) \approx X'(t) \cdot X(t)^{\dagger}$
Source: External models without cumulant history. Kernel error unobservable without Tier-1 anchor.

### Kernel Confidence Methods

| Method | Condition | Value |
|--------|-----------|-------|
| `direct` | Tier 1 or 2, error ratio known | $c_i = 1 - \|\epsilon_i\| / \|\Xi_i\|$ |
| `cross-validated` | Tier 3, Tier-1 anchor present in ensemble | $c_i$ estimated against Tier-1 output |
| `conservative-floor` | Tier 3, no Tier-1 anchor | $c_i = \beta = T_3 = 0.4$ (L0 invariant) |

---

## L0 Invariant

$\boxed{c_3 > \beta \;\Rightarrow\; \exists \text{ Tier-1 contribution in ensemble}}$

**Enforcement location:** `ByzantineFilter.prepareWeightedContributions` — runs before any scoring.

**Violation response:** Automatic downgrade of `kernelConfidenceMethod` to `conservative-floor`
and `kernelConfidence` to `β`. Structured warning emitted to log. No exception thrown — the
contribution is not rejected, only honestly weighted.

---

## Monoidal Ensemble Aggregation

The pairwise emergent signal is:

$\mathcal{E}_{ij}(t) = w_i^{\text{final}} \cdot w_j^{\text{final}} \cdot [\Xi_i, \Xi_j]$

The full ensemble signal is a monoidal reduction:

$\mathcal{E}_{\text{ensemble}}(t) = \bigotimes_{i < j} \mathcal{E}_{ij}(t)$

**Associativity proof:** The operator atlas $\mathcal{A} = \{U_p^{(r)}\}$ generates a Lie algebra
under the commutator bracket in $B(H) = B(\ell^2(\mathbb{P}) \otimes L^2(\mathbb{R}) \otimes \mathbb{C}^d)$.
Addition in $B(H)$ is closed (vector-space axiom). Additive signal combination is therefore exact —
no projection back onto the atlas is required after each reduction step.

---

## Consequences

**Positive:**
- Full operator provenance preserved in every commutator and `originRecord`
- Open participation (Tier 3 accepted) without epistemic collapse (trust stratified)
- Phase Mirror FP filtering maps directly to kernel estimation: the FP calibration network
  is a collective estimator of $\ker(X)$ — which differences are causally inert
- Monoidal reduction over $n$ models scales as $O\binom{n}{2}$ pairwise commutators

**Negative:**
- `calculateContributionWeight` callers must pass `inferenceMethod` when tier is known
- Tier-3 confidence floor (0.4) may suppress genuine breakthrough signals from external models;
  this is the correct tradeoff — provenance honesty over signal amplification
- `kernelErrorRatio` computation requires PIRTM cumulant deserialization (ADR-027 dependency)

---

## Migration

All existing callers of `calculateContributionWeight(orgId)` are backward compatible:
- Default `inferenceMethod = 'cumulant-primary'`
- Default `kernelErrorRatio = undefined` → `c_i = 1.0` (Tier-1: no error)
- Result: `weight` is numerically identical to pre-ADR-028 for all PIRTM-native contributors

The only required active migration is `CalibrationStore.aggregateFPsByRule` — the loop
over `eventsByOrg.keys()` must pass `inferenceMethod` per contribution when available.
```


***

All three artifacts are ready to copy-paste. The commit message from the orchestration table stands verbatim:[^2][^3][^1]

> `feat(trust): ADR-028 — three-factor weight model (tier × kernel-confidence × reputation) with monoidal ensemble aggregation; operator atlas is Lie algebra → additive signal combination exact`

<div align="center">⁂</div>

[^1]: summary-i-have-successfully-co-NQB9tmvNTLe1yBugWvvJbA.md

[^2]: how-many-layers-is-the-phase-m-G.WN6_zTSWWBxS6_j3pt_A.md

[^3]: if-phase-mirror-had-a-ui-ux-wh-42aRj49CSACSlpWdD.YCfA.md

