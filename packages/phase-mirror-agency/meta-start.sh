#!/usr/bin/env bash
# Phase Mirror Meta-Ensemble: Dev HQ Bootstrap
set -e

AGENCY_ROOT="/home/multiplicity/Multiplicity/Phase Mirror"
LOG_DIR="$AGENCY_ROOT/packages/phase-mirror-agency/logs"

mkdir -p "$LOG_DIR"

echo "[META] Launching Phase Mirror Meta-Ensemble..."

# 1. Compile Rust binaries
echo "[1/5] Compiling binary harnesses..."
bash "$AGENCY_ROOT/packages/phase-mirror-agency/agency-server/compile_binaries.sh"

# 2. Start Agency Server (port 8082)
echo "[2/5] Starting Agency Server..."
cd "$AGENCY_ROOT/packages/phase-mirror-agency/agency-server"
npm install --silent > /dev/null 2>&1 || true
make build > /dev/null 2>&1 || true
node dist/index.js > "$LOG_DIR/agency-server.log" 2>&1 &
echo $! > "$LOG_DIR/agency-server.pid"

# 3. Start DevOps UI (port 5173)
echo "[3/5] Starting DevOps UI..."
cd "$AGENCY_ROOT/packages/phase-mirror-agency/ui"
npm install --silent > /dev/null 2>&1 || true
npm run dev > "$LOG_DIR/ui.log" 2>&1 &
echo $! > "$LOG_DIR/ui.pid"

# 4. Start Q-Calculator REST (port 7070) — optional, for REST fallback
echo "[4/5] Starting Q-Calculator REST..."
if [ -d "$AGENCY_ROOT/Legacy/q-calculator" ]; then
  cd "$AGENCY_ROOT/Legacy/q-calculator"
  if command -v uvicorn >/dev/null 2>&1; then
    uvicorn packages.q_calculator.src.api_v2:app --port 7070 --host 127.0.0.1 > "$LOG_DIR/q-calculator.log" 2>&1 &
    echo $! > "$LOG_DIR/q-calculator.pid"
  else
    echo "[WARN] uvicorn not found. Skipping Q-Calculator REST."
  fi
else
  echo "[WARN] Legacy/q-calculator/ not found. Skipping Q-Calculator REST."
fi

# 5. Verify
sleep 3
echo "[5/5] Verifying ecosystem..."
if curl -sf "http://127.0.0.1:8082/v1/health" >/dev/null 2>&1; then
  echo "  > Agency Server: VERIFIED"
else
  echo "  > Agency Server: PENDING (may need more time)"
fi

if curl -sf "http://127.0.0.1:5173" >/dev/null 2>&1; then
  echo "  > DevOps UI: VERIFIED"
else
  echo "  > DevOps UI: PENDING (Vite HMR may take a moment)"
fi

echo ""
echo "[SUCCESS] Meta-ensemble is launching."
echo "- Agency: http://127.0.0.1:8082"
echo "- UI:     http://127.0.0.1:5173"
echo "- Q-Calc: http://127.0.0.1:7070 (if running)"
echo "Logs: $LOG_DIR"
echo "Press Ctrl+C to stop all services."

trap 'kill 0' EXIT
wait
