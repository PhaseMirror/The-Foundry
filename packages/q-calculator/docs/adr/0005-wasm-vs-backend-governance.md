# ADR 5: Harmonizing WASM Client Core and Server-Side Governance

## Context
There is a **Gap in Implementation**: `ADR-002` dictates that the Rust computational core (`q-calculator-rs` / `QAriCore`) is compiled to WASM and executed in the client to avoid network latency and ensure offline-first capability. However, the current `package.json` lacks the actual Rust crate dependency, and all governance/computation logic (like Triple-Lock) is occurring on the Express backend (`server.ts`).

**Productive Contradiction:** The client is designed to be "offline-first" (via WASM) but the application heavily relies on server endpoints (`/api/chat`, `/api/triple-lock-verify`) to authorize any state changes or perform validations.

## Decision
We will cleanly separate the computational core from the governance layer using the Phase Mirror methodology:
1. **Client-Side Computation (WASM):** The actual mathematical calculations (Q-calculator operations on matrices) will remain in WASM on the client side, as per `ADR-002`. We will properly link the `q-calculator-rs` package in `package.json`.
2. **Server-Side Governance:** The `Triple-Lock` verification and invariant checking will remain on the backend, serving as an authoritative auditor of the client's requested state transitions.
3. **Synchronization (The Mirror):** The client will perform speculative execution locally via WASM for zero-latency UI updates, but these updates will remain in a "provisional" state until the backend's `Triple-Lock` governance confirms the state hash.

## Consequences
- The frontend will need to manage optimistic UI states while waiting for `/api/triple-lock-verify`.
- We must add the missing `q-calculator-rs` WASM build to the workspace and link it to the React app.
