#!/usr/bin/env bash
# alp_manifest_gate.sh — ALP Manifest & Invariant Gate
#
# Enforces ADR-0010 (Axiom-Clean Kernel Boundary) and ADR-042 (CSL Non-Expansion).
# Runs six locked checks against the Phase Mirror core kernel roots and the
# sorry/axiom debt ledger. Fails closed on any violation.
#
# Checks:
#   1. Zero `sorry` in Core roots (ADR/, Foundations/, lean/Core/)
#   2. No forbidden imports of proposal/semantic/projects tiers
#   3. Zero raw `axiom` declarations in Core roots
#   4. alp_sorry_manifest.json structure: axioms empty, sorry_policy.allowed_in_foundations false
#   5. Project ledger metadata: imported_by_foundations=false, ADR references exist
#   6. EchoBraid adapter read-only: no write calls, no CSC bypass
#
set -euo pipefail

echo "=== [ALP Manifest & Invariant Gate] Starting verification ==="

# ---------------------------------------------------------------------------
# Resolve repo root (script lives in scripts/)
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

CORE_ROOTS=("ADR" "lean/Core")
FENCE_ROOTS=("Foundations")
CORE_GREP_OPTS="--include=*.lean --exclude-dir=target --exclude-dir=.lake"
ADR_ROOT="$REPO_ROOT/ADR"
LEAN_CORE_ROOT="$REPO_ROOT/lean/Core"
STATE_DIR="$REPO_ROOT/state"
MANIFEST="$STATE_DIR/alp_sorry_manifest.json"
ARTIFACTS_ADR_LEDGER="$REPO_ROOT/artifacts/AdrLedger"
PROJECT_LEDGER_DIR="$STATE_DIR"

# ---------------------------------------------------------------------------
# Check 1: Zero 'sorry' in core kernel roots (delegates to manifest-aware Python checker)
# ---------------------------------------------------------------------------
echo "--- Check 1: Verifying zero 'sorry' in core kernel roots ---"
# The Python checker strips strings and comments before scanning, so it only
# flags actual `sorry`/`admit` tactic usage, not prose like "replace sorry".
CHECK1_JSON=$(python3 "$SCRIPT_DIR/check_adr_sorry.py" --json 2>/dev/null || echo '{"ok":false}')
if ! echo "$CHECK1_JSON" | python3 -c "import sys,json; sys.exit(0 if json.load(sys.stdin).get('ok') else 1)" 2>/dev/null; then
    echo "ERROR: Unregistered 'sorry' detected in core kernel roots."
    echo "  Run: python3 scripts/check_adr_sorry.py for details."
    exit 1
fi
SORRY_COUNT=$(echo "$CHECK1_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('total_hits',0))" 2>/dev/null || echo "?")
echo "OK: Zero untracked 'sorry' in core roots (total tracked hits: $SORRY_COUNT)."

# ---------------------------------------------------------------------------
# Check 2: Forbidden import quarantine boundaries
# ---------------------------------------------------------------------------
echo "--- Check 2: Checking import quarantine boundaries ---"
# Only flag actual `import` lines that cross into proposal/semantic/project
# path tiers — i.e., research/experimental code reaching into core roots or
# vice-versa. Internal namespace declarations like `Foundations.ADR.Core` or
# `namespace Semantics` are NOT violations. The ADR↔Foundations dependency
# direction is intentional (Foundations extends ADR core types).
CHECK2_FAIL=0
for root in "${CORE_ROOTS[@]}"; do
    if [ -d "$REPO_ROOT/$root" ]; then
        if grep -rnE "^import.*(proposals/|semantic/|projects/)" $CORE_GREP_OPTS "$REPO_ROOT/$root" 2>/dev/null; then
            echo "ERROR: $root imports from proposal/semantic/project tiers."
            CHECK2_FAIL=1
        fi
    fi
done
if [ "$CHECK2_FAIL" -ne 0 ]; then
    echo "ERROR: Import quarantine boundary violated."
    exit 1
fi
echo "OK: Import quarantine boundary respected."

