import { Metadata } from 'next';
import Link from 'next/link';
import { LayoutGrid, Sidebar, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Layout Components',
  description: 'Pre-built layout patterns for common application structures.',
};

const layouts = [
  {
    title: 'Sidebar Layout',
    description: 'Classic sidebar navigation with collapsible menu and responsive design.',
    href: '/layouts/sidebar-layout',
    icon: Sidebar,
  },
  {
    title: 'Stacked Layout',
    description: 'Vertical stacked layout with header, content area, and optional footer.',
    href: '/layouts/stacked-layout',
    icon: Layers,
  },
];

export default function LayoutsPage() {
  return (
    <div className="p-6 w-full">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <LayoutGrid className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Layout Components</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Pre-built layout patterns for common application structures. Each layout includes responsive behavior,
          theme support, and composable primitives.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {layouts.map((layout) => {
          const Icon = layout.icon;
          return (
            <Link
              key={layout.href}
              href={layout.href}
              className="group block rounded-lg border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {layout.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {layout.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
