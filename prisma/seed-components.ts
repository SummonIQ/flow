import { PrismaClient, ComponentType } from '@prisma/client';

const prisma = new PrismaClient();

const components = [
  // Forms
  {
    slug: 'button',
    name: 'Button',
    description: 'Clickable button component with multiple variants, sizes, and states',
    category: 'forms',
    type: ComponentType.COMPONENT,
    code: `import { Button } from '@summoniq/applab-ui';

<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>`,
    demoCode: `<div className="flex gap-2">
  <Button variant="default">Default</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="outline">Outline</Button>
</div>`,
    documentation: `# Button Component

A versatile button component with multiple variants and sizes.

## Variants
- **default**: Primary button style
- **secondary**: Secondary button style
- **outline**: Outlined button
- **ghost**: Transparent button
- **destructive**: For destructive actions

## Sizes
- **sm**: Small button
- **default**: Default size
- **lg**: Large button

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | string | "default" | Button style variant |
| size | string | "default" | Button size |
| disabled | boolean | false | Disable the button |`,
    props: {
      variant: { type: 'string', default: 'default', options: ['default', 'secondary', 'outline', 'ghost', 'destructive'] },
      size: { type: 'string', default: 'default', options: ['sm', 'default', 'lg'] },
      disabled: { type: 'boolean', default: false },
    },
    tags: ['forms', 'interactive', 'button'],
    order: 1,
  },
  {
    slug: 'input',
    name: 'Input',
    description: 'Text input field for collecting user data',
    category: 'forms',
    type: ComponentType.COMPONENT,
    code: `import { Input, Label } from '@summoniq/applab-ui';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="name@example.com" 
  />
</div>`,
    demoCode: `<Input placeholder="Enter text..." />`,
    documentation: `# Input Component

Text input field with various types and states.

## Types
- text
- email
- password
- number
- tel
- url

## States
- Default
- Disabled
- Read-only
- Error`,
    tags: ['forms', 'input', 'text'],
    order: 2,
  },
  {
    slug: 'checkbox',
    name: 'Checkbox',
    description: 'Checkbox input for boolean selections',
    category: 'forms',
    type: ComponentType.COMPONENT,
    code: `import { Checkbox, Label } from '@summoniq/applab-ui';

<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</div>`,
    demoCode: `<Checkbox id="terms" />`,
    documentation: `# Checkbox Component

A checkbox input for boolean selections.

## Usage
\`\`\`tsx
<Checkbox id="terms" />
\`\`\`

## States
- Checked
- Unchecked
- Indeterminate
- Disabled`,
    props: {
      checked: { type: 'boolean', default: false },
      disabled: { type: 'boolean', default: false },
    },
    tags: ['forms', 'checkbox', 'input'],
    order: 3,
  },
  {
    slug: 'select',
    name: 'Select',
    description: 'Dropdown select input for choosing from options',
    category: 'forms',
    type: ComponentType.COMPONENT,
    code: `import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@summoniq/applab-ui';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>`,
    demoCode: `<Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></Select>`,
    documentation: `# Select Component

A dropdown select component for choosing from a list of options.

## Features
- Searchable
- Keyboard navigation
- Accessibility support
- Custom styling`,
    tags: ['forms', 'select', 'dropdown'],
    order: 4,
  },
  {
    slug: 'switch',
    name: 'Switch',
    description: 'Toggle switch for binary settings',
    category: 'forms',
    type: ComponentType.COMPONENT,
    code: `import { Switch, Label } from '@summoniq/applab-ui';

<div className="flex items-center space-x-2">
  <Switch id="airplane-mode" />
  <Label htmlFor="airplane-mode">Airplane Mode</Label>
</div>`,
    demoCode: `<Switch id="mode" />`,
    documentation: `# Switch Component

A toggle switch for binary on/off settings.

## Usage
\`\`\`tsx
<Switch id="notifications" checked={enabled} onCheckedChange={setEnabled} />
\`\`\`

## Props
- checked: boolean
- onCheckedChange: (checked: boolean) => void
- disabled: boolean`,
    props: {
      checked: { type: 'boolean', default: false },
      disabled: { type: 'boolean', default: false },
    },
    tags: ['forms', 'switch', 'toggle'],
    order: 5,
  },
  {
    slug: 'textarea',
    name: 'Textarea',
    description: 'Multi-line text input for longer content',
    category: 'forms',
    type: ComponentType.COMPONENT,
    code: `import { Textarea, Label } from '@summoniq/applab-ui';

<div className="space-y-2">
  <Label htmlFor="message">Message</Label>
  <Textarea 
    id="message" 
    placeholder="Type your message here..." 
    rows={4}
  />
</div>`,
    demoCode: `<Textarea placeholder="Enter text..." />`,
    documentation: `# Textarea Component

Multi-line text input field for longer text content.

## Features
- Auto-resize
- Character counter
- Placeholder support
- Multiple rows`,
    tags: ['forms', 'textarea', 'text', 'input'],
    order: 6,
  },
  {
    slug: 'label',
    name: 'Label',
    description: 'Accessible labels for form inputs',
    category: 'forms',
    type: ComponentType.COMPONENT,
    code: `import { Label } from '@summoniq/applab-ui';

<Label htmlFor="email">Email Address</Label>`,
    demoCode: `<Label>Label Text</Label>`,
    documentation: `# Label Component

Accessible label component for form inputs.

## Usage
\`\`\`tsx
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
\`\`\`

## Accessibility
Automatically associates with form inputs via htmlFor prop.`,
    tags: ['forms', 'label', 'accessibility'],
    order: 7,
  },
  // Backgrounds
  {
    slug: 'gradient-mesh',
    name: 'Gradient Mesh',
    description: 'Animated gradient mesh with smooth color transitions',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { GradientMeshBackground } from '@/components/backgrounds';

<div className="relative min-h-screen">
  <GradientMeshBackground 
    colors={['#667eea', '#764ba2', '#f093fb', '#4facfe']}
    speed={3}
  />
  <div className="relative z-10">
    {/* Your content here */}
  </div>
</div>`,
    demoCode: `<GradientMeshBackground />`,
    documentation: `# Gradient Mesh Background

Animated gradient mesh perfect for hero sections.

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| colors | string[] | ['#667eea',...] | Array of hex colors |
| speed | number | 3 | Animation speed |`,
    props: {
      colors: { type: 'array', default: ['#667eea', '#764ba2', '#f093fb', '#4facfe'] },
      speed: { type: 'number', default: 3 },
    },
    tags: ['backgrounds', 'animated', 'gradient'],
    order: 1,
  },
  {
    slug: 'particles',
    name: 'Particle Field',
    description: 'Interactive particle system with mouse tracking',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { ParticleBackground } from '@/components/backgrounds';

<div className="relative min-h-screen bg-slate-900">
  <ParticleBackground 
    particleCount={100}
    connectionDistance={150}
    particleColor="rgba(99, 102, 241, 0.5)"
    speed={0.5}
  />
  <div className="relative z-10">
    {/* Your content here */}
  </div>
</div>`,
    demoCode: `<ParticleBackground />`,
    documentation: `# Particle Field Background

Interactive particle system with mouse tracking and connections.

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| particleCount | number | 100 | Number of particles |
| connectionDistance | number | 150 | Connection line distance |
| particleColor | string | "rgba(99, 102, 241, 0.5)" | Particle color |
| speed | number | 0.5 | Movement speed |`,
    props: {
      particleCount: { type: 'number', default: 100 },
      connectionDistance: { type: 'number', default: 150 },
      particleColor: { type: 'string', default: 'rgba(99, 102, 241, 0.5)' },
      speed: { type: 'number', default: 0.5 },
    },
    tags: ['backgrounds', 'interactive', 'particles', 'canvas'],
    order: 2,
  },
  {
    slug: 'wave-lines',
    name: 'Wave Lines',
    description: 'Flowing wave lines with depth and perspective',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { WaveLinesBackground } from '@/components/backgrounds';

<div className="relative min-h-screen">
  <WaveLinesBackground 
    lineCount={15}
    waveAmplitude={50}
    waveFrequency={0.01}
    speed={0.02}
    lineColor="rgba(99, 102, 241, 0.3)"
  />
  <div className="relative z-10">
    {/* Your content here */}
  </div>
</div>`,
    demoCode: `<WaveLinesBackground />`,
    documentation: `# Wave Lines Background

Animated sine wave lines with layered depth effect.

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| lineCount | number | 15 | Number of wave lines |
| waveAmplitude | number | 50 | Wave height |
| waveFrequency | number | 0.01 | Wave frequency |
| speed | number | 0.02 | Animation speed |
| lineColor | string | "rgba(99, 102, 241, 0.3)" | Line color |`,
    props: {
      lineCount: { type: 'number', default: 15 },
      waveAmplitude: { type: 'number', default: 50 },
      waveFrequency: { type: 'number', default: 0.01 },
      speed: { type: 'number', default: 0.02 },
      lineColor: { type: 'string', default: 'rgba(99, 102, 241, 0.3)' },
    },
    tags: ['backgrounds', 'animated', 'waves', 'canvas'],
    order: 3,
  },
  {
    slug: 'aurora',
    name: 'Aurora Borealis',
    description: 'Beautiful aurora effect with color shifting',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { AuroraBackground } from '@/components/backgrounds';

<div className="relative min-h-screen">
  <AuroraBackground 
    colors={['#10b981', '#3b82f6', '#8b5cf6', '#ec4899']}
    speed={5}
  />
  <div className="relative z-10">
    {/* Your content here */}
  </div>
</div>`,
    demoCode: `<AuroraBackground />`,
    documentation: `# Aurora Borealis Background

Animated radial gradients creating aurora effect.

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| colors | string[] | ['#10b981',...] | Array of aurora colors |
| speed | number | 5 | Animation speed |`,
    props: {
      colors: { type: 'array', default: ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899'] },
      speed: { type: 'number', default: 5 },
    },
    tags: ['backgrounds', 'animated', 'gradient', 'css'],
    order: 4,
  },
  {
    slug: 'matrix-rain',
    name: 'Matrix Rain',
    description: 'Classic matrix-style falling characters',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { MatrixBackground } from '@/components/backgrounds';

<div className="relative min-h-screen">
  <MatrixBackground 
    color="#0F0"
    fontSize={16}
    speed={50}
  />
  <div className="relative z-10">
    {/* Your content here */}
  </div>
</div>`,
    demoCode: `<MatrixBackground />`,
    documentation: `# Matrix Rain Background

Canvas-based matrix rain effect with falling characters.

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| color | string | "#0F0" | Character color |
| fontSize | number | 16 | Font size in pixels |
| speed | number | 50 | Animation speed (ms) |`,
    props: {
      color: { type: 'string', default: '#0F0' },
      fontSize: { type: 'number', default: 16 },
      speed: { type: 'number', default: 50 },
    },
    tags: ['backgrounds', 'animated', 'interactive', 'canvas'],
    order: 5,
  },
  {
    slug: 'starfield',
    name: 'Starfield',
    description: 'Moving starfield with depth parallax effect',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { StarfieldBackground } from '@/components/backgrounds';

<div className="relative min-h-screen">
  <StarfieldBackground 
    starCount={800}
    speed={5}
    starColor="#ffffff"
  />
  <div className="relative z-10">
    {/* Your content here */}
  </div>
</div>`,
    demoCode: `<StarfieldBackground />`,
    documentation: `# Starfield Background

3D starfield with perspective projection and motion trails.

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| starCount | number | 800 | Number of stars |
| speed | number | 5 | Movement speed |
| starColor | string | "#ffffff" | Star color |`,
    props: {
      starCount: { type: 'number', default: 800 },
      speed: { type: 'number', default: 5 },
      starColor: { type: 'string', default: '#ffffff' },
    },
    tags: ['backgrounds', 'animated', 'canvas', 'space'],
    order: 6,
  },
  {
    slug: 'liquid-blob',
    name: 'Liquid Blob',
    description: 'Morphing liquid blob with smooth animations',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { LiquidBlobBackground } from '@/components/backgrounds';

<div className="relative min-h-screen">
  <LiquidBlobBackground 
    blobColor="rgba(14, 165, 233, 0.4)"
    blobCount={3}
    speed={0.001}
  />
  <div className="relative z-10">
    {/* Your content here */}
  </div>
</div>`,
    demoCode: `<LiquidBlobBackground />`,
    documentation: `# Liquid Blob Background

Organic blob shapes with morphing animation.

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| blobColor | string | "rgba(14, 165, 233, 0.4)" | Blob color |
| blobCount | number | 3 | Number of blobs |
| speed | number | 0.001 | Morphing speed |`,
    props: {
      blobColor: { type: 'string', default: 'rgba(14, 165, 233, 0.4)' },
      blobCount: { type: 'number', default: 3 },
      speed: { type: 'number', default: 0.001 },
    },
    tags: ['backgrounds', 'animated', 'canvas', 'organic'],
    order: 7,
  },
  {
    slug: 'neural-network',
    name: 'Neural Network',
    description: 'Animated neural network with connecting nodes',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { NeuralNetworkBackground } from '@/components/backgrounds';

<div className="relative min-h-screen">
  <NeuralNetworkBackground 
    nodeCount={50}
    connectionDistance={200}
    nodeColor="rgba(59, 130, 246, 0.8)"
    lineColor="rgba(59, 130, 246, 0.3)"
    speed={0.3}
  />
  <div className="relative z-10">
    {/* Your content here */}
  </div>
</div>`,
    demoCode: `<NeuralNetworkBackground />`,
    documentation: `# Neural Network Background

Animated network of connected nodes with data packets.

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| nodeCount | number | 50 | Number of nodes |
| connectionDistance | number | 200 | Max connection distance |
| nodeColor | string | "rgba(59, 130, 246, 0.8)" | Node color |
| lineColor | string | "rgba(59, 130, 246, 0.3)" | Connection line color |
| speed | number | 0.3 | Movement speed |`,
    props: {
      nodeCount: { type: 'number', default: 50 },
      connectionDistance: { type: 'number', default: 200 },
      nodeColor: { type: 'string', default: 'rgba(59, 130, 246, 0.8)' },
      lineColor: { type: 'string', default: 'rgba(59, 130, 246, 0.3)' },
      speed: { type: 'number', default: 0.3 },
    },
    tags: ['backgrounds', 'animated', 'interactive', 'canvas'],
    order: 8,
  },
  {
    slug: 'holographic',
    name: 'Holographic',
    description: 'Futuristic holographic effect with scan lines',
    category: 'backgrounds',
    type: ComponentType.BACKGROUND,
    code: `import { HolographicBackground } from '@/components/backgrounds';

<div className="relative min-h-screen">
  <HolographicBackground 
    primaryColor="#06b6d4"
    secondaryColor="#ec4899"
    speed={3}
  />
  <div className="relative z-10">
    {/* Your content here */}
  </div>
</div>`,
    demoCode: `<HolographicBackground />`,
    documentation: `# Holographic Background

Holographic effect with scan lines and gradients.

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| primaryColor | string | "#06b6d4" | Primary gradient color |
| secondaryColor | string | "#ec4899" | Secondary gradient color |
| speed | number | 3 | Scan animation speed |`,
    props: {
      primaryColor: { type: 'string', default: '#06b6d4' },
      secondaryColor: { type: 'string', default: '#ec4899' },
      speed: { type: 'number', default: 3 },
    },
    tags: ['backgrounds', 'animated', 'gradient', 'css'],
    order: 9,
  },
  // Display Components
  {
    slug: 'card',
    name: 'Card',
    description: 'Container component for grouping related content',
    category: 'display',
    type: ComponentType.COMPONENT,
    code: `import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@summoniq/applab-ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <p className="text-sm text-muted-foreground">Card footer</p>
  </CardFooter>
</Card>`,
    demoCode: `<Card><CardHeader><CardTitle>Example Card</CardTitle></CardHeader></Card>`,
    documentation: `# Card Component

A versatile container component for grouping related content.

## Sub-components
- **CardHeader**: Header section with title and description
- **CardTitle**: Title text
- **CardDescription**: Description text
- **CardContent**: Main content area
- **CardFooter**: Footer section

## Usage
\`\`\`tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
\`\`\``,
    tags: ['display', 'container', 'card'],
    order: 1,
  },
  {
    slug: 'badge',
    name: 'Badge',
    description: 'Small status indicator or label',
    category: 'display',
    type: ComponentType.COMPONENT,
    code: `import { Badge } from '@summoniq/applab-ui';

<div className="flex gap-2">
  <Badge variant="default">Default</Badge>
  <Badge variant="secondary">Secondary</Badge>
  <Badge variant="destructive">Destructive</Badge>
  <Badge variant="outline">Outline</Badge>
</div>`,
    demoCode: `<Badge>Badge</Badge>`,
    documentation: `# Badge Component

Small status indicator or label component.

## Variants
- **default**: Primary badge style
- **secondary**: Secondary badge style
- **destructive**: For errors or warnings
- **outline**: Outlined badge

## Usage
\`\`\`tsx
<Badge variant="default">New</Badge>
<Badge variant="secondary">Beta</Badge>
<Badge variant="destructive">Error</Badge>
\`\`\``,
    props: {
      variant: { type: 'string', default: 'default', options: ['default', 'secondary', 'destructive', 'outline'] },
    },
    tags: ['display', 'badge', 'status'],
    order: 2,
  },
  // Navigation Components
  {
    slug: 'tabs',
    name: 'Tabs',
    description: 'Organize content into tabbed sections',
    category: 'navigation',
    type: ComponentType.COMPONENT,
    code: `import { Tabs, TabsList, TabsTrigger, TabsContent } from '@summoniq/applab-ui';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
    <TabsTrigger value="tab3">Tab 3</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    Content for tab 1
  </TabsContent>
  <TabsContent value="tab2">
    Content for tab 2
  </TabsContent>
  <TabsContent value="tab3">
    Content for tab 3
  </TabsContent>
</Tabs>`,
    demoCode: `<Tabs defaultValue="tab1"><TabsList><TabsTrigger value="tab1">Tab 1</TabsTrigger></TabsList></Tabs>`,
    documentation: `# Tabs Component

Organize content into tabbed sections with animated transitions.

## Features
- Animated indicator
- Keyboard navigation
- Accessible
- Two variants: default and underline

## Usage
\`\`\`tsx
<Tabs defaultValue="overview">
  <TabsList variant="default">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="details">Details</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Overview content</TabsContent>
  <TabsContent value="details">Details content</TabsContent>
</Tabs>
\`\`\``,
    props: {
      defaultValue: { type: 'string', description: 'Default active tab' },
      variant: { type: 'string', default: 'default', options: ['default', 'underline'] },
    },
    tags: ['navigation', 'tabs', 'interactive'],
    order: 1,
  },
  // Layout Components
  {
    slug: 'modal',
    name: 'Modal',
    description: 'Overlay dialog for focused content and interactions',
    category: 'layout',
    type: ComponentType.COMPONENT,
    code: `import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalTitle, ModalDescription, Button } from '@summoniq/applab-ui';

<Modal>
  <ModalTrigger asChild>
    <Button>Open Modal</Button>
  </ModalTrigger>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Modal Title</ModalTitle>
      <ModalDescription>Modal description goes here</ModalDescription>
    </ModalHeader>
    <ModalBody>
      <p>Modal content goes here</p>
    </ModalBody>
    <ModalFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </ModalFooter>
  </ModalContent>
</Modal>`,
    demoCode: `<Modal><ModalTrigger><Button>Open</Button></ModalTrigger></Modal>`,
    documentation: `# Modal Component

Overlay dialog component for focused content and interactions.

## Variants
- **default**: Centered modal
- **drawer**: Side drawer
- **slide**: Slide-out panel

## Features
- Animated transitions
- Focus management
- Keyboard navigation (ESC to close)
- Accessible
- Multiple sizes

## Usage
\`\`\`tsx
<Modal>
  <ModalTrigger asChild>
    <Button>Open</Button>
  </ModalTrigger>
  <ModalContent variant="default" size="lg">
    <ModalHeader>
      <ModalTitle>Title</ModalTitle>
    </ModalHeader>
    <ModalBody>Content</ModalBody>
    <ModalFooter>Actions</ModalFooter>
  </ModalContent>
</Modal>
\`\`\``,
    props: {
      variant: { type: 'string', default: 'default', options: ['default', 'drawer', 'slide'] },
      size: { type: 'string', default: 'lg', options: ['sm', 'md', 'lg', 'xl', '2xl', 'full'] },
      showOverlay: { type: 'boolean', default: true },
    },
    tags: ['layout', 'modal', 'dialog', 'overlay'],
    order: 1,
  },
  {
    slug: 'separator',
    name: 'Separator',
    description: 'Visual divider between content sections',
    category: 'layout',
    type: ComponentType.COMPONENT,
    code: `import { Separator } from '@summoniq/applab-ui';

<div>
  <p>Content above</p>
  <Separator className="my-4" />
  <p>Content below</p>
</div>`,
    demoCode: `<Separator />`,
    documentation: `# Separator Component

Visual divider to separate content sections.

## Orientations
- **horizontal**: Default horizontal line
- **vertical**: Vertical line for inline content

## Usage
\`\`\`tsx
<Separator orientation="horizontal" />
<Separator orientation="vertical" className="h-4" />
\`\`\``,
    props: {
      orientation: { type: 'string', default: 'horizontal', options: ['horizontal', 'vertical'] },
    },
    tags: ['layout', 'separator', 'divider'],
    order: 2,
  },
];

async function main() {
  console.log('Seeding components...');

  for (const component of components) {
    await prisma.component.upsert({
      where: { slug: component.slug },
      update: component,
      create: component,
    });
    console.log(`✓ ${component.name}`);
  }

  console.log('✅ Component seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error seeding components:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

