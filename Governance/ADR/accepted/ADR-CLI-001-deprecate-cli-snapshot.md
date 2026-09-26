# ADR-CLI-001: Deprecate packages/phase-mirror-cli Entire Directory

## Status
Proposed

## Context
The `packages/phase-mirror-cli/` directory contains a snapshot of the CLI that duplicates functionality in `models/the-commander/crates/commander-cli/`. The snapshot:
- Is missing `GovernanceSubcommands::VerifyCore`
- Has workspace path mismatches
- Contains deprecated `mirror-dissonance-cli` with broken `TinyLlamaModel` imports
- Duplicates `pirtm-candle` vendor

## Decision
Deprecate `packages/phase-mirror-cli/` entirely. Use `models/the-commander/crates/commander-cli/` as the sole source of truth.

## Consequences
- One canonical CLI at `models/the-commander/crates/commander-cli/`
- Removal of duplicate `pirtm-candle` vendor
- Elimination of compilation errors from stale snapshot

## Implementation
- Remove `packages/phase-mirror-cli/` directory
- Point users to build from `models/the-commander/` workspace
