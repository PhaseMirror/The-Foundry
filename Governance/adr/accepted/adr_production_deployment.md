# ADR 001: Production‑grade Deployment of the Sedona Spine‑backed Service

**Status:** Accepted

## Context

The *phase‑mirror‑mcp* crate implements a critical ESI preservation engine built on the **Sedona Spine** (Rust engine + WASM SDK).  The service must satisfy the **Sedona Spine Mandate**:

1. **Zero Drift** – No component may compute preservation‑risk levels independently of the engine.
2. **Path of Integrity** – All UI/Agent calls flow through `Engine → SDK → Contract → UI`.
3. **Policy‑driven Variation** – Domain‑specific rules live exclusively in declarative YAML policies.

The recent audit introduced a thin wrapper (`src/tools/mod.rs`), enriched the contract (`CONTRACT.md` with a Mermaid diagram), added structured logging, a CI pipeline, and a runtime‑config template.  We now need a concrete plan to push the service to production while preserving compliance, observability, security, and reliability.

## Decision

We will adopt a **Kubernetes‑native, blue‑green deployment** strategy complemented by **GitOps** for configuration management and **service‑mesh** observability.  The deployment will consist of the following layers:

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Container Runtime** | **Docker** (multi‑stage build) | Produces minimal, reproducible images; aligns with Rust‑cargo build.
| **Orchestration** | **Kubernetes (v1.30+)** | Handles scaling, self‑healing, and rollout control.
| **GitOps** | **Argo CD** | Declarative sync of manifests from the repository; audit‑ready change history.
| **Service Mesh** | **Istio** (or **Linkerd**) | Enables mTLS, traffic splitting for blue‑green, and distributed tracing.
| **CI/CD** | Existing GitHub Actions workflow (`.github/workflows/ci.yml`) triggers image build, scan, and Argo CD sync.
| **Configuration** | YAML policy files stored in a dedicated ConfigMap, rendered from `src/config/template.yaml` and policy‑specific `.yaml` under `models/legalese-scopist/templates/`.
| **Observability** | **Prometheus** + **Grafana** dashboards; **OpenTelemetry** instrumentation in the Rust engine.
| **Secrets Management** | **HashiCorp Vault** (integrated via side‑car injector) for TLS certificates and token secrets.
| **Logging** | Structured JSON logs written by `CrmfStorage.log_preservation_event`; forwarded to **ELK** stack.

## Alternatives Considered

| Alternative | Pros | Cons |
|------------|------|------|
| **Monolithic VM deployment** (systemd service) | Simple, low initial overhead. | Lacks elasticity, difficult to roll back, no built‑in mTLS, manual config drift.
| **Serverless (AWS Lambda)** | Pay‑per‑use, automatic scaling. | Cold‑start latency for the Rust + WASM engine, limited control over TLS and custom networking, harder to guarantee the mandated Engine→SDK→Contract path.
| **Docker Swarm** | Familiar Docker‑only orchestration. | Obsolete compared to Kubernetes, limited blue‑green capabilities, smaller ecosystem for policy‑driven GitOps.
| **Chosen** – **K8s + GitOps** | Full control over rollout, native support for mTLS, declarative CI, observability, and policy management. | Higher operational complexity, but mitigated by using managed K8s (e.g., EKS, GKE, AKS).

## Implementation Plan

1. **Container Image**
   - Add a `Dockerfile` with a multi‑stage build: compile the Rust binary, then copy the binary into a `scratch` base.
   - Tag images as `registry.example.com/phase-mirror-mcp:${GIT_SHA}`.
2. **CI Enhancements**
   - Extend the existing GitHub Actions workflow to:
     - Run `cargo audit` for security scanning.
     - Build and push the Docker image.
     - Generate and push a `SBOM` (Software Bill of Materials).
     - Trigger an Argo CD sync via API.
3. **GitOps Manifests**
   - Create Helm chart `phase-mirror-mcp` containing:
     - Deployment with two replica sets (`blue` and `green`).
     - Service exposing gRPC/HTTP endpoints.
     - ConfigMap generated from `src/config/template.yaml` plus policy YAMLs.
     - Secret referencing Vault‑derived TLS certs.
4. **Blue‑Green Rollout**
   - Use Istio `VirtualService` to split traffic 100 % to *blue*.
   - Deploy *green* with the new version; shift traffic incrementally (10 % → 100 %) while monitoring metrics and logs.
   - On success, decommission *blue*.
5. **Observability & Alerting**
   - Instrument the Rust engine with `opentelemetry` crate to emit spans to Jaeger.
   - Scrape Prometheus metrics from `/metrics` endpoint (added by the runtime config).
   - Configure Grafana dashboards for:
     - Risk‑score distribution.
     - Preservation‑event ingestion latency.
     - TLS handshake success rates.
   - Set up alerts for:
     - Critical risk (> 0.9) *and* no `[PRESERVATION ALERT]` logged within 5 min.
6. **Security Hardening**
   - Enforce mTLS via Istio.
   - Store TLS certs and token secret in Vault; rotate automatically.
   - Enable Kubernetes `PodSecurityPolicy` with `runAsNonRoot` and read‑only root filesystem.
   - Run container as non‑root user (UID 1000).
7. **Disaster Recovery**
   - Replicate the `CrmfStorage` log file to a persistent volume claim (PVC) backed by encrypted block storage.
   - Periodically snapshot the PVC to an off‑site bucket.
   - Provide a restoration script that replays the log to reconstruct the chain of custody.
8. **Documentation & Governance**
   - Update `models/legalese-scopist/CONTRACT.md` with a link to this ADR.
   - Store the ADR in `docs/adr/001-production-deployment.md` and version‑control it.
   - Add a review checklist for any future changes that might affect the Engine→SDK→Contract path.

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Misconfiguration of policy YAML leading to unintended retention periods. | Medium | High (legal exposure) | Enforce schema validation in CI (`cargo validate-config`). |
| Container image vulnerability. | Low | High | `cargo audit` + Docker image scanning in CI; auto‑remediate via Dependabot. |
| Blue‑green traffic split causing inconsistent state. | Low | Medium | Make the service stateless; all state stored in `CrmfStorage` which is persisted. |
| Vault secret leakage. | Low | Critical | Use Vault Agent sidecar with auto‑renew; restrict access via K8s RBAC. |

## Acceptance Criteria

- ✅ Docker image builds and pushes without manual steps.
- ✅ Argo CD successfully syncs the Helm release.
- ✅ Blue‑green rollout can be performed via Istio traffic split.
- ✅ All risk calculations are logged via `log_preservation_event` and appear in ELK.
- ✅ Prometheus metrics are scraped and alerts fire on critical risk without a preservation alert.
- ✅ Documentation (this ADR and updated CONTRACT.md) is version‑controlled and reviewed.

---
*Prepared by Antigravity AI on 2026‑06‑26.*
