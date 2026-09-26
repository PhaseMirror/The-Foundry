#!/usr/bin/env bash
# Phase Mirror Bundle: Ecosystem Launcher
set -e

# Kill existing processes on exit
trap 'kill 0' EXIT

echo "[BUNDLE] Launching Phase Mirror Ecosystem..."

# 1. Agency Server (Port 8082)
echo "[1/4] Starting Agency Server..."
cd agency-server && npm start > ../agency-server.log 2>&1 &
cd ..

# 2. Discord Bot
echo "[2/4] Starting Discord Bot..."
# Note: Requires .env configuration
cd discord-bot && npm run dev > ../discord-bot.log 2>&1 &
cd ..

# 3. Admin Dashboard (Port 3000)
echo "[3/4] Starting Admin Dashboard..."
cd admin && npm run dev > ../admin.log 2>&1 &
cd ..

# 4. Citizen Gardens Frontend (Port 5173)
echo "[4/4] Starting Citizen Gardens..."
cd citizen-gardens && npm run dev > ../citizen-gardens.log 2>&1 &
cd ..

echo "[SUCCESS] Ecosystem is running."
echo "- Agency: http://127.0.0.1:8082"
echo "- Admin: http://127.0.0.1:3000"
echo "- Site: http://127.0.0.1:5173"
echo "Press Ctrl+C to stop all services."

wait
