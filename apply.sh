#!/usr/bin/env bash
# =====================================================
# apply.sh — installs the painterly UI update into ../lang_game
#
# Run from inside this folder (lang_game_v2/):
#   bash apply.sh
#
# Or pass a custom target:
#   bash apply.sh /path/to/lang_game
# =====================================================
set -euo pipefail

TARGET="${1:-../lang_game}"

if [ ! -d "$TARGET" ]; then
  echo "✗ Target not found: $TARGET"
  echo "  Pass a path:  bash apply.sh /path/to/lang_game"
  exit 1
fi

echo "→ Updating $TARGET"

# 1. Copy new + replacement files
echo "  • index.html"
cp index.html "$TARGET/index.html"

echo "  • src/App.jsx"
cp src/App.jsx "$TARGET/src/App.jsx"
echo "  • src/App.css"
cp src/App.css "$TARGET/src/App.css"
echo "  • src/App.test.jsx"
cp src/App.test.jsx "$TARGET/src/App.test.jsx"

mkdir -p "$TARGET/src/components"
for f in GameDisplay.jsx GameDisplay.test.jsx Painterly.jsx Scenery.jsx Celebrations.jsx Transitions.jsx; do
  echo "  • src/components/$f"
  cp "src/components/$f" "$TARGET/src/components/$f"
done

# 2. Remove stale exploration files (lowercase shadows of new files + leftovers)
echo "→ Removing stale files"
for f in \
  "$TARGET/src/components/celebrations.jsx" \
  "$TARGET/src/components/transitions.jsx" \
  "$TARGET/src/components/shared.jsx" \
  "$TARGET/src/components/ui-shells.jsx" \
; do
  if [ -f "$f" ]; then
    echo "  • rm $f"
    rm "$f"
  fi
done

echo ""
echo "✓ Done. Now run:"
echo "    cd $TARGET && npm install && npm run dev"
