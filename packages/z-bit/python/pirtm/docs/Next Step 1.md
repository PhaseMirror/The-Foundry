<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# A concrete statement template for that Fock-lifted contraction lemma (both in mathematical English and in Lean-structure form) as the next artifact

Here’s a concrete template you can drop into both the paper and the codebase, in two layers: precise mathematical English and a Lean-4-shaped skeleton you can adapt to your actual `Fock.lean` definitions. The statement is deliberately written for a **truncated Fock space** $\mathcal{F}_N(H)$, since that’s the numerically relevant setting and matches how bounded-operator norms behave on finite truncations.[^1][^2][^3]

***

## 1. Mathematical-English statement

**Setting**

- Let $H$ be a complex Hilbert space.[^4]
- Let $T : H \to H$ be a bounded linear operator with operator norm $\lVert T\rVert \le L < 1$.[^5][^6]
- For a fixed integer cutoff $N \ge 1$, let $\mathcal{F}_N(H)$ denote the truncated bosonic Fock space of order $N$:

$$
\mathcal{F}_N(H) := \bigoplus_{n=0}^N H^{\otimes_s n},
$$

equipped with the Hilbert direct-sum norm

$$
\left\lVert (x_0, x_1, \dots, x_N) \right\rVert_{\mathcal{F}_N}
  := \left(\sum_{n=0}^N \lVert x_n\rVert_{H^{\otimes_s n}}^2\right)^{1/2}.
$$ [^3][^4]
- Define the **Fock-lifted operator**

$$
T^{\mathcal{F}_N} : \mathcal{F}_N(H) \to \mathcal{F}_N(H)
$$

by acting on each sector via the symmetrized tensor power:

$$
T^{\mathcal{F}_N}(x_0, x_1, \dots, x_N)
:=
\bigl(x_0,\ T^{\otimes_s 1} x_1,\ \dots,\ T^{\otimes_s N} x_N\bigr).
$$

Here $T^{\otimes_s n} : H^{\otimes_s n} \to H^{\otimes_s n}$ is the linear operator induced by $T$ on the $n$-particle symmetric tensor power.[^3][^4]

**Lemma (Fock-lifted contraction template).**

> Suppose $\lVert T\rVert \le L < 1$.
> For each cutoff $N \ge 1$, the Fock-lifted operator $T^{\mathcal{F}_N}$ is Lipschitz (with respect to the Fock norm) with Lipschitz constant

> $$
> L_{\mathrm{Fock}}(N) \;\le\; \max_{0 \le n \le N} \lVert T^{\otimes_s n}\rVert.
>
$$

> In particular, if we have an a priori bound

> $$
> \lVert T^{\otimes_s n} \rVert \le L_{\mathrm{lift}} < 1
> \quad\text{for all } 1 \le n \le N,
>
$$

> then $T^{\mathcal{F}_N}$ is a contraction on $\mathcal{F}_N(H)$ with contraction constant $L_{\mathrm{lift}}<1$.

This is the **pure Fock-lifted contraction** lemma: it tells you how a single-step operator bound on sectors induces a contraction property on the truncated many-body space. Note that for naive tensor powers one has $\lVert T^{\otimes n}\rVert = \lVert T\rVert^n$, so if $L<1$ then all higher tensor powers shrink even more strongly. For symmetric tensor powers $H^{\otimes_s n}$, the operator norms are still controlled in terms of $\lVert T\rVert$; in many standard constructions you retain a bound of the form $\lVert T^{\otimes_s n}\rVert \le \lVert T\rVert^n$.[^4][^3][^5]

**PIRTM-specific extension (optional, matches your Λₘ rule).**

You can then phrase a PIRTM-flavored version for the Λₘ update:

> Let $G : H \to H$ be the PIRTM inner step with operator-norm bound $\lVert G\rVert \le L_G < 1$ derived from

> $$
> L_G \;\le\; \lVert \Xi \rVert + \lVert \Lambda\rVert L_T.
>
$$

> Define the Λₘ update on $H$ by

> $$
> T_{\Lambda_m}(x) := (1-\lambda_m)x + \lambda_m G(x)
>
$$

> with $0 < \lambda_m \le 1$, so its contraction constant on $H$ is

> $$
> c := 1 - \lambda_m(1 - L_G) < 1.
>
$$

> For each truncated Fock space $\mathcal{F}_N(H)$, define the lifted update

> $$
> T_{\Lambda_m}^{\mathcal{F}_N}
> := (1-\lambda_m)\operatorname{Id}_{\mathcal{F}_N}
>    + \lambda_m G^{\mathcal{F}_N},
>
$$

> where $G^{\mathcal{F}_N}$ is the Fock-lift of $G$ as above.
> If $\lVert G^{\otimes_s n}\rVert \le L_G$ for all $1 \le n \le N$, then
> $T_{\Lambda_m}^{\mathcal{F}_N}$ is a contraction on $\mathcal{F}_N(H)$ with contraction constant at most $c$, and hence has a unique fixed point by the Banach fixed-point theorem.[^7][^6][^5]

