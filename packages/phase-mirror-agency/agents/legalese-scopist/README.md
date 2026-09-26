# Legalese Scopist: The Sedona Spine

**Legalese Scopist** is the L0 ESI governance infrastructure for PhaseMirror-Legal. It provides a high-integrity, deterministic engine that bridges ESI system behavior with legal preservation duties under the Sedona Principles and FRCP 37(e).

## Core Capabilities
*   **Sedona-Aware Retention**: A formal DSL for expressing ESI retention policies, anchoring business storage behavior (purges, holds) to Sedona Principle 2 (Proportionality) and Principle 5 (Preservation Duty).
*   **Spoliation State Machine**: A production-grade Rust/WASM engine that tracks preservation risk trajectories (duty triggers, holds, deletions) and auto-escalates risk based on verifiable event histories.
*   **Multiplicity ($M_t$) Engine**: A prime-indexed state model ($M = \prod p_i^{e_i}$) that treats litigation strategy as a formal, deterministic state vector, tracking leverage dimensions across the life of a matter.
*   **TypeScript SDK**: A WASM-ready interface enabling UI components and AI agents to query kernel truths directly, ensuring "zero-drift" governance.

## Governance Architecture
Legalese Scopist is governed by strict constitutional mandates:
*   **The Sedona Spine Mandate**: All ESI retention, litigation hold, and spoliation risk logic MUST flow through the engine. No ad-hoc re-computation is permitted.
*   **Agent-Engine Contract**: Agents are restricted to transforming deterministic engine outputs into litigation-ready narratives. Hallucinated risk assessments are structurally prevented.
*   **Provenance Chain**: Every work product (Preservation Alerts, Motion Skeletons) traces back to an explicit **Policy YAML**, **System Event**, and **Engine Computation**.

## Archetypes & Playbooks
The Spine has been validated against three fundamental legal archetypes, each with its own YAML policy and playbook:
1.  **Debt-Buyer Standing (Matter-DB-001)**: Chain-of-title preservation.
2.  **Phantom Clickwrap (Matter-ARB-002)**: Contract formation & assent log spoliation.
3.  **Sewer Service Log (Matter-SVC-003)**: Jurisdictional threshold and metadata contest.

## Documentation
*   **Operational Contract**: [`CONTRACT.md`](CONTRACT.md)
*   **Counsel Guide**: [`GUIDE.md`](GUIDE.md)
*   **Project Mandates**: [`GEMINI.md`](../../GEMINI.md)
*   **Architecture Decisions**: [`docs/adr/accepted/`](docs/adr/accepted/)

## Getting Started
The engine is a Rust/WASM workspace. Run unit tests to verify the governance state:
```bash
cd models/legalese-scopist
cargo test
```
See [`PLAYBOOK-*.md`](PLAYBOOK-SERVICE.md) for matter-level deployment instructions.
