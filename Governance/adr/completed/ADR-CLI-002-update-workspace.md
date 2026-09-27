# ADR-CLI-002: Update Workspace to Reference Canonical CLI

## Status
Proposed

## Context
The root `Cargo.toml` workspace at line 3 includes `packages/phase-mirror-cli` which points to a deprecated snapshot.

## Decision
Remove `packages/phase-mirror-cli` from workspace members. Build CLI from `models/the-commander/crates/commander-cli/`.

## Changes
- Remove `packages/phase-mirror-cli` from workspace in `Cargo.toml`
- CLI documentation updates to reflect build path

## Migration Path
```bash
# Old (deprecated)
cargo build -p multiplicity-commander-cli

# New (canonical)
cd models/the-commander
cargo build -p multiplicity-commander-cli
```
