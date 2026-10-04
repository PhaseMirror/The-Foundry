#!/bin/bash
set -e

echo "Waiting for holospaces.zip to finish downloading..."
while fuser holospaces.zip >/dev/null 2>&1; do
    sleep 5
done

echo "Extracting OS..."
unzip -q -o holospaces.zip
# make-dist.mjs looks for ../../../holo-os/system/os from apps/tauri
# So we need Multiplicity/holo-os/system/os
mkdir -p holo-os
cp -R holospaces-main/system holo-os/

echo "Building Hologram Apps Tauri..."
cd hologram-apps-main/apps/tauri
HOLO_OS2_DIR=$(pwd)/../../../../holo-os/system/os npm run build

echo "Packaging as Flatpak..."
cd target/release/bundle/appimage
# Create a simple flatpak wrapping the binary
APP_NAME="org.hologram.os"
mkdir -p flatpak-build/dir
# We would extract the AppImage or use the deb to create a flatpak.
# A simple way is to use flatpak build-init and flatpak build.
echo "Creating flatpak repo..."
flatpak build-init flatpak-build $APP_NAME org.freedesktop.Platform org.freedesktop.Sdk 22.08
cp hologram*.AppImage flatpak-build/dir/hologram-os
flatpak build flatpak-build chmod +x /dir/hologram-os
# This is a simplification; a full flatpak manifest would be better.
echo "Done!"
