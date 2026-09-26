import Mathlib.Analysis.Normed.Group.Basic
import Mathlib.Analysis.Normed.Module.Basic
import Mathlib.Analysis.Complex.Trigonometric

open Real

section

variable {V : Type*} [NormedAddCommGroup V] [NormedSpace ℝ V]

/-- The Safety Set S is defined as a closed ball around the origin with radius `threshold`. -/
def safetySet (threshold : ℝ) : Set V :=
  {w | ‖w‖ ≤ threshold}

/-- 
  The ACE Projection function (ADR-011).
  Maps any proposal `w` to the nearest point in the safety set.
-/
noncomputable def aceProjection (threshold : ℝ) (w : V) : V :=
  if ‖w‖ ≤ threshold then w
  else (threshold / ‖w‖) • w

/-- 
  Theorem: The ACE Guardian ensures weight safety.
  For any weight `w`, the projected weight `aceProjection threshold w` is in the safety set.
-/
theorem ace_guardian_safety (threshold : ℝ) (h_pos : 0 < threshold) (w : V) :
  aceProjection threshold w ∈ safetySet threshold := by
  unfold aceProjection safetySet
  split_ifs with h
  · -- Case 1: w is already safe
    exact h
  · -- Case 2: w is unsafe, project it
    simp only [Set.mem_setOf_eq]
    rw [norm_smul]
    rw [Real.norm_eq_abs]
    -- We know ‖w‖ > threshold, so ‖w‖ > 0
    have h_w_pos : 0 < ‖w‖ := by
      have h_gt : threshold < ‖w‖ := not_le.mp h
      exact h_pos.trans h_gt
    rw [abs_div, abs_of_pos h_pos, abs_of_pos h_w_pos]
    field_simp [h_w_pos.ne.symm]
    exact le_refl _

/--
  Contraction property (ADR-031):
  Recursive updates in the PIRTM substrate remain stable.
  (Simplified model of tanh activation)
-/
theorem tanh_bounds (x : ℝ) : |tanh x| < 1 := by
  rw [abs_lt]
  constructor
  · exact neg_one_lt_tanh x
  · exact tanh_lt_one x

/--
  Stability of Recursive Updates:
  If the state is updated via a proposal function (the Genius)
  and then projected by the Guardian, the system remains bounded
  within the safety set for all time steps.
-/
theorem recursive_stability (threshold : ℝ) (h_pos : 0 < threshold) (genius : V → V) 
  (w₀ : V) (hw₀ : ‖w₀‖ ≤ threshold) :
  ∀ n, ‖(fun w => aceProjection threshold (genius w))^[n] w₀‖ ≤ threshold := by
  intro n
  induction n with
  | zero => 
    simp
    exact hw₀
  | succ n ih =>
    rw [Function.iterate_succ_apply']
    -- Apply the safety theorem to the last proposal
    exact ace_guardian_safety threshold h_pos (genius ((fun w => aceProjection threshold (genius w))^[n] w₀))

end
