# ADR-0121: Definition of Physical Mechanisms

## Status
Proposed

## Context
A request was made to refine the Foundry project as a "unified physics calculator". The project is currently scoped as a "Universal Closure Calculator" focused on formal proofs, cryptography, and civic infrastructure. The phrase "unified physics calculator" is an undefined vibe claim that lacks mechanical bindings to the existing verified codebase.

## Decision
We require the explicit definition of the "physics" domains to be calculated. If Foundry is to operate as a physics calculator, we must identify the specific mathematical models and their precise representation in Lean 4.

We will not adopt the label "unified physics calculator" until the following mechanisms are defined:
1. **Data Types:** The exact scalar, vector, and tensor types required for calculations.
2. **Formal Models:** The domain-specific laws to be formalized as Lean 4 theorems.
3. **Calculation Engines:** The computational engine (e.g., Rust binaries under `src/`) required to perform the numerical or symbolic calculations.

## Consequences
- Prevents scope creep and preserves the strict cryptographic boundaries established in ADR-0013.
- Forces the replacement of vibe claims with concrete, testable mechanisms.
- Requires a defined owner to specify the physical laws before any code is merged.

## Cross-Plane Binding (ADR-PML-068)
The token "calculator" is already normatively defined in the linked PrismPM plane as a bounded, schema-locked S-plane artifact:
- `prismpm/calculator-baseline/1` — `closed`, `exact-major`, shape-validated against `schemas/calculator-baseline.schema.json` (`packages/PrismPM/CONTRACTS.md:35`)
- `prism-calculator = 0.1.0` crate and `Calculator.holo` (`packages/PrismPM/SPEC.md:500`)

This ADR's "unified physics calculator" phrasing is a *different* concept (an undefined physical-domain scope, resolved per ADR-0122 as an unprivileged computational guest) and must not be read as, or collide with, the PrismPM calculator artifact. Per ADR-PML-068 the resolution is one of: bind the physics-calculator label to `prismpm/calculator-baseline/1` + `Calculator.holo`, supersede that contract, or drop the label. No new contract or conformance ID carrying the name "calculator" may be minted in either plane without an explicit disambiguation link to the PrismPM contract.
