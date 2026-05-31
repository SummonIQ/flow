'use client';

import { TagList } from '@/components/ui/tag';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@summoniq/applab-ui';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

interface Component {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  type: string;
  tags: string[];
}

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  // Unwrap params using React.use()
  const { category } = use(params);

  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategoryComponents();
  }, [category]);

  const fetchCategoryComponents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/components/by-category/${category}`);

      if (!response.ok) {
        throw new Error('Failed to load components');
      }

      const data = await response.json();
      setComponents(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load components',
      );
    } finally {
      setLoading(false);
    }
  };

  const categoryNames: Record<string, string> = {
    forms: 'Form Components',
    display: 'Display Components',
    layout: 'Layout Components',
    containers: 'Container Components',
    navigation: 'Navigation Components',
    data: 'Data Components',
    theme: 'Theme Components',
    media: 'Media Components',
  };

  const categoryDescriptions: Record<string, string> = {
    forms: 'Interactive form elements including buttons, inputs, and controls',
    display: 'Visual components for displaying content and information',
    layout: 'Components for structuring and organizing your UI',
    containers: 'Wrapper components for content organization',
    navigation: 'Navigation and menu components',
    data: 'Components for displaying and managing data',
    theme: 'Theme customization and appearance controls',
    media: 'Image, video, and icon components',
  };

  const categoryName = categoryNames[category] || category;
  const categoryDescription =
    categoryDescriptions[category] || `Browse ${category} components`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="space-y-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading components...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Failed to Load</h2>
          <p className="text-muted-foreground">{error}</p>
          <Link href="/components" className="text-primary hover:underline">
            ← Back to Components
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/components"
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Components
        </Link>
        <h1 className="text-xl font-bold tracking-tight">{categoryName}</h1>
        <p className="text-muted-foreground mt-2">{categoryDescription}</p>
      </div>

      {components.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              No components found in this category yet.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Components will appear here once they're added to the database.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {components.map(component => (
            <Link
              key={component.id}
              href={`/components/${category}/${component.slug}`}
            >
              <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{component.name}</CardTitle>
                  <CardDescription>{component.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <TagList tags={component.tags} max={3} size="sm" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
