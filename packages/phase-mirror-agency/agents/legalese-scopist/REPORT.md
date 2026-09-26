# Legalese Scopist: Production Artifacts Summary

The `legalese-scopist` model provides a Sedona-aware ESI retention and spoliation tracking system. This report summarizes the core production artifacts.

## 1. Rust Core Engine (`src/`)
- **`model.rs`**: Defines the Sedona-aware DSL (RetentionPolicy, EsiSource, RelevanceBand).
- **`enforcement.rs`**: Implements the `RetentionEngine` with WASM-ready auditing logic.
- **`spoliation.rs`**: Implements the event-driven spoliation risk state machine, including `LegalMatter` for multi-event tracking.
- **`parser.rs`**: Provides `nom`-based rationale expansion and variable parsing.

## 2. TypeScript SDK (`sdk/`)
- A full TypeScript wrapper for the Rust WASM core.
- **`LegalMatter`**: Class for managing individual matter risk trajectories.
- **`RetentionAuditor`**: Class for batch auditing ESI sources against corporate policies.
- **Full Type Definitions**: Comprehensive interfaces for `SedonaEvent`, `SpoliationRiskState`, and `RetentionViolation`.

## 3. Policy Templates (`templates/`)
- **`m365-standard-retention.yaml`**: Industry-standard corporate retention policy with litigation hold overrides.
- **Sedona Integration**: Every rule includes explicit principle references and rationales.

## 4. Usage Examples
- **Audit**: Detects violations where auto-purge conflicts with litigation holds.
- **Risk Tracking**: Automatically escalates risk level (e.g., to **High** or **Critical**) based on preservation gaps or post-duty deletions.

## 5. Technical Stack
- **Rust**: For high-integrity legal logic and safety.
- **WASM**: For sharing that logic across the dashboard surface (Web/Node).
- **Chrono/Serde**: For precise legal date arithmetic and cross-language interoperability.
