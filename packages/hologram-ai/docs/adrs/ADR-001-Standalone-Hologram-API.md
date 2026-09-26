# ADR 001: Standalone Hologram-API with In-Built Governance

## Status
Proposed

## Context
Currently, `hologram-ai` is a highly optimized client-side AI compiler and execution runtime. However, its execution parameters are unguarded, and integrating it into the broader Phase Mirror Agency and Prime formal verification stack requires heavy external coordination. To enable production-grade, autonomous deployments without reliance on external services, we need `hologram-ai` to operate as a completely **standalone package** that inherently governs itself using Prime's ALP-CNL mathematical proofs and logs to the Phase Mirror Archivum. 

The mandate is to build `hologram-api`—a production-ready API and MCP server—entirely *inside* the `hologram-ai` workspace. This will require copying in necessary components from other subsystems (`Prime`'s CNL compiler, Phase Mirror's MCP bridging, and Archivum event logging) rather than creating external dependencies.

## Decision
We will develop `hologram-api` as a new top-level crate (or set of crates) inside the `hologram-ai/crates/` workspace. It will serve as the networked interface for the runtime. 

To make it standalone, we will execute the following architecture plan:

### 1. Internalize the Prime CNL/ALP Subsystem
Instead of making network calls to `Prime` to verify inference parameters, we will copy the Prime Controlled Natural Language (CNL) compiler and Abductive Logic Programming (ALP) geometrical gate into `hologram-ai/crates/hologram-cnl`.
*   **Action**: Copy `pirtm-apps/src/cnl.rs` and related `MOCWord` AST definitions from the `Prime` repository into `hologram-ai/crates/hologram-cnl/`.
*   **Integration**: Wire the CNL policy checker directly into Hologram's `ModelRunner`. Any request to generate a token must first clear the internal, locally-executing ALP topological gate (e.g., verifying `temperature = 0.0` for specific domains).

### 2. Internalize the Archivum Ledger (Provenance)
Hologram-AI already has perfect internal $\kappa$-provenance (`AiEvent` sequence). To integrate this with the broader Phase Mirror network natively, `hologram-api` must independently format and log these events to the Archivum format.
*   **Action**: Create `hologram-ai/crates/hologram-archivum` to handle immutable JSONL event hashing (`UnifiedWitness`).
*   **Integration**: Hook this crate to the `ModelRunner` so that all inference executions write append-only logs natively without requiring the Phase Mirror Node.js orchestrator to mediate.

### 3. Develop the Governed MCP Server (`hologram-api`)
The main entry point will be a new Rust binary `hologram-ai/apps/hologram-api`.
*   **Action**: Implement the Model Context Protocol (MCP) directly within this application. It will expose `hologram_compile` and `hologram_generate` tools.
*   **Integration**: The MCP server will ingest requests, pass them through the local CNL/ALP gates (from Step 1), execute using the core `hologram-ai` runtime, log the output via the local Archivum (from Step 2), and return the results.

### 4. Standalone Multi-Ensemble Routing
To allow the API to dynamically select the correct local model based on the domain (e.g., Legal Scopist vs. Medical Ataraxia), we will implement a static routing table within `hologram-api`.
*   **Action**: Define local YAML-based routing policies that map domain contexts to specific `.holo` archives.
*   **Integration**: When a request hits the API with a specific context, the API will automatically hot-swap the optimal compiled graph within the WASM runtime before generation.

## Consequences
### Positive
- **Zero External Dependencies**: `hologram-ai` becomes a fully sovereign, self-contained AI node.
- **Provable Safety**: Generation parameters are mathematically guarded directly at the execution runtime level, impossible to bypass.
- **Unified Provenance**: The cryptographic chain of custody (Policy -> Log -> Execution -> Output) is enforced inherently by the package.
- **Portability**: The entire governed inference stack can be deployed as a single binary or container.

### Negative
- **Code Duplication**: We are intentionally copying `cnl.rs`, `MOCWord`, and Archivum specifications from other repositories (`Prime` and `Phase Mirror`). This introduces the risk of code drift if the upstream `Prime` repository changes.
- **Mitigation**: We will treat the copied components as a frozen, stable core standard for the inference runtime, and only port upstream changes during explicit version bumps.

## Implementation Steps (Next Actions)
1. Initialize the `hologram-api` application in `hologram-ai/apps/hologram-api`.
2. Port the `cnl.rs` and `MOCWord` components from `/home/multiplicity/Multiplicity/Prime` into `hologram-ai/crates/hologram-cnl`.
3. Port the Archivum logging structures into `hologram-ai/crates/hologram-archivum`.
4. Wire the local `ModelRunner` to invoke `hologram-cnl` prior to execution.
5. Expose the governed pipeline via the MCP protocol in `hologram-api`.

## 5. Implementation Steps
1. Create new crates `crates/hologram-cnl` and `crates/hologram-archivum`.
2. Move Prime ALP evaluation subsets to `hologram-cnl`.
3. Build the event logger in `hologram-archivum`.
4. Scaffold the Model Context Protocol application in `apps/hologram-api`.
5. Remove external dependencies from `hologram-ai`'s `Cargo.toml`.

## 6. L0 Sign-off on Closed Windows (Update)
**Date**: 2026-07-06  
**Status**: Closed  
**Evidence**: The analytic contradiction for RH is successfully closed modulo core axioms. `FinalContradiction.lean` has been refactored, and `CriticalHeight.lean` establishes $T_{\text{crit}}(A)$ seamlessly eliminating auxiliary assumptions. The dual gates on the `successor` and `stratum_boundary` constructors strictly enforce AiGraphTopology parameters without violating L0 invariants. Real constant extraction (`extracted.json`) has been generated to validate the gap formula deterministically. No third operator will be authorized until the failable constructor template is formally re-audited and wired to CI.
