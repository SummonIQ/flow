import { getComponentCategories } from '@/lib/data/components';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@summoniq/applab-ui';
import {
  Box,
  Code,
  Database,
  Eye,
  Film,
  Grid3x3,
  Layout,
  Palette,
} from 'lucide-react';
import Link from 'next/link';

const categoryIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  forms: Code,
  layout: Layout,
  display: Eye,
  theme: Palette,
  containers: Box,
  navigation: Grid3x3,
  data: Database,
  media: Film,
};

const categoryDescriptions: Record<string, string> = {
  forms: 'Interactive form elements including buttons, inputs, and controls',
  layout: 'Components for structuring and organizing your UI',
  display: 'Visual components for displaying content and information',
  theme: 'Theme customization and appearance controls',
  containers: 'Wrapper components for content organization',
  navigation: 'Navigation and menu components',
  data: 'Components for displaying and managing data',
  media: 'Image, video, and icon components',
};

const categoryLabels: Record<string, string> = {
  forms: 'Forms',
  layout: 'Layout',
  display: 'Display',
  theme: 'Theme',
  containers: 'Containers',
  navigation: 'Navigation',
  data: 'Data',
  media: 'Media',
};

export default async function ComponentsPage() {
  const categories = await getComponentCategories();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Component Library</h1>
        <p className="text-muted-foreground mt-2">
          Browse and explore our comprehensive collection of reusable UI
          components
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map(category => {
          const Icon = categoryIcons[category.name] || Box;
          const label = categoryLabels[category.name] || category.name;
          const description =
            categoryDescriptions[category.name] ||
            `Browse ${category.name} components`;
          const isHighlight = false;

          return (
            <Link key={category.name} href={`/components/${category.name}`}>
              <Card
                className={`h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer ${
                  isHighlight
                    ? 'border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10'
                    : ''
                }`}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`p-1.5 rounded-md ${
                        isHighlight
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-medium flex items-center gap-1.5">
                      {label}
                      {category.count > 0 && (
                        <span className="text-[10px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                          {category.count}
                        </span>
                      )}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {categories.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              No components found. Run the seed script to add components.
            </p>
            <code className="text-sm mt-4 px-4 py-2 bg-muted rounded-md">
              bun run prisma db seed -- --seed seed-components.ts
            </code>
          </CardContent>
        </Card>
      )}

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Learn how to use components in your projects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Import components</h4>
            <pre className="bg-muted p-4 rounded-lg text-sm">
              <code>{`import { Button, Card, Badge } from '@summoniq/applab-ui';`}</code>
            </pre>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Use in your code</h4>
            <pre className="bg-muted p-4 rounded-lg text-sm">
              <code>{`<Card>
  <CardHeader>
    <CardTitle>Hello World</CardTitle>
  </CardHeader>
  <CardContent>
    <Button>Click me</Button>
  </CardContent>
</Card>`}</code>
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
