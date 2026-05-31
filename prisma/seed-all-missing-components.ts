import { PrismaClient, ComponentType } from '@prisma/client';

const prisma = new PrismaClient();

const missingComponents = [
  // Layout Components
  {
    slug: 'popover',
    name: 'Popover',
    description: 'Floating content container anchored to an element',
    category: 'layout',
    type: ComponentType.COMPONENT,
    code: `import { Popover, PopoverTrigger, PopoverContent, Button } from '@summoniq/applab-ui';

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open Popover</Button>
  </PopoverTrigger>
  <PopoverContent>
    <p>Popover content goes here</p>
  </PopoverContent>
</Popover>`,
    documentation: `# Popover Component

Floating content container that appears near a trigger element.

## Features
- Positioned relative to trigger
- Accessible
- Keyboard navigation
- Auto-positioning`,
    tags: ['layout', 'popover', 'overlay'],
    order: 3,
  },
  {
    slug: 'dropdown-menu',
    name: 'Dropdown Menu',
    description: 'Menu with dropdown options',
    category: 'layout',
    type: ComponentType.COMPONENT,
    code: `import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, Button } from '@summoniq/applab-ui';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
    <DropdownMenuItem>Item 2</DropdownMenuItem>
    <DropdownMenuItem>Item 3</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
    documentation: `# Dropdown Menu

Menu component with dropdown functionality.`,
    tags: ['layout', 'menu', 'dropdown'],
    order: 4,
  },
  {
    slug: 'collapsible',
    name: 'Collapsible',
    description: 'Expandable/collapsible content section',
    category: 'layout',
    type: ComponentType.COMPONENT,
    code: `import { Collapsible, CollapsibleTrigger, CollapsibleContent, Button } from '@summoniq/applab-ui';

<Collapsible>
  <CollapsibleTrigger asChild>
    <Button>Toggle</Button>
  </CollapsibleTrigger>
  <CollapsibleContent>
    <p>Collapsible content</p>
  </CollapsibleContent>
</Collapsible>`,
    documentation: `# Collapsible Component

Expandable and collapsible content section.`,
    tags: ['layout', 'collapsible', 'accordion'],
    order: 5,
  },
  {
    slug: 'responsive',
    name: 'Responsive',
    description: 'Responsive layout utilities',
    category: 'layout',
    type: ComponentType.UTILITY,
    code: `import { Responsive } from '@summoniq/applab-ui';

<Responsive>
  <div>Responsive content</div>
</Responsive>`,
    documentation: `# Responsive Utilities

Utilities for responsive layouts.`,
    tags: ['layout', 'responsive', 'utility'],
    order: 6,
  },
  // Display Components
  {
    slug: 'avatar',
    name: 'Avatar',
    description: 'User profile image or initials',
    category: 'display',
    type: ComponentType.COMPONENT,
    code: `import { Avatar, AvatarImage, AvatarFallback } from '@summoniq/applab-ui';

<Avatar>
  <AvatarImage src="/avatar.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>`,
    documentation: `# Avatar Component

Display user profile images with fallback.`,
    tags: ['display', 'avatar', 'user'],
    order: 3,
  },
  {
    slug: 'fancy-badge',
    name: 'Fancy Badge',
    description: 'Enhanced badge with animations',
    category: 'display',
    type: ComponentType.COMPONENT,
    code: `import { FancyBadge } from '@summoniq/applab-ui';

<FancyBadge>Premium</FancyBadge>`,
    documentation: `# Fancy Badge

Enhanced badge component with animations and gradients.`,
    tags: ['display', 'badge', 'animated'],
    order: 4,
  },
  // Navigation Components
  {
    slug: 'breadcrumb',
    name: 'Breadcrumb',
    description: 'Navigation breadcrumb trail',
    category: 'navigation',
    type: ComponentType.COMPONENT,
    code: `import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@summoniq/applab-ui';

<Breadcrumb>
  <BreadcrumbItem>
    <BreadcrumbLink href="/">Home</BreadcrumbLink>
  </BreadcrumbItem>
  <BreadcrumbItem>
    <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
  </BreadcrumbItem>
  <BreadcrumbItem>Current</BreadcrumbItem>
</Breadcrumb>`,
    documentation: `# Breadcrumb Component

Navigation breadcrumb trail showing current location.`,
    tags: ['navigation', 'breadcrumb'],
    order: 2,
  },
  {
    slug: 'side-nav',
    name: 'Animated Side Nav',
    description: 'Animated sidebar navigation',
    category: 'navigation',
    type: ComponentType.COMPONENT,
    code: `import { AnimatedSideNav } from '@summoniq/applab-ui';

<AnimatedSideNav sections={navSections} />`,
    documentation: `# Animated Side Nav

Animated sidebar navigation with smooth transitions.`,
    tags: ['navigation', 'sidebar', 'animated'],
    order: 3,
  },
  {
    slug: 'menu',
    name: 'Navigation Menu',
    description: 'Main navigation menu',
    category: 'navigation',
    type: ComponentType.COMPONENT,
    code: `import { NavigationMenu } from '@summoniq/applab-ui';

<NavigationMenu items={menuItems} />`,
    documentation: `# Navigation Menu

Main navigation menu component.`,
    tags: ['navigation', 'menu'],
    order: 4,
  },
  // Container Components
  {
    slug: 'glass',
    name: 'Glass',
    description: 'Glassmorphism container effect',
    category: 'containers',
    type: ComponentType.COMPONENT,
    code: `import { Glass } from '@summoniq/applab-ui';

<Glass>
  <p>Content with glass effect</p>
</Glass>`,
    documentation: `# Glass Container

Container with glassmorphism effect.`,
    tags: ['containers', 'glass', 'effect'],
    order: 2,
  },
  {
    slug: 'page',
    name: 'Page',
    description: 'Page layout container',
    category: 'containers',
    type: ComponentType.COMPONENT,
    code: `import { Page } from '@summoniq/applab-ui';

<Page>
  <p>Page content</p>
</Page>`,
    documentation: `# Page Container

Standard page layout container.`,
    tags: ['containers', 'layout', 'page'],
    order: 3,
  },
  // Data Components
  {
    slug: 'table',
    name: 'Table',
    description: 'Data table component',
    category: 'data',
    type: ComponentType.COMPONENT,
    code: `import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@summoniq/applab-ui';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
      <TableHead>Column 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data 1</TableCell>
      <TableCell>Data 2</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
    documentation: `# Table Component

Data table for displaying tabular data.`,
    tags: ['data', 'table'],
    order: 1,
  },
  {
    slug: 'metadata-list',
    name: 'Metadata List',
    description: 'Key-value metadata display',
    category: 'data',
    type: ComponentType.COMPONENT,
    code: `import { MetadataList } from '@summoniq/applab-ui';

<MetadataList items={metadata} />`,
    documentation: `# Metadata List

Display key-value pairs in a formatted list.`,
    tags: ['data', 'metadata', 'list'],
    order: 2,
  },
  // Theme Components
  {
    slug: 'theme-toggle',
    name: 'Theme Toggle',
    description: 'Dark/light mode toggle',
    category: 'theme',
    type: ComponentType.COMPONENT,
    code: `import { ThemeToggle } from '@summoniq/applab-ui';

<ThemeToggle />`,
    documentation: `# Theme Toggle

Toggle between dark and light themes.`,
    tags: ['theme', 'toggle', 'dark-mode'],
    order: 1,
  },
  {
    slug: 'theme-customizer',
    name: 'Theme Customizer',
    description: 'Advanced theme customization',
    category: 'theme',
    type: ComponentType.COMPONENT,
    code: `import { ThemeCustomizer } from '@summoniq/applab-ui';

<ThemeCustomizer />`,
    documentation: `# Theme Customizer

Advanced theme customization interface.`,
    tags: ['theme', 'customizer', 'settings'],
    order: 2,
  },
  // Media Components
  {
    slug: 'image',
    name: 'Image',
    description: 'Optimized image component',
    category: 'media',
    type: ComponentType.COMPONENT,
    code: `import Image from 'next/image';

<Image src="/image.jpg" alt="Description" width={400} height={300} />`,
    documentation: `# Image Component

Optimized image component with lazy loading.`,
    tags: ['media', 'image'],
    order: 1,
  },
  {
    slug: 'video',
    name: 'Video',
    description: 'Video player component',
    category: 'media',
    type: ComponentType.COMPONENT,
    code: `<video controls>
  <source src="/video.mp4" type="video/mp4" />
</video>`,
    documentation: `# Video Component

Video player with controls.`,
    tags: ['media', 'video'],
    order: 2,
  },
  {
    slug: 'icon',
    name: 'Icon',
    description: 'Icon component library',
    category: 'media',
    type: ComponentType.COMPONENT,
    code: `import { Icon } from 'lucide-react';

<Icon className="w-4 h-4" />`,
    documentation: `# Icon Component

Icon library using Lucide icons.`,
    tags: ['media', 'icon'],
    order: 3,
  },
];

async function main() {
  console.log('Seeding missing components...');

  for (const component of missingComponents) {
    await prisma.component.upsert({
      where: { slug: component.slug },
      update: component,
      create: component,
    });
    console.log(`✓ ${component.name} (${component.category})`);
  }

  console.log(`✅ Added ${missingComponents.length} missing components!`);
}

main()
  .catch((e) => {
    console.error('Error seeding components:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });





