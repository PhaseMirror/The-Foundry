# Draft mathlib4 PR description: direct-sum/operator-norm lemma for truncated Fock lifts

## Summary
This PR adds a small operator-norm lemma for continuous linear maps acting on finite direct sums of normed spaces. The result shows that if each sectorwise map is bounded by a uniform constant `L`, then the induced direct-sum map is also bounded by `L`.

## Motivation
This lemma is useful for reasoning about block-diagonal operators, truncated tensor/Fock constructions, and other finite direct-sum operator models. In particular, it provides a clean bridge from sectorwise bounds to a global `ContinuousLinearMap.opNorm` bound.

## Scope
This PR intentionally avoids any domain-specific terminology (for example, PIRTM, Fock contraction, or quantum-operator naming). It contributes only the reusable functional-analytic statement and proof infrastructure.

## Main statement
Informally:

> Let `T_i : E_i →L[𝕜] E_i` be a finite family of continuous linear maps indexed by a finite type `ι`.
> If `‖T_i‖ ≤ L` for all `i`, then the block/direct-sum operator `T : (∀ i, E_i) →L[𝕜] (∀ i, E_i)`
> defined componentwise by `(T x)_i = T_i (x_i)` satisfies `‖T‖ ≤ L`.

The intended norm on the finite product/direct sum is the standard one already available in Mathlib for the chosen construction.

## Why this belongs in Mathlib
- The result is general-purpose and independent of any one application.
- It packages a recurring argument about operator norms on block-diagonal maps.
- It is a useful lemma for downstream work in operator theory and structured finite-dimensional models.

## Notes
Before opening the PR, I plan to confirm on Zulip whether an equivalent lemma already exists in current Mathlib. If it does, I will instead add a documentation/example improvement rather than a new theorem.
