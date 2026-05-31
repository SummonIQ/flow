import type { AnimatedSideNavSection } from '@/components/navigation/animated-side-nav';
import { prisma } from '@/lib/db/prisma';
import {
  Box,
  Code,
  Database,
  Eye,
  Film,
  Grid3x3,
  Layout,
  Navigation,
  Palette,
} from 'lucide-react';
import { unstable_noStore as noStore } from 'next/cache';
import { ComponentsSidebar } from './components-sidebar';

// Category metadata for icons and display names
const categoryMeta: Record<string, { label: string; icon: React.ReactNode }> = {
  forms: { label: 'Forms', icon: <Code className="w-4 h-4" /> },
  layout: { label: 'Layout', icon: <Layout className="w-4 h-4" /> },
  display: { label: 'Display', icon: <Eye className="w-4 h-4" /> },
  navigation: { label: 'Navigation', icon: <Navigation className="w-4 h-4" /> },
  containers: { label: 'Containers', icon: <Box className="w-4 h-4" /> },
  data: { label: 'Data', icon: <Database className="w-4 h-4" /> },
  theme: { label: 'Theme', icon: <Palette className="w-4 h-4" /> },
  media: { label: 'Media', icon: <Film className="w-4 h-4" /> },
};

// Order for categories in navigation
const categoryOrder = [
  'forms',
  'layout',
  'display',
  'navigation',
  'containers',
  'data',
  'theme',
  'media',
];

async function getNavigation(): Promise<AnimatedSideNavSection[]> {
  noStore();
  try {
    const components = await prisma.component.findMany({
      where: { isPublished: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      select: { slug: true, name: true, category: true },
    });

    // Group by category
    const grouped: Record<string, { slug: string; name: string }[]> = {};
    for (const comp of components) {
      if (!grouped[comp.category]) {
        grouped[comp.category] = [];
      }
      grouped[comp.category].push({ slug: comp.slug, name: comp.name });
    }

    // Build navigation sections
    const sections: AnimatedSideNavSection[] = [
      {
        href: '/components',
        label: 'Overview',
        icon: <Grid3x3 className="w-4 h-4" />,
      },
    ];

    // Add categories in order
    for (const category of categoryOrder) {
      const items = grouped[category];
      if (items && items.length > 0) {
        const meta = categoryMeta[category] || {
          label: category,
          icon: <Box className="w-4 h-4" />,
        };
        sections.push({
          href: `/components/${category}`,
          label: meta.label,
          icon: meta.icon,
          subItems: items.map(item => ({
            href: `/components/${category}/${item.slug}`,
            label: item.name,
          })),
        });
      }
    }

    return sections;
  } catch (error) {
    console.error('Error fetching navigation:', error);
    // Return minimal fallback
    return [
      {
        href: '/components',
        label: 'Overview',
        icon: <Grid3x3 className="w-4 h-4" />,
      },
    ];
  }
}

export default async function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigation = await getNavigation();

  return (
    <ComponentsSidebar navigation={navigation}>{children}</ComponentsSidebar>
  );
}
