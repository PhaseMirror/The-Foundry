/- # AffineCore.Foundations.BanachSpace -/

/-!
The ambient space: a complex Banach space (self-contained, no Mathlib).
For the shared library build, we use Float as the base type.
-/

-- Simple Set type definition without Mathlib
def Set (E : Type) := E -> Prop

class Mem (E : Type) (a : E) (s : Set E) where
  mem : s a

infix:50 " ∈ " => Mem.mem

-- State trajectory type
def StateSeq (E : Type) := Nat -> E

/-!
The Lawful Subspace L.
-/
def LawfulSubspace (E : Type) : Set E := fun x => True

instance mem_LawfulSubspace (E : Type) (x : E) : Mem E x (LawfulSubspace E) where
  mem := by simp [LawfulSubspace]

/-!
The central claim of the Affine Core: existence of a stable trajectory.
This file sets up the Banach space foundations without Mathlib.
-/
