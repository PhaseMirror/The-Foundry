#!/usr/bin/env bash
# Bundle the Agency Server into a portable .zip deployment package.

set -e
SERVER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="/home/multiplicity/Multiplicity/Phase Mirror/deploy_artifacts"

mkdir -p "$OUTPUT_DIR"

echo "[DEPLOY] Packaging Agency Server (v1.0)..."

# Ensure binaries are fresh
bash "$SERVER_DIR/compile_binaries.sh"

# Create temporary staging area
STAGING="/tmp/agency-server-staging"
rm -rf "$STAGING"
mkdir -p "$STAGING"

cp -r "$SERVER_DIR/package.json" "$STAGING/"
cp -r "$SERVER_DIR/src" "$STAGING/"
cp -r "$SERVER_DIR/bin" "$STAGING/"

# Zip the staging area
(cd "$STAGING" && zip -qr "$OUTPUT_DIR/agency-server.zip" .)

echo "[SUCCESS] Agency Server deployment package created at $OUTPUT_DIR/agency-server.zip"
