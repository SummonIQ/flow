import { Card, CardContent } from '@summoniq/applab-ui';
import Link from 'next/link';

const containerComponents = [
  {
    href: '/components/containers/card',
    title: 'Card',
    description: 'Flexible container for grouping content',
    preview: (
      <div className="w-full space-y-1.5">
        <div className="h-3 w-3/4 bg-foreground rounded" />
        <div className="h-2 w-1/2 bg-muted-foreground rounded" />
        <div className="h-8 bg-muted rounded mt-2" />
      </div>
    ),
  },
  {
    href: '/components/containers/glass',
    title: 'Glass',
    description: 'Glassmorphism container with blur',
    preview: (
      <div className="w-full h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
        <span className="text-xs">Glass Effect</span>
      </div>
    ),
  },
  {
    href: '/components/containers/page',
    title: 'Page',
    description: 'Standard page layout wrapper',
    preview: (
      <div className="w-full border-2 border-dashed border-muted-foreground/30 rounded p-2">
        <div className="h-2 w-1/2 bg-muted rounded mb-2" />
        <div className="h-1 w-full bg-muted/50 rounded" />
        <div className="h-1 w-3/4 bg-muted/50 rounded mt-1" />
      </div>
    ),
  },
];

export default function ContainersPage() {
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
          Container Components
        </h1>
        <p className="text-muted-foreground mt-2">
          Containers and wrappers for organizing and styling content
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {containerComponents.map(component => (
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
