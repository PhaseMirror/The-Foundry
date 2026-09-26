# ADR 009: The Coding Commander (Phase Mirror Edition)

## Status
Proposed

## Context
We require a specialized orchestrator exclusively for developing and maintaining the Phase Mirror infrastructure. This "Coding Commander" must be a multi-ensemble agent that understands the unique invariants of MOC, PIRTM, and the Sedona Spine.

## Decision
We will initialize a new ensemble: **Coding Commander (PM Edition)**.

### 1. Ensemble Composition
The Coding Commander is a Meta-Ensemble that specifically orchestrates:
- **The Genius (The Inventor)**: Responsible for code generation, logic refactoring, and ADR drafting.
- **The Guardian (Security)**: Responsible for static analysis, security-critical gating, and credential protection.
- **The Examiner (Audit)**: Responsible for ensuring new code does not drift from established ADR-001 through ADR-008 mandates.
- **The Publisher (Artifacts)**: Responsible for updating `MASTER_REGISTRY.json` after successful builds.

### 2. Personality & Mission
- **Mission**: To act as the authoritative CEO for all Phase Mirror development tasks.
- **Persona**: Cold, deterministic, and high-velocity. It prioritizes **Mathematical Correctness** over conversational fluff.

### 3. Workflow Integration
The Coding Commander will be the primary entry point for any `antigravity` mission related to the Phase Mirror codebase. It will use the **Archivum Bridge** to witness every commit.

## Consequences
- **Positive**: Dedicated development agent that "understands" the system's core laws; enforces ADR compliance automatically.
- **Negative**: Risk of "circular logic" if the agent modifies its own governance ADRs without external human-on-exception review.
