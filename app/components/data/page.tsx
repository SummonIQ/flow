import { Card, CardContent } from '@summoniq/applab-ui';
import Link from 'next/link';

const dataComponents = [
  {
    href: '/components/data/table',
    title: 'Table',
    description: 'Display structured data in rows and columns',
    preview: (
      <div className="w-full space-y-1">
        <div className="grid grid-cols-3 gap-1">
          <div className="h-2 bg-muted rounded" />
          <div className="h-2 bg-muted rounded" />
          <div className="h-2 bg-muted rounded" />
        </div>
        <div className="grid grid-cols-3 gap-1">
          <div className="h-2 bg-muted/50 rounded" />
          <div className="h-2 bg-muted/50 rounded" />
          <div className="h-2 bg-muted/50 rounded" />
        </div>
        <div className="grid grid-cols-3 gap-1">
          <div className="h-2 bg-muted/50 rounded" />
          <div className="h-2 bg-muted/50 rounded" />
          <div className="h-2 bg-muted/50 rounded" />
        </div>
      </div>
    ),
  },
  {
    href: '/components/data/metadata-list',
    title: 'Metadata List',
    description: 'Key-value pairs in structured format',
    preview: (
      <div className="w-full space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Label</span>
          <span className="text-xs">Value</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Label</span>
          <span className="text-xs">Value</span>
        </div>
      </div>
    ),
  },
];

export default function DataPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/components"
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Components
        </Link>
        <h1 className="text-xl font-bold tracking-tight">Data Components</h1>
        <p className="text-muted-foreground mt-2">
          Components for displaying and organizing data
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {dataComponents.map(component => (
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