This gives you the exact artifact you want: “Layer‑II inherits the same contraction constant as Layer‑I under an appropriate sectorwise operator-norm bound.”

***

## 2. Lean-4 shaped template

Below is a **skeleton**, not drop-in code: it gives you structure, module boundaries, and names that should fit your existing `Foundations/Fock.lean` and `PIRTM` naming scheme.

I’ll split it into two theorems:

1. A generic Fock-lifted Lipschitz bound.
2. A PIRTM Λₘ-specific contraction lemma.

### 2.1. Generic Fock-lifted Lipschitz bound

```lean
/-
Assumptions:
- E : Type* is a complex Hilbert space (NormedAddCommGroup + InnerProductSpace ℂ E).
- FockTrunc E N represents ⨁_{n=0}^N (SymmTensorPower ℂ n E) with the ℓ²-direct-sum norm.
- T : E →L[ℂ] E is a bounded linear operator.
- For each n, we have a "lift" T_fock_n : SymmTensorPower ℂ n E →L[ℂ] SymmTensorPower ℂ n E
  with ∥T_fock_n∥ ≤ L_n.
-/

import Mathlib.Analysis.NormedSpace.OperatorNorm.Basic
import Mathlib.Analysis.NormedSpace.Basic

noncomputable section
open scoped BigOperators

namespace PIRTM

variable {E : Type*} [NormedAddCommGroup E] [InnerProductSpace ℂ E]

/-- A truncated Fock space over `E` at cutoff `N`. This should already exist
as your `FockSpace N E` (or similar) with a norm from the ℓ² direct sum. -/
@[reducible] def FockTrunc (N : ℕ) := sorry  -- your existing definition

namespace FockTrunc

/-- The sectorwise lift of a bounded operator to a truncated Fock space.

Intended form:
- It acts as the identity on the vacuum sector.
- On the `n`-particle sector, it acts by the corresponding lifted operator
  `T_fock_n`. -/
def liftOperator
    {N : ℕ}
    (T_fock : ∀ n : Fin (N+1),
      (FockSector E n) →L[ℂ] (FockSector E n)) :
    FockTrunc E N →L[ℂ] FockTrunc E N :=
  sorry

/-- Template lemma: if every sectorwise lift has norm ≤ L_lift < 1, then the
direct-sum lift is a contraction with the same Lipschitz constant. -/
theorem liftOperator_contractive
    {N : ℕ}
    (T_fock : ∀ n : Fin (N+1),
      (FockSector E n) →L[ℂ] (FockSector E n))
    (L_lift : ℝ)
    (hL0 : 0 ≤ L_lift) (hL1 : L_lift < 1)
    (hTnorm : ∀ n, ∥T_fock n∥ ≤ L_lift) :
    ∀ x y : FockTrunc E N,
      dist (liftOperator T_fock x) (liftOperator T_fock y)
        ≤ L_lift * dist x y := by
  -- Sketch:
  -- 1. Expand FockTrunc as ℓ² direct sum over sectors.
  -- 2. Use Pythagoras / norm of direct-sum operator ≤ sup of sector norms.
  -- 3. Apply `hTnorm` and the fact that ℓ² sum → Lipschitz constant is sup sector-wise.
  sorry

end FockTrunc

end PIRTM
```

You’ll replace `FockSector`, `FockTrunc`, and `liftOperator` with your actual Fock module names, but structurally this is what you want: a lemma stating that the lifted operator is Lipschitz with constant `L_lift`, using a direct-sum argument.[^2][^3][^4]

### 2.2. PIRTM Λₘ-specific lemma (Fock-lifted contraction)

This version assumes you already have:

- `pirtmUpdate : ℝ → (E → E) → E → E` (your Λₘ update on the base space).
- `pirtm_contraction_const : ℝ → ℝ → ℝ := fun lambda_m L_G => 1 - lambda_m * (1 - L_G)`.
- `pirtm_step_lipschitz : ...` giving you `L_G` via $\|\Xi\|, \|\Lambda\|, L_T$.
- A Fock-lifted `G_fock` that acts sectorwise.