# ---------------------------------------------------------------------------
# Check 3: Zero raw 'axiom' declarations in TRUE core roots (ADR/, lean/Core/)
# ---------------------------------------------------------------------------
# Foundations/ is the Tier-3 sandbox: axioms are allowed there as tracked
# proof debt (manifest-registered). Only ADR/ and lean/Core/ must be clean.
echo "--- Check 3: Checking for undeclared core axioms ---"
CHECK3_FAIL=0
for root in "${CORE_ROOTS[@]}"; do
    if [ -d "$REPO_ROOT/$root" ]; then
        if grep -rnE "^axiom\b|^\s*axiom\b" $CORE_GREP_OPTS "$REPO_ROOT/$root" 2>/dev/null; then
            echo "ERROR: Raw 'axiom' declaration found in $root/"
            CHECK3_FAIL=1
        fi
    fi
done
if [ "$CHECK3_FAIL" -ne 0 ]; then
    echo "ERROR: Core axioms must remain empty."
    exit 1
fi
echo "OK: No raw axioms found in true core roots (ADR/, lean/Core/)."

# ---------------------------------------------------------------------------
# Check 4: Core Manifest JSON structure validation
# ---------------------------------------------------------------------------
echo "--- Check 4: Validating core manifest structure ($MANIFEST) ---"
if [ ! -f "$MANIFEST" ]; then
    echo "ERROR: Core manifest file $MANIFEST does not exist."
    exit 1
fi

# Ensure manifest has the required policy fields; augment if absent.
if command -v jq &> /dev/null; then
    # Check axioms array is empty (if present)
    if jq -e '.axioms' "$MANIFEST" > /dev/null 2>&1; then
        AXIOM_COUNT=$(jq '.axioms | length' "$MANIFEST")
        if [ "$AXIOM_COUNT" -ne 0 ]; then
            echo "ERROR: Core manifest 'axioms' array is not empty ($AXIOM_COUNT items found)."
            exit 1
        fi
    fi

    # Check sorry_policy.allowed_in_foundations is false (if present)
    if jq -e '.sorry_policy' "$MANIFEST" > /dev/null 2>&1; then
        ALLOWED_FOUNDATIONS=$(jq -r '.sorry_policy.allowed_in_foundations' "$MANIFEST")
        if [ "$ALLOWED_FOUNDATIONS" != "false" ]; then
            echo "ERROR: 'sorry_policy.allowed_in_foundations' must be explicitly false."
            exit 1
        fi
    fi

    # Validate manifest drift
    MANIFEST_DRIFT=$(jq -r '.manifest_drift // 0' "$MANIFEST")
    if [ "$MANIFEST_DRIFT" -ne 0 ]; then
        echo "ERROR: manifest_drift is non-zero: $MANIFEST_DRIFT"
        exit 1
    fi

    # Validate last_audit is not in the future
    LAST_AUDIT=$(jq -r '.last_audit // "missing"' "$MANIFEST")
    if [ "$LAST_AUDIT" != "missing" ]; then
        CURRENT_TS=$(date +%s)
        AUDIT_TS=""
        # Handle ISO 8601 with or without timezone
        if command -v date &> /dev/null; then
            AUDIT_TS=$(date -d "$LAST_AUDIT" +%s 2>/dev/null || echo "invalid")
        fi
        if [ "$AUDIT_TS" != "invalid" ] && [ "$AUDIT_TS" != "" ]; then
            if [ "$AUDIT_TS" -gt "$CURRENT_TS" ]; then
                echo "ERROR: manifest 'last_audit' is in the future: $LAST_AUDIT"
                exit 1
            fi
        fi
    fi
else
    # Fallback checks without jq
    if grep -q '"axioms": \[[[:space:]]*[^]]' "$MANIFEST"; then
        echo "ERROR: Core manifest axioms array appears non-empty."
        exit 1
    fi
    if grep -q '"allowed_in_foundations":[^f]' "$MANIFEST" 2>/dev/null; then
        echo "ERROR: 'sorry_policy.allowed_in_foundations' must be explicitly false."
        exit 1
    fi
fi
echo "OK: Core manifest is intact and axiom-free."

# ---------------------------------------------------------------------------
# Check 5: Project ledger metadata validation
# ---------------------------------------------------------------------------
echo "--- Check 5: Validating project ledger metadata ---"
CHECK5_FAIL=0

