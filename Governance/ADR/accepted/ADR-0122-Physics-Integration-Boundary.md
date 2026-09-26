# ADR-0122: Integration Boundary for Physical Calculations

## Status
Proposed

## Context
Following the requirement to mechanize the "physics calculator" scope (ADR-0121), there is a structural tension between continuous physical calculation and the discrete, fail-closed cryptographic state machine established in ADR-0013.

## Decision
Any physical calculation engine must be strictly segregated from the `UnsignedCrmfEnvelope` fail-closed interlocks. Physical simulations must run as isolated pure functions or external processes without the ability to halt the L0 gate. 

1. **Boundary Enforcement:** Physics modules cannot mutate the core cryptographic ledgers.
2. **State Segregation:** Results of physical calculations must be explicitly passed as unprivileged payloads if they are to be signed or verified.

## Consequences
- Maintains the integrity of the PWEH chain and the determinism of the Scopist formal model.
- Defines clear architectural ownership: physics domains are unprivileged computational guests within the Foundry formal environment.

## Cross-Plane Binding (ADR-PML-068)
The segregation decision above concerns "physical calculation engines" — unprivileged guests. The only mechanical "calculator" contract in the shared S-plane is the PrismPM artifact set: `prismpm/calculator-baseline/1` (`packages/PrismPM/CONTRACTS.md:35`, `closed`/`exact-major`), the `prism-calculator` crate, and `Calculator.holo` (`packages/PrismPM/SPEC.md:500`). Any future physics module that seeks "calculator" standing binds to that contract or is named otherwise; the disambiguation bets are stated in ADR-0121's cross-plane binding block and in ADR-PML-068.
