# SummonIQ Orchestrator Icons

## Quick Icon Generation

To generate icons from the SVG logo:

### Option 1: Using librsvg (Recommended)
```bash
# Install librsvg
brew install librsvg

# Run the generation script
./scripts/generate-icons.sh
```

### Option 2: Using online converter
1. Open `/public/logo.svg` in a browser
2. Use an online SVG to PNG converter (e.g., https://svgtopng.com/)
3. Export at these sizes: 16, 32, 64, 128, 256, 512, 1024
4. Save them in this directory as `icon-{size}.png`

### Option 3: Using Figma/Sketch
1. Import `/public/logo.svg`
2. Export as PNG at the required sizes
3. Save in this directory

## Required Icon Sizes

- `icon-16.png` - 16x16px
- `icon-32.png` - 32x32px  
- `icon-64.png` - 64x64px
- `icon-128.png` - 128x128px
- `icon-256.png` - 256x256px
- `icon-512.png` - 512x512px
- `icon-1024.png` - 1024x1024px
- `icon.icns` - macOS icon bundle (generated from PNGs)

## Current Status

Using a placeholder icon until proper icons are generated.
