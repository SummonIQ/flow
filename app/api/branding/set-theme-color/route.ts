import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360 * 10) / 10,
    s: Math.round(s * 100 * 10) / 10,
    l: Math.round(l * 100 * 10) / 10,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { projectName, type, color } = await request.json();

    if (!type || !color) {
      return NextResponse.json(
        { error: 'Type and color are required' },
        { status: 400 }
      );
    }

    if (type !== 'primary' && type !== 'accent') {
      return NextResponse.json(
        { error: 'Type must be either "primary" or "accent"' },
        { status: 400 }
      );
    }

    // Convert hex to HSL
    const hsl = hexToHSL(color);
    const hslString = `${hsl.h} ${hsl.s}% ${hsl.l}%`;

    // Path to globals.css
    const globalsPath = path.join(process.cwd(), 'app', 'globals.css');
    
    // Read the file
    let content = await fs.readFile(globalsPath, 'utf-8');

    if (type === 'primary') {
      // Update light mode primary
      content = content.replace(
        /--primary: oklch\([^)]+\);/,
        `--primary: oklch(${hsl.l / 100} ${hsl.s / 100} ${hsl.h});`
      );
      
      // Calculate foreground (inverted lightness)
      const fgLightness = hsl.l > 50 ? 0.2 : 0.95;
      content = content.replace(
        /--primary-foreground: oklch\([^)]+\);/,
        `--primary-foreground: oklch(${fgLightness} 0.001 106.423);`
      );

      // Update dark mode primary
      const darkMatch = content.match(/\.dark\s*\{[^}]+/s);
      if (darkMatch) {
        const darkSection = darkMatch[0];
        const updatedDarkSection = darkSection.replace(
          /--primary: oklch\([^)]+\);/,
          `--primary: oklch(${hsl.l / 100} ${hsl.s / 100} ${hsl.h});`
        );
        content = content.replace(darkSection, updatedDarkSection);
      }
    } else if (type === 'accent') {
      // Update light mode accent
      content = content.replace(
        /--accent: oklch\([^)]+\);/,
        `--accent: oklch(${hsl.l / 100} ${hsl.s / 100} ${hsl.h});`
      );

      // Calculate foreground
      const fgLightness = hsl.l > 50 ? 0.2 : 0.95;
      content = content.replace(
        /--accent-foreground: oklch\([^)]+\);/,
        `--accent-foreground: oklch(${fgLightness} 0.001 106.423);`
      );

      // Update dark mode accent
      const darkMatch = content.match(/\.dark\s*\{[^}]+/s);
      if (darkMatch) {
        const darkSection = darkMatch[0];
        const updatedDarkSection = darkSection.replace(
          /--accent: oklch\([^)]+\);/,
          `--accent: oklch(${hsl.l / 100} ${hsl.s / 100} ${hsl.h});`
        );
        content = content.replace(darkSection, updatedDarkSection);
      }
    }

    // Write the file back
    await fs.writeFile(globalsPath, content, 'utf-8');

    return NextResponse.json({ 
      success: true, 
      message: `${type} color updated to ${color}`,
      hsl: hslString 
    });
  } catch (error) {
    console.error('Error setting theme color:', error);
    return NextResponse.json(
      { error: 'Failed to set theme color' },
      { status: 500 }
    );
  }
}
