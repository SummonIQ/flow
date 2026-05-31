import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { promises as fs } from 'fs';
import path from 'path';

// Map slug to source file name for backgrounds
const backgroundFileMap: Record<string, string> = {
  aurora: 'aurora-background.tsx',
  bokeh: 'bokeh-background.tsx',
  cells: 'cells-background.tsx',
  circuits: 'circuits-background.tsx',
  confetti: 'confetti-background.tsx',
  constellation: 'constellation-background.tsx',
  crystal: 'crystal-background.tsx',
  dunes: 'dunes-background.tsx',
  embers: 'embers-background.tsx',
  fireflies: 'fireflies-background.tsx',
  'geometric-grid': 'geometric-grid-background.tsx',
  glitch: 'glitch-background.tsx',
  'gradient-mesh': 'gradient-mesh-background.tsx',
  grid: 'grid-background.tsx',
  hex: 'hex-background.tsx',
  holographic: 'holographic-background.tsx',
  ink: 'ink-background.tsx',
  kaleido: 'kaleido-background.tsx',
  lava: 'lava-background.tsx',
  lightning: 'lightning-background.tsx',
  'liquid-blob': 'liquid-blob-background.tsx',
  'matrix-rain': 'matrix-background.tsx',
  metaballs: 'metaballs-background.tsx',
  moire: 'moire-background.tsx',
  nebula: 'nebula-background.tsx',
  'neural-network': 'neural-network-background.tsx',
  noise: 'noise-background.tsx',
  orbit: 'orbit-background.tsx',
  particles: 'particle-background.tsx',
  plasma: 'plasma-background.tsx',
  prism: 'prism-background.tsx',
  radar: 'radar-background.tsx',
  rain: 'rain-background.tsx',
  ribbons: 'ribbons-background.tsx',
  rings: 'rings-background.tsx',
  shards: 'shards-background.tsx',
  silk: 'silk-background.tsx',
  smoke: 'smoke-background.tsx',
  spiral: 'spiral-background.tsx',
  starfield: 'starfield-background.tsx',
  topo: 'topo-background.tsx',
  voronoi: 'voronoi-background.tsx',
  warp: 'warp-background.tsx',
  'wave-lines': 'wave-lines-background.tsx',
  waves: 'waves-background.tsx',
};

async function getSourceCode(
  category: string,
  slug: string,
): Promise<string | null> {
  try {
    if (category === 'backgrounds') {
      const fileName = backgroundFileMap[slug];
      if (!fileName) return null;

      const filePath = path.join(
        process.cwd(),
        'components',
        'backgrounds',
        fileName,
      );
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    }
    return null;
  } catch {
    return null;
  }
}

// GET - Fetch a single component by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const component = await prisma.component.findUnique({
      where: { slug },
      include: {
        revisions: {
          where: { status: 'ACCEPTED' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 },
      );
    }

    // If there's an accepted revision, use its code
    if (component.revisions.length > 0) {
      component.code = component.revisions[0].code;
    }

    // Fetch actual source code for the component
    const sourceCode = await getSourceCode(component.category, slug);

    return NextResponse.json({
      ...component,
      sourceCode,
    });
  } catch (error) {
    console.error('Error fetching component:', error);
    return NextResponse.json(
      { error: 'Failed to fetch component' },
      { status: 500 },
    );
  }
}

