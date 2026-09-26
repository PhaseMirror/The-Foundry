# ADR-ECHO-002: Adopt Rust Workspace

- Status: accepted
- Date: 2026-05-24
- Owners: @core-architecture
- Tags: [architecture, rust]
- Depends On: ADR-ECHO-001
- Supersedes: None

## Context
The kernel requires a stable core library, a thin operational CLI, and automatable repository tasks.

## Decision
Use a Cargo workspace with three crates: `kernel-core`, `kernel-cli`, and `xtask`.

## Consequences
Compile boundaries stay clean.
Testing and release automation scale without mixing orchestration code into the core crate.
