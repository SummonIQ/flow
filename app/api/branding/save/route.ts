import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { projectName, cssVariables, colors } = await request.json();

    if (!projectName || !cssVariables) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Path to the project's globals.css file
    // Adjust this path based on your project structure
    const globalsPath = path.join(process.cwd(), 'app', 'globals.css');

    // Read the current globals.css file
    let cssContent = await fs.readFile(globalsPath, 'utf-8');

    // Find the @theme block
    const themeRegex = /@theme\s*{([\s\S]*?)}/;
    const themeMatch = cssContent.match(themeRegex);

    if (!themeMatch) {
      return NextResponse.json(
        { message: 'Could not find @theme block in globals.css' },
        { status: 500 }
      );
    }

    let themeContent = themeMatch[1];

    // Remove existing brand color variables
    const brandColorRegex = /\/\* Brand color \d+ - #[a-f0-9]{6} \*\/\s*(--brand-\d+-[a-z]+:.*;\s*)*/gim;
    themeContent = themeContent.replace(brandColorRegex, '');

    // Find where to insert the brand colors (after existing Brand Colors comment or at the end)
    const brandColorsCommentRegex = /\/\* Brand Colors \*\//;
    const brandColorsMatch = themeContent.match(brandColorsCommentRegex);

    if (brandColorsMatch) {
      // Find the section and replace it
      const brandColorsSectionRegex = /\/\* Brand Colors \*\/([\s\S]*?)(?=\/\*|$)/;
      themeContent = themeContent.replace(
        brandColorsSectionRegex,
        `/* Brand Colors */\n${cssVariables}\n\n  `
      );
    } else {
      // Add brand colors section before State Colors or at the end
      const stateColorsRegex = /\/\* State Colors \*\//;
      if (themeContent.match(stateColorsRegex)) {
        themeContent = themeContent.replace(
          stateColorsRegex,
          `/* Brand Colors */\n${cssVariables}\n\n  /* State Colors */`
        );
      } else {
        // Add at the end before the last closing brace
        const lastVariableRegex = /(--[a-z-]+:.*;\s*)(\s*\/\*|$)/;
        themeContent = themeContent.replace(
          lastVariableRegex,
          `$1\n\n  /* Brand Colors */\n${cssVariables}\n\n  $2`
        );
      }
    }

    // Reconstruct the CSS content with updated theme
    cssContent = cssContent.replace(themeRegex, `@theme {${themeContent}}`);

    // Write back to the file
    await fs.writeFile(globalsPath, cssContent, 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Brand colors saved successfully',
      colors,
    });
  } catch (error) {
    console.error('Error saving brand colors:', error);
    return NextResponse.json(
      { message: 'Failed to save brand colors', error: String(error) },
      { status: 500 }
    );
  }
}
