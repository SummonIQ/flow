import { ComponentType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const newBackgrounds = [
  {
    slug: 'geometric-grid',
    name: 'Geometric Grid',
    description: 'Animated grid with pulsing intersections',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { GeometricGridBackground } from '@/components/backgrounds';

<GeometricGridBackground 
  gridSize={50}
  speed={2}
/>`,
    tags: ['animated', 'canvas', 'geometric'],
    order: 10,
  },
  {
    slug: 'bokeh',
    name: 'Bokeh Lights',
    description: 'Soft floating bokeh light circles',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { BokehBackground } from '@/components/backgrounds';

<BokehBackground 
  circleCount={20}
  speed={0.5}
/>`,
    tags: ['animated', 'canvas', 'ambient'],
    order: 11,
  },
  {
    slug: 'rain',
    name: 'Rain',
    description: 'Atmospheric rain effect with wind',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { RainBackground } from '@/components/backgrounds';

<RainBackground 
  dropCount={200}
  speed={15}
  wind={2}
/>`,
    tags: ['animated', 'canvas', 'weather'],
    order: 12,
  },
  {
    slug: 'confetti',
    name: 'Confetti',
    description: 'Celebratory falling confetti particles',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { ConfettiBackground } from '@/components/backgrounds';

<ConfettiBackground 
  particleCount={100}
  speed={2}
/>`,
    tags: ['animated', 'canvas', 'festive'],
    order: 13,
  },
  {
    slug: 'smoke',
    name: 'Smoke',
    description: 'Rising smoke puffs with fade effect',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { SmokeBackground } from '@/components/backgrounds';

<SmokeBackground 
  smokeCount={15}
  speed={0.5}
/>`,
    tags: ['animated', 'canvas', 'atmospheric'],
    order: 14,
  },
  {
    slug: 'lightning',
    name: 'Lightning',
    description: 'Electric lightning bolts with branching effect',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { LightningBackground } from '@/components/backgrounds';

<LightningBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'electric'],
    order: 15,
  },
  {
    slug: 'plasma',
    name: 'Plasma',
    description: 'Flowing plasma with organic movement',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { PlasmaBackground } from '@/components/backgrounds';

<PlasmaBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'organic'],
    order: 16,
  },
  {
    slug: 'nebula',
    name: 'Nebula',
    description: 'Cosmic nebula with swirling gas clouds',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { NebulaBackground } from '@/components/backgrounds';

<NebulaBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'space'],
    order: 17,
  },
  {
    slug: 'lava',
    name: 'Lava',
    description: 'Molten lava with flowing heat',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { LavaBackground } from '@/components/backgrounds';

<LavaBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'fire'],
    order: 18,
  },
  {
    slug: 'circuits',
    name: 'Circuits',
    description: 'Digital circuit board patterns',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { CircuitsBackground } from '@/components/backgrounds';

<CircuitsBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'tech'],
    order: 19,
  },
  {
    slug: 'constellation',
    name: 'Constellation',
    description: 'Star constellation with connecting lines',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { ConstellationBackground } from '@/components/backgrounds';

<ConstellationBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'space'],
    order: 20,
  },
  {
    slug: 'fireflies',
    name: 'Fireflies',
    description: 'Glowing fireflies floating in the dark',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { FirefliesBackground } from '@/components/backgrounds';

<FirefliesBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'nature'],
    order: 21,
  },
  {
    slug: 'glitch',
    name: 'Glitch',
    description: 'Digital glitch distortion effect',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { GlitchBackground } from '@/components/backgrounds';

<GlitchBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'tech'],
    order: 22,
  },
  {
    slug: 'hex',
    name: 'Hexagon Grid',
    description: 'Animated hexagonal grid pattern',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { HexBackground } from '@/components/backgrounds';

<HexBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'geometric'],
    order: 23,
  },
  {
    slug: 'voronoi',
    name: 'Voronoi',
    description: 'Organic voronoi cell pattern',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { VoronoiBackground } from '@/components/backgrounds';

<VoronoiBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'organic'],
    order: 24,
  },
  {
    slug: 'silk',
    name: 'Silk',
    description: 'Flowing silk fabric simulation',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { SilkBackground } from '@/components/backgrounds';

<SilkBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'organic'],
    order: 25,
  },
  {
    slug: 'topo',
    name: 'Topographic',
    description: 'Topographic map contour lines',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { TopoBackground } from '@/components/backgrounds';

<TopoBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'geometric'],
    order: 26,
  },
  {
    slug: 'prism',
    name: 'Prism',
    description: 'Rainbow light refraction effect',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { PrismBackground } from '@/components/backgrounds';

<PrismBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'colorful'],
    order: 27,
  },
  {
    slug: 'ribbons',
    name: 'Ribbons',
    description: 'Flowing ribbon streams',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { RibbonsBackground } from '@/components/backgrounds';

<RibbonsBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'organic'],
    order: 28,
  },
  {
    slug: 'spiral',
    name: 'Spiral',
    description: 'Hypnotic spiral vortex',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { SpiralBackground } from '@/components/backgrounds';

<SpiralBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'geometric'],
    order: 29,
  },
  {
    slug: 'warp',
    name: 'Warp',
    description: 'Space warp tunnel effect',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { WarpBackground } from '@/components/backgrounds';

<WarpBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'space'],
    order: 30,
  },
  {
    slug: 'metaballs',
    name: 'Metaballs',
    description: 'Organic blob merging effect',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { MetaballsBackground } from '@/components/backgrounds';

<MetaballsBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'organic'],
    order: 31,
  },
  {
    slug: 'moire',
    name: 'Moiré',
    description: 'Optical moiré interference pattern',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { MoireBackground } from '@/components/backgrounds';

<MoireBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'geometric'],
    order: 32,
  },
  {
    slug: 'ink',
    name: 'Ink',
    description: 'Ink spreading in water effect',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { InkBackground } from '@/components/backgrounds';

<InkBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'organic'],
    order: 33,
  },
  {
    slug: 'embers',
    name: 'Embers',
    description: 'Rising embers and sparks',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { EmbersBackground } from '@/components/backgrounds';

<EmbersBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'fire'],
    order: 34,
  },
  {
    slug: 'dunes',
    name: 'Dunes',
    description: 'Desert sand dunes landscape',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { DunesBackground } from '@/components/backgrounds';

<DunesBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'nature'],
    order: 35,
  },
  {
    slug: 'crystal',
    name: 'Crystal',
    description: 'Crystalline geometric structures',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { CrystalBackground } from '@/components/backgrounds';

<CrystalBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'geometric'],
    order: 36,
  },
  {
    slug: 'orbit',
    name: 'Orbit',
    description: 'Orbiting particles around a center',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { OrbitBackground } from '@/components/backgrounds';

<OrbitBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'space'],
    order: 37,
  },
  {
    slug: 'radar',
    name: 'Radar',
    description: 'Radar sweep scanning effect',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { RadarBackground } from '@/components/backgrounds';

<RadarBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'tech'],
    order: 38,
  },
  {
    slug: 'rings',
    name: 'Rings',
    description: 'Concentric expanding rings',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { RingsBackground } from '@/components/backgrounds';

<RingsBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'geometric'],
    order: 39,
  },
  {
    slug: 'shards',
    name: 'Shards',
    description: 'Broken glass shard fragments',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { ShardsBackground } from '@/components/backgrounds';

<ShardsBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'geometric'],
    order: 40,
  },
  {
    slug: 'cells',
    name: 'Cells',
    description: 'Organic cell division pattern',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { CellsBackground } from '@/components/backgrounds';

<CellsBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'organic'],
    order: 41,
  },
  {
    slug: 'noise',
    name: 'Noise',
    description: 'Perlin noise texture animation',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { NoiseBackground } from '@/components/backgrounds';

<NoiseBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'ambient'],
    order: 42,
  },
  {
    slug: 'grid',
    name: 'Grid',
    description: 'Infinite grid perspective',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { GridBackground } from '@/components/backgrounds';

<GridBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'geometric'],
    order: 43,
  },
  {
    slug: 'kaleido',
    name: 'Kaleidoscope',
    description: 'Kaleidoscope mirror pattern',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { KaleidoBackground } from '@/components/backgrounds';

<KaleidoBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'colorful'],
    order: 44,
  },
];

async function main() {
  console.log('Seeding new backgrounds...');

  for (const bg of newBackgrounds) {
    const existing = await prisma.component.findFirst({
      where: { slug: bg.slug, category: 'backgrounds' },
    });

    if (existing) {
      console.log(`  Skipping ${bg.name} (already exists)`);
      continue;
    }

    await prisma.component.create({
      data: {
        ...bg,
        isPublished: true,
      },
    });
    console.log(`  Created ${bg.name}`);
  }

  console.log('Done seeding new backgrounds!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
