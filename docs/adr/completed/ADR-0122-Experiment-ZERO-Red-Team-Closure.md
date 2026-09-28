# ADR-0122: Experiment ZERO Red Team Closure and Implementation Gates

## Status
Accepted

## Context
Following the completion of Experiment ZERO, the reference-harness attacks were assessed to evaluate the paper/reference phase closure and identify residual risks for the implementation phase.

## Decision
Close the following reference phase attacks as successfully handled by the reference harness:
* Loss laundering
* Vault bypass
* Defer bypass
* Negative-knowledge repetition
* Stale laundering
* Authority/representability separation
* Checkpoint tamper
* History deletion
* Deterministic precedence
* Context compilation transparency

Establish the following Release Gates (Gates A-G) for the Implementation Phase to handle residual risks:
* **Gate A:** Actual RI1/Soreia mechanisms map to reference semantics with evidence.
* **Gate B:** Real executor passes ZERO cases without special-casing the benchmark.
* **Gate C:** Authority and protected-unknown behavior survive adversarial indirect-access attempts.
* **Gate D:** Checkpoint survives independent process/environment reconstruction.
* **Gate E:** Dependency impact and negative knowledge work over a nontrivial project graph.
* **Gate F:** Replay class is declared honestly and measured.
* **Gate G:** Red team can inspect why each blocked/deferred transition received its state.

## Consequences
The implementation phase is gated by the established release gates. Residual risks such as Real model policy bypass, real context omission, authority implementation, storage tamper, non-interference, semantic replay, scale, and Soreia/RI1 equivalence must be resolved.
