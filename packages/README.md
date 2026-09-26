# PhaseMirror

**PhaseMirror** is a suite of tools and libraries dedicated to verified architectural governance, formal methods, and dissonance resolution. It enforces strict alignment between documentation (like ADRs) and actual deployed system state, using principles derived from Lean 4 and verified Rust logic.

## Core Packages

This workspace contains various components for the PhaseMirror ecosystem:

- **`phase-mirror-agent` / `phase-mirror-agency`**: Core agents responsible for auditing and enforcing the PhaseMirror principles.
- **`phase-mirror-dissonance`**: Tools for visualizing and resolving tension between proposed documentation and actual on-tree artifacts.
- **`phase_mirror_adr`**: Scaffolding and tooling for defining Architecture Decision Records (ADRs) as dependent types.
- **`sedona_spine`**: A core verification engine built in Rust and WASM.
- **`multiplicity-crypto`**: Cryptographic primitives for verifiable claims.
- **`operator-ui` / `the-commander` / `ui-core`**: Operator-facing dashboards and interfaces.

## Principles

1. **On-Tree Ground Truth (ADR-015)**: Every claim must link to a physically existing, tested artifact. No speculative claims allowed.
2. **L0 Scope Invariant (ADR-013)**: The Small-Gain Theorem gate ($\rho(|A|\,\mathrm{diag}(\lambda)) < 1.0$) cannot be satisfied by scalar float summation. It must be grounded in verified receipts.
3. **Zero Tolerance for Simulation**: `sorry` in Lean proofs, simulated telemetry in execution paths, and mock closures in production code are treated as proof debt.

## Getting Started

See individual packages for build and deployment instructions.
