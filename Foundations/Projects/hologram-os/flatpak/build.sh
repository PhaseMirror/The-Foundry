#!/bin/bash
set -e

echo "Building Hologram OS Flatpak..."
cd flatpak
flatpak run org.flatpak.Builder --user --install --force-clean --install-deps-from=flathub build-dir io.hologram.OS.json

echo "Build complete. You can run it with:"
echo "flatpak run io.hologram.OS"
