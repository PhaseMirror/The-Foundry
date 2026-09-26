# ADR-DEPLOY-001: Phase Mirror Production Deployment Readiness Plan

- Status: accepted
- Date: 2026-08-02
- Owners: Multiplicity Foundation
- Tags: #deployment, #docker, #production, #phase-mirror-gpt, #phase-mirror-mcp

## 1. Context

Phase Mirror has two production Rust binaries (`phase-mirror-gpt` and `phase-mirror-mcp`) and one automation crate (`phase-mirror-automation`). The governance core (L0 invariants, Triple-Lock, Archivum, SemanticPolicy) is implemented and verified. However, deployment readiness is blocked by build system issues, missing container orchestration, and absent production hardening.

Current state:
- `phase-mirror-gpt` builds successfully in release mode (~6.1MB binary)
- `phase-mirror-mcp` fails to build due to missing `sigmatics-core` dependency (`../../Ensembles/sigmatics-core` does not exist)
- Root `Dockerfile` only builds `phase-mirror-gpt`
- No `docker-compose` for multi-service orchestration
- Tests exist but have not been validated end-to-end in CI
- No health check endpoints or graceful shutdown handlers
- `.kilo/kilo.jsonc` references a non-existent binary path for `phase-mirror-mcp`

## 2. Decision

We will execute a **5-phase deployment readiness plan** to bring Phase Mirror to production:

### Phase 1: Fix Build System (Immediate)
- Remove broken `sigmatics-core` dependency from `phase-mirror-mcp/Cargo.toml`
- Make `phase-mirror-mcp` self-contained using its existing `tools/`, `governance/`, and `persistence/` modules
- Validate both binaries build in release mode

### Phase 2: Container Orchestration (Day 1-2)
- Update root `Dockerfile` to multi-stage build both binaries
- Create `docker-compose.yml` with `phase-mirror-gpt` (stdio MCP) and `phase-mirror-mcp` (WebSocket MCP) services
- Add health check probes for both services

### Phase 3: Production Hardening (Day 2-3)
- Add graceful shutdown (`SIGTERM` handling) to both binaries
- Add `/health` endpoint to `phase-mirror-mcp` (Axum)
- Add structured JSON logging to `phase-mirror-gpt`
- Add resource limit configuration (memory, concurrency)

### Phase 4: CI/CD Validation (Day 3-4)
- Fix high-concurrency test timeout in `governance_tests.rs` (reduce iterations for CI)
- Add build matrix for both binaries in `.github/workflows/release.yml`
- Add Docker image build and push to GitHub Container Registry
- Validate Kani proofs in CI for `phase-mirror-automation`

### Phase 5: Documentation & Runbooks (Day 4-5)
- Create `docs/deployment/` with production guides
- Update `README.md` with deployment instructions
- Create `scripts/` for local development startup

## 3. Implementation Plan

### 3.1 Fix phase-mirror-mcp Build

**File:** `packages/phase-mirror-mcp/Cargo.toml`

Remove:
```toml
sigmatics-core = { path = "../../Ensembles/sigmatics-core" }
verification-harness = { path = "../verification-harness" }
phase-mirror-surface = { path = "../phase-mirror-surface" }
```

These dependencies are either non-existent or unused in the current code. The MCP server's tool implementations (`src/tools/*.rs`) and governance layer (`src/governance/mod.rs`) are self-contained.

### 3.2 Multi-Stage Dockerfile

**File:** `Dockerfile`

Build both binaries in a single multi-stage Dockerfile:
- Stage 1: Build `phase-mirror-gpt` (musl target for static binary)
- Stage 2: Build `phase-mirror-mcp` (glibc target for Axum/WebSocket)
- Stage 3: Minimal runtime with both binaries

### 3.3 Docker Compose

**File:** `docker-compose.yml`

Services:
- `phase-mirror-gpt`: stdio MCP server, mounted config volumes
- `phase-mirror-mcp`: WebSocket MCP server on port 3000, with `/metrics` endpoint
- Shared `archivum` volume for WAL persistence

### 3.4 Health Checks & Graceful Shutdown

Add to both binaries:
- `phase-mirror-gpt`: Signal handler for `SIGTERM`/`SIGINT`, cleanup before exit
- `phase-mirror-mcp`: Axum `/health` route returning JSON status

### 3.5 CI/CD Pipeline

Update `.github/workflows/release.yml`:
- Build both binaries
- Run tests for both packages
- Build and push Docker images
- Generate and upload checksums

## 4. Consequences

### Positive
- Both production binaries build and containerize
- Multi-service deployment via docker-compose
- Production-ready health checks and graceful shutdown
- CI pipeline validates every commit

### Negative / Risk
- Removing `sigmatics-core` dependency may break features if they were planned but not yet used
- Multi-stage Dockerfile increases build time
- Health checks add minor runtime overhead

### Neutral
- `phase-mirror-automation` remains a standalone crate for local development
- Existing single-binary Dockerfile is replaced

## 5. Security & Governance

1. **Non-Bypassability**: Both binaries enforce L0/L1/Triple-Lock before any tool execution
2. **Immutable Audit**: All governance events append to Λ-Archivum WAL
3. **Zero Drift**: Container images are built from pinned Rust toolchain (1.85) with reproducible builds

## 6. Dependencies

- `packages/phase-mirror-gpt` — already builds
- `packages/phase-mirror-mcp` — needs dependency fix
- `Dockerfile` — needs multi-stage update
- `.github/workflows/release.yml` — needs multi-binary CI

## 7. Promotion Criteria

| Criteria Type | Description | Target / Threshold | Status |
| :--- | :--- | :--- | :--- |
| **Build** | Both binaries build in release mode | 0 errors | ⬜ |
| **Test** | All tests pass for both packages | 100% pass | ⬜ |
| **Container** | `docker compose build` succeeds | Both images built | ⬜ |
| **Health** | `/health` returns 200 on MCP server | JSON status OK | ⬜ |
| **CI** | GitHub Actions passes on PR | Green | ⬜ |
| **Docs** | Deployment guide published | `docs/deployment/` | ⬜ |
