/- # AffineCore.Stability.InvariantCompleteness -/

import AffineCore.Foundations.BanachSpace
import AffineCore.MTPI.DriftBound

/-!
The L0 Invariants Predicate (Model of l0-invariants.yaml).
-/
structure L0Invariants (S_t S_next : Float) (lipschitz_L : Float) (entropy_drift : Float) where
  drift_mag : Float.abs (S_t - S_next) < 0.3
  contractive : lipschitz_L < 1.0
  entropy_stable : entropy_drift < 0.05

/-!
Theorem: Invariant Completeness.
-/
theorem l0_invariant_completeness
    (S_t S_next : Float) (L : Float) (eta : Float)
    (h_prev : LawfulSubspace Float S_t)
    (h_l0 : L0Invariants S_t S_next L eta)
    (h_pirtm : exists (f : Float -> Float), preserves_lawfulness f ∧ S_next = f S_t) :
    LawfulSubspace Float S_next := by
  rcases h_pirtm with ⟨f, h_pres, h_next⟩
  rw [h_next]
  apply h_pres
  exact h_prev

/-!
The "Lawful Drift" Lemma:
-/
theorem lawful_drift_integrity
    (S_t S_next : Float) (L : Float) (eta : Float)
    (h_l0 : L0Invariants S_t S_next L eta)
    (topological_invariant : Float -> Float)
    (h_stable : forall x y, Float.abs (topological_invariant x - topological_invariant y) <= Float.abs (x - y))
    (h_target : topological_invariant S_t = 0) :
    Float.abs (topological_invariant S_next) < 0.3 := by
  calc Float.abs (topological_invariant S_next) = Float.abs (topological_invariant S_next - topological_invariant S_t) := by rw [h_target, sub_zero]
    _ <= Float.abs (S_next - S_t) := h_stable S_next S_t
    _ = Float.abs (S_t - S_next) := by rw [abs_sub]
    _ < 0.3 := h_l0.drift_mag
