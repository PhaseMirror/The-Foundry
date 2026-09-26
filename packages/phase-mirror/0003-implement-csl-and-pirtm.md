# ADR 0003: Implement CSL and PIRTM Mechanisms

## Status
Proposed

## Context
The `verify_csl` and `verify_pirtm` functions are documented as enforcing "constitutional prime support" and "fixed-point contractivity" respectively. Both functions currently return `Ok(())` unconditionally. They are vibe claims without mechanical backing.

## Decision
We will define the mathematical constraints for CSL and PIRTM. We will implement these constraints in Rust. If the constraints cannot be mechanically checked at runtime, the functions and their associated claims will be removed.

## Consequences
- State transitions will be subject to actual mathematical constraints.
- Transition performance will decrease due to additional computation.
- Empty functions masking as governance checks are removed.
