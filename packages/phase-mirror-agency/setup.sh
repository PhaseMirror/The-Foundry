#!/usr/bin/env bash
# Phase Mirror Bundle: Dependency Setup
set -e

echo "[BUNDLE] Setting up Phase Mirror Ecosystem..."

echo "[1/4] Installing Agency Server dependencies..."
cd agency-server && npm install --silent
cd ..

echo "[2/4] Installing Discord Bot dependencies..."
cd discord-bot && npm install --silent
cd ..

echo "[3/4] Installing Admin Dashboard dependencies..."
cd admin && npm install --silent
cd ..

echo "[4/4] Installing Citizen Gardens dependencies..."
cd citizen-gardens && npm install --silent
cd ..

echo "[5/5] Compiling and packaging ensemble harnesses..."
bash agency-server/compile_binaries.sh

echo "[SUCCESS] All dependencies installed and harnesses compiled."