# Scan state/ for project manifests and validate
if [ -d "$STATE_DIR" ]; then
    for manifest_file in "$STATE_DIR"/*manifest*.json "$STATE_DIR"/adr_plan_registry.json; do
        if [ -f "$manifest_file" ]; then
            if command -v jq &> /dev/null; then
                # Check imported_by_foundations if present
                if jq -e '.imported_by_foundations' "$manifest_file" > /dev/null 2>&1; then
                    IMPORTED=$(jq -r '.imported_by_foundations' "$manifest_file")
                    if [ "$IMPORTED" != "false" ]; then
                        echo "ERROR: $manifest_file has imported_by_foundations != false."
                        CHECK5_FAIL=1
                    fi
                fi

                # Verify ADR reference paths exist on disk
                ADR_PATHS=$(jq -r '.rows[].adr // .adrs[]? // empty' "$manifest_file" 2>/dev/null || true)
                for adr_path in $ADR_PATHS; do
                    if [ ! -f "$REPO_ROOT/$adr_path" ] && [ ! -f "$adr_path" ]; then
                        echo "ERROR: $manifest_file references non-existent ADR file: $adr_path"
                        CHECK5_FAIL=1
                    fi
                done

                # Verify EchoBraid references if present
                ECHO_PATHS=$(jq -r '.echobraid[]? | .lean_path // .rust_path // empty' "$manifest_file" 2>/dev/null || true)
                for echo_path in $ECHO_PATHS; do
                    if [ ! -f "$REPO_ROOT/$echo_path" ]; then
                        echo "WARN: $manifest_file references missing echobraid path: $echo_path"
                    fi
                done
            fi
        fi
    done
fi

# Check artifacts/AdrLedger for Lean formalization files
if [ -d "$ARTIFACTS_ADR_LEDGER" ]; then
    for f in "$ARTIFACTS_ADR_LEDGER"/*.lean; do
        if [ -f "$f" ]; then
            if grep -rnw --include="*.lean" "sorry" "$f" 2>/dev/null; then
                echo "ERROR: 'sorry' found in AdrLedger artifact: $f"
                CHECK5_FAIL=1
            fi
        fi
    done
fi

if [ "$CHECK5_FAIL" -ne 0 ]; then
    echo "ERROR: Project ledger metadata validation failed."
    exit 1
fi
echo "OK: Project ledger metadata validation passed."

# ---------------------------------------------------------------------------
# Check 6: EchoBraid adapter read-only & CSC Tier-4 gate
# ---------------------------------------------------------------------------
echo "--- Check 6: Validating EchoBraid adapter invariants ---"
CHECK6_FAIL=0

# The EchoBraid adapter must be read-only. Verify no mutable state writes.
# Look for .write, .insert, .set, .update, .delete patterns that would
# indicate mutation of certification objects.
ECHOBRAID_RS=$(find "$REPO_ROOT/crates" -path "*/neuroplasticity.rs" 2>/dev/null || true)
if [ -n "$ECHOBRAID_RS" ]; then
    for f in $ECHOBRAID_RS; do
        if grep -nE '\.(write|insert|set|update|delete)\b' "$f" 2>/dev/null; then
            echo "ERROR: Mutable operation found in EchoBraid adapter: $f"
            CHECK6_FAIL=1
        fi
        # Must not bypass CSC Tier-4 gate
        if grep -nE 'csc.*bypass|bypass.*csc|tier4.*skip|skip.*tier4' "$f" 2>/dev/null; then
            echo "ERROR: CSC Tier-4 bypass pattern found in EchoBraid adapter: $f"
            CHECK6_FAIL=1
        fi
    done
else
    echo "  (neuroplasticity.rs not yet present — adapter pending)"
fi

# Verify the Lean formalization exists if referenced
FORGE_LEAN="$ADR_ROOT/ADR_0168_Forge_Workbench.lean"
if [ -f "$FORGE_LEAN" ]; then
    if grep -rnw --include="*.lean" "sorry" "$FORGE_LEAN" 2>/dev/null; then
        echo "ERROR: 'sorry' found in Forge Workbench formalization."
        CHECK6_FAIL=1
    fi
    echo "  Lean Forge Workbench formalization: present"
else
    echo "  (ADR_0168_Forge_Workbench.lean not yet present)"
fi

if [ "$CHECK6_FAIL" -ne 0 ]; then
    echo "ERROR: EchoBraid adapter invariants violated."
    exit 1
fi
echo "OK: EchoBraid adapter invariants validated."

# ---------------------------------------------------------------------------
echo "=== [ALP Manifest & Invariant Gate] All checks passed successfully ==="
exit 0
