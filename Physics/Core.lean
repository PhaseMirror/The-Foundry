/-!
# Physics — Core Data Types

Scalar, vector, and tensor types for the Foundry physics calculator,
as specified by ADR-0121 (Definition of Physical Mechanisms).
-/

namespace Physics

/-- Physical scalar quantity. -/
structure Scalar where
  val : Nat
  deriving DecidableEq, Repr, Inhabited

instance : OfNat Scalar (n : Nat) := ⟨⟨n⟩⟩
instance : ToString Scalar := ⟨fun s => toString s.val⟩
instance : Add Scalar := ⟨fun a b => ⟨a.val + b.val⟩⟩
instance : Sub Scalar := ⟨fun a b => ⟨a.val - b.val⟩⟩
instance : Mul Scalar := ⟨fun a b => ⟨a.val * b.val⟩⟩
instance : Div Scalar := ⟨fun a b => ⟨a.val / b.val⟩⟩
instance : Neg Scalar := ⟨fun a => ⟨0 - a.val⟩⟩

/-- Zero scalar. -/
def Scalar.zero : Scalar := ⟨0⟩

/-- One scalar. -/
def Scalar.one : Scalar := ⟨1⟩

/-- From Nat. -/
def Scalar.ofNat (n : Nat) : Scalar := ⟨n⟩

/-- From Float (truncated). -/
def Scalar.ofFloat (f : Float) : Scalar := ⟨f.toUInt32.toNat⟩

/-- To Float. -/
def Scalar.toFloat (s : Scalar) : Float := Float.ofNat s.val

/-- Absolute value (identity for Nat). -/
def Scalar.abs (s : Scalar) : Scalar := s

/-- 3D Euclidean vector with Nat components. -/
structure Vec3 where
  x : Nat
  y : Nat
  z : Nat
  deriving DecidableEq, Repr, Inhabited

/-- Zero vector. -/
def Vec3.zero : Vec3 := ⟨0, 0, 0⟩

/-- Unit vectors. -/
def Vec3.i : Vec3 := ⟨1, 0, 0⟩
def Vec3.j : Vec3 := ⟨0, 1, 0⟩
def Vec3.k : Vec3 := ⟨0, 0, 1⟩

/-- Vector addition. -/
def Vec3.add (u v : Vec3) : Vec3 := ⟨u.x + v.x, u.y + v.y, u.z + v.z⟩

/-- Vector subtraction. -/
def Vec3.sub (u v : Vec3) : Vec3 := ⟨u.x - v.x, u.y - v.y, u.z - v.z⟩

/-- Scalar-vector multiplication. -/
def Vec3.scale (s : Scalar) (v : Vec3) : Vec3 :=
  ⟨s.val * v.x, s.val * v.y, s.val * v.z⟩

/-- Dot product. -/
def Vec3.dot (u v : Vec3) : Nat := u.x * v.x + u.y * v.y + u.z * v.z

/-- Cross product. -/
def Vec3.cross (u v : Vec3) : Vec3 :=
  ⟨u.y * v.z - u.z * v.y, u.z * v.x - u.x * v.z, u.x * v.y - u.y * v.x⟩

/-- Squared norm. -/
def Vec3.norm (v : Vec3) : Nat := v.x * v.x + v.y * v.y + v.z * v.z

/-- Squared distance. -/
def Vec3.dist (u v : Vec3) : Nat := Vec3.norm (Vec3.sub u v)

/-- From three Scalars. -/
def Vec3.ofScalars (a b c : Scalar) : Vec3 := ⟨a.val, b.val, c.val⟩

instance : Add Vec3 := ⟨Vec3.add⟩
instance : Sub Vec3 := ⟨Vec3.sub⟩
/-- Negation (truncated to 0 for Nat). -/
def Vec3.neg (v : Vec3) : Vec3 := ⟨0 - v.x, 0 - v.y, 0 - v.z⟩

instance : Neg Vec3 := ⟨Vec3.neg⟩
instance : ToString Vec3 := ⟨fun v => s!"({v.x}, {v.y}, {v.z})"⟩

/-- Component by Fin 3. -/
def Vec3.at (v : Vec3) (i : Fin 3) : Nat :=
  match i with
  | 0 => v.x
  | 1 => v.y
  | 2 => v.z

