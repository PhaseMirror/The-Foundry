# Commander Core Specification

## Purpose
`commander-core` provides the primary orchestration logic for PhaseSpace OS, ensuring that all tool execution passes through the Atomic Language Policy (ALP) gate and into the Archivum ledger.

## Core Components
1. **Compliance Engine (`compliance.rs`)**: Loads SOC2/HIPAA policy maps and generates formal reports validating execution bounds.
2. **Sigma Kernel Interface (`lib.rs`)**: Orchestrates workflows securely, instantiating isolated environments for untrusted external execution.
3. **Archivum Writer (`archivum.rs`)**: Safely serializes execution receipts into `witnesses.jsonl` to provide a tamper-evident audit trail anchored via `GitLedger`.

## Invariants
- No workflow execution can bypass `multiplicity-alp` checks.
- Every workflow generates exactly one `UnifiedWitness`.
- External workflows are restricted from modifying system state via unauthorized MCP calls.
