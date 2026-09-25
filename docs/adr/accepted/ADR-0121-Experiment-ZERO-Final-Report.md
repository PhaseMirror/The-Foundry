# ADR-0121: Experiment ZERO Baseline and Hostile Test Validation

## Status
Accepted

## Context
A neutral reference experiment (Experiment ZERO) was executed to validate the semantic properties of the Sovereign Transaction Protocol without coupling to a production implementation.

## Decision
Accept the results of Experiment ZERO. The reference experiment successfully completed 15 hostile/continuity tests and 8 baseline cases, proving that the reference state machine preserves the distinctions it was designed to protect.

**Key Findings:**
* Representability and admissibility remained separate gates.
* LOSSY cannot silently become EXACT.
* DEFER is operationally distinct from DENY.
* Negative knowledge can block repetition of a known failed path.
* STALE blocks promotion after dependency mutation.
* PROTECTED_UNKNOWN functions as a typed state with a resolution policy.
* Checkpoint integrity and hash chaining detect tampering.
* The active frontier can be reconstructed from checkpoint-only state and portable exports.

## Consequences
The architecture is ready to move from a neutral harness to implementation reconciliation. The next phase will run the same acceptance suite against actual Soreia/RI1 bridge mechanisms and UAR/UOR components.
