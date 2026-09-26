# Project Integrity: Certified and Governed

This document defines the formal governance and integrity framework for the Phase Mirror project. It ensures that all architectural decisions, research hypotheses, and engineering implementations are epistemically sound, transparently documented, and empirically verified.

## 1. The Epistemic Governor: Phase Mirror Methodology

Phase Mirror is the project’s **epistemic governor**. Its function is to surface hidden assumptions, name contradictions, convert them into code-visible levers, and require that every lever be validated through logged evidence.

### Mandatory ADR Governance Fields
Every Architectural Decision Record (ADR) MUST include:
1.  **Hidden Assumptions**: Unpacking what is taken for granted.
2.  **Contradictions / Tensions**: Naming the core system conflicts.
3.  **Lever Introduced**: Specifying the technical mechanism for resolution.
4.  **Validation Metric**: Defining the empirical test for success.

## 2. Assumptions Register

This register tracks active assumptions across the stack. Assumptions remain here until they are either formalized into an ADR lever or empirically falsified.

| ID | Category | Assumption | Status | Validation Lever |
| :--- | :--- | :--- | :--- | :--- |
| AS-001 | Dynamics | The search space is locally smooth enough for RK4. | Active | `oracle_score` stability |
| AS-002 | Resonance | Zeta-zero frequencies correlate with SHA-256 residuals. | Speculative | `zeta_specificity` score |
| AS-003 | Attestation | PWEH overhead is negligible for real-time mining. | Active | Benchmark `step_latency` |
| AS-004 | Multiplicity | $\Lambda_m$ weighting accurately reflects prime diversity. | Certified | `StabilityGate` admission |

## 3. Certified Benchmarking Protocol

A benchmark is only "Certified" if it adheres to the following:
- **Baseline Alignment**: All gains must be compared against a 'none' (zero-drive) and 'random' (surrogate-drive) control.
- **Evidentiary Logging**: Every trial MUST produce a verified PWEH log.
- **Assumption Mapping**: Every claimed performance gain must be mapped to its corresponding Assumption (AS-XXX) and Lever.

## 4. Integrity Checklists

### Pre-Implementation (ADR Review)
- [ ] Are the hidden assumptions explicit?
- [ ] Is there a clear tension being resolved?
- [ ] Is the lever measurable in the PWEH log?

### Post-Implementation (Verification)
- [ ] Does the `Verifier` accept the production PWEH log?
- [ ] Does the benchmark score exceed the 'random' baseline?
- [ ] Is the `StabilityGate` rejection rate within acceptable bounds?
