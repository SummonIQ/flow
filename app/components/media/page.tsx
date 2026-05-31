import { Card, CardContent } from '@summoniq/applab-ui';
import { Film, Image, Sparkles } from 'lucide-react';
import Link from 'next/link';

const mediaComponents = [
  {
    href: '/components/media/image',
    title: 'Image',
    description: 'Optimized image component with loading states',
    preview: (
      <div className="w-full h-16 rounded bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        <Image className="w-6 h-6 text-muted-foreground" />
      </div>
    ),
  },
  {
    href: '/components/media/video',
    title: 'Video',
    description: 'Video player with controls and accessibility',
    preview: (
      <div className="w-full h-16 rounded bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
        <Film className="w-6 h-6 text-muted-foreground" />
      </div>
    ),
  },
  {
    href: '/components/media/icon',
    title: 'Icon',
    description: 'Icon library with Lucide icons',
    preview: (
      <div className="flex gap-2 items-center justify-center">
        <Sparkles className="w-5 h-5" />
        <Image className="w-5 h-5" />
        <Film className="w-5 h-5" />
      </div>
    ),
  },
];

export default function MediaPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/components"
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Components
        </Link>
        <h1 className="text-xl font-bold tracking-tight">Media Components</h1>
        <p className="text-muted-foreground mt-2">
          Components for images, videos, and icons
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {mediaComponents.map(component => (
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
