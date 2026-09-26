# ADR 002: Hologram-API Deployment Readiness

## Status
Proposed

## Context
With the successful integration of the standalone `hologram-api`—featuring built-in formal verification (`hologram-cnl`) and ledger logging (`hologram-archivum`) alongside dynamic YAML routing—the `hologram-ai` workspace now hosts a complete, sovereign inference server. To transition this server from development to production deployment, we must align it with the rigorous Validation and Verification (V&V) standards of the existing codebase and prepare it for seamless, governed distribution.

## Decision
We will finalize the deployment readiness of `hologram-api` through the following containerization, configuration, and CI/CD strategies:

### 1. Containerization (Docker)
The `hologram-api` binary must be deployable as an isolated microservice.
*   **Action**: Create a `Dockerfile.api` in the workspace root. It will use a multi-stage build: compiling the `hologram-api` binary in a rust builder environment and moving it to a minimal `scratch` or `alpine` runtime image.
*   **Volume Mounts**: The container will expose two critical volume paths:
    *   `/etc/hologram/routing.yaml` (Read-only model configuration mapping)
    *   `/var/log/hologram/hologram_archivum_ledger.jsonl` (Append-only ledger state)
    *   `/models/hologram/` (Persistent storage for downloaded `.holo` archives)

### 2. Configuration via Environment Variables
Currently, the API hardcodes the location of `routing.yaml` and the Archivum ledger.
*   **Action**: Refactor `apps/hologram-api/src/main.rs` to ingest environment variables (e.g., `HOLOGRAM_ROUTING_PATH`, `HOLOGRAM_LEDGER_PATH`) overriding defaults. This ensures cloud-native orchestration compatibility (Kubernetes, Docker Swarm).

### 3. CI/CD Integration (Justfile & GitHub Actions)
The workspace `Justfile` currently governs web, structural, and portability tests. `hologram-api` must be brought under the same strict governance loop.
*   **Action**: Update `Justfile` to include:
    *   `api-test`: Specific test lanes for the MCP JSON-RPC handlers and the `hologram-cnl` bounds.
    *   `api-build`: Target for the release-optimized server binary.
*   **Action**: Update `.github/workflows/ci.yml` so that every PR and push builds and asserts the mathematical gates within `hologram-api`.

### 4. Telemetry and Liveness Probes
For horizontal scaling (e.g., in the `legal_scopist` ensemble), orchestrators need to know if the engine is ready and whether the underlying graph has successfully compiled.
*   **Action**: Extend the MCP interface or add a lightweight HTTP daemon alongside the stdio RPC to emit a standard `/health` and `/ready` probe that returns the state of the active model and the mathematical saturation index.

## Consequences
### Positive
- **Cloud-Native Compatibility**: The service can be dropped into any Kubernetes cluster or deployed via Docker Compose seamlessly.
- **Auditable Artifacts**: The container images become immutable, signed artifacts themselves—expanding the provenance chain from the source code up to the running host.
- **Maintainability**: Unified configuration management prevents manual tampering with hardcoded paths.

### Negative
- **Operational Overhead**: Managing Docker networking and persistent volumes for the `.holo` archives will require infrastructure scaffolding for end users.
- **Mitigation**: We will provide a `docker-compose.yml` template and Helm chart to abstract the deployment complexity.

## Implementation Steps (Next Actions)
1. Write the `Dockerfile.api` encompassing the multi-stage build.
2. Refactor `apps/hologram-api/src/main.rs` for dynamic Environment Variable configuration.
3. Update `Justfile` with specific build and test assertions for the API.
4. Author the initial Kubernetes/Docker-Compose scaffolding templates.
