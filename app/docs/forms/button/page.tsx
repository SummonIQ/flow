'use client';

import { CodeBlock } from '@/components/docs/code-block';
import { ComponentExample } from '@/components/docs/component-example';
import { Button } from '@summoniq/applab-ui';
import {
  ArrowRight,
  ChevronRight,
  Download,
  Edit2,
  Loader2,
  Save,
  Search,
  Star,
  Trash2,
  Upload,
  UserPlus,
} from 'lucide-react';

export default function ButtonPage() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">Button</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Clickable button component with multiple variants, sizes, and states
      </p>

      <div className="space-y-12">
        {/* Variants */}
        <ComponentExample
          title="Button Variants"
          description="Different visual styles for various use cases - now with enhanced gradients and animations!"
          code={`<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="link">Link</Button>`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
        </ComponentExample>

        {/* Sizes */}
        <ComponentExample
          title="Button Sizes"
          description="Different button sizes for various contexts - now with improved scaling animations!"
          code={`<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="xs">Extra Small</Button>
<Button size="icon">
  <Star className="h-4 w-4" />
</Button>`}
        >
          <div className="flex items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="xs">Extra Small</Button>
            <Button size="icon">
              <Star className="h-4 w-4" />
            </Button>
          </div>
        </ComponentExample>

        {/* With Icons */}
        <ComponentExample
          title="Buttons with Icons"
          description="Combining icons with text for better visual communication"
          code={`<Button>
  <UserPlus className="h-4 w-4 mr-2" />
  Add User
</Button>

<Button variant="secondary">
  <Download className="h-4 w-4 mr-2" />
  Download
</Button>

<Button variant="outline">
  <Upload className="h-4 w-4 mr-2" />
  Upload
</Button>

<Button variant="destructive">
  <Trash2 className="h-4 w-4 mr-2" />
  Delete
</Button>

<Button>
  Continue
  <ArrowRight className="h-4 w-4 ml-2" />
</Button>`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
            <Button variant="secondary">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button>
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </ComponentExample>

        {/* States */}
        <ComponentExample
          title="Button States"
          description="Different button states for various interactions"
          code={`<Button>Active</Button>
<Button disabled>Disabled</Button>

// Loading state (custom implementation)
<Button disabled>
  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
  Loading...
</Button>`}
        >
          <div className="flex items-center gap-3">
            <Button>Active</Button>
            <Button disabled>Disabled</Button>
            <Button disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </Button>
          </div>
        </ComponentExample>

        {/* Icon-Only Buttons */}
        <ComponentExample
          title="Icon-Only Buttons"
          description="Compact buttons with just icons for toolbars and tight spaces"
          code={`<Button size="icon" variant="outline">
  <Search className="h-4 w-4" />
</Button>
<Button size="icon" variant="ghost">
  <Edit2 className="h-4 w-4" />
</Button>
<Button size="icon">
  <Save className="h-4 w-4" />
</Button>
<Button size="icon" variant="destructive">
  <Trash2 className="h-4 w-4" />
</Button>`}
        >
          <div className="flex items-center gap-3">
            <Button size="icon" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost">
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button size="icon">
              <Save className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </ComponentExample>

        {/* Button Groups */}
        <ComponentExample
          title="Button Groups"
          description="Grouping related actions together"
          code={`// Primary and secondary actions
<div className="flex gap-2">
  <Button>Save Changes</Button>
  <Button variant="outline">Cancel</Button>
</div>

// Toolbar style
<div className="flex gap-1">
  <Button size="sm" variant="ghost">Bold</Button>
  <Button size="sm" variant="ghost">Italic</Button>
  <Button size="sm" variant="ghost">Underline</Button>
</div>

// Split button pattern
<div className="flex">
  <Button className="rounded-r-none">Download</Button>
  <Button variant="outline" size="icon" className="rounded-l-none border-l-0">
    <ChevronRight className="h-4 w-4" />
  </Button>
</div>`}
        >
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button>Save Changes</Button>
              <Button variant="outline">Cancel</Button>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost">
                Bold
              </Button>
              <Button size="sm" variant="ghost">
                Italic
              </Button>
              <Button size="sm" variant="ghost">
                Underline
              </Button>
            </div>
            <div className="flex">
              <Button className="rounded-r-none">Download</Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-l-none border-l-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </ComponentExample>

        {/* Enhanced Features */}
        <ComponentExample
          title="✨ Enhanced Visual Effects"
          description="Experience the new gradient backgrounds, hover animations, and visual improvements"
          code={`// All buttons now feature:
// - Multi-stop gradient backgrounds
// - Subtle hover scale animations (1.02x)
// - Active scale feedback (0.97x)
// - Enhanced shadow effects with color matching
// - Improved transition timing (300ms)
// - GPU-accelerated transforms for smooth performance

<Button variant="default" size="lg">
  Try hovering and clicking!
</Button>
<Button variant="secondary" className="ml-3">
  Beautiful
</Button>
<Button variant="outline" size="lg" className="ml-3">
  Smooth animations
</Button>`}
        >
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              🎨 Hover over the buttons below to experience the enhanced
              animations and gradients!
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4">
              <Button size="lg">Try hovering and clicking!</Button>
              <Button variant="secondary">Beautiful</Button>
              <Button variant="outline" size="lg">
                Smooth animations
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              ✨ Features: Multi-stop gradients • Hover scaling • Color-matched
              shadows • 300ms transitions
            </p>
          </div>
        </ComponentExample>

        {/* Import Example */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Import Statement
          </h3>
          <CodeBlock
            code={`import { Button } from '@summoniq/applab-ui'`}
            language="typescript"
          />
        </div>

        {/* Props Reference */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Props Reference
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Prop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Default
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                    variant
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    'default' | 'secondary' | 'outline' | 'ghost' |
                    'destructive' | 'link'
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    'default'
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Button style variant with enhanced gradients
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                    size
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    'xs' | 'sm' | 'default' | 'lg' | 'icon'
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    'default'
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Button size with hover animations
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                    disabled
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    boolean
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    false
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Disable button interaction
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                    asChild
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    boolean
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    false
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Render as child element
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
