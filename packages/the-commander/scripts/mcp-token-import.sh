#!/usr/bin/env bash
set -euo pipefail

# mcp-token-import.sh – Securely import an admission token for the MCP server.
# The script supports two modes:
#   1. Store the token in the Linux secret service (if available).
#   2. Fallback to a file with strict permissions.
# Usage: ./mcp-token-import.sh <token> [label]
#   <token> – The admission token string (or path to a file containing it).
#   [label] – Optional label for the secret (default: "mcp-admission-token").

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <token-or-path> [label]"
  exit 1
fi

TOKEN_INPUT="$1"
LABEL="${2:-mcp-admission-token}"

# Determine if input is a file
if [[ -f "$TOKEN_INPUT" ]]; then
  TOKEN=$(<"$TOKEN_INPUT")
else
  TOKEN="$TOKEN_INPUT"
fi

# Try to use the Freedesktop secret service (e.g., GNOME Keyring, KWallet)
if command -v secret-tool >/dev/null 2>&1; then
  echo "Storing token in secret service under label '$LABEL'..."
  # Delete any existing entry with the same label first
  existing=$(secret-tool search label "$LABEL" || true)
  if [[ -n "$existing" ]]; then
    # secret-tool does not provide delete, so we just overwrite by storing new value
    :
  fi
  echo -n "$TOKEN" | secret-tool store --label "$LABEL" label "$LABEL"
  echo "Token stored securely in secret service."
  exit 0
fi

# Fallback: store in a file with mode 0600
TOKEN_DIR="/etc/mcp/tokens"
TOKEN_FILE="$TOKEN_DIR/admission.token"
mkdir -p "$TOKEN_DIR"
chmod 750 "$TOKEN_DIR"

echo "Storing token in $TOKEN_FILE (mode 0600)..."
printf "%s" "$TOKEN" > "$TOKEN_FILE"
chmod 600 "$TOKEN_FILE"

echo "Token stored at $TOKEN_FILE with restricted permissions."