@[ext] theorem Vec3.ext (u v : Vec3) (h : u.x = v.x) (h' : u.y = v.y) (h'' : u.z = v.z) : u = v := by
  cases u <;> cases v <;> subst h h' h'' <;> rfl

/-- 3x3 matrix. -/
structure Mat3 where
  r0 : Vec3
  r1 : Vec3
  r2 : Vec3
  deriving DecidableEq, Repr, Inhabited

/-- Zero matrix. -/
def Mat3.zero : Mat3 := ⟨Vec3.zero, Vec3.zero, Vec3.zero⟩

/-- Identity matrix. -/
def Mat3.id : Mat3 := ⟨Vec3.i, Vec3.j, Vec3.k⟩

/-- Row access. -/
def Mat3.row (m : Mat3) (i : Fin 3) : Vec3 :=
  match i with
  | 0 => m.r0
  | 1 => m.r1
  | 2 => m.r2

/-- Matrix-vector multiplication. -/
def Mat3.vecMul (m : Mat3) (v : Vec3) : Vec3 :=
  ⟨Vec3.dot m.r0 v, Vec3.dot m.r1 v, Vec3.dot m.r2 v⟩

/-- Matrix-matrix multiplication. -/
def Mat3.matMul (a b : Mat3) : Mat3 :=
  let r0 := Vec3.ofScalars
    (Scalar.ofNat (Vec3.dot a.r0 b.r0))
    (Scalar.ofNat (Vec3.dot a.r0 b.r1))
    (Scalar.ofNat (Vec3.dot a.r0 b.r2))
  let r1 := Vec3.ofScalars
    (Scalar.ofNat (Vec3.dot a.r1 b.r0))
    (Scalar.ofNat (Vec3.dot a.r1 b.r1))
    (Scalar.ofNat (Vec3.dot a.r1 b.r2))
  let r2 := Vec3.ofScalars
    (Scalar.ofNat (Vec3.dot a.r2 b.r0))
    (Scalar.ofNat (Vec3.dot a.r2 b.r1))
    (Scalar.ofNat (Vec3.dot a.r2 b.r2))
  ⟨r0, r1, r2⟩

/-- Transpose. -/
def Mat3.transpose (m : Mat3) : Mat3 :=
  ⟨⟨m.r0.x, m.r1.x, m.r2.x⟩, ⟨m.r0.y, m.r1.y, m.r2.y⟩, ⟨m.r0.z, m.r1.z, m.r2.z⟩⟩

/-- Trace. -/
def Mat3.trace (m : Mat3) : Nat := m.r0.x + m.r1.y + m.r2.z

/-- General tensor. -/
def Tensor := Fin 3 → Fin 3 → Scalar

/-- Zero tensor. -/
def Tensor.zero : Tensor := fun _ _ => Scalar.zero

/-- Identity tensor (Kronecker delta). -/
def Tensor.id : Tensor := fun i j => if i = j then Scalar.one else Scalar.zero

/-- From Mat3. -/
def Tensor.ofMat3 (m : Mat3) : Tensor := fun i j => Scalar.ofNat (Vec3.at (Mat3.row m i) j)

/-- Tensor trace. -/
def Tensor.trace (t : Tensor) : Scalar := t 0 0 + t 1 1 + t 2 2

/-- Get component. -/
def Tensor.get (t : Tensor) (i j : Fin 3) : Scalar := t i j

/-- Set component. -/
def Tensor.set (t : Tensor) (i j : Fin 3) (s : Scalar) : Tensor :=
  fun k l => if k = i && l = j then s else t k l

/-- Zero vector is additive identity. -/
theorem vec3_zero_add (v : Vec3) : Vec3.add Vec3.zero v = v := by
  unfold Vec3.add Vec3.zero
  ext
  · exact Nat.zero_add v.x
  · exact Nat.zero_add v.y
  · exact Nat.zero_add v.z

/-- Dot product is commutative. -/
theorem dot_symm (u v : Vec3) : Vec3.dot u v = Vec3.dot v u := by
  unfold Vec3.dot
  simp [Nat.mul_comm]

/-- Zero distance is reflexive. -/
theorem dist_refl (v : Vec3) : Vec3.dist v v = 0 := by
  unfold Vec3.dist Vec3.norm Vec3.sub
  simp [Nat.sub_self]

/-- Squared norm is non-negative. -/
theorem norm_nonneg (v : Vec3) : 0 ≤ Vec3.norm v :=
  Nat.zero_le _

/-- Norm of zero vector. -/
theorem norm_zero : Vec3.norm Vec3.zero = 0 := rfl

/-- Distance is non-negative. -/
theorem dist_nonneg (u v : Vec3) : 0 ≤ Vec3.dist u v :=
  Nat.zero_le _

/-- Additive identity: n + 0 = n (Nat). -/
theorem nat_add_zero (n : Nat) : n + 0 = n := Nat.add_zero n

/-- Multiplicative identity: n * 1 = n (Nat). -/
theorem nat_mul_one (n : Nat) : n * 1 = n := by omega

/-- Multiplication is commutative (Nat). -/
theorem nat_mul_comm (n m : Nat) : n * m = m * n := Nat.mul_comm n m

end Physics
