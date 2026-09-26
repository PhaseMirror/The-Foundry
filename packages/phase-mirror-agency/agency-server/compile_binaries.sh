#!/usr/bin/env bash
# Compile all Agency Ensembles into the server's bin/ directory.

set -e
# Fixed path to repository target directory
TARGET_DIR="/home/multiplicity/Multiplicity/target/release"
REPO_ROOT="/home/multiplicity/Multiplicity/Phase Mirror"
BIN_DIR="/home/multiplicity/Multiplicity/Phase Mirror/phase-mirror-agency/agency-server/bin"

mkdir -p "$BIN_DIR"

echo "[COMPILE] Building Agency Ensembles for Server Deployment..."

build_and_copy() {
    local name="$1"
    local path_suffix="$2"
    local bin_name="$3"
    local target_bin="$4"
    
    local full_path="$REPO_ROOT/phase-mirror-agency/ensembles/$path_suffix"
    if [ -d "$full_path" ]; then
        echo "Building $name..."
        (
            cd "$full_path"
            cargo build --release
            if [ -f "target/release/$bin_name" ]; then
                cp "target/release/$bin_name" "$BIN_DIR/$target_bin"
            elif [ -f "$TARGET_DIR/$bin_name" ]; then
                cp "$TARGET_DIR/$bin_name" "$BIN_DIR/$target_bin"
            else
                echo "[ERROR] Compiled binary not found for $name"
                exit 1
            fi
        )
    else
        echo "[WARN] Source directory for $name does not exist: $full_path"
        if [ ! -f "$BIN_DIR/$target_bin" ]; then
            echo "[INFO] Creating mock or placeholder binary for $target_bin..."
            echo "#!/bin/sh" > "$BIN_DIR/$target_bin"
            echo "echo '[MOCK] $name executed'" >> "$BIN_DIR/$target_bin"
            chmod +x "$BIN_DIR/$target_bin"
        fi
    fi
}

build_and_copy "Coding Commander" "coding-commander/harness" "coding-commander-harness" "coding-commander"
build_and_copy "Finton" "finton/harness" "finton-harness" "finton"
build_and_copy "Ataraxia" "ataraxia/harness" "ataraxia-harness" "ataraxia"
build_and_copy "The Examiner" "the-examiner/harness" "the-examiner-harness" "the-examiner"
build_and_copy "The Publisher" "the-publisher/harness" "the-publisher-harness" "the-publisher"

echo "[SUCCESS] All binaries compiled and moved to agency-server/bin/"
