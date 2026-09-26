# ADR 006: MCP Server Architecture — Extrinsic Oracle vs. Intrinsic Substrate

## Status
Proposed

## Context
The Agency requires a standardized Model Context Protocol (MCP) interface for tool execution. We have identified two fundamentally different philosophies of control:
1. **Phase Mirror Oracle**: Extrinsic governance (Auditor).
2. **Echobraid**: Intrinsic execution substrate (MultiplicityCell).

To achieve production-grade safety, we must codify how these servers diverge and how they interact.

## Decision
We will implement both MCP server types, using the Oracle for accountability (who is responsible) and Echobraid for capability (what the system is physically allowed to do).

### 1. Phase Mirror Oracle MCP (Extrinsic)
- **Persona**: The Auditor.
- **Logic**: Adaptive Constraint Enforcement (ACE).
- **Mechanism**: Analyzes intent vs. constitutional drift (MD-005).
- **Enforcement**: Reactive Gating (Blocks/Rollbacks).
- **Control**: Override-based for authorized users.

### 2. Echobraid MCP (Intrinsic)
- **Persona**: The Substrate.
- **Logic**: Prime-Weighted Execution Hashing (PWEH).
- **Mechanism**: Policy is the "physics" of the cell; every move is indexed by a prime.
- **Enforcement**: Execution Lock (Unauthorized transitions cannot be hashed).
- **Control**: Partition-based (Rigid vs. Fluid).

## Implementation — The MultiplicityCell
The Echobraid MCP will be implemented as a Rust-based **MultiplicityCell**. It enforces:
- **Trace Uniqueness**: The execution path is audited, not just the final output.
- **Non-Associativity**: The order of operations ($A_{p2}A_{p1} \neq A_{p1}A_{p2}$) ensures a unique, tamper-evident hash chain.

## Consequences
- **Positive**: Cryptographic guarantee of lawfulness; prevents "Forbidden Prime" attacks; enables compositional safety.
- **Negative**: Higher computational cost for PWEH; requires rigid tool partitioning.
