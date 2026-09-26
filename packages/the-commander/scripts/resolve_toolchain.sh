#!/bin/bash
# scripts/resolve_toolchain.sh
# Finds the latest Rust Flatpak SDK and prints the export command

# --- Portability Check ---
if command -v cargo >/dev/null 2>&1; then
    # Cargo is already in PATH, no-op but successful
    echo "# Cargo already in PATH"
    exit 0
fi

BASE_PATH="/home/multiplicity/.local/share/flatpak/runtime/org.freedesktop.Sdk.Extension.rust-stable/x86_64"

if [ ! -d "$BASE_PATH" ]; then
    echo "# Error: $BASE_PATH not found and cargo not in PATH" >&2
    exit 1
fi

# Get the latest version directory (e.g. 25.08)
LATEST_VERSION=$(ls -1 "$BASE_PATH" | grep -E '^[0-9]' | sort -V | tail -n 1)

if [ -z "$LATEST_VERSION" ]; then
    echo "# Error: Could not find any Rust SDK version in $BASE_PATH" >&2
    exit 1
fi

# Get the hash directory (exclude 'active' symlink)
LATEST_HASH=$(ls -1 "$BASE_PATH/$LATEST_VERSION" | grep -v 'active' | head -n 1)

if [ -z "$LATEST_HASH" ]; then
    echo "# Error: Could not find any SDK hash in $BASE_PATH/$LATEST_VERSION" >&2
    exit 1
fi

BIN_PATH="$BASE_PATH/$LATEST_VERSION/$LATEST_HASH/files/bin"

if [ -d "$BIN_PATH" ]; then
    echo "export PATH=\"$BIN_PATH:\$PATH\""
else
    echo "# Error: $BIN_PATH is not a directory" >&2
    exit 1
fi
