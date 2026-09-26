# ADR-031: Workspace Member Alignment

## Status
Proposed

## Context
During a Phase Mirror audit of the project, a significant "dissonance" was detected between the physical directory structure and the Rust workspace configuration. Specifically, the `crates/` and `crates/pro/` directories contain dozens of Rust crates (e.g., `phase-mirror`, `automata`, `governance`, `trace-serializer`), but the root `Cargo.toml` only includes 7 members in its `[workspace.members]` array. 

This creates a productive contradiction: the presence of the crates implies they are part of the project's dependency graph, but their omission from the workspace means they are neither built nor tested by standard `cargo` commands, breaking L0 invariants for drift magnitude and invariant-safe composition.

## Decision
We will systematically align the `Cargo.toml` workspace with the physical directory structure. 
1. All valid Rust crates in `crates/` and `crates/pro/` will be added to the `[workspace.members]` array.
2. Any obsolete or deprecated crates will be explicitly removed or moved to an `archive/` directory to prevent silent build failures.
3. A Phase Mirror policy rule (e.g., MD-003) will be implemented in `mirror-dissonance` to enforce parity between discovered `Cargo.toml` files and the root workspace definition, failing CI if dissonance is detected.

## Consequences
- **Positive:** Restores invariant-safe composition; ensures all code is actively tested and audited; resolves the drift between intent (folder existence) and reality (build graph).
- **Negative:** May introduce immediate build failures if the unlisted crates contain outdated or broken code, requiring a short-term stabilization phase.
