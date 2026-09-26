# ADR-032: Folder Scaffold Reconciliation

## Status
Proposed

## Context
A Phase Mirror audit revealed a hidden assumption and structural dissonance: `docs/adr/Folder-Scaffold-Map.md` describes an architecture consisting of a Go/TS MCP server, a `cmd/` directory, and an `internal/` directory. However, the actual implementation uses a Rust workspace with a `crates/` directory, a Python `daemon/`, and various other divergent paths.

This contradiction violates the Phase Mirror methodology's core tenet of resolving dissonance between documentation (intent) and implementation (reality). The hidden assumption was that the `Folder-Scaffold-Map.md` was a binding contract, but it has clearly drifted into obsolescence, misleading onboarding engineers and automated tools.

## Decision
We will deprecate the current `Folder-Scaffold-Map.md` and generate a new, source-of-truth scaffolding map that accurately reflects the Rust-first ecosystem.
1. `Folder-Scaffold-Map.md` will be updated to reflect the actual existence of `crates/`, `daemon/`, `api/`, and `circuits/`.
2. A Phase Mirror policy rule (e.g., MD-004) will be implemented to run a structural diff between the documented scaffold map and the actual filesystem, flagging high drift magnitude.
3. If the Go/TS architecture described in the old map is still planned, it will be moved to a separate "Future Architecture" ADR rather than presented as the current state.

## Consequences
- **Positive:** Eliminates dissonance between docs and code; provides an accurate map for the ecosystem; exercises the Phase Mirror protocol by turning a documentation gap into a verifiable invariant.
- **Negative:** Requires initial effort to map the current sprawling structure accurately.
