#!/usr/bin/env bash
# Phase Mirror Bundle: End-to-End Test Harness
set -e

echo "=== Phase Mirror Ecosystem Test Harness ==="
BASE_URL="http://127.0.0.1:8082/v1"

# 1. Health Check
echo -n "[TEST 1/5] Checking Agency Health... "
HEALTH=$(curl -s "$BASE_URL/health")
if [[ "$HEALTH" == *"ONLINE"* ]]; then
    echo "PASS"
else
    echo "FAIL ($HEALTH)"
    exit 1
fi

# 2. Archivum Retrieval
echo -n "[TEST 2/5] Retrieving Archivum Ledger... "
LEDGER=$(curl -s "$BASE_URL/agency/archivum/ledger")
if [[ "$LEDGER" == *"["* ]]; then
    echo "PASS ($(echo $LEDGER | grep -o "id" | wc -l) entries)"
else
    echo "FAIL ($LEDGER)"
    exit 1
fi

# 3. Mission Dispatch (The Triple-Lock)
echo -n "[TEST 3/5] Dispatching Validation Mission... "
MISSION='{"mission": "Validate Bundle Integrity", "partition": "test"}'
RESULT=$(curl -s -X POST "$BASE_URL/agency/coding-commander/completions" \
    -H "Content-Type: application/json" \
    -d "$MISSION")

if [[ "$RESULT" == *"witness_hash"* ]] && [[ "$RESULT" == *"VERIFIED"* ]]; then
    echo "PASS"
else
    echo "FAIL"
    echo "$RESULT"
    exit 1
fi

# 4. Dissonance Graph
echo -n "[TEST 4/5] Fetching Dissonance Map... "
GRAPH=$(curl -s "$BASE_URL/agency/dissonance/graph")
if [[ "$GRAPH" == *"nodes"* ]] && [[ "$GRAPH" == *"edges"* ]]; then
    echo "PASS"
else
    echo "FAIL"
    exit 1
fi

# 5. CLI Proxy
echo -n "[TEST 5/7] Verifying CLI Bridge... "
CLI_RES=$(curl -s -X POST "$BASE_URL/agency/cli/execute" \
    -H "Content-Type: application/json" \
    -d '{"command": "pwd"}')
if [[ "$CLI_RES" == *"output"* ]]; then
    echo "PASS"
else
    echo "FAIL"
    exit 1
fi

# 6. Drift Monitor (The Examiner)
echo -n "[TEST 6/7] Verifying Drift Monitor (The Examiner)... "
EXAMINER_PASS=$(curl -s -X POST "$BASE_URL/agency/the-examiner/audit" \
    -H "Content-Type: application/json" \
    -d '{"observed_l_eff": 0.1386}')
if [[ "$EXAMINER_PASS" != *"PASSED"* ]]; then
    echo "FAIL (Valid L_eff audit failed)"
    exit 1
fi

# Test drift violation
EXAMINER_FAIL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/agency/the-examiner/audit" \
    -H "Content-Type: application/json" \
    -d '{"observed_l_eff": 0.1388}')
if [ "$EXAMINER_FAIL_STATUS" -ne 400 ]; then
    echo "FAIL (Expected HTTP 400 for drift violation, got $EXAMINER_FAIL_STATUS)"
    exit 1
fi
echo "PASS"

# 7. Immutability Sign-Off (The Publisher)
echo -n "[TEST 7/7] Verifying Immutability Sign-Off (The Publisher)... "
TMP_FILE="/home/multiplicity/Multiplicity/tmp/test-artifact.txt"
echo "test payload content 123" > "$TMP_FILE"

PUBLISH_RES=$(curl -s -X POST "$BASE_URL/agency/the-publisher/publish" \
    -H "Content-Type: application/json" \
    -d "{\"file_path\": \"$TMP_FILE\"}")

rm -f "$TMP_FILE"

if [[ "$PUBLISH_RES" == *"PUBLISHED"* ]] && [[ "$PUBLISH_RES" == *"recursion_hash"* ]]; then
    echo "PASS"
else
    echo "FAIL (Publication failed)"
    echo "$PUBLISH_RES"
    exit 1
fi

echo ""
echo "=== [SUCCESS] ALL ECOSYSTEM TESTS PASSED ==="

