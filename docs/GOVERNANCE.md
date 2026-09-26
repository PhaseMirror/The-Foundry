# UOR Foundation Governance & Evidence Posture

Pursuant to **ADR-0029 (UOR Foundation Reinitialization and 90-Day Baseline Cycle)**, the following policies are strictly enforced across the UOR Foundry repository.

## 1. Scope Freeze
No new foundational concepts, namespaces, or repositories will be authorized without an explicit exception decision. All development must focus strictly on the bounded deliverables of the current 90-Day Baseline Cycle.

## 2. Portfolio Classes
Every asset in this repository MUST be explicitly classified into one of the following portfolio classes:
* **Normative**: Core, governed, verified implementations defining truth.
* **Reference**: Accepted educational or auxiliary implementations.
* **Experimental**: Active RnD, explicitly out of the path of production truth.
* **Historical**: Deprecated or archived artifacts preserved for provenance.

## 3. Evidence Posture (E0-E6 Scale)
All public claims must cite an evidence grade from E0 to E6, including the date, owner, and explicit limitations.
* **E0**: Unverified claim / Anecdotal.
* **E1**: Internal proof-of-concept / Partial trace.
* **E2**: End-to-end local reproduction.
* **E3**: Independent reproduction (non-author).
* **E4**: CI-verified / Formally checked against normative contracts.
* **E5**: Mathematically verified via Lean / Kani.
* **E6**: Fully ratified, independently audited, canonical truth.
