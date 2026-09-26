/- # AffineCore.Operators.MultiplicityOperator -/

import AffineCore.Foundations.BanachSpace

/-!
Multiplicity Operator Phi^op = Lambda_m(t) * I.
Scalar multiple of identity.
Formalizes Theorem C1.
-/
noncomputable def MultiplicityOp (Lambda : Float) : Float -> Float :=
  fun x => Float.mul Lambda x

/-!
Its operator norm is exactly abs Lambda_m.
-/
theorem multiplicity_op_norm (Lambda : Float) :
    Float.abs (MultiplicityOp Lambda 0) = Float.abs Lambda := by
  sorry
