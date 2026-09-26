# Phase Mirror Oracle CLI (`mirror-dissonance-cli`)

The Phase Mirror **Oracle CLI** is the operational core of the Dissonance Protocol, functioning as a diagnostic engine for AI governance. It identifies structural contradictions in code, configurations, and policies before they become operational liabilities.

## Core Principle: "Governance-as-Compilation"

The CLI enforces the principle where build failures are treated as necessary safety interventions to preserve system stability. It replaces subjective reviews with deterministic, evidence-based artifacts.

### Key Features

- **Diagnostic Oracle**: Scans repositories to detect "dissonance"—tensions between allowed actions and actual permissions.
- **Hierarchical Compute Model**: Executes L0 Invariants (foundational) and L1 Policy (standard rules).
- **Adaptive Feedback**: Automatically calibrates enforcement based on False Positive Rates (FPR).
- **Privacy Guardrails**: Deterministic path redaction using HMAC-SHA256 to protect sensitive data.
- **Fail-Closed Security**: Any internal failure defaults to a "BLOCK" state.

## Installation

### Prerequisites
- Rust (Edition 2021+)
- Cargo

### Building from Source
```bash
cargo build --release
```

## Usage

```bash
mirror-dissonance-cli [OPTIONS]
```

### Options
- `--mode <MODE>`: Operation mode (`pull-request`, `merge-group`, `drift`).
- `--root <ROOT>`: Root directory to scan (default: `.`).
- `--output <OUTPUT>`: Path for the `dissonance_report.json` (default: `dissonance_report.json`).
- `--fp-store <PATH>`: Path to the False Positive Store JSON (default: `fp_store.json`).
- `--redact`: Enable deterministic path redaction for privacy.

### Example: CI Scan
```bash
mirror-dissonance-cli --mode pull-request --redact
```

## Architecture

### L0 Invariants (Foundational)
Non-negotiable gates that must pass before any policy evaluation occurs:
- **L0-001 (Schema Fixity)**: Validates manifest integrity.

### L1 Policy Rules
Standard diagnostic rules:
- **MD-002 (Pinning)**: Identifies unpinned binaries (e.g., `curl | bash`) in scripts and YAMLs.

### Adaptive Feedback (FP Store)
The CLI monitors its own accuracy. If a rule's False Positive Rate exceeds 15%, the engine downgrades the violation from `BLOCK` to `WARN` and logs it as a `[DEGRADED POLICY]` event.

### Privacy Guardrails
When `--redact` is enabled, all file paths in the report are masked using:
`hmac-sha256(Secret, OriginalPath)`

## License
Licensed under the **Phase Mirror License v1.0**. See the [LICENSE](LICENSE) file for details.
