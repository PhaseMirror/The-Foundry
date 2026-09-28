# ADR-0124: UAC Quantum Hardware Platform Selection

## Status
Integrated - Deployment Ready - Blocked by ADR-0123

## Context
Per the UAC ADR Plan, a decision is required between Atom Computing ($^{87}$Sr), Infleqtion ($^{133}$Cs), or Custom M³A platforms. However, the UAC framework currently fails stability tests at `f_hat=9200` and violates ZK-Circom 80-bit limits. Hardware selection is premature when the underlying formal mathematical constraints are violated.

## Decision
We defer hardware selection. The selection process will only commence after the mechanisms defined in ADR-0123 (Boundary Stability, Circuit Constraints, Load Attestation) are satisfied. Once unblocked, the hardware selection metric will strictly evaluate the chosen platform's native pulse API against the formal limits of the fixed Q-SQD module.

## Consequences
- Prevents vendor lock-in to hardware that may not support the necessary mathematical constraints required to resolve `f_hat=9200`.
