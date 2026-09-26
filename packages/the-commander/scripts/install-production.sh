#!/usr/bin/env bash
set -euo pipefail

# install-production.sh – Deploy MCP server and the‑commander CLI for production
# Assumes running as root or with sudo privileges

# 1. Install binaries (assuming they are already built in target/release)
BINARY_SRC="$(pwd)/target/release"
install -Dm755 "$BINARY_SRC/mcp" /usr/local/bin/mcp
install -Dm755 "$BINARY_SRC/pscmd" /usr/local/bin/pscmd

# 2. Install systemd unit files
install -Dm644 infra-config/mcp/mcp.service /etc/systemd/system/mcp.service
install -Dm644 infra-config/cli/the-commander.service /etc/systemd/system/the-commander.service

# 3. Install configuration templates
install -Dm644 infra-config/mcp/config.toml.example /etc/mcp/config.toml.example
install -Dm644 infra-config/cli/config.toml.example /etc/the-commander/config.toml.example

# 4. Generate self‑signed TLS certificates if not present
TLS_DIR="/etc/mcp/tls"
mkdir -p "$TLS_DIR"
if [[ ! -f "$TLS_DIR/server.crt" || ! -f "$TLS_DIR/server.key" ]]; then
  echo "Generating self‑signed TLS certificates for MCP..."
  openssl req -newkey rsa:4096 -nodes -keyout "$TLS_DIR/server.key" \
    -x509 -days 365 -out "$TLS_DIR/server.crt" \
    -subj "/CN=mcp.local"
fi

# 5. Import admission token (provide token via environment variable or file)
if [[ -n "${MCP_ADMISSION_TOKEN:-}" ]]; then
  echo "Importing admission token from environment variable..."
  scripts/mcp-token-import.sh "$MCP_ADMISSION_TOKEN"
else
  echo "No admission token provided. Skipping token import. Use scripts/mcp-token-import.sh to import later."
fi

# 6. Enable and start services
systemctl daemon-reload
systemctl enable --now mcp.service
systemctl enable --now the-commander.service

echo "Production deployment completed."
