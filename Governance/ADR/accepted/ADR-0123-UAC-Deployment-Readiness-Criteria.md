# ADR-0123: UAC Deployment Readiness Criteria

## Status
Proposed

## Context
A request was made to bring the Universal Atomic Calculator (UAC) to "deployment readiness" via a sequence of ADRs. The term "deployment readiness" currently lacks a mechanical definition and ignores existing fail states. Current `uac_boundary_test_results.txt` shows stability failures at `f_hat=9200` and ZK-Circom 80-bit overflow limit violations. Additionally, on-chain finality is strictly blocked without a FeMoco-class QaaS attestation.

## Decision
We reject "deployment readiness" as a subjective vibe claim. UAC deployment is hard-blocked until the following mechanisms are satisfied and formally verified:

1. **Boundary Stability:** Resolution of the `f_hat=9200` boundary failure in the Q-SQD module.
2. **Circuit Constraints:** Resolution of the ZK-Circom 80-bit overflow limits.
3. **Load Attestation:** Execution of the FeMoco-class QaaS 100-request load test, producing a verifiable cryptographic attestation.

ADRs will not be used to bypass or mask technical debt. The next sequence of work must address these mechanical failures directly.

## Consequences
- Prevents deployment of failing UAC boundary conditions.
- Enforces the cryptographic and formal gating previously established.
- Re-aligns operating incentives toward fixing failing mechanisms rather than writing architectural documents.
