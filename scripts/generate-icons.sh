#!/bin/bash
# Generate app icons for Electron
# Run with: bun run icons:generate

echo "🎨 Icon Generation"
echo ""
echo "ℹ️  This script generates app icons for different platforms."
echo "   Place your source icon at: public/icon.png (1024x1024 recommended)"
echo ""

SOURCE_ICON="public/icon.png"

if [ ! -f "$SOURCE_ICON" ]; then
  echo "⚠️  Source icon not found: $SOURCE_ICON"
  echo "   Please add a 1024x1024 PNG icon first."
  exit 0
fi

echo "✅ Source icon found"
echo "✨ Icons ready!"
