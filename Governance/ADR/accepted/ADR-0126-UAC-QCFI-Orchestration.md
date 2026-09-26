# ADR-0126: Qudit-Classical Feedback Interface (QCFI) Orchestration

## Status
Proposed - Blocked by ADR-0123

## Context
QCFI requires real-time feedback for dynamic subspace reconfiguration. Options proposed were tightly coupled FPGA or edge-compute nodes. Real-time dynamic reconfiguration risks state desynchronization with the Foundry L0 gate.

## Decision
QCFI orchestration is deferred. When unblocked, it must be implemented via a strictly verified edge-compute node that submits verifiable state transitions to the main ledger. Direct FPGA control that bypasses the `SIG_GOV_KILL` fail-closed interlock is rejected.

## Consequences
- Latency bounds must be formally proven in Lean 4 to ensure dynamic dimension shifting occurs within coherence times while satisfying L0 interlocks.
