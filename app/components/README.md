# Components Library

A comprehensive component library and repository for the SummonIQ Orchestrator, featuring organized categories and interactive background components.

## Structure

The components page is organized into the following categories:

### 1. Forms (`/components/forms`)
Form elements and input controls:
- Button (with variants: default, secondary, outline, ghost, destructive)
- Input (text, email, password)
- Checkbox
- Switch
- Textarea
- Label
- Select

### 2. Layout (`/components/layout`)
Layout and organizational components:
- Dropdown Menu
- Modal
- Popover
- Collapsible
- Separator
- Responsive utilities

### 3. Display (`/components/display`)
Visual display components:
- Avatar
- Badge (with variants)
- Fancy Badge (with gradient effects)

### 4. Navigation (`/components/navigation`)
Navigation and routing components:
- Breadcrumb
- Tabs
- Navigation Menu

### 5. Containers (`/components/containers`)
Container and wrapper components:
- Card (with CardHeader, CardTitle, CardDescription, CardContent)
- Glass (glassmorphism effect)
- Page (full page layout container)

### 6. Data (`/components/data`)
Data display components:
- Table
- Metadata List

### 7. Theme (`/components/theme`)
Theme customization components:
- Theme Toggle (dark mode switch)
- Theme Customizer (advanced theme controls)

### 8. Backgrounds (`/components/backgrounds`) ⭐ Featured
Interactive, 3D, and animated background components perfect for hero sections:

#### Available Backgrounds

1. **Gradient Mesh** - Animated gradient mesh with smooth color transitions
   - Tags: animated, css, gradient
   - Customizable colors and speed

2. **Particle Field** - Interactive particle system with mouse tracking
   - Tags: interactive, canvas, webgl
   - Customizable particle count, connection distance, and speed

3. **Wave Lines** - Flowing wave lines with depth and perspective
   - Tags: animated, canvas, waves
   - Customizable line count, amplitude, and frequency

4. **Aurora Borealis** - Beautiful aurora effect with color shifting
   - Tags: animated, gradient, css
   - Customizable colors and animation speed

5. **Matrix Rain** - Classic matrix-style falling characters
   - Tags: animated, interactive, canvas
   - Customizable color, font size, and speed

6. **Starfield** - Moving starfield with depth parallax effect
   - Tags: animated, canvas, space
   - Customizable star count and speed

7. **Liquid Blob** - Morphing liquid blob with smooth animations
   - Tags: animated, canvas, organic
   - Customizable blob count and morphing speed

8. **Neural Network** - Animated neural network with connecting nodes
   - Tags: animated, interactive, canvas
   - Customizable node count, connection distance, and speed

9. **Holographic** - Futuristic holographic effect with scan lines
   - Tags: animated, gradient, css
   - Customizable colors and scan speed

## Usage

### Importing Components

```tsx
import { Button, Card, Badge } from '@summoniq/applab-ui';
```

### Using Background Components

```tsx
import { ParticleBackground } from '@/components/backgrounds';

export default function HeroSection() {
  return (
    <div className="relative min-h-screen">
      <ParticleBackground 
        particleCount={100}
        connectionDistance={150}
        speed={0.5}
      />
      <div className="relative z-10">
        {/* Your content here */}
      </div>
    </div>
  );
}
```

### Background Preview

Each background has a dedicated preview page at `/components/backgrounds/preview/[id]` where you can:
- See the background in full-screen
- View the implementation code
- Copy usage examples
- Understand the available props

## Features

### Filtering and Search
The backgrounds page includes:
- **Tag-based filtering** - Filter by technology (3d, webgl, canvas, css, animated, interactive)
- **Text search** - Search by name or description
- **Live preview** - See backgrounds in action before using them

### Component Preview
- Full-screen preview mode
- Code examples with syntax highlighting
- Copy-to-clipboard functionality
- Props documentation

## Navigation

The component library uses a sidebar layout with:
- Category grouping
- Nested navigation for individual components
- Active state indication
- Smooth scrolling

## Adding New Components

To add a new component to the library:

1. Create the component in the appropriate category folder
2. Add it to the category's page.tsx file
3. Include usage examples and code snippets
4. Update the navigation in `layout.tsx` if needed

For backgrounds:
1. Create the component in `/components/backgrounds/`
2. Export it from `/components/backgrounds/index.ts`
3. Add it to the backgrounds array in `/app/components/backgrounds/page.tsx`
4. Add configuration in `/app/components/backgrounds/preview/[id]/page.tsx`

## Technologies Used

- **React 19.2** - UI framework
- **Next.js 16** - App Router and server components
- **Tailwind CSS 4** - Styling
- **Canvas API** - 2D graphics for particle systems, matrix rain, etc.
- **CSS Animations** - Gradient effects, aurora, holographic effects
- **Framer Motion** - Advanced animations (where needed)

## Best Practices

1. **Server Components First** - Use server components by default, add 'use client' only when needed
2. **Type Safety** - All components are fully typed with TypeScript
3. **Accessibility** - Components follow WCAG 2.1 AA standards
4. **Performance** - Backgrounds use requestAnimationFrame for smooth 60fps animations
5. **Responsive** - All components are mobile-friendly

## Performance Considerations

Background components are optimized for performance:
- Canvas-based backgrounds use efficient rendering techniques
- Animation frames are properly cleaned up on unmount
- Particle counts and connection distances are configurable for performance tuning
- CSS-based backgrounds use GPU-accelerated transforms

## Browser Support

All components work in modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Canvas and WebGL backgrounds require:
- Canvas API support
- requestAnimationFrame support
- Modern JavaScript features (ES6+)

