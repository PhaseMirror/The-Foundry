# ADR 008: Agentic Bridge — External API Integration (OpenAI/Antigravity)

## Status
Proposed

## Context
The Agency's specialized ensembles currently exist as localized Rust harnesses and contracts. To make them dispatchable co-pilots within the **Antigravity IDE**, we must expose their deterministic logic via standardized API endpoints.

## Decision
We will implement an **Agentic Bridge** that wraps Agency ensemble harnesses and exposes an OpenAI-compatible REST API.

### 1. The Bridge Architecture
- **Server**: A lightweight Axum/Tokio server (Rust) that interfaces with the `phasemirror-agency` directory.
- **Endpoint**: `/v1/chat/completions` (OpenAI compatible).
- **Execution Loop**:
    1. Receive proposal from Antigravity (as `The Genius` persona).
    2. Dispatch to the specific Ensemble harness for L1-validation.
    3. Audit via `The Examiner` (MD-005).
    4. Return a "Stability Certificate" or "Rejection" as the completion response.

### 2. Antigravity Dispatch
Ensembles will be registered as "Custom Agents" within Antigravity, pointing to the local Bridge server. This allows them to be summoned like standard co-pilots but with the Agency's "Cold Machine" governance.

## Consequences
- **Positive**: Seamless integration into the user's primary IDE; standardized interface for all ensembles.
- **Negative**: Adds a network/proxy layer; requires managing concurrent P-Kernel witness logs.
