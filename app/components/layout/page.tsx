import { Card, CardContent, Separator } from '@summoniq/applab-ui';
import { ChevronDown, Square } from 'lucide-react';
import Link from 'next/link';

const layoutComponents = [
  {
    href: '/components/layout/dropdown-menu',
    title: 'Dropdown Menu',
    description: 'Contextual dropdown menus for actions',
    preview: (
      <div className="flex items-center gap-2">
        <div className="px-3 py-1.5 text-xs rounded-md border bg-background">
          Menu <ChevronDown className="w-3 h-3 inline ml-1" />
        </div>
      </div>
    ),
  },
  {
    href: '/components/layout/modal',
    title: 'Modal',
    description: 'Modal overlay for focused content',
    preview: (
      <div className="relative w-full h-16 rounded-md border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
        <Square className="w-6 h-6 text-muted-foreground" />
      </div>
    ),
  },
  {
    href: '/components/layout/popover',
    title: 'Popover',
    description: 'Floating content attached to triggers',
    preview: (
      <div className="px-3 py-1.5 text-xs rounded-md border bg-background">
        Popover
      </div>
    ),
  },
  {
    href: '/components/layout/collapsible',
    title: 'Collapsible',
    description: 'Expandable/collapsible sections',
    preview: (
      <div className="w-full space-y-1">
        <div className="flex items-center gap-2 text-xs">
          <ChevronDown className="w-3 h-3" />
          <span>Section</span>
        </div>
        <div className="ml-5 h-6 rounded border-l-2 border-primary/30" />
      </div>
    ),
  },
  {
    href: '/components/layout/separator',
    title: 'Separator',
    description: 'Visual divider between sections',
    preview: (
      <div className="w-full space-y-2">
        <div className="h-1 bg-muted rounded" />
        <Separator />
        <div className="h-1 bg-muted rounded" />
      </div>
    ),
  },
  {
    href: '/components/layout/responsive',
    title: 'Responsive',
    description: 'Responsive layout utilities',
    preview: (
      <div className="grid grid-cols-3 gap-1">
        <div className="h-8 rounded bg-muted" />
        <div className="h-8 rounded bg-muted" />
        <div className="h-8 rounded bg-muted" />
      </div>
    ),
  },
];

export default function LayoutPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/components"
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Components
        </Link>
        <h1 className="text-xl font-bold tracking-tight">Layout Components</h1>
        <p className="text-muted-foreground mt-2">
          Components for organizing and structuring your UI
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {layoutComponents.map(component => (
          <Link key={component.href} href={component.href}>
            <Card className="h-full hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
              <CardContent className="p-3">
                <div className="p-3 rounded-md bg-muted/30 border mb-2 flex items-center justify-center h-[64px]">
                  {component.preview}
                </div>
                <h3 className="text-sm font-medium">{component.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {component.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
