import { ComponentType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const heroBackgrounds = [
  {
    slug: 'aurora-curtain',
    name: 'Aurora Curtain',
    description: 'Flowing aurora curtains with gradient colors',
    tags: ['aurora', 'gradient', 'animated'],
  },
  {
    slug: 'aurora-sweep',
    name: 'Aurora Sweep',
    description: 'Sweeping aurora waves across the screen',
    tags: ['aurora', 'waves', 'animated'],
  },
  {
    slug: 'aurora-waves',
    name: 'Aurora Waves',
    description: 'Layered aurora wave patterns',
    tags: ['aurora', 'waves', 'layered'],
  },
  {
    slug: 'binary-rain',
    name: 'Binary Rain',
    description: 'Floating particles with connecting lines',
    tags: ['tech', 'particles', 'animated'],
  },
  {
    slug: 'blob-morph',
    name: 'Blob Morph',
    description: 'Morphing gradient blobs',
    tags: ['gradient', 'organic', 'animated'],
  },
  {
    slug: 'bubbles',
    name: 'Bubbles',
    description: 'Rising bubbles with highlights',
    tags: ['bubbles', 'animated', 'playful'],
  },
  {
    slug: 'circuit-board',
    name: 'Circuit Board',
    description: 'Circuit board traces with pulses',
    tags: ['tech', 'grid', 'animated'],
  },
  {
    slug: 'circuit-trace',
    name: 'Circuit Trace',
    description: 'Glowing circuit traces',
    tags: ['tech', 'lines', 'animated'],
  },
  {
    slug: 'constellation',
    name: 'Constellation',
    description: 'Connected star constellation',
    tags: ['stars', 'lines', 'space'],
  },
  {
    slug: 'corner-glow',
    name: 'Corner Glow',
    description: 'Soft corner gradient glows',
    tags: ['gradient', 'minimal', 'subtle'],
  },
  {
    slug: 'crystal-shards',
    name: 'Crystal Shards',
    description: 'Floating crystal shapes with diagonal lines',
    tags: ['geometric', 'gradient', 'animated'],
  },
  {
    slug: 'cyber-grid',
    name: 'Cyber Grid',
    description: 'Perspective cyber grid',
    tags: ['tech', 'grid', 'perspective'],
  },
  {
    slug: 'depth-layers',
    name: 'Depth Layers',
    description: 'Layered depth gradient effect',
    tags: ['gradient', 'layered', 'depth'],
  },
  {
    slug: 'diagonal-lines',
    name: 'Diagonal Lines',
    description: 'Animated diagonal line pattern',
    tags: ['lines', 'geometric', 'animated'],
  },
  {
    slug: 'diamond-grid',
    name: 'Diamond Grid',
    description: 'Pulsing diamond grid pattern',
    tags: ['grid', 'geometric', 'animated'],
  },
  {
    slug: 'dna-helix',
    name: 'DNA Helix',
    description: 'Wave lines with floating nodes',
    tags: ['waves', 'particles', 'animated'],
  },
  {
    slug: 'dot-grid',
    name: 'Dot Grid',
    description: 'Animated dot grid pattern',
    tags: ['dots', 'grid', 'minimal'],
  },
  {
    slug: 'dust-particles',
    name: 'Dust Particles',
    description: 'Floating dust in light beam',
    tags: ['particles', 'atmospheric', 'warm'],
  },
  {
    slug: 'electric-arc',
    name: 'Electric Arc',
    description: 'Electric arc effects',
    tags: ['electric', 'animated', 'energy'],
  },
  {
    slug: 'electric-field',
    name: 'Electric Field',
    description: 'Radiating electric field lines',
    tags: ['electric', 'lines', 'animated'],
  },
  {
    slug: 'falling-leaves',
    name: 'Falling Leaves',
    description: 'Autumn leaves drifting down',
    tags: ['nature', 'animated', 'warm'],
  },
  {
    slug: 'fire-embers',
    name: 'Fire Embers',
    description: 'Rising embers with warm glow',
    tags: ['fire', 'particles', 'warm'],
  },
  {
    slug: 'floating-shapes',
    name: 'Floating Shapes',
    description: 'Floating geometric shapes',
    tags: ['geometric', 'animated', 'minimal'],
  },
  {
    slug: 'flowing-lines',
    name: 'Flowing Lines',
    description: 'Smooth flowing line patterns',
    tags: ['lines', 'animated', 'organic'],
  },
  {
    slug: 'fog-mist',
    name: 'Fog Mist',
    description: 'Drifting fog layers',
    tags: ['atmospheric', 'layered', 'subtle'],
  },
  {
    slug: 'fractal-tree',
    name: 'Fractal Tree',
    description: 'Tree branches with floating particles',
    tags: ['nature', 'organic', 'animated'],
  },
  {
    slug: 'galaxy-spiral',
    name: 'Galaxy Spiral',
    description: 'Spiral galaxy with stars',
    tags: ['space', 'spiral', 'stars'],
  },
  {
    slug: 'geometric-explosion',
    name: 'Geometric Explosion',
    description: 'Radiating geometric shapes',
    tags: ['geometric', 'animated', 'dynamic'],
  },
  {
    slug: 'geometric-float',
    name: 'Geometric Float',
    description: 'Floating geometric forms',
    tags: ['geometric', 'minimal', 'animated'],
  },
  {
    slug: 'glitch-matrix',
    name: 'Glitch Matrix',
    description: 'Matrix-style data streams',
    tags: ['tech', 'glitch', 'animated'],
  },
  {
    slug: 'glowing-lines',
    name: 'Glowing Lines',
    description: 'Soft glowing line patterns',
    tags: ['lines', 'glow', 'minimal'],
  },
  {
    slug: 'gradient-mesh',
    name: 'Gradient Mesh',
    description: 'Animated gradient mesh',
    tags: ['gradient', 'mesh', 'colorful'],
  },
  {
    slug: 'gradient-sweep',
    name: 'Gradient Sweep',
    description: 'Sweeping gradient animation',
    tags: ['gradient', 'animated', 'smooth'],
  },
  {
    slug: 'gravity-particles',
    name: 'Gravity Particles',
    description: 'Orbital particles with trails',
    tags: ['particles', 'orbital', 'animated'],
  },
  {
    slug: 'hexagon-mesh',
    name: 'Hexagon Mesh',
    description: 'Pulsing hexagon grid',
    tags: ['hexagon', 'grid', 'animated'],
  },
  {
    slug: 'holographic',
    name: 'Holographic',
    description: 'Holographic scan lines with color shift',
    tags: ['holographic', 'tech', 'iridescent'],
  },
  {
    slug: 'honeycomb',
    name: 'Honeycomb',
    description: 'Honeycomb pattern with glow',
    tags: ['hexagon', 'pattern', 'geometric'],
  },
  {
    slug: 'ink-spread',
    name: 'Ink Spread',
    description: 'Watercolor ink blobs',
    tags: ['organic', 'light-theme', 'artistic'],
  },
  {
    slug: 'light-rays',
    name: 'Light Rays',
    description: 'Volumetric light rays',
    tags: ['light', 'rays', 'atmospheric'],
  },
  {
    slug: 'lightning-storm',
    name: 'Lightning Storm',
    description: 'Storm clouds with electric tendrils',
    tags: ['weather', 'atmospheric', 'dramatic'],
  },
  {
    slug: 'liquid-gradient',
    name: 'Liquid Gradient',
    description: 'Flowing liquid gradients',
    tags: ['gradient', 'liquid', 'animated'],
  },
  {
    slug: 'liquid-metal',
    name: 'Liquid Metal',
    description: 'Metallic blobs with reflections',
    tags: ['metallic', 'gradient', 'animated'],
  },
  {
    slug: 'meteor-shower',
    name: 'Meteor Shower',
    description: 'Shooting stars across night sky',
    tags: ['space', 'animated', 'dynamic'],
  },
  {
    slug: 'morphing-rings',
    name: 'Morphing Rings',
    description: 'Morphing circular rings',
    tags: ['circles', 'animated', 'geometric'],
  },
  {
    slug: 'mountain-layers',
    name: 'Mountain Layers',
    description: 'Parallax mountain silhouettes',
    tags: ['nature', 'layered', 'scenic'],
  },
  {
    slug: 'nebula-cloud',
    name: 'Nebula Cloud',
    description: 'Colorful nebula clouds',
    tags: ['space', 'colorful', 'atmospheric'],
  },
  {
    slug: 'neon-rain',
    name: 'Neon Rain',
    description: 'Colorful neon rain drops',
    tags: ['neon', 'animated', 'colorful'],
  },
  {
    slug: 'neural-network',
    name: 'Neural Network',
    description: 'Connected neural network nodes',
    tags: ['tech', 'network', 'animated'],
  },
  {
    slug: 'noise-gradient',
    name: 'Noise Gradient',
    description: 'Animated noise gradient',
    tags: ['gradient', 'noise', 'organic'],
  },
  {
    slug: 'northern-lights',
    name: 'Northern Lights',
    description: 'Aurora borealis curtains',
    tags: ['aurora', 'nature', 'animated'],
  },
  {
    slug: 'ocean-waves',
    name: 'Ocean Waves',
    description: 'Layered ocean waves with foam',
    tags: ['ocean', 'waves', 'nature'],
  },
  {
    slug: 'orb-cluster',
    name: 'Orb Cluster',
    description: 'Floating orb cluster',
    tags: ['orbs', 'gradient', 'animated'],
  },
  {
    slug: 'parallax-stars',
    name: 'Parallax Stars',
    description: 'Multi-depth starfield',
    tags: ['stars', 'parallax', 'space'],
  },
  {
    slug: 'particle-constellation',
    name: 'Particle Constellation',
    description: 'Connected particle constellation',
    tags: ['particles', 'lines', 'animated'],
  },
  {
    slug: 'particle-swarm',
    name: 'Particle Swarm',
    description: 'Orbiting particle rings',
    tags: ['particles', 'orbital', 'animated'],
  },
  {
    slug: 'plasma-waves',
    name: 'Plasma Waves',
    description: 'Color-shifting plasma blobs',
    tags: ['plasma', 'colorful', 'animated'],
  },
  {
    slug: 'prism-light',
    name: 'Prism Light',
    description: 'Prismatic light refraction',
    tags: ['prism', 'colorful', 'light'],
  },
  {
    slug: 'pulse-rings',
    name: 'Pulse Rings',
    description: 'Expanding pulse rings',
    tags: ['rings', 'animated', 'minimal'],
  },
  {
    slug: 'radial-burst',
    name: 'Radial Burst',
    description: 'Radial burst pattern',
    tags: ['radial', 'burst', 'dynamic'],
  },
  {
    slug: 'retro-sun',
    name: 'Retro Sun',
    description: 'Synthwave sun with grid',
    tags: ['retro', 'synthwave', 'grid'],
  },
  {
    slug: 'ripple-effect',
    name: 'Ripple Effect',
    description: 'Water ripple effect',
    tags: ['water', 'ripple', 'animated'],
  },
  {
    slug: 'shimmer-wave',
    name: 'Shimmer Wave',
    description: 'Shimmering wave pattern',
    tags: ['shimmer', 'waves', 'animated'],
  },
  {
    slug: 'smoke-wisps',
    name: 'Smoke Wisps',
    description: 'Drifting smoke wisps',
    tags: ['smoke', 'atmospheric', 'organic'],
  },
  {
    slug: 'snow-fall',
    name: 'Snow Fall',
    description: 'Falling snow particles',
    tags: ['snow', 'particles', 'winter'],
  },
  {
    slug: 'soft-particles',
    name: 'Soft Particles',
    description: 'Soft floating particles',
    tags: ['particles', 'soft', 'minimal'],
  },
  {
    slug: 'sound-visualizer',
    name: 'Sound Visualizer',
    description: 'Audio frequency bars',
    tags: ['audio', 'bars', 'animated'],
  },
  {
    slug: 'spotlight-glow',
    name: 'Spotlight Glow',
    description: 'Moving spotlight effect',
    tags: ['spotlight', 'glow', 'animated'],
  },
  {
    slug: 'topography',
    name: 'Topography',
    description: 'Topographic contour lines',
    tags: ['topography', 'lines', 'organic'],
  },
  {
    slug: 'vortex-spiral',
    name: 'Vortex Spiral',
    description: 'Spiral vortex with particles',
    tags: ['spiral', 'vortex', 'animated'],
  },
  {
    slug: 'warp-tunnel',
    name: 'Warp Tunnel',
    description: 'Warp speed star tunnel',
    tags: ['space', 'warp', 'dynamic'],
  },
  {
    slug: 'wave-divider',
    name: 'Wave Divider',
    description: 'Animated wave divider',
    tags: ['waves', 'divider', 'animated'],
  },
  {
    slug: 'wave-mesh',
    name: 'Wave Mesh',
    description: 'Undulating wave mesh',
    tags: ['waves', 'mesh', 'animated'],
  },
  {
    slug: 'aurora-shimmer',
    name: 'Aurora Shimmer',
    description: 'Shimmering aurora bands with color shift',
    tags: ['aurora', 'gradient', 'animated'],
  },
  {
    slug: 'bamboo-wind',
    name: 'Bamboo Wind',
    description: 'Swaying bamboo stalks in breeze',
    tags: ['nature', 'zen', 'animated'],
  },
  {
    slug: 'candle-flicker',
    name: 'Candle Flicker',
    description: 'Warm flickering candle glow',
    tags: ['warm', 'glow', 'ambient'],
  },
  {
    slug: 'canopy-light',
    name: 'Canopy Light',
    description: 'Forest light filtering through canopy',
    tags: ['nature', 'light', 'atmospheric'],
  },
  {
    slug: 'cherry-blossom',
    name: 'Cherry Blossom',
    description: 'Delicate pink petals drifting down',
    tags: ['nature', 'elegant', 'animated'],
  },
  {
    slug: 'cloud-drift',
    name: 'Cloud Drift',
    description: 'Soft clouds drifting across sky',
    tags: ['atmospheric', 'minimal', 'calm'],
  },
  {
    slug: 'comet-trail',
    name: 'Comet Trail',
    description: 'Streaming comet with glowing trail',
    tags: ['space', 'animated', 'dynamic'],
  },
  {
    slug: 'dewdrop',
    name: 'Dewdrop',
    description: 'Glistening morning dewdrops',
    tags: ['nature', 'subtle', 'elegant'],
  },
  {
    slug: 'dot-wave',
    name: 'Dot Wave',
    description: 'Wave pattern made of dots',
    tags: ['dots', 'wave', 'minimal'],
  },
  {
    slug: 'feather-float',
    name: 'Feather Float',
    description: 'Soft feathers floating gently',
    tags: ['nature', 'elegant', 'soft'],
  },
  {
    slug: 'firefly-dance',
    name: 'Firefly Dance',
    description: 'Glowing fireflies in the dark',
    tags: ['nature', 'glow', 'animated'],
  },
  {
    slug: 'gentle-breeze',
    name: 'Gentle Breeze',
    description: 'Soft flowing wave curves',
    tags: ['minimal', 'calm', 'elegant'],
  },
  {
    slug: 'gradient-orbs',
    name: 'Gradient Orbs',
    description: 'Floating gradient spheres',
    tags: ['gradient', 'orbs', 'colorful'],
  },
  {
    slug: 'grass-sway',
    name: 'Grass Sway',
    description: 'Gentle grass swaying in wind',
    tags: ['nature', 'green', 'animated'],
  },
  {
    slug: 'horizon-glow',
    name: 'Horizon Glow',
    description: 'Warm sunset horizon glow',
    tags: ['gradient', 'warm', 'atmospheric'],
  },
  {
    slug: 'ink-wash',
    name: 'Ink Wash',
    description: 'Watercolor ink wash effect',
    tags: ['artistic', 'organic', 'subtle'],
  },
  {
    slug: 'koi-pond',
    name: 'Koi Pond',
    description: 'Graceful koi swimming',
    tags: ['nature', 'zen', 'animated'],
  },
  {
    slug: 'leaf-spiral',
    name: 'Leaf Spiral',
    description: 'Leaves spiraling gently',
    tags: ['nature', 'spiral', 'animated'],
  },
  {
    slug: 'line-weave',
    name: 'Line Weave',
    description: 'Interlacing flowing lines',
    tags: ['lines', 'minimal', 'animated'],
  },
  {
    slug: 'lotus-bloom',
    name: 'Lotus Bloom',
    description: 'Opening lotus flower petals',
    tags: ['nature', 'zen', 'elegant'],
  },
  {
    slug: 'magnetic-field',
    name: 'Magnetic Field',
    description: 'Flowing magnetic field lines',
    tags: ['tech', 'lines', 'animated'],
  },
  {
    slug: 'moon-glow',
    name: 'Moon Glow',
    description: 'Soft lunar glow effect',
    tags: ['space', 'glow', 'calm'],
  },
  {
    slug: 'moon-phases',
    name: 'Moon Phases',
    description: 'Cycling moon phase animation',
    tags: ['space', 'minimal', 'animated'],
  },
  {
    slug: 'morning-mist',
    name: 'Morning Mist',
    description: 'Atmospheric morning haze layers',
    tags: ['atmospheric', 'layered', 'calm'],
  },
  {
    slug: 'moss-growth',
    name: 'Moss Growth',
    description: 'Organic spreading moss pattern',
    tags: ['nature', 'organic', 'green'],
  },
  {
    slug: 'orbit-trail',
    name: 'Orbit Trail',
    description: 'Orbiting particles with trails',
    tags: ['space', 'orbital', 'animated'],
  },
  {
    slug: 'paper-fold',
    name: 'Paper Fold',
    description: 'Origami-inspired geometric folds',
    tags: ['geometric', 'minimal', 'elegant'],
  },
  {
    slug: 'paper-lantern',
    name: 'Paper Lantern',
    description: 'Floating paper lanterns rising',
    tags: ['warm', 'animated', 'festive'],
  },
  {
    slug: 'pebble-ripple',
    name: 'Pebble Ripple',
    description: 'Stone ripples in still water',
    tags: ['water', 'ripple', 'zen'],
  },
  {
    slug: 'pendulum-wave',
    name: 'Pendulum Wave',
    description: 'Mesmerizing pendulum pattern',
    tags: ['physics', 'animated', 'hypnotic'],
  },
  {
    slug: 'petal-fall',
    name: 'Petal Fall',
    description: 'Soft flower petals falling',
    tags: ['nature', 'elegant', 'animated'],
  },
  {
    slug: 'pixel-dissolve',
    name: 'Pixel Dissolve',
    description: 'Fading pixel pattern',
    tags: ['tech', 'minimal', 'animated'],
  },
  {
    slug: 'pulse-grid',
    name: 'Pulse Grid',
    description: 'Pulsing grid of dots',
    tags: ['grid', 'dots', 'animated'],
  },
  {
    slug: 'quantum-dots',
    name: 'Quantum Dots',
    description: 'Quantum-inspired floating particles',
    tags: ['tech', 'particles', 'animated'],
  },
  {
    slug: 'rain-glass',
    name: 'Rain Glass',
    description: 'Rain streaks on window glass',
    tags: ['weather', 'atmospheric', 'calm'],
  },
  {
    slug: 'river-flow',
    name: 'River Flow',
    description: 'Meandering river streams',
    tags: ['water', 'nature', 'animated'],
  },
  {
    slug: 'sand-dunes',
    name: 'Sand Dunes',
    description: 'Rolling desert sand dunes',
    tags: ['nature', 'layered', 'warm'],
  },
  {
    slug: 'silk-threads',
    name: 'Silk Threads',
    description: 'Delicate silk thread lines',
    tags: ['elegant', 'minimal', 'animated'],
  },
  {
    slug: 'smoke-ring',
    name: 'Smoke Ring',
    description: 'Rising smoke rings',
    tags: ['atmospheric', 'organic', 'animated'],
  },
  {
    slug: 'soap-bubble',
    name: 'Soap Bubble',
    description: 'Iridescent floating bubbles',
    tags: ['colorful', 'animated', 'playful'],
  },
  {
    slug: 'soundwave-pulse',
    name: 'Soundwave Pulse',
    description: 'Audio waveform visualization',
    tags: ['audio', 'bars', 'animated'],
  },
  {
    slug: 'spiral-galaxy',
    name: 'Spiral Galaxy',
    description: 'Spinning spiral galaxy arms',
    tags: ['space', 'spiral', 'stars'],
  },
  {
    slug: 'star-trail',
    name: 'Star Trail',
    description: 'Circular star trail paths',
    tags: ['space', 'stars', 'animated'],
  },
  {
    slug: 'stone-stack',
    name: 'Stone Stack',
    description: 'Balanced zen stone cairns',
    tags: ['zen', 'minimal', 'calm'],
  },
  {
    slug: 'string-wave',
    name: 'String Wave',
    description: 'Vibrating string harmonics',
    tags: ['physics', 'waves', 'animated'],
  },
  {
    slug: 'sunbeam',
    name: 'Sunbeam',
    description: 'Soft radiating sun rays',
    tags: ['light', 'warm', 'atmospheric'],
  },
  {
    slug: 'tide-pool',
    name: 'Tide Pool',
    description: 'Gentle tidal wave layers',
    tags: ['water', 'layered', 'calm'],
  },
  {
    slug: 'water-drop',
    name: 'Water Drop',
    description: 'Expanding water drop ripples',
    tags: ['water', 'ripple', 'animated'],
  },
  {
    slug: 'wind-chimes',
    name: 'Wind Chimes',
    description: 'Swinging wind chime pendulums',
    tags: ['zen', 'animated', 'calm'],
  },
  {
    slug: 'zen-garden',
    name: 'Zen Garden',
    description: 'Raked zen garden lines',
    tags: ['zen', 'minimal', 'calm'],
  },
  {
    slug: 'zen-ripple',
    name: 'Zen Ripple',
    description: 'Concentric zen ripple circles',
    tags: ['zen', 'ripple', 'minimal'],
  },
];

async function main() {
  console.log('Seeding hero backgrounds...');

  // Delete existing hero backgrounds
  await prisma.component.deleteMany({
    where: { category: 'hero-backgrounds' },
  });

  // Create hero backgrounds using upsert to handle existing slugs
  for (let i = 0; i < heroBackgrounds.length; i++) {
    const bg = heroBackgrounds[i];
    await prisma.component.upsert({
      where: { slug: bg.slug },
      update: {
        name: bg.name,
        description: bg.description,
        category: 'hero-backgrounds',
        type: ComponentType.BACKGROUND,
        code: `<${toPascalCase(bg.slug)} />`,
        tags: bg.tags,
        order: i + 1,
        isPublished: true,
      },
      create: {
        slug: bg.slug,
        name: bg.name,
        description: bg.description,
        category: 'hero-backgrounds',
        type: ComponentType.BACKGROUND,
        code: `<${toPascalCase(bg.slug)} />`,
        tags: bg.tags,
        order: i + 1,
        isPublished: true,
      },
    });
    console.log(`  Created ${bg.name}`);
  }

  console.log(`Done! Created ${heroBackgrounds.length} hero backgrounds.`);
}

function toPascalCase(str: string): string {
  return (
    str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') + 'Hero'
  );
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
