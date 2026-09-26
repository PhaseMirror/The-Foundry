#!/bin/bash
# ADR Linter for Ataraxia ecosystem
# Checks for ADR naming convention and mandatory metadata headers.

EXIT_CODE=0
ADR_DIRS=(
    "models/ataraxia/docs/adr/accepted"
    "models/ataraxia/docs/adr/proposed"
    "models/ataraxia/crates/echo-kernel/adr-kernel-rs/docs/adr"
    "models/ataraxia/crates/umc-parom/docs/adrs"
    "models/ataraxia/apps/microsoft-agt-rust/architecture"
)

echo "🔍 Linting Ataraxia ADRs..."

for dir in "${ADR_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        continue
    fi

    echo "Checking directory: $dir"
    for file in "$dir"/ADR-*.md; do
        if [ ! -e "$file" ]; then
            continue
        fi

        filename=$(basename "$file")
        
        # Skip indices and readmes
        if [[ "$filename" == "README.md" || "$filename" == "ADR-INDEX.md" ]]; then
            continue
        fi
        
        # 1. Check Naming Convention: ADR-{SCOPE}-{ID}-{SLUG}.md
        if [[ ! "$filename" =~ ^ADR-[A-Z0-9]+-[0-9]{3}-.+\.md$ ]]; then
            echo "❌ Invalid naming format: $filename (Expected ADR-{SCOPE}-{ID}-{SLUG}.md)"
            EXIT_CODE=1
        fi

        # 2. Check for Mandatory Metadata (Status and Date)
        # Supports both "- Status: " and "**Status:**" or just "Status: "
        if ! grep -qiE "(status|date):" "$file"; then
             echo "❌ Missing basic metadata in $filename"
             EXIT_CODE=1
        fi
        
        if ! grep -qi "status:" "$file"; then
            echo "❌ Missing Status in $filename"
            EXIT_CODE=1
        fi
        
        if ! grep -qi "date:" "$file"; then
            echo "❌ Missing Date in $filename"
            EXIT_CODE=1
        fi

        # 3. Check Constitutional References (only for spoke ADRs)
        if [[ "$filename" =~ ^ADR-(ECHO|UMC|AGT|CLI|MATH|ALP|WIT|SIG|WF|PROF|INT|GTM|MCP)-[0-9]{3}-.+\.md$ ]]; then
            # We don't strictly require Constitutional-Refs yet, but if they exist, validate them.
            # Actually, the directive is to make them mandatory for execution-critical ADRs.
            # For now, let's validate existence and status if present.
            refs=$(grep "^- Constitutional-Refs:" "$file" | cut -d: -f2- | tr -d ' ' | tr ',' '\n')
            for ref in $refs; do
                if [ -z "$ref" ]; then continue; fi
                
                # Search for the reference file in the known ADR directories
                ref_file=""
                for search_dir in "${ADR_DIRS[@]}"; do
                    # Match by exact filename or by prefix (e.g. ADR-AHGI-003)
                    found=$(find "$search_dir" -name "${ref}.md" -o -name "${ref}-*.md" 2>/dev/null | head -1)
                    if [ -n "$found" ]; then
                        ref_file="$found"
                        break
                    fi
                done

                if [ -z "$ref_file" ]; then
                    echo "❌ $filename references $ref which does not exist in any ADR directory."
                    EXIT_CODE=1
                else
                    ref_status=$(grep -i "^- Status:" "$ref_file" | cut -d: -f2- | tr -d ' ' | tr '[:upper:]' '[:lower:]')
                    if [[ "$ref_status" == "deprecated" || "$ref_status" == "superseded" || "$ref_status" == "rejected" ]]; then
                        echo "❌ $filename references non-active ADR $ref (Status: $ref_status)"
                        EXIT_CODE=1
                    fi
                fi
            done
        fi
    done
done

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ All ADRs pass validation!"
else
    echo "❌ ADR validation failed."
fi

exit $EXIT_CODE
