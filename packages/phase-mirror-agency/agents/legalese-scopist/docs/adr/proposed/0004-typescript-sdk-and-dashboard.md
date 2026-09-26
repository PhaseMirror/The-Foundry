# ADR-0004: TypeScript SDK & Dashboard Architecture

## Status
Proposed

## Context
The Rust-based Sedona engine needs to be accessible to front-end applications and integrated into the PhaseMirror-Legal ecosystem. We need a way to audit retention vs. holds and render chain-of-custody in a hybrid cloud/SaaS environment.

## Decision
We will develop a TypeScript SDK that wraps the Rust kernel (via WASM or API) and provides high-level auditing and visualization functions.

### SDK Responsibilities
- `auditRetentionVsHolds`: Compares actual ESI state against the DSL-defined policy.
- `computeChainOfCustodyStatus`: Validates end-to-end integrity and identifies gaps.
- `getSpoliationRisk`: Retrieves the current risk trajectory from the state machine.

### Dashboard Components
- **Retention Audit Dashboard**: Table showing system-wide compliance, highlights violations where auto-purge conflicts with holds.
- **Chain-of-Custody Validation**: Visual timeline of ESI collection, transfer, and production with hash-based integrity checks.

## Consequences
- Provides a professional UI for legal teams to monitor compliance.
- Simplifies integration with SaaS platforms (M365, Slack, Salesforce).
- Translates technical integrity checks (hashes, logs) into legal risk signals.
