#!/usr/bin/env bash
# Refresh the playable demos: copy each game's built dist/ into public/play/<genre>/.
# Usage: bash scripts/sync-demos.sh [path-to-prompt-tests]   (default /workspace/prompt-tests)
# Each game must be built with Vite `base: './'` so it works from a subfolder.
set -euo pipefail
SRC="${1:-/workspace/prompt-tests}"
DEST="$(cd "$(dirname "$0")/.." && pwd)/public/play"
# <demo folder on site>:<source project folder>
# Core Keepers (towerdefense-ck) is NOT synced here: it is the email-gated demo in private/core-keepers/.
MAP="platformer:platformer roguelite:roguelite idle:idle runner:runner puzzle:puzzle"
for pair in $MAP; do
  demo="${pair%%:*}"; proj="${pair#*:}"
  if [ -f "$SRC/$proj/dist/index.html" ]; then
    rm -rf "$DEST/$demo"; mkdir -p "$DEST/$demo"
    cp -R "$SRC/$proj/dist/." "$DEST/$demo/"
    echo "synced $proj/dist -> public/play/$demo/"
  else
    echo "skip $demo: $SRC/$proj/dist/index.html not found (run npm run build in that project)"
  fi
done
echo "Now run: npm run build"
