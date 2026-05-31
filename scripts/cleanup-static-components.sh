#!/bin/bash

# Cleanup Static Component Pages
# Removes old static component pages now that we have dynamic routes

set -e

echo "🧹 Cleaning up static component pages..."
echo ""

cd "$(dirname "$0")/.."

# List of static component pages to remove
STATIC_PAGES=(
  "app/components/forms/button/page.tsx"
  "app/components/forms/input/page.tsx"
  "app/components/forms/checkbox/page.tsx"
  "app/components/forms/select/page.tsx"
  "app/components/forms/switch/page.tsx"
  "app/components/forms/textarea/page.tsx"
  "app/components/forms/label/page.tsx"
  "app/components/display/avatar/page.tsx"
  "app/components/display/badge/page.tsx"
  "app/components/display/fancy-badge/page.tsx"
  "app/components/containers/glass/page.tsx"
  "app/components/containers/page/page.tsx"
  "app/components/layout/dropdown-menu/page.tsx"
  "app/components/layout/modal/page.tsx"
  "app/components/layout/popover/page.tsx"
  "app/components/layout/collapsible/page.tsx"
  "app/components/layout/separator/page.tsx"
  "app/components/layout/responsive/page.tsx"
  "app/components/navigation/breadcrumb/page.tsx"
  "app/components/navigation/tabs/page.tsx"
  "app/components/navigation/side-nav/page.tsx"
  "app/components/navigation/menu/page.tsx"
  "app/components/data/table/page.tsx"
  "app/components/data/metadata-list/page.tsx"
  "app/components/theme/theme-toggle/page.tsx"
  "app/components/theme/theme-customizer/page.tsx"
  "app/components/media/image/page.tsx"
  "app/components/media/video/page.tsx"
  "app/components/media/icon/page.tsx"
  "app/components/backgrounds/gradient-mesh/page.tsx"
  "app/components/backgrounds/particles/page.tsx"
  "app/components/backgrounds/wave-lines/page.tsx"
  "app/components/backgrounds/aurora/page.tsx"
  "app/components/backgrounds/matrix/page.tsx"
  "app/components/backgrounds/starfield/page.tsx"
  "app/components/backgrounds/liquid-blob/page.tsx"
  "app/components/backgrounds/neural-network/page.tsx"
  "app/components/backgrounds/holographic/page.tsx"
)

# Remove static pages
for page in "${STATIC_PAGES[@]}"; do
  if [ -f "$page" ]; then
    rm "$page"
    echo "✓ Removed $page"
  fi
done

# Remove empty directories
find app/components -type d -empty -delete 2>/dev/null || true

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📝 Note: The following pages are kept:"
echo "  - app/components/page.tsx (main overview)"
echo "  - app/components/[category]/page.tsx (dynamic category pages)"
echo "  - app/components/[category]/[slug]/page.tsx (dynamic component pages with tabs)"
echo ""
echo "🚀 All components now use the dynamic tabbed interface!"





