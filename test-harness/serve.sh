#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXTENSIONS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$SCRIPT_DIR"
echo "Generating registry..."
node generate-registry.js
echo ""

# Serve from the extensions directory
cd "$EXTENSIONS_DIR"
echo "Serving at http://localhost:8080/test-harness/index.html"
python3 -m http.server 8080
