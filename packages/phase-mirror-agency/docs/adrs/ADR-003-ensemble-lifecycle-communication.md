# ADR 003: Ensemble (Agent) Lifecycle & Inter-Agent Communication

## Status
Proposed

## Context
Individual agents (Ensembles) within the Agency must communicate and share state without violating their domain-specific invariants (e.g., Ataraxia's healthcare privacy vs. Scopist's legal discovery). We need a secure, auditable lifecycle and communication protocol.

## Decision
We will implement a unified lifecycle and a "Holographic State" communication model for all Ensembles.

### 1. Ensemble Lifecycle
Every agent must transition through the following states:
- **INITIALIZING**: Loading domain-specific Lean Core constants and LawfulRecursionHash anchors.
- **READY**: Awaiting Meta-Ensemble convex weight assignment.
- **ACTIVE**: Executing directed missions (C4 simulations, audits, or narrative generation).
- **HALTED**: Suspended by `The Guardian` or a `Kill-Switch` trigger.

### 2. Inter-Agent Communication (The Archivum Bridge)
Agents do not share direct memory. Instead, they communicate via the **Archivum Bridge**:
- **Message Type**: Every cross-agent request must be a `MissionProtocol` object.
- **Witnessing**: Every message is witnessed by `The Guardian` and logged by `The Examiner`.
- **Transformation**: `The Genius` performs semantic mapping when data moves between domains (e.g., translating medical biomarkers from Ataraxia into legal risk levels for Scopist).

## Implementation Guidelines
- **Zero-Surveillance Privacy**: Use `ANON_CREDENTIALS` (from `lambda/docs`) for cross-domain data exchange where applicable.
- **Deterministic Handshakes**: All communication must include a `LawfulRecursionHash` handshake to ensure version alignment.

## Consequences
- **Positive**: Strict audit trail for all inter-agent activity; protects domain integrity.
- **Negative**: Communication latency due to mandatory witnessing and hashing.
