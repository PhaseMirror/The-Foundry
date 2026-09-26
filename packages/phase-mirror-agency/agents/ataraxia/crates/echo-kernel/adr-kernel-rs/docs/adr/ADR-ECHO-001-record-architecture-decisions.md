# ADR-ECHO-001: Record Architecture Decisions

- Status: accepted
- Date: 2026-05-24
- Owners: @core-architecture
- Tags: [governance, runtime]
- Depends On: None
- Supersedes: None

## Context
The kernel needs explicit governance artifacts so validation logic, CLI behavior, and proof generation can evolve without hidden assumptions.

## Decision
Store ADRs in `docs/adr` and require architectural changes affecting validation semantics, proof formats, or CI release policy to land with an ADR.

## Consequences
Decision lineage becomes auditable.
Review cost rises slightly, but kernel drift becomes visible.
