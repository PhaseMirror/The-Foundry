# ADR-002: No Mathlib Policy

## Status
Accepted

## Context
Using mathlib introduces significant axiomatic complexity and potential for unsoundness. For production-grade verification, we need explicit foundations.

## Decision
All proofs use only core Lean imports:
- `Init.Data.Nat.Basic`
- `Init.Data.List.Basic`
- `Init.Data.Prod`
- `Init.Logic`

No `import Mathlib` anywhere in the formalization.

## Consequences
- All proofs are explicit and constructive
- No axiom of choice or classical logic
- Increased proof burden but soundness guarantee