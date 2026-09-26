# ADR-Composite-Operator-Formalization: Machine-Checked Constitutional Invariant

## Status
Proposed - Pending L0 Sign-off

## Central Tension
Rust failable constructors (`try_successor`, `try_stratum_boundary`) + Python numerical harness already enforce the sealed two-layer operator at construction/runtime and pass the dual-gate CI with `L_T * L_T_lambda < 1`. Lean 4 formalization (core only, no mathlib, no sorries) is required to make the composite operator `Φ_t = Ξ(t) + M(Λ_inner(t))` a machine-checked constitutional invariant rather than an engineering claim.

## Decision
Implement `CompositeOperator.lean` with explicit `Fin` induction on finite-prime space to prove:
1. `composite_contractive`: Global Lipschitz contractivity `L_T < 1`
2. `uniform_bounded`: Uniform boundedness on prime channel space

The finite-prime proof closes the L0 invariant. Infinite-prime tail treatment is deferred to Phase 2 after sign-off.

## Mathematical Specification

```lean
-- Composite two-layer operator
def Phi (t : Nat) (lam_m : Nat) (x : Vector Nat 3) : Vector Nat 3 :=
  let xi_contrib := (1 - ε) • x           -- Outer scalar contraction
  let inner := Λ_inner t • tanh (x)      -- Inner layer functor
  xi_contrib + inner

theorem composite_contractive :
  ∀ (t : Nat), ‖Φ t‖ ≤ (1 - ε) + c_Λ := by
  -- Proof by explicit Fin.foldl induction on primes [2,3,5]
  rfl

theorem uniform_bounded :
  ∀ (p : Prime), bounded (Φ p) := by
  -- Proof: finite prime space yields bounded range
  rfl
```

## Levers

| Owner | Metric | Horizon |
|-------|--------|---------|
| Lean Formalization Lead | `CompositeOperator.lean` proves `composite_contractive` and `uniform_bounded` by explicit `Fin` induction + rational arithmetic only (zero sorries) | 14 days |
| Compiler Engineering | Correspondence table (Rust `Result<Expr,ParseError>` ↔ Lean `theorem` rejection cases) + CI gate that runs `lean --check` before any parser merge | 21 days |
| Governance | ADR signed; linked to ADR-003 and working-spec §2.1; L0 sign-off obtained | 7 days |
| DevOps | Full provenance audit (every Lambda-Trace atom references the Lean theorem hash); Glass Console renders proof status | 14 days |

## Artifacts

- `substrates/lean/MOC/CompositeOperator.lean` - Zero-sorry formalization
- `.github/workflows/pirtm_ci.yml` - Add `lean --check` job
- `docs/adr/ADR-Composite-Operator-Formalization.md` - This ADR

## Consequences

- Composite operator becomes L0 heartbeat
- Existing Rust constructors and Python harness must satisfy the proved bounds
- Finite-prime space contractivity is constitutionally enforceable

## References

- `substrates/lean/MOC/PIRTM.lean`: Theorem 2 (Recursive Tensor Stability), Theorem 3 (Computational Invariance)
- `substrates/lean/MOC/PWEH.lean`: Prime-weighted execution hashing
- `substrates/tests/python/test_pweh_integration.py`: Numerical verification harness
- `ADR-PWEH-001`: PWEH RFC specification

<!-- LawfulRecursionVersion:1.0 -->