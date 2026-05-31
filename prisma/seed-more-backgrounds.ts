import { ComponentType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const moreBackgrounds = [
  {
    slug: 'aurora',
    name: 'Aurora',
    description: 'Northern lights dancing across the sky',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { AuroraBackground } from '@/components/backgrounds';

<AuroraBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'nature'],
    order: 45,
  },
  {
    slug: 'waves-ocean',
    name: 'Ocean Waves',
    description: 'Gentle ocean waves rolling effect',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { OceanWavesBackground } from '@/components/backgrounds';

<OceanWavesBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'nature'],
    order: 46,
  },
  {
    slug: 'matrix',
    name: 'Matrix Rain',
    description: 'Classic digital rain falling code effect',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { MatrixBackground } from '@/components/backgrounds';

<MatrixBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'canvas', 'tech'],
    order: 47,
  },
  {
    slug: 'fractal-tree',
    name: 'Fractal Tree',
    description: 'Growing fractal tree branches',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { FractalTreeBackground } from '@/components/backgrounds';

<FractalTreeBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'canvas', 'organic'],
    order: 48,
  },
  {
    slug: 'bubbles',
    name: 'Bubbles',
    description: 'Floating soap bubbles with refraction',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { BubblesBackground } from '@/components/backgrounds';

<BubblesBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'playful'],
    order: 49,
  },
  {
    slug: 'starfield',
    name: 'Starfield',
    description: 'Traveling through a starfield at warp speed',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { StarfieldBackground } from '@/components/backgrounds';

<StarfieldBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'canvas', 'space'],
    order: 50,
  },
  {
    slug: 'gradient-mesh',
    name: 'Gradient Mesh',
    description: 'Smooth animated gradient mesh blending',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { GradientMeshBackground } from '@/components/backgrounds';

<GradientMeshBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'colorful'],
    order: 51,
  },
  {
    slug: 'ripple',
    name: 'Ripple',
    description: 'Water ripple effect on mouse interaction',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { RippleBackground } from '@/components/backgrounds';

<RippleBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'interactive'],
    order: 52,
  },
  {
    slug: 'dots-wave',
    name: 'Dot Wave',
    description: 'Grid of dots creating wave patterns',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { DotWaveBackground } from '@/components/backgrounds';

<DotWaveBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'canvas', 'geometric'],
    order: 53,
  },
  {
    slug: 'terrain',
    name: 'Terrain',
    description: '3D procedural terrain flyover',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { TerrainBackground } from '@/components/backgrounds';

<TerrainBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'nature'],
    order: 54,
  },
  {
    slug: 'snow',
    name: 'Snow',
    description: 'Gentle snowfall with wind effect',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { SnowBackground } from '@/components/backgrounds';

<SnowBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'canvas', 'weather'],
    order: 55,
  },
  {
    slug: 'northern-lights',
    name: 'Northern Lights',
    description: 'Vibrant aurora borealis simulation',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { NorthernLightsBackground } from '@/components/backgrounds';

<NorthernLightsBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'colorful'],
    order: 56,
  },
  {
    slug: 'cubefield',
    name: 'Cube Field',
    description: 'Rotating 3D cube field',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { CubeFieldBackground } from '@/components/backgrounds';

<CubeFieldBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'geometric'],
    order: 57,
  },
  {
    slug: 'liquid',
    name: 'Liquid',
    description: 'Liquid metal morphing effect',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { LiquidBackground } from '@/components/backgrounds';

<LiquidBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'organic'],
    order: 58,
  },
  {
    slug: 'particles-attract',
    name: 'Particle Attract',
    description: 'Particles attracted to mouse cursor',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { ParticleAttractBackground } from '@/components/backgrounds';

<ParticleAttractBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'canvas', 'interactive'],
    order: 59,
  },
  {
    slug: 'clouds',
    name: 'Clouds',
    description: 'Drifting volumetric clouds',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { CloudsBackground } from '@/components/backgrounds';

<CloudsBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'nature'],
    order: 60,
  },
  {
    slug: 'electric-field',
    name: 'Electric Field',
    description: 'Pulsing electric field lines',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { ElectricFieldBackground } from '@/components/backgrounds';

<ElectricFieldBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'electric'],
    order: 61,
  },
  {
    slug: 'morphing-blobs',
    name: 'Morphing Blobs',
    description: 'Colorful blobs morphing into each other',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { MorphingBlobsBackground } from '@/components/backgrounds';

<MorphingBlobsBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'organic'],
    order: 62,
  },
  {
    slug: 'geometric-tunnel',
    name: 'Geometric Tunnel',
    description: 'Flying through a geometric tunnel',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { GeometricTunnelBackground } from '@/components/backgrounds';

<GeometricTunnelBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'geometric'],
    order: 63,
  },
  {
    slug: 'neon-lines',
    name: 'Neon Lines',
    description: 'Glowing neon line animations',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { NeonLinesBackground } from '@/components/backgrounds';

<NeonLinesBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'canvas', 'colorful'],
    order: 64,
  },
  {
    slug: 'galaxy',
    name: 'Galaxy',
    description: 'Rotating spiral galaxy',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { GalaxyBackground } from '@/components/backgrounds';

<GalaxyBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'space'],
    order: 65,
  },
  {
    slug: 'pulse-grid',
    name: 'Pulse Grid',
    description: 'Grid with pulsing wave propagation',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { PulseGridBackground } from '@/components/backgrounds';

<PulseGridBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'canvas', 'geometric'],
    order: 66,
  },
  {
    slug: 'sunburst',
    name: 'Sunburst',
    description: 'Radiating sun rays effect',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { SunburstBackground } from '@/components/backgrounds';

<SunburstBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'colorful'],
    order: 67,
  },
  {
    slug: 'ascii',
    name: 'ASCII Art',
    description: 'Animated ASCII character patterns',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { AsciiBackground } from '@/components/backgrounds';

<AsciiBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'canvas', 'tech'],
    order: 68,
  },
  {
    slug: 'fluid-sim',
    name: 'Fluid Simulation',
    description: 'Interactive fluid dynamics simulation',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { FluidSimBackground } from '@/components/backgrounds';

<FluidSimBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'interactive'],
    order: 69,
  },
  {
    slug: 'vortex',
    name: 'Vortex',
    description: 'Swirling vortex tunnel effect',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { VortexBackground } from '@/components/backgrounds';

<VortexBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'geometric'],
    order: 70,
  },
  {
    slug: 'pixelate',
    name: 'Pixelate',
    description: 'Retro pixelated animation effect',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { PixelateBackground } from '@/components/backgrounds';

<PixelateBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'canvas', 'retro'],
    order: 71,
  },
  {
    slug: 'caustics',
    name: 'Caustics',
    description: 'Underwater light caustic patterns',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { CausticsBackground } from '@/components/backgrounds';

<CausticsBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'nature'],
    order: 72,
  },
  {
    slug: 'mesh-gradient',
    name: 'Mesh Gradient',
    description: 'Smooth animated mesh gradient',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { MeshGradientBackground } from '@/components/backgrounds';

<MeshGradientBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'colorful'],
    order: 73,
  },
  {
    slug: 'starburst',
    name: 'Starburst',
    description: 'Radiating starburst rays',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { StarburstBackground } from '@/components/backgrounds';

<StarburstBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'canvas', 'colorful'],
    order: 74,
  },
  {
    slug: 'synthwave',
    name: 'Synthwave',
    description: 'Retro 80s synthwave grid',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { SynthwaveBackground } from '@/components/backgrounds';

<SynthwaveBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'retro'],
    order: 75,
  },
  {
    slug: 'firewall',
    name: 'Firewall',
    description: 'Digital firewall visualization',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { FirewallBackground } from '@/components/backgrounds';

<FirewallBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'canvas', 'tech'],
    order: 76,
  },
  {
    slug: 'leaves',
    name: 'Falling Leaves',
    description: 'Gentle falling autumn leaves',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { LeavesBackground } from '@/components/backgrounds';

<LeavesBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'canvas', 'nature'],
    order: 77,
  },
  {
    slug: 'network-graph',
    name: 'Network Graph',
    description: 'Connected network nodes visualization',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { NetworkGraphBackground } from '@/components/backgrounds';

<NetworkGraphBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'canvas', 'tech'],
    order: 78,
  },
  {
    slug: 'diamonds',
    name: 'Diamonds',
    description: 'Sparkling diamond pattern',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { DiamondsBackground } from '@/components/backgrounds';

<DiamondsBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'geometric'],
    order: 79,
  },
  {
    slug: 'wave-interference',
    name: 'Wave Interference',
    description: 'Overlapping wave interference patterns',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { WaveInterferenceBackground } from '@/components/backgrounds';

<WaveInterferenceBackground variant={1} mouse={{ x: 0, y: 0 }} />`,
    tags: ['animated', 'webgl', 'geometric'],
    order: 80,
  },
];

async function main() {
  console.log('Seeding additional backgrounds...');

  for (const bg of moreBackgrounds) {
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

  console.log('Done seeding additional backgrounds!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