```lean
import Mathlib.Topology.MetricSpace.Contracting
import Mathlib.Analysis.NormedSpace.OperatorNorm.Basic
import ./Foundations/Fock  -- your existing Fock formalization
import ./LambdaMUpdate     -- your Layer-I Λ_m lemmas

noncomputable section
open scoped NNReal

namespace PIRTM

variable {E : Type*} [NormedAddCommGroup E] [InnerProductSpace ℂ E]
variable [CompleteSpace E]

/-- PIRTM Λ_m update on base space, as already sealed. -/
def pirtmUpdate (lambda_m : ℝ) (G : E → E) (x : E) : E :=
  (1 - lambda_m) • x + lambda_m • G x

/-- Fock-lifted PIRTM Λ_m update at cutoff `N`.
Assumes we have a FockTrunc and a sectorwise lift of `G`. -/
def pirtmUpdateFock
    (lambda_m : ℝ)
    {N : ℕ}
    (G_fock : FockTrunc E N → FockTrunc E N) :
    FockTrunc E N → FockTrunc E N :=
  fun ψ => (1 - lambda_m) • ψ + lambda_m • G_fock ψ

/-- Template lemma: Fock-lifted Λ_m contraction.

If the base PIRTM step has Lipschitz constant `L_G < 1` (coming from
`∥Ξ∥, ∥Λ∥, L_T`), and the sectorwise Fock lifts respect the same bound up to
cutoff `N`, then the truncated Fock Λ_m update is contractive with the same
contraction constant. -/
theorem pirtmUpdateFock_contracts
    {N : ℕ}
    {G : E → E}
    (lambda_m L_G : ℝ)
    (hλ0 : 0 < lambda_m) (hλ1 : lambda_m ≤ 1)
    (hLG : L_G < 1)
    (hG_lip : LipschitzWith (Real.toNNReal L_G) G)
    -- sectorwise Fock lift `G_fock` and norm bound
    (G_fock_op : ∀ n : Fin (N+1),
        (FockSector E n) →L[ℂ] (FockSector E n))
    (hG_fock_norm : ∀ n, ∥G_fock_op n∥ ≤ L_G) :
    ∃ K : NNReal, K < 1 ∧
      LipschitzWith K (pirtmUpdateFock lambda_m (FockTrunc.liftOperator G_fock_op)) := by
  -- 1. Base-space contraction constant:
  --    c := pirtm_contraction_const lambda_m L_G = 1 - lambda_m * (1 - L_G).
  -- 2. Use your existing `lambdaUpdate_contracts` lemma for base space.
  -- 3. Use `FockTrunc.liftOperator_contractive` with `L_lift = L_G`.
  -- 4. Combine the two to show `pirtmUpdateFock` is Lipschitz with constant `c`.
  sorry

end PIRTM
```

You’ll fill in the `sorry`s using your existing:

- Λₘ lemmas (`lambdaUpdate_contractingWith` / `pirtm_contraction_const`).
- Fock space definitions and direct-sum norm lemmas.
- Operator-norm facts from `Mathlib.Analysis.NormedSpace.OperatorNorm.Basic`.[^6][^5]

***

If you like this template, I can next help you specialize it to **your actual Fock module names and existing lemmas**, so the theorem becomes as close as possible to a drop-in Lean file for `Foundations/Fock.lean` and your `PIRTM` namespace.
<span style="display:none">[^10][^11][^12][^13][^14][^15][^16][^17][^18][^19][^20][^21][^22][^8][^9]</span>

<div align="center">⁂</div>

[^1]: https://github.com/qutip/qutip/issues/2495

[^2]: https://www.notebookarchive.org/truncated-fock-space-as-a-way-to-model-2nd-quantization-in-wolfram-language--2024-07-48hd33l/

[^3]: https://en.wikipedia.org/wiki/Tensor_product_of_Hilbert_spaces

[^4]: https://heil.math.gatech.edu/metricnote/chap8.pdf

[^5]: https://github.com/leanprover-community/mathlib4/blob/968ea7f28314185cfc93c17b99f1c265af095b1b/Mathlib/Analysis/NormedSpace/OperatorNorm/Basic.lean

[^6]: https://en.wikipedia.org/wiki/Operator_norm

[^7]: https://en.wikipedia.org/wiki/Banach_fixed-point_theorem

[^8]: https://github.com/qutip/QuantumToolbox.jl/blob/main/docs/src/users_guide/tensor.md

[^9]: https://github.com/antoniopedrofraga/computational-methods/blob/master/readme.md

[^10]: https://github.com/jhjacobsen/invertible-resnet/issues/25

[^11]: https://github.com/sumeetkhatri/QuTIpy

[^12]: http://github.com/XanaduAI/MrMustard

[^13]: https://github.com/fpvandoorn/sard

[^14]: https://github.com/mxamin/MSc-Thesis-Seminar/blob/master/th_seminar.tex

[^15]: https://github.com/cpeck-rmvd/complex-analysis

[^16]: https://github.com/Haokai-Zhang/EasyMPS

[^17]: https://arxiv.org/abs/1312.2214

[^18]: https://www.johndcook.com/blog/2018/12/21/contraction-mapping-theorem/

[^19]: https://en.wikipedia.org/wiki/Contraction_(operator_theory)

[^20]: https://discuss.pennylane.ai/t/fock-backend-truncation/3545

[^21]: https://wiki.math.ntnu.no/_media/tma4145/2020h/banach.pdf

[^22]: https://web.ma.utexas.edu/mp_arc/c/14/14-2.pdf

