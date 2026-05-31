import { Card, CardContent } from '@summoniq/applab-ui';
import { ChevronRight, Home, Square } from 'lucide-react';
import Link from 'next/link';

const navigationComponents = [
  {
    href: '/components/navigation/breadcrumb',
    title: 'Breadcrumb',
    description: 'Navigation trail showing page location',
    preview: (
      <div className="flex items-center gap-1 text-xs">
        <Home className="w-3 h-3" />
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <span className="text-muted-foreground">Page</span>
      </div>
    ),
  },
  {
    href: '/components/navigation/tabs',
    title: 'Animated Tabs',
    description: 'Tabs with animated indicator',
    preview: (
      <div className="flex gap-2">
        <div className="px-2 py-1 text-xs rounded border-b-2 border-primary bg-primary/10">
          Tab 1
        </div>
        <div className="px-2 py-1 text-xs text-muted-foreground">Tab 2</div>
      </div>
    ),
  },
  {
    href: '/components/navigation/side-nav',
    title: 'Animated Side Nav',
    description: 'Sidebar navigation with line indicator',
    preview: (
      <div className="w-full space-y-1">
        <div className="flex items-center gap-2 text-xs px-2 py-1 rounded bg-primary/10">
          <Square className="w-3 h-3" />
          <span>Active</span>
        </div>
        <div className="flex items-center gap-2 text-xs px-2 py-1 text-muted-foreground">
          <Square className="w-3 h-3" />
          <span>Item</span>
        </div>
      </div>
    ),
  },
  {
    href: '/components/navigation/menu',
    title: 'Navigation Menu',
    description: 'Main navigation with dropdowns',
    preview: (
      <div className="w-full space-y-1">
        <div className="px-2 py-1 text-xs rounded bg-muted">Menu Item</div>
        <div className="px-2 py-1 text-xs rounded bg-muted">Menu Item</div>
      </div>
    ),
  },
];

export default function NavigationPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/components"
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Components
        </Link>
        <h1 className="text-xl font-bold tracking-tight">
          Navigation Components
        </h1>
        <p className="text-muted-foreground mt-2">
          Components for navigation, routing, and user flow
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {navigationComponents.map(component => (
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
