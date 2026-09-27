# ADR-CLI-001 — CLI Completion Plan

## Status
Implemented

## Summary
The `models/the-commander/crates/commander-cli` is the canonical CLI. The `packages/phase-mirror-cli` snapshot has been deprecated and removed.

## Changes Made
1. **Removed** `packages/phase-mirror-cli/` directory (deprecated snapshot)
2. **Added** `compose.rs` module to `mirror-dissonance` crate for `pscmd compose` functionality
3. **Updated** `mirror-dissonance/Cargo.toml` with `serde_yaml` and `multiplicity-common` deps

## Test Results
- `test_compose_external_blocked_from_governed_server` — ✅ PASSED
- `cargo check -p multiplicity-commander-cli` — ✅ PASSED (warnings only)

## Build Instructions
```bash
cd models/the-commander
cargo build -p multiplicity-commander-cli
```

## Usage
```bash
./target/debug/pscmd workflows list
./target/debug/pscmd workflows run <name>
./target/debug/pscmd compose validate workflow.sigma.yaml
./target/debug/pscmd --tui
```
