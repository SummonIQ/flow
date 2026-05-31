import { Card, CardContent } from '@summoniq/applab-ui';
import { Moon } from 'lucide-react';
import Link from 'next/link';

const themeComponents = [
  {
    href: '/components/theme/theme-toggle',
    title: 'Theme Toggle',
    description: 'Switch between light and dark themes',
    preview: (
      <div className="flex items-center gap-2">
        <div className="w-10 h-6 rounded-full bg-primary relative">
          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
        </div>
        <Moon className="w-4 h-4" />
      </div>
    ),
  },
  {
    href: '/components/theme/theme-customizer',
    title: 'Theme Customizer',
    description: 'Customize theme colors and appearance',
    preview: (
      <div className="grid grid-cols-2 gap-2">
        <div className="h-6 rounded bg-primary" />
        <div className="h-6 rounded bg-secondary" />
        <div className="h-6 rounded bg-accent" />
        <div className="h-6 rounded bg-muted" />
      </div>
    ),
  },
];

export default function ThemePage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/components"
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Components
        </Link>
        <h1 className="text-xl font-bold tracking-tight">Theme Components</h1>
        <p className="text-muted-foreground mt-2">
          Components for theme customization and color management
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {themeComponents.map(component => (
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
