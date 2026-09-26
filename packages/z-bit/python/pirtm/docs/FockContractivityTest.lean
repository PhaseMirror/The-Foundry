import Mathlib.Analysis.Normed.Operator.ContinuousLinearMap
import Mathlib.Topology.MetricSpace.Contracting

noncomputable section
open scoped NNReal

namespace PIRTM

/-- Test scaffold for multi-particle Fock contraction.
Replace `FockTrunc`, `liftOperator`, and imported foundations with the concrete
repo definitions before running the narrow build. -/
variable {𝕜 : Type*} [IsROrC 𝕜]
variable {E : Type*} [NormedAddCommGroup E] [NormedSpace 𝕜 E]

axiom FockTrunc : Type* -> ℕ -> Type*
axiom instNormedAddCommGroupFockTrunc (E : Type*) [NormedAddCommGroup E] (N : ℕ) : NormedAddCommGroup (FockTrunc E N)
axiom instNormedSpaceFockTrunc (E : Type*) [NormedAddCommGroup E] [NormedSpace 𝕜 E] (N : ℕ) : NormedSpace 𝕜 (FockTrunc E N)
attribute [instance] instNormedAddCommGroupFockTrunc instNormedSpaceFockTrunc

axiom liftOperator : {N : ℕ} -> (FockTrunc E N →L[𝕜] FockTrunc E N) -> (FockTrunc E N →L[𝕜] FockTrunc E N)

def pirtm_contraction_const (lambda_m L_G : ℝ) : ℝ := (1 - lambda_m) + lambda_m * L_G

def pirtmUpdateFock {N : ℕ} (lambda_m : ℝ) (Gf : FockTrunc E N →L[𝕜] FockTrunc E N) :
    FockTrunc E N → FockTrunc E N :=
  fun ψ => (1 - lambda_m) • ψ + lambda_m • Gf ψ

lemma pirtmUpdateFock_lipschitz_test
    {N : ℕ} {lambda_m L_G : ℝ}
    (hλ0 : 0 ≤ lambda_m) (hλ1 : lambda_m ≤ 1)
    (hGf : ‖Gf‖ ≤ L_G) :
    LipschitzWith (Real.toNNReal (pirtm_contraction_const lambda_m L_G)) (pirtmUpdateFock (E := E) lambda_m Gf) := by
  intro x y
  calc
    dist (pirtmUpdateFock (E := E) lambda_m Gf x) (pirtmUpdateFock (E := E) lambda_m Gf y)
        ≤ dist ((1 - lambda_m) • x) ((1 - lambda_m) • y) + dist (lambda_m • Gf x) (lambda_m • Gf y) := by
            simpa [pirtmUpdateFock, dist_eq_norm] using dist_add_add_le ((1 - lambda_m) • x) ((1 - lambda_m) • y) (lambda_m • Gf x) (lambda_m • Gf y)
    _ = ‖(1 - lambda_m : ℝ)‖ * dist x y + ‖(lambda_m : ℝ)‖ * dist (Gf x) (Gf y) := by
          simp [dist_eq_norm, norm_smul]
    _ ≤ ‖(1 - lambda_m : ℝ)‖ * dist x y + ‖(lambda_m : ℝ)‖ * (‖Gf‖ * dist x y) := by
          gcongr
          simpa using Gf.lipschitz.norm_sub_le x y
    _ ≤ ((1 - lambda_m) + lambda_m * L_G) * dist x y := by
          have h1 : ‖(1 - lambda_m : ℝ)‖ = 1 - lambda_m := by
            rw [Real.norm_eq_abs, abs_of_nonneg]
            linarith
          have h2 : ‖(lambda_m : ℝ)‖ = lambda_m := by
            rw [Real.norm_eq_abs, abs_of_nonneg hλ0]
          rw [h1, h2]
          nlinarith
    _ ≤ Real.toNNReal (pirtm_contraction_const lambda_m L_G) * dist x y := by
          simp [pirtm_contraction_const]

end PIRTM
