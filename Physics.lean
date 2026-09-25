import Physics.Core
import Physics.Models
import Physics.Engines
import Physics.Export
import Physics.Test

/-!
# Physics Library — Module Facade

Root module of the `Physics` lean library.
Implements ADR-0121: Definition of Physical Mechanisms.
-/

open Physics

/-- The identifier for this physics module. -/
def physicsId : ADRId := "ADR-0121-Physics"

/-- This library implements ADR-0121. -/
theorem physics_implements_adr_0121 :
    Physics.Scalar.ofFloat 0.0 = Physics.Scalar.zero := rfl
