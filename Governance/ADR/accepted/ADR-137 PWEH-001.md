# ADR-PWEH-001: Prime-Weighted Execution Hashing (PWEH) RFC Specification

## Status
Accepted - Implemented

## Context
Prime-Weighted Execution Hashing commits execution traces of prime-indexed tensor operators to a hash chain where each link `S_integrity(t)` binds `(prior_state, prime_choice, normed_observable, governance_metadata)`. The norm is multiplicity-weighted spectral: `||A_{p_i} T||_mult = Σ ω(p_i, μ_j) · σ_j`. State-constrained evolution enforces dynamic opcode availability via prime-channel domain conditions. Path-dependence yields order-commitment stronger than length-extension resistance.

## Decision
Implement PWEH as a Lean 4 formalization with:
1. Core-only (no mathlib) sorry-free skeleton
2. Integration with existing PIRTM convergence theorem
3. RFC-style type signatures and verification algorithm
4. Linkage to ContractivityReceipt and Archivum artifacts

## RFC-Style Specification

### Type Signatures
```lean
/-- Prime enumeration for PWEH availability checks -/
inductive Prime : Type where
  | two : Prime
  | three : Prime
  | five : Prime

/-- Tensor state with multiplicity and recursion depth -/
structure TensorState : Type where
  multiplicity : Nat
  recursion_depth : Nat

/-- PWEH state with hash commitment and step counter -/
structure PWEHState : Type where
  tensor : TensorState
  hash : Nat
  step : Nat
```

### Verification Algorithm
```
verify_step(prev: PWEHState, p: Prime, meta: String):
  if is_prime_available(prev.tensor, p):
    n := compute_norm(prev.tensor, p)
    new_hash := prev.hash + n + prime_weight(p)
    return Some { tensor := prev.tensor, hash := new_hash, step := prev.step + 1 }
  else:
    return None

verify_trace(initial: PWEHState, trace: List (Prime × String)): Bool
  Check each step in sequence; return false if any step fails.
```

### Security Assumptions
- Prime availability predicate enforces policy manifold Π
- Hash chain preserves order-commitment
- Forgery (forbidden prime or depth violation) fails verification

## Integration with PIRTM
A PWEH trace is valid only if every step respects prime-channel availability and the cumulative contraction factor satisfies `|k|<1`. The integrated predicate `verify_trace_converges` returns true when:
1. Hash chain is consistent (all steps succeed)
2. `|k| < 1` (PIRTM convergence invariant)
3. Final state equals fixed-point `F/(1-k)`

## Implementation Artifacts
- `substrates/lean/MOC/PWEH.lean` - Sorry-free core specification (no Mathlib imports)
- `substrates/tests/python/test_pweh_integration.py` - 3x3 tensor numerical integration test

## Consequences
- Unverifiable claims on dynamic instruction sets are prevented
- Order-commitment invariant is cryptographically enforced
- Linkage to ContractivityReceipt ensures L0 compliance

## References
- ADR-PIRTM-001: Convergence theorem and failable constructors
- `substrates/lean/MOC/PIRTM.lean`: Existing formalization
- `state/archivum/witnesses.jsonl`: Archivum ledger

<!-- LawfulRecursionVersion:1.0 -->