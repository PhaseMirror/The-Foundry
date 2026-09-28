# ADR-0125: HSEC (Hyperfine Subspace Error Correction) Boundary

## Status
Integrated - Deployment Ready - Blocked by ADR-0123

## Context
The UAC plan proposes implementing HSEC via either low-level pulse control APIs or an abstract middleware layer. HSEC relies on unmeasured auxiliary manifolds, creating a tension with the discrete cryptographic state machine in Foundry.

## Decision
The software-hardware boundary for HSEC is deferred. When unblocked by ADR-0123, HSEC must be implemented as a mechanically verifiable middleware layer that produces zero-knowledge cryptographic witnesses of error detection without projective readout. Low-level unverified pulse control is rejected as a vibe claim; all error correction must emit proofs into the PWEH chain.

## Consequences
- Enforces strict coherence with the Foundry verification policy.
- Requires a formal Lean 4 model of the HSEC protocol before code generation.
