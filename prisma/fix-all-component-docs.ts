import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const updates = [
  // FORMS - Add missing props
  {
    slug: 'input',
    props: {
      type: { type: 'string', default: 'text', options: ['text', 'email', 'password', 'number', 'tel', 'url'] },
      placeholder: { type: 'string' },
      disabled: { type: 'boolean', default: false },
      required: { type: 'boolean', default: false },
    },
  },
  {
    slug: 'select',
    props: {
      placeholder: { type: 'string' },
      disabled: { type: 'boolean', default: false },
      required: { type: 'boolean', default: false },
    },
  },
  {
    slug: 'textarea',
    props: {
      rows: { type: 'number', default: 4 },
      placeholder: { type: 'string' },
      disabled: { type: 'boolean', default: false },
      required: { type: 'boolean', default: false },
    },
  },
  {
    slug: 'label',
    props: {
      htmlFor: { type: 'string' },
      required: { type: 'boolean', default: false },
    },
  },
  // LAYOUT - Add docs and props
  {
    slug: 'popover',
    props: {
      open: { type: 'boolean' },
      onOpenChange: { type: 'function' },
      side: { type: 'string', default: 'bottom', options: ['top', 'bottom', 'left', 'right'] },
    },
  },
  {
    slug: 'dropdown-menu',
    documentation: `# Dropdown Menu Component

A dropdown menu for displaying a list of actions or options.

## Features
- Keyboard navigation
- Auto-positioning
- Accessible
- Nested menus supported

## Usage
\`\`\`tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
    <DropdownMenuItem>Item 2</DropdownMenuItem>
    <DropdownMenuItem>Item 3</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
\`\`\``,
    props: {
      open: { type: 'boolean' },
      onOpenChange: { type: 'function' },
    },
  },
  {
    slug: 'collapsible',
    documentation: `# Collapsible Component

Expandable and collapsible content section.

## Features
- Smooth animations
- Controlled or uncontrolled
- Accessible

## Usage
\`\`\`tsx
<Collapsible>
  <CollapsibleTrigger asChild>
    <Button>Toggle</Button>
  </CollapsibleTrigger>
  <CollapsibleContent>
    Hidden content here
  </CollapsibleContent>
</Collapsible>
\`\`\``,
    props: {
      open: { type: 'boolean' },
      onOpenChange: { type: 'function' },
      disabled: { type: 'boolean', default: false },
    },
  },
  {
    slug: 'responsive',
    documentation: `# Responsive Utilities

Utility components and hooks for responsive layouts.

## Features
- Breakpoint-based visibility
- Mobile/desktop detection
- Responsive hooks

## Usage
\`\`\`tsx
<Responsive.Desktop>
  Desktop content
</Responsive.Desktop>
<Responsive.Mobile>
  Mobile content
</Responsive.Mobile>
\`\`\``,
    props: {
      breakpoint: { type: 'string', options: ['sm', 'md', 'lg', 'xl'] },
    },
  },
  // DISPLAY
  {
    slug: 'avatar',
    documentation: `# Avatar Component

Display user profile images with fallback to initials.

## Features
- Image with fallback
- Initials support
- Multiple sizes
- Status indicator

## Usage
\`\`\`tsx
<Avatar>
  <AvatarImage src="/avatar.jpg" alt="John Doe" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
\`\`\``,
    props: {
      size: { type: 'string', default: 'md', options: ['sm', 'md', 'lg', 'xl'] },
    },
  },
  {
    slug: 'fancy-badge',
    documentation: `# Fancy Badge Component

Enhanced badge with gradients and animations.

## Features
- Gradient backgrounds
- Animations
- Multiple styles
- Icon support

## Usage
\`\`\`tsx
<FancyBadge variant="gradient">Premium</FancyBadge>
\`\`\``,
    props: {
      variant: { type: 'string', default: 'default', options: ['default', 'gradient', 'animated'] },
    },
  },
  {
    slug: 'card',
    props: {
      variant: { type: 'string', default: 'default', options: ['default', 'elevated', 'outline'] },
    },
  },
  // NAVIGATION
  {
    slug: 'breadcrumb',
    documentation: `# Breadcrumb Component

Navigation breadcrumb showing current page location.

## Features
- Responsive
- Collapsible on mobile
- Custom separators
- Accessible

## Usage
\`\`\`tsx
<Breadcrumb>
  <BreadcrumbItem>
    <BreadcrumbLink href="/">Home</BreadcrumbLink>
  </BreadcrumbItem>
  <BreadcrumbItem>
    <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
  </BreadcrumbItem>
  <BreadcrumbItem>Current Page</BreadcrumbItem>
</Breadcrumb>
\`\`\``,
    props: {
      separator: { type: 'string', default: '/' },
    },
  },
  {
    slug: 'side-nav',
    documentation: `# Animated Side Nav

Animated sidebar navigation with smooth transitions.

## Features
- Smooth animations
- Collapsible sections
- Active state tracking
- Icons support

## Usage
\`\`\`tsx
<AnimatedSideNav sections={navSections} />
\`\`\``,
    props: {
      sections: { type: 'array' },
      collapsed: { type: 'boolean', default: false },
    },
  },
  {
    slug: 'menu',
    documentation: `# Navigation Menu

Main navigation menu component.

## Features
- Multi-level menus
- Responsive
- Keyboard navigation
- Accessible

## Usage
\`\`\`tsx
<NavigationMenu items={menuItems} />
\`\`\``,
    props: {
      items: { type: 'array' },
      orientation: { type: 'string', default: 'horizontal', options: ['horizontal', 'vertical'] },
    },
  },
  // CONTAINERS
  {
    slug: 'glass',
    documentation: `# Glass Container

Container with glassmorphism effect.

## Features
- Glassmorphism styling
- Backdrop blur
- Customizable opacity
- Modern aesthetic

## Usage
\`\`\`tsx
<Glass blur="md">
  Content with glass effect
</Glass>
\`\`\``,
    props: {
      blur: { type: 'string', default: 'md', options: ['sm', 'md', 'lg'] },
      opacity: { type: 'number', default: 0.8 },
    },
  },
  {
    slug: 'page',
    documentation: `# Page Container

Standard page layout container.

## Features
- Consistent spacing
- Responsive padding
- Max-width control
- Section support

## Usage
\`\`\`tsx
<Page>
  <PageHeader>
    <PageTitle>Page Title</PageTitle>
  </PageHeader>
  <PageContent>
    Content here
  </PageContent>
</Page>
\`\`\``,
    props: {
      maxWidth: { type: 'string', default: '7xl', options: ['md', 'lg', 'xl', '2xl', '7xl', 'full'] },
    },
  },
  // DATA
  {
    slug: 'table',
    documentation: `# Table Component

Data table for displaying tabular data.

## Features
- Sortable columns
- Row selection
- Pagination
- Responsive

## Usage
\`\`\`tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</Table>
\`\`\``,
    props: {
      striped: { type: 'boolean', default: false },
      hoverable: { type: 'boolean', default: true },
    },
  },
  {
    slug: 'metadata-list',
    documentation: `# Metadata List

Display key-value pairs in a formatted list.

## Features
- Clean layout
- Responsive
- Customizable styling
- Label/value pairs

## Usage
\`\`\`tsx
<MetadataList
  items={[
    { label: 'Name', value: 'John Doe' },
    { label: 'Email', value: 'john@example.com' },
  ]}
/>
\`\`\``,
    props: {
      items: { type: 'array' },
      orientation: { type: 'string', default: 'horizontal', options: ['horizontal', 'vertical'] },
    },
  },
  // THEME
  {
    slug: 'theme-toggle',
    documentation: `# Theme Toggle

Toggle between dark and light themes.

## Features
- System theme detection
- Smooth transitions
- Persistent preference
- Icon animations

## Usage
\`\`\`tsx
<ThemeToggle />
\`\`\``,
    props: {
      showLabel: { type: 'boolean', default: false },
    },
  },
  {
    slug: 'theme-customizer',
    documentation: `# Theme Customizer

Advanced theme customization interface.

## Features
- Color picker
- Font selection
- Spacing controls
- Live preview

## Usage
\`\`\`tsx
<ThemeCustomizer />
\`\`\``,
    props: {
      position: { type: 'string', default: 'bottom-right', options: ['top-right', 'bottom-right', 'bottom-left'] },
    },
  },
  // MEDIA
  {
    slug: 'image',
    documentation: `# Image Component

Optimized image component with lazy loading.

## Features
- Lazy loading
- Placeholder blur
- Responsive sizes
- Next.js optimized

## Usage
\`\`\`tsx
<Image
  src="/image.jpg"
  alt="Description"
  width={400}
  height={300}
/>
\`\`\``,
    props: {
      src: { type: 'string' },
      alt: { type: 'string' },
      width: { type: 'number' },
      height: { type: 'number' },
      priority: { type: 'boolean', default: false },
    },
  },
  {
    slug: 'video',
    documentation: `# Video Component

Video player with controls.

## Features
- Native controls
- Multiple formats
- Responsive
- Autoplay control

## Usage
\`\`\`tsx
<video controls>
  <source src="/video.mp4" type="video/mp4" />
</video>
\`\`\``,
    props: {
      controls: { type: 'boolean', default: true },
      autoplay: { type: 'boolean', default: false },
      loop: { type: 'boolean', default: false },
    },
  },
  {
    slug: 'icon',
    documentation: `# Icon Component

Icon library using Lucide icons.

## Features
- 1000+ icons
- Customizable size
- Color control
- Tree-shakeable

## Usage
\`\`\`tsx
import { Icon } from 'lucide-react';

<Icon className="w-4 h-4" />
\`\`\``,
    props: {
      size: { type: 'number', default: 24 },
      strokeWidth: { type: 'number', default: 2 },
    },
  },
];

async function main() {
  console.log('Fixing component docs and props...\n');

  for (const update of updates) {
    const component = await prisma.component.findUnique({
      where: { slug: update.slug },
    });

    if (!component) {
      console.log(`❌ Component not found: ${update.slug}`);
      continue;
    }

    await prisma.component.update({
      where: { slug: update.slug },
      data: {
        documentation: update.documentation || component.documentation,
        props: update.props || component.props,
      },
    });

    console.log(`✓ Updated ${update.slug}`);
  }

  console.log(`\n✅ Fixed ${updates.length} components!`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



