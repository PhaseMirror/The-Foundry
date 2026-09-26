# ADR 010: Agency API Specification — The Coding Commander Protocol

## Status
Proposed

## Context
To enable the Coding Commander and other Agency ensembles to be used within external applications (mobile, web, or IDE plugins), we must provide a robust, scalable, and standardized API. This must mimic the developer experience of commercial AI APIs (like Gemini or OpenAI) while maintaining the Agency's strict deterministic governance.

## Decision
We will implement the **Agency API Gateway**, a production-grade interface for the Meta-Ensemble.

### 1. API Architecture (The "Cold" Endpoint)
- **Technology**: Rust (Axum + Tokio) for memory safety and concurrency.
- **Protocol**: REST + WebSockets (for streaming completions).
- **Authentication**: Bearer Token (API Keys) anchored to a `governance/API_KEYS.json` registry.

### 2. Unified Request/Response Schema
The API will support an OpenAI-compatible completion format to ensure drop-in compatibility for most apps:
- **Endpoint**: `POST /v1/agency/coding-commander/completions`
- **Request**:
  ```json
  {
    "mission": "Refactor the spectral norm logic",
    "context": ["src/main.rs"],
    "partition": "rigid",
    "stream": true
  }
  ```
- **Response**:
  ```json
  {
    "id": "pm-mission-...",
    "witness_hash": "61e2ac8e...",
    "completion": "...",
    "governance_status": "VERIFIED"
  }
  ```

### 3. Real-Time Triple-Lock Enforcement
Unlike standard LLM APIs, every request triggers the following sequence before a final response is committed:
1. **The Genius (API Side)**: Formulates the probabilistic plan.
2. **The Guardian (API Side)**: Validates plan against Lean Core invariants.
3. **The Examiner (API Side)**: Audits the proposed state change for MD-005 drift.
4. **The Publisher (API Side)**: Codifies the outcome and returns the "Witness Hash" to the client.

## Implementation Plan
1. **Initialize `api-server`**: Create a new Rust project in `phasemirror-agency/api-server`.
2. **Standardize `MissionProtocol`**: Define shared types for cross-ensemble data exchange.
3. **SDK Generation**: Provide a simple TypeScript/Python client for app integration.

## Consequences
- **Positive**: High-velocity integration into external apps; enforces governance as a service.
- **Negative**: Response latency increases due to real-time Triple-Lock validation (~100-200ms overhead).
