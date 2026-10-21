#!/usr/bin/env bash
# Copy the Assistant Team Starter Kit (buyer files only) into private/assistant-kit/, which /api/download zips per buyer.
# Usage: bash scripts/sync-assistant-kit.sh [kit source]   (default /workspace/products/assistant-setup-kit)
# Rebuild the guide first: node /workspace/products/assistant-setup-kit/scripts/build-guide.mjs
set -euo pipefail
SRC="${1:-/workspace/products/assistant-setup-kit}"
DEST="$(cd "$(dirname "$0")/.." && pwd)/private/assistant-kit"
[ -f "$SRC/README.md" ] && [ -f "$SRC/GUIDE.pdf" ] || { echo "missing README.md or GUIDE.pdf in $SRC"; exit 1; }
rm -rf "$DEST"; mkdir -p "$DEST"
( cd "$SRC" && tar --exclude=./scripts --exclude=./node_modules --exclude='*.zip' --exclude=.DS_Store -cf - . ) | ( cd "$DEST" && tar -xf - )
echo "synced $SRC -> private/assistant-kit/ ($(find "$DEST" -type f | wc -l) files)"
