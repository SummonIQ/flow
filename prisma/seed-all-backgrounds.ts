import { ComponentType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// All backgrounds that have actual component files
const allBackgrounds = [
  {
    slug: 'gradient-mesh',
    name: 'Gradient Mesh',
    description: 'Smooth animated gradient mesh with flowing colors',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { GradientMeshBackground } from '@/components/backgrounds';

<GradientMeshBackground />`,
    tags: ['animated', 'webgl', 'colorful'],
    order: 1,
  },
  {
    slug: 'particles',
    name: 'Particle Field',
    description: 'Interactive particle system with dynamic connections',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { ParticleBackground } from '@/components/backgrounds';

<ParticleBackground />`,
    tags: ['animated', 'canvas', 'interactive'],
    order: 2,
  },
  {
    slug: 'wave-lines',
    name: 'Wave Lines',
    description: 'Flowing wave lines animation',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { WaveLinesBackground } from '@/components/backgrounds';

<WaveLinesBackground />`,
    tags: ['animated', 'canvas', 'minimal'],
    order: 3,
  },
  {
    slug: 'aurora',
    name: 'Aurora Borealis',
    description: 'Northern lights dancing across the sky',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { AuroraBackground } from '@/components/backgrounds';

<AuroraBackground />`,
    tags: ['animated', 'webgl', 'nature'],
    order: 4,
  },
  {
    slug: 'matrix',
    name: 'Matrix Rain',
    description: 'Classic digital rain falling code effect',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { MatrixBackground } from '@/components/backgrounds';

<MatrixBackground />`,
    tags: ['animated', 'canvas', 'tech'],
    order: 5,
  },
  {
    slug: 'starfield',
    name: 'Starfield',
    description: 'Traveling through a starfield at warp speed',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { StarfieldBackground } from '@/components/backgrounds';

<StarfieldBackground />`,
    tags: ['animated', 'canvas', 'space'],
    order: 6,
  },
  {
    slug: 'liquid-blob',
    name: 'Liquid Blob',
    description: 'Morphing liquid blob animation',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { LiquidBlobBackground } from '@/components/backgrounds';

<LiquidBlobBackground />`,
    tags: ['animated', 'webgl', 'organic'],
    order: 7,
  },
  {
    slug: 'neural-network',
    name: 'Neural Network',
    description: 'Connected neural network visualization',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { NeuralNetworkBackground } from '@/components/backgrounds';

<NeuralNetworkBackground />`,
    tags: ['animated', 'canvas', 'tech'],
    order: 8,
  },
  {
    slug: 'holographic',
    name: 'Holographic',
    description: 'Iridescent holographic shimmer effect',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { HolographicBackground } from '@/components/backgrounds';

<HolographicBackground />`,
    tags: ['animated', 'webgl', 'colorful'],
    order: 9,
  },
  {
    slug: 'geometric-grid',
    name: 'Geometric Grid',
    description: 'Dynamic geometric grid patterns',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { GeometricGridBackground } from '@/components/backgrounds';

<GeometricGridBackground />`,
    tags: ['animated', 'canvas', 'geometric'],
    order: 10,
  },
  {
    slug: 'bokeh',
    name: 'Bokeh',
    description: 'Soft glowing bokeh light circles',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { BokehBackground } from '@/components/backgrounds';

<BokehBackground />`,
    tags: ['animated', 'canvas', 'soft'],
    order: 11,
  },
  {
    slug: 'rain',
    name: 'Rain',
    description: 'Realistic rain drops falling effect',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { RainBackground } from '@/components/backgrounds';

<RainBackground />`,
    tags: ['animated', 'canvas', 'weather'],
    order: 12,
  },
  {
    slug: 'confetti',
    name: 'Confetti',
    description: 'Colorful confetti celebration',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { ConfettiBackground } from '@/components/backgrounds';

<ConfettiBackground />`,
    tags: ['animated', 'canvas', 'playful'],
    order: 13,
  },
  {
    slug: 'smoke',
    name: 'Smoke',
    description: 'Billowing smoke wisps effect',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { SmokeBackground } from '@/components/backgrounds';

<SmokeBackground />`,
    tags: ['animated', 'webgl', 'atmospheric'],
    order: 14,
  },
  {
    slug: 'lightning',
    name: 'Lightning',
    description: 'Electric lightning bolt strikes',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { LightningBackground } from '@/components/backgrounds';

<LightningBackground />`,
    tags: ['animated', 'canvas', 'electric'],
    order: 15,
  },
  {
    slug: 'plasma',
    name: 'Plasma',
    description: 'Flowing plasma energy field',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { PlasmaBackground } from '@/components/backgrounds';

<PlasmaBackground />`,
    tags: ['animated', 'canvas', 'energy'],
    order: 16,
  },
  {
    slug: 'nebula',
    name: 'Nebula',
    description: 'Deep space nebula clouds',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { NebulaBackground } from '@/components/backgrounds';

<NebulaBackground />`,
    tags: ['animated', 'webgl', 'space'],
    order: 17,
  },
  {
    slug: 'lava',
    name: 'Lava',
    description: 'Molten lava flowing surface',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { LavaBackground } from '@/components/backgrounds';

<LavaBackground />`,
    tags: ['animated', 'canvas', 'hot'],
    order: 18,
  },
  {
    slug: 'circuits',
    name: 'Circuits',
    description: 'Animated circuit board pathways',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { CircuitsBackground } from '@/components/backgrounds';

<CircuitsBackground />`,
    tags: ['animated', 'canvas', 'tech'],
    order: 19,
  },
  {
    slug: 'constellation',
    name: 'Constellation',
    description: 'Connected star constellation map',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { ConstellationBackground } from '@/components/backgrounds';

<ConstellationBackground />`,
    tags: ['animated', 'canvas', 'space'],
    order: 20,
  },
  {
    slug: 'fireflies',
    name: 'Fireflies',
    description: 'Glowing fireflies in the night',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { FirefliesBackground } from '@/components/backgrounds';

<FirefliesBackground />`,
    tags: ['animated', 'canvas', 'nature'],
    order: 21,
  },
  {
    slug: 'glitch',
    name: 'Glitch',
    description: 'Digital glitch distortion effect',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { GlitchBackground } from '@/components/backgrounds';

<GlitchBackground />`,
    tags: ['animated', 'canvas', 'tech'],
    order: 22,
  },
  {
    slug: 'hex',
    name: 'Hexagons',
    description: 'Hexagonal grid pattern',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { HexBackground } from '@/components/backgrounds';

<HexBackground />`,
    tags: ['animated', 'canvas', 'geometric'],
    order: 23,
  },
  {
    slug: 'voronoi',
    name: 'Voronoi',
    description: 'Voronoi cell tessellation',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { VoronoiBackground } from '@/components/backgrounds';

<VoronoiBackground />`,
    tags: ['animated', 'canvas', 'geometric'],
    order: 24,
  },
  {
    slug: 'silk',
    name: 'Silk',
    description: 'Flowing silk fabric waves',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { SilkBackground } from '@/components/backgrounds';

<SilkBackground />`,
    tags: ['animated', 'webgl', 'elegant'],
    order: 25,
  },
  {
    slug: 'topo',
    name: 'Topography',
    description: 'Topographic contour lines',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { TopoBackground } from '@/components/backgrounds';

<TopoBackground />`,
    tags: ['animated', 'canvas', 'minimal'],
    order: 26,
  },
  {
    slug: 'prism',
    name: 'Prism',
    description: 'Light prism refraction colors',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { PrismBackground } from '@/components/backgrounds';

<PrismBackground />`,
    tags: ['animated', 'webgl', 'colorful'],
    order: 27,
  },
  {
    slug: 'ribbons',
    name: 'Ribbons',
    description: 'Flowing 3D ribbon streams',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { RibbonsBackground } from '@/components/backgrounds';

<RibbonsBackground />`,
    tags: ['animated', 'webgl', 'elegant'],
    order: 28,
  },
  {
    slug: 'spiral',
    name: 'Spiral',
    description: 'Hypnotic spiral animation',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { SpiralBackground } from '@/components/backgrounds';

<SpiralBackground />`,
    tags: ['animated', 'canvas', 'geometric'],
    order: 29,
  },
  {
    slug: 'warp',
    name: 'Warp',
    description: 'Space warp tunnel effect',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { WarpBackground } from '@/components/backgrounds';

<WarpBackground />`,
    tags: ['animated', 'webgl', 'space'],
    order: 30,
  },
  {
    slug: 'metaballs',
    name: 'Metaballs',
    description: 'Organic metaball blobs',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { MetaballsBackground } from '@/components/backgrounds';

<MetaballsBackground />`,
    tags: ['animated', 'webgl', 'organic'],
    order: 31,
  },
  {
    slug: 'moire',
    name: 'Moiré',
    description: 'Moiré interference patterns',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { MoireBackground } from '@/components/backgrounds';

<MoireBackground />`,
    tags: ['animated', 'canvas', 'optical'],
    order: 32,
  },
  {
    slug: 'ink',
    name: 'Ink',
    description: 'Ink diffusion in water',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { InkBackground } from '@/components/backgrounds';

<InkBackground />`,
    tags: ['animated', 'webgl', 'organic'],
    order: 33,
  },
  {
    slug: 'embers',
    name: 'Embers',
    description: 'Rising ember particles',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { EmbersBackground } from '@/components/backgrounds';

<EmbersBackground />`,
    tags: ['animated', 'canvas', 'warm'],
    order: 34,
  },
  {
    slug: 'dunes',
    name: 'Dunes',
    description: 'Desert sand dune waves',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { DunesBackground } from '@/components/backgrounds';

<DunesBackground />`,
    tags: ['animated', 'webgl', 'nature'],
    order: 35,
  },
  {
    slug: 'crystal',
    name: 'Crystal',
    description: 'Crystalline structure formation',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { CrystalBackground } from '@/components/backgrounds';

<CrystalBackground />`,
    tags: ['animated', 'webgl', 'geometric'],
    order: 36,
  },
  {
    slug: 'orbit',
    name: 'Orbit',
    description: 'Orbiting particles around center',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { OrbitBackground } from '@/components/backgrounds';

<OrbitBackground />`,
    tags: ['animated', 'canvas', 'space'],
    order: 37,
  },
  {
    slug: 'radar',
    name: 'Radar',
    description: 'Radar sweep scanning effect',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { RadarBackground } from '@/components/backgrounds';

<RadarBackground />`,
    tags: ['animated', 'canvas', 'tech'],
    order: 38,
  },
  {
    slug: 'rings',
    name: 'Rings',
    description: 'Concentric expanding rings',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { RingsBackground } from '@/components/backgrounds';

<RingsBackground />`,
    tags: ['animated', 'canvas', 'minimal'],
    order: 39,
  },
  {
    slug: 'shards',
    name: 'Shards',
    description: 'Broken glass shard fragments',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { ShardsBackground } from '@/components/backgrounds';

<ShardsBackground />`,
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

<CellsBackground />`,
    tags: ['animated', 'canvas', 'organic'],
    order: 41,
  },
  {
    slug: 'noise',
    name: 'Noise',
    description: 'Perlin noise texture animation',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { NoiseBackground } from '@/components/backgrounds';

<NoiseBackground />`,
    tags: ['animated', 'canvas', 'minimal'],
    order: 42,
  },
  {
    slug: 'grid',
    name: 'Grid',
    description: 'Infinite grid perspective',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { GridBackground } from '@/components/backgrounds';

<GridBackground />`,
    tags: ['animated', 'canvas', 'minimal'],
    order: 43,
  },
  {
    slug: 'kaleido',
    name: 'Kaleidoscope',
    description: 'Kaleidoscope mirror pattern',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { KaleidoBackground } from '@/components/backgrounds';

<KaleidoBackground />`,
    tags: ['animated', 'canvas', 'colorful'],
    order: 44,
  },
  {
    slug: 'waves',
    name: 'Waves',
    description: 'Ocean wave motion',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { WavesBackground } from '@/components/backgrounds';

<WavesBackground />`,
    tags: ['animated', 'canvas', 'nature'],
    order: 45,
  },
  {
    slug: 'hyperdrive',
    name: 'Hyperdrive',
    description: 'Hyperspace jump speed lines',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { HyperdriveBackground } from '@/components/backgrounds';

<HyperdriveBackground />`,
    tags: ['animated', 'canvas', 'space'],
    order: 46,
  },
  {
    slug: 'dna-helix',
    name: 'DNA Helix',
    description: 'Rotating double helix DNA strands',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { DnaHelixBackground } from '@/components/backgrounds';

<DnaHelixBackground />`,
    tags: ['animated', 'canvas', 'science', 'biology'],
    order: 48,
  },
  {
    slug: 'fireworks',
    name: 'Fireworks',
    description: 'Colorful fireworks celebration display',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { FireworksBackground } from '@/components/backgrounds';

<FireworksBackground />`,
    tags: ['animated', 'canvas', 'celebration', 'colorful'],
    order: 49,
  },
  {
    slug: 'watercolor',
    name: 'Watercolor',
    description: 'Soft flowing watercolor paint blobs',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { WatercolorBackground } from '@/components/backgrounds';

<WatercolorBackground />`,
    tags: ['animated', 'canvas', 'artistic', 'soft'],
    order: 50,
  },
  {
    slug: 'sakura',
    name: 'Sakura Petals',
    description: 'Falling cherry blossom petals',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { SakuraBackground } from '@/components/backgrounds';

<SakuraBackground />`,
    tags: ['animated', 'canvas', 'nature', 'japanese'],
    order: 51,
  },
  {
    slug: 'ocean-waves',
    name: 'Ocean Waves',
    description: 'Rolling ocean waves with sunset',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { OceanWavesBackground } from '@/components/backgrounds';

<OceanWavesBackground />`,
    tags: ['animated', 'canvas', 'nature', 'ocean'],
    order: 52,
  },
  {
    slug: 'retro-sun',
    name: 'Retro Synthwave Sun',
    description: '80s synthwave sunset with grid',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { RetroSunBackground } from '@/components/backgrounds';

<RetroSunBackground />`,
    tags: ['animated', 'canvas', 'retro', '80s'],
    order: 53,
  },
  {
    slug: 'geometric-shapes',
    name: 'Floating Shapes',
    description: 'Floating geometric shapes rising',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { GeometricShapesBackground } from '@/components/backgrounds';

<GeometricShapesBackground />`,
    tags: ['animated', 'canvas', 'geometric', 'minimal'],
    order: 54,
  },
  {
    slug: 'northern-lights',
    name: 'Northern Lights',
    description: 'Aurora borealis dancing in the sky',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { NorthernLightsBackground } from '@/components/backgrounds';

<NorthernLightsBackground />`,
    tags: ['animated', 'canvas', 'nature', 'aurora'],
    order: 55,
  },
  {
    slug: 'galaxy-spiral',
    name: 'Spiral Galaxy',
    description: 'Rotating spiral galaxy with stars',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { GalaxySpiralBackground } from '@/components/backgrounds';

<GalaxySpiralBackground />`,
    tags: ['animated', 'canvas', 'space', 'galaxy'],
    order: 56,
  },
  {
    slug: 'electric-storm',
    name: 'Electric Storm',
    description: 'Lightning storm with rain',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { ElectricStormBackground } from '@/components/backgrounds';

<ElectricStormBackground />`,
    tags: ['animated', 'canvas', 'weather', 'lightning'],
    order: 57,
  },
  {
    slug: 'pixel-rain',
    name: 'Pixel Rain',
    description: 'Retro pixel blocks falling like rain',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { PixelRainBackground } from '@/components/backgrounds';

<PixelRainBackground />`,
    tags: ['animated', 'canvas', 'retro', 'pixel'],
    order: 58,
  },
  {
    slug: 'meteor-shower',
    name: 'Meteor Shower',
    description: 'Shooting stars across night sky',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `<MeteorShowerBackground />`,
    tags: ['animated', 'canvas', 'space', 'nature'],
    order: 67,
  },
  {
    slug: 'color-burst',
    name: 'Color Burst',
    description: 'Radiating color burst rays',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `<ColorBurstBackground />`,
    tags: ['animated', 'canvas', 'colorful', 'abstract'],
    order: 71,
  },
  {
    slug: 'tunnel-warp',
    name: 'Tunnel Warp',
    description: 'Rotating tunnel warp effect',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `<TunnelWarpBackground />`,
    tags: ['animated', 'canvas', 'hypnotic', '3d'],
    order: 72,
  },
  {
    slug: 'soundwave',
    name: 'Soundwave',
    description: 'Audio visualizer bars',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `<SoundwaveBackground />`,
    tags: ['animated', 'canvas', 'audio', 'music'],
    order: 73,
  },
  {
    slug: 'falling-leaves',
    name: 'Falling Leaves',
    description: 'Autumn leaves floating down',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `<FallingLeavesBackground />`,
    tags: ['animated', 'canvas', 'nature', 'autumn'],
    order: 74,
  },
  {
    slug: 'neon-rings',
    name: 'Neon Rings',
    description: 'Pulsing neon concentric rings',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `<NeonRingsBackground />`,
    tags: ['animated', 'canvas', 'neon', 'colorful'],
    order: 76,
  },
  {
    slug: 'cosmic-dust',
    name: 'Cosmic Dust',
    description: 'Swirling cosmic particles',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `<CosmicDustBackground />`,
    tags: ['animated', 'canvas', 'space', 'particles'],
    order: 78,
  },
  {
    slug: 'wave-gradient',
    name: 'Wave Gradient',
    description: 'Animated gradient waves',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `<WaveGradientBackground />`,
    tags: ['animated', 'canvas', 'gradient', 'colorful'],
    order: 81,
  },
  {
    slug: 'clock-gears',
    name: 'Clock Gears',
    description: 'Rotating steampunk gears',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `<ClockGearsBackground />`,
    tags: ['animated', 'canvas', 'steampunk'],
    order: 82,
  },
  {
    slug: 'rain-drops',
    name: 'Rain Drops',
    description: 'Rippling water droplets',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `<RainDropsBackground />`,
    tags: ['animated', 'canvas', 'water'],
    order: 84,
  },
  {
    slug: 'sand-particles',
    name: 'Sand Particles',
    description: 'Desert sand blowing in wind',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `<SandParticlesBackground />`,
    tags: ['animated', 'canvas', 'nature'],
    order: 85,
  },
  {
    slug: 'breathing-circles',
    name: 'Breathing Circles',
    description: 'Pulsing concentric circles',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `<BreathingCirclesBackground />`,
    tags: ['animated', 'canvas', 'zen'],
    order: 98,
  },
  {
    slug: 'lightning-bugs',
    name: 'Lightning Bugs',
    description: 'Glowing fireflies at night',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `<LightningBugsBackground />`,
    tags: ['animated', 'canvas', 'nature'],
    order: 100,
  },
  {
    slug: 'pinwheel',
    name: 'Pinwheel',
    description: 'Colorful spinning pinwheel',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `<PinwheelBackground />`,
    tags: ['animated', 'canvas', 'colorful'],
    order: 101,
  },
  {
    slug: 'ripple-pond',
    name: 'Ripple Pond',
    description: 'Water ripples expanding',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `<RipplePondBackground />`,
    tags: ['animated', 'canvas', 'water'],
    order: 102,
  },
  {
    slug: 'floating-diamonds',
    name: 'Floating Diamonds',
    description: 'Rotating diamond gems',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `<FloatingDiamondsBackground />`,
    tags: ['animated', 'canvas', 'elegant'],
    order: 103,
  },
  {
    slug: 'sound-bars',
    name: 'Sound Bars',
    description: 'Audio equalizer visualization',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `<SoundBarsBackground />`,
    tags: ['animated', 'canvas', 'audio'],
    order: 104,
  },
  {
    slug: 'neon-pulse',
    name: 'Neon Pulse',
    description: 'Pulsing neon circles',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `<NeonPulseBackground />`,
    tags: ['animated', 'canvas', 'neon'],
    order: 106,
  },
  {
    slug: 'hexagon-grid',
    name: 'Hexagon Grid',
    description: 'Animated hexagonal grid',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `<HexagonGridBackground />`,
    tags: ['animated', 'canvas', 'geometric'],
    order: 107,
  },
  {
    slug: 'circuit-flow',
    name: 'Circuit Flow',
    description: 'Data flowing on circuit board',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `<CircuitFlowBackground />`,
    tags: ['animated', 'canvas', 'tech'],
    order: 109,
  },
  {
    slug: 'morphing-shapes',
    name: 'Morphing Shapes',
    description: 'Shapes morphing and rotating',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `<MorphingShapesBackground />`,
    tags: ['animated', 'canvas', 'abstract'],
    order: 110,
  },
  {
    slug: 'dandelion-seeds',
    name: 'Dandelion Seeds',
    description: 'Floating dandelion seeds',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `<DandelionSeedsBackground />`,
    tags: ['animated', 'canvas', 'nature'],
    order: 111,
  },
];

async function main() {
  console.log('Seeding all backgrounds with actual components...');

  // First, delete all existing backgrounds to reset
  await prisma.component.deleteMany({
    where: { category: 'backgrounds' },
  });
  console.log('  Cleared existing backgrounds');

  // Create all backgrounds
  for (const bg of allBackgrounds) {
    await prisma.component.create({
      data: {
        ...bg,
        isPublished: true,
      },
    });
    console.log(`  Created ${bg.name}`);
  }

  console.log(`Done! Created ${allBackgrounds.length} backgrounds.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
