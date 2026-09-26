# ADR-0002: Sedona-Aware ESI Retention DSL

## Status
Proposed

## Context
Legal professionals need a human-legible way to express ESI (Electronically Stored Information) retention and deletion policies in terms of Sedona Principles (relevance, accessibility, uniqueness, proportionality, and preservation duty). The current Rust-based enforcement engine lacks a high-level, legally-oriented policy layer.

## Decision
We will implement a YAML-based Domain Specific Language (DSL) that compiles to Rust structures. This DSL will explicitly reference Sedona Principles and Factors.

### DSL Structure
The DSL will include:
- **Scopes**: Systems and ESI types (email, chat, archive, backups).
- **Conditions**: Relevance bands, accessibility, holds, and matter attributes.
- **Actions**: Retain, purge, legal-hold override, snapshot.
- **Sedona Tags**: Explicit references to principles and rationales.

### Example Policy
```yaml
version: "1.0"
policy_name: "Baseline Debt-Buyer ESI Retention"
sedona_references:
  - principle: "Sedona Principle 5"
    note: "Duty to preserve relevant, unique ESI once litigation is anticipated."

rules:
  - id: "email-core-default"
    scope:
      systems: ["exchange", "m365"]
      esi_types: ["Email"]
    when:
      litigation_hold_active: false
      relevance_band: ["Unknown", "Core", "Important"]
    action:
      retain_for_days: 1825 # 5 years
      delete_after: true
    sedona:
      principles: ["Principle 2", "Principle 5"]
      rationale: "Freestanding retention window long enough to support foreseeable disputes."
```

## Consequences
- Legal counsel can review and author policies without reading Rust code.
- Every retention decision becomes audit-ready with a "Sedona-aware" explanation.
- Provides a bridge between legal requirements and technical implementation.
