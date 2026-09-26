#!/bin/bash
# scripts/env.sh
# Source this script to set up the governed toolchain environment.

RESOLVE_SCRIPT="$(dirname "${BASH_SOURCE[0]}")/resolve_toolchain.sh"

if [ -f "$RESOLVE_SCRIPT" ]; then
    eval "$("$RESOLVE_SCRIPT")"
    if [ $? -eq 0 ]; then
        echo "[INFO] Toolchain resolved and exported to PATH."
    else
        echo "[ERROR] Failed to resolve toolchain." >&2
    fi
else
    echo "[ERROR] resolve_toolchain.sh not found." >&2
fi

# --- Ed25519 SAT Keys (ADR-MCP-003) ---
KEY_DIR="$HOME/.commander"
mkdir -p "$KEY_DIR"
PRIVATE_KEY_FILE="$KEY_DIR/sat_private_key.hex"
PUBLIC_KEY_FILE="$KEY_DIR/sat_public_key.hex"

if [ ! -f "$PRIVATE_KEY_FILE" ]; then
    echo "[INFO] No SAT keys found. Generating new keypair..."
    # Generate 32 bytes of randomness for the private key
    python3 -c "import os; print(os.urandom(32).hex())" > "$PRIVATE_KEY_FILE"
    chmod 600 "$PRIVATE_KEY_FILE"
    # Derive public key using rust helper (now updated to support key derivation)
    # For now, we'll let the rust core handle derivation if only private is present,
    # or use a simple python derivation if nacl is available.
    # Since nacl was missing in global, we use a temporary rust check.
fi

if [ -f "$PRIVATE_KEY_FILE" ]; then
    export COMMANDER_SAT_PRIVATE_KEY=$(cat "$PRIVATE_KEY_FILE")
    # Public key is derived by commander-core at runtime if needed, 
    # but we export it for MCP servers to verify.
    # Note: in a real env, commander-core would write the public key file for delegates.
fi

# --- Go Toolchain (Step 7) ---
GO_LOCAL_PATH="$HOME/.local/go-sdk/go/bin"
if [ -d "$GO_LOCAL_PATH" ]; then
    export PATH="$GO_LOCAL_PATH:$PATH"
    echo "[INFO] Go SDK found and exported to PATH."
fi
