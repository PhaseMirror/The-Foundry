#!/bin/bash
# Multiplic cPanel Deployment Scaffold
# Usage: bash infra/cpanel/deploy.sh

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Project root is two levels up from infra/cpanel/
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../" && pwd)"

ARTIFACT_DIR="$PROJECT_ROOT/deploy_artifacts"
CONFIG_FILE="$PROJECT_ROOT/multiplic.json"

echo "Using Project Root: $PROJECT_ROOT"

# Check for multiplic.json
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: $CONFIG_FILE not found at $CONFIG_FILE"
    exit 1
fi

# Prepare artifact directory and local tmp
mkdir -p "$ARTIFACT_DIR"
mkdir -p "$PROJECT_ROOT/.tmp"
export TMPDIR="$PROJECT_ROOT/.tmp"

echo "Using Project Root: $PROJECT_ROOT"
echo "Using Local TMPDIR: $TMPDIR"
SITES=$(jq -c '.sites[]' "$CONFIG_FILE")

for SITE in $SITES; do
    NAME=$(echo "$SITE" | jq -r '.name')
    DIR=$(echo "$SITE" | jq -r '.path')
    
    echo "--- Building site: $NAME ---"
    
    # Path to the site directory
    SITE_FULL_PATH="$PROJECT_ROOT/$DIR"
    
    if [ ! -d "$SITE_FULL_PATH" ]; then
        echo "Warning: Site directory $SITE_FULL_PATH not found. Skipping."
        continue
    fi

    pushd "$SITE_FULL_PATH" > /dev/null
    
    # Perform build
    echo "Running npm install..."
    npm install --silent
    echo "Running npm run build..."
    npm run build
    
    # Prepare artifact
    TMP_DIR="$ARTIFACT_DIR/$NAME"
    mkdir -p "$TMP_DIR"
    
    if [ -d "dist" ]; then
        # Check for nested Angular/Vite structures
        if [ -d "dist/app/browser" ]; then
            # Angular 17+ SSR/Prerender pattern
            cp -r dist/app/browser/* "$TMP_DIR/"
        elif [ -d "dist/$NAME/browser" ]; then
             # Standard Angular nested pattern
            cp -r dist/"$NAME"/browser/* "$TMP_DIR/"
        elif [ -d "dist/$NAME" ]; then
            # Common Vite/other nested pattern
            cp -r dist/"$NAME"/* "$TMP_DIR/"
        else
            # Default: copy everything from dist
            cp -r dist/* "$TMP_DIR/"
        fi
    else
        echo "Error: Build failed to produce a 'dist' directory for $NAME"
        popd > /dev/null
        continue
    fi
    
    # Inject cPanel specifics
    cp "$SCRIPT_DIR/proxy.php" "$TMP_DIR/"
    cp "$SCRIPT_DIR/.htaccess.template" "$TMP_DIR/.htaccess"
    
    # Zip it up
    cd "$ARTIFACT_DIR"
    echo "Creating zip artifact..."
    zip -r -q "${NAME}_deploy.zip" "$NAME"
    rm -rf "$NAME"
    
    popd > /dev/null
    
    echo "Artifact created: $ARTIFACT_DIR/${NAME}_deploy.zip"
done

echo "Deployment scaffold complete."
