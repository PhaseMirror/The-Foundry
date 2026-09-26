# ADR-DEPLOY-001: Production‑grade Deployment of the‑commander

**Status**: Proposed

## Context
The `the‑commander` package is a core component of the PhaseMirror ecosystem. It provides a CLI for interacting with the Multiplicity platform and relies on the MCP (Multipurpose Communication Protocol) server for runtime coordination. While the package can be built and run locally for development, a production‑grade deployment requires:

1. A stable, long‑running MCP server instance.
2. The CLI configured to communicate securely with that server.
3. Systemd (or equivalent) service wrappers for automatic startup, health‑checks and log rotation.
4. Secure handling of secrets (e.g., admission tokens, TLS certificates).
5. Observability (metrics, tracing) integrated with the existing monitoring stack.

Existing ADRs relevant to this decision:
- [ADR‑MCP‑001‑mcp‑native‑boundaries](../accepted/ADR-MCP-001-mcp-native-boundaries.md)
- [ADR‑CLI‑001‑tui‑library](../accepted/ADR-CLI-001-tui-library.md)
- [ADR‑MCP‑003‑python‑alp‑proxy](../accepted/ADR-MCP-003-python-alp-proxy.md)

## Decision
We will ship a **production‑grade deployment guide** and accompanying configuration files that automate the following:

- **MCP server**: Deploy the MCP server as a systemd service (`mcp.service`) using the existing `infra-config/mcp` templates. It will run behind TLS, verify client admission tokens, and expose an SSE transport for event streaming.
- **CLI integration**: The CLI will be installed system‑wide (`/usr/local/bin/pscmd`) and will read its configuration from `/etc/the-commander/config.toml`. The config will contain the MCP endpoint, TLS certificate paths, and default workspace locations.
- **Service wrapper for the CLI**: Optionally run the CLI in daemon mode (`pscmd daemon`) as `the-commander.service` for background tasks (e.g., scheduled workflows).
- **Secret management**: Use the host's keyring (or a secrets manager) to store admission tokens. Provide a helper script `scripts/mcp-token-import.sh`.
- **Observability**: Enable Prometheus metrics (`/metrics` endpoint on MCP) and forwarding of CLI logs to `systemd-journald`.

The deployment guide will be versioned and included under `docs/deployment/production.md`.

## Consequences
- **Operational overhead**: Operators must provision TLS certificates and maintain the MCP service.
- **Security surface**: Exposing the MCP server requires careful firewall rules and token rotation policies.
- **Complexity**: Additional scripts and systemd units increase the codebase size; we must keep them in sync with the Rust binaries.
- **Benefit**: Guarantees reliability, scalability, and secure communication for production users, aligning with the roadmap for PhaseMirror.

## Implementation Steps
1. **Add systemd unit files**
   - `infra-config/mcp/mcp.service` – runs the compiled MCP binary with `--config /etc/mcp/config.toml`.
   - `infra-config/cli/the-commander.service` – runs `pscmd daemon` with appropriate env vars.
2. **Create default config templates**
   - `/etc/mcp/config.toml.example`
   - `/etc/the-commander/config.toml.example`
3. **Write install script** `scripts/install-production.sh` that:
   - Copies binaries to `/usr/local/bin`.
   - Installs unit files to `/etc/systemd/system` and enables them.
   - Generates self‑signed TLS certs (or uses supplied ones).
   - Imports admission tokens via `scripts/mcp-token-import.sh`.
4. **Update documentation**
   - Add `docs/deployment/production.md` describing manual and CI‑CD paths.
   - Reference this ADR from the new docs.
5. **Testing**
   - Add integration tests under `tests/production_deploy/` that spin up a temporary MCP server (using the `daemon` crate) and verify CLI connectivity.
6. **CI pipeline**
   - Extend `Justfile` with a `just production-deploy` target that runs the install script on a fresh container.

## Rollout Plan
- **Phase 1** (Beta): Release the install script and docs in a separate branch; gather feedback from internal teams.
- **Phase 2** (Stable): Merge into `main`, bump version, and publish the production binaries.
- **Phase 3** (Monitoring): Enable Prometheus alerts for MCP health and CLI error rates.

---
*Created by Antigravity on 2026‑08‑29.*
