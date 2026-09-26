# ADR 001 – Production‑grade Deployment of the Sedona Spine‑backed Service

**Status:** Accepted

### Decision points (aligned with Governance levers)

| Lever | Owner | Metric | Horizon | Chosen value |
|------|-------|--------|---------|--------------|
| **Registry** | DevOps | Image name documented in ADR & CI; SBOM passes on first push | 7 d | `docker.io/youruser/phase-mirror-mcp` |
| **Strategy** | Governance | Deployment strategy recorded; blue‑green deferred until L0 artifact exists | 7 d | **Single‑deployment** (initial) |
| **Config loader** | Compiler Eng. | `src/config/mod.rs` validates all required fields; 100 % test coverage | 14 d | – |
| **Helm chart** | DevOps | Helm chart with non‑root security context; CI builds/pushes image + SBOM | 14 d | – |

*All subsequent changes must reference this ADR (via a hyperlink in `models/legalese‑scopist/CONTRACT.md` and the project README).*

---

## Deployment artefacts

- **ADR:** [001‑production‑deployment](../docs/adr/001-production-deployment.md) – records container registry, image name, and deployment strategy.
- **CI pipeline:** Updated `.github/workflows/ci.yml` now builds the Docker image, generates an SBOM, and pushes to Docker Hub.
- **Helm chart:** `helm/phase-mirror-mcp/` – single‑deployment chart with non‑root security context.
- **Config loader:** `src/config/mod.rs` validates `template.yaml` at startup, ensuring no drift from the engine‑computed risk logic.
