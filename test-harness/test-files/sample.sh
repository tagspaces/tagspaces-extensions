#!/bin/bash
# Sample shell script for testing the Text Editor extension
# Demonstrates variables, functions, loops, and conditionals

set -euo pipefail

# Configuration
APP_NAME="TagSpaces"
VERSION="5.7.0"
LOG_FILE="/tmp/${APP_NAME,,}_build.log"
BUILD_DIR="./build"
EXTENSIONS=("image-viewer" "pdf-viewer" "md-editor" "text-editor" "media-player")

# Logging function
log() {
    local level="$1"
    shift
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $*" | tee -a "$LOG_FILE"
}

# Check dependencies
check_deps() {
    local deps=("node" "npm" "git")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &>/dev/null; then
            log "ERROR" "Missing dependency: $dep"
            return 1
        fi
    done
    log "INFO" "All dependencies found"
}

# Build an extension
build_extension() {
    local ext_name="$1"
    local ext_dir="./extensions/${ext_name}"

    if [[ ! -d "$ext_dir" ]]; then
        log "WARN" "Extension directory not found: $ext_dir"
        return 0
    fi

    log "INFO" "Building ${ext_name}..."
    cd "$ext_dir"
    npm install --silent 2>/dev/null
    npm run build --silent 2>/dev/null
    cd - >/dev/null

    log "INFO" "Successfully built ${ext_name}"
}

# Main build process
main() {
    log "INFO" "Starting ${APP_NAME} v${VERSION} build"

    check_deps || exit 1

    mkdir -p "$BUILD_DIR"

    local success=0
    local failed=0

    for ext in "${EXTENSIONS[@]}"; do
        if build_extension "$ext"; then
            ((success++))
        else
            ((failed++))
        fi
    done

    log "INFO" "Build complete: ${success} succeeded, ${failed} failed"

    if [[ $failed -gt 0 ]]; then
        log "WARN" "Some extensions failed to build"
        exit 1
    fi
}

main "$@"
