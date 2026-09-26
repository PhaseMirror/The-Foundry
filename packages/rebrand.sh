#!/bin/bash
set -e

REPO_DIR="opencode"

if [ ! -d "$REPO_DIR" ]; then
    echo "Directory $REPO_DIR does not exist."
    exit 1
fi

echo "Starting rebrand in $REPO_DIR..."
cd "$REPO_DIR"

# Find all text files and replace opencode -> phasemirror, OpenCode -> PhaseMirror
# Using perl for inline replacement without dealing with sed macOS/Linux differences
find . -type f -not -path "*/.git/*" -not -path "*/node_modules/*" -not -name "*.png" -not -name "*.jpg" -not -name "*.ico" -exec perl -pi -e 's/OpenCode/PhaseMirror/g' {} +
find . -type f -not -path "*/.git/*" -not -path "*/node_modules/*" -not -name "*.png" -not -name "*.jpg" -not -name "*.ico" -exec perl -pi -e 's/opencode/phasemirror/g' {} +
find . -type f -not -path "*/.git/*" -not -path "*/node_modules/*" -not -name "*.png" -not -name "*.jpg" -not -name "*.ico" -exec perl -pi -e 's/opencode-ai/phasemirror-coder/g' {} +

# Rename the directory itself
cd ..
mv opencode phasemirror-cli-rebranded

echo "Rebranding complete! The repository is now available at phasemirror-cli-rebranded."
