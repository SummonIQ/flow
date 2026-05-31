import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Page, PageHeader } from '@/components/ui/page-layout';
import { Eye } from 'lucide-react';
import Link from 'next/link';

const availableComponents = [
  'HeroSection',
  'ServicesSection',
  'IndustriesSection',
  'TestimonialsSection',
  'CTASection',
  'FooterSection',
  'DotGridHero',
  'RainbowGodBeams',
] as const;

const layouts = [
  {
    id: 'modern-saas',
    name: 'Modern SaaS',
    description:
      'A sleek, modern landing page with 3D card effects, animated dot grid, and rainbow god beams.',
    features: [
      '3D Tilt Card',
      'Dot Grid Background',
      'Animated Blobs',
      'Glassmorphism',
    ],
    color: 'from-blue-500 to-cyan-500',
    preview: '/layouts/preview/modern-saas',
  },
];

export default function LayoutsPage() {
  return (
    <Page className="h-full">
      <PageHeader
        title="Layouts"
        description="Pre-built page layouts and reusable section components"
      />

      <div className="flex-1 overflow-auto p-6 space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {layouts.map(layout => (
            <Link
              key={layout.id}
              href={layout.preview}
              className="group relative border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all"
            >
              <div
                className={`h-32 bg-gradient-to-br ${layout.color} opacity-20 group-hover:opacity-30 transition-opacity`}
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                  {layout.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {layout.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {layout.features.slice(0, 3).map(feature => (
                    <Badge
                      key={feature}
                      variant="secondary"
                      className="text-xs"
                    >
                      {feature}
                    </Badge>
                  ))}
                  {layout.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{layout.features.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {layouts.length === 0 && (
          <Card>
            <div className="flex flex-col items-center justify-center py-12 p-6">
              <p className="text-muted-foreground text-center">
                No layouts available yet.
              </p>
            </div>
          </Card>
        )}

        <Card className="border-dashed">
          <div className="p-6 pb-2">
            <h3 className="text-lg font-semibold">Using Layout Components</h3>
            <p className="text-sm text-muted-foreground">
              Import and customize section components for your landing pages
            </p>
          </div>
          <div className="p-6 pt-4 space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Available Components</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {availableComponents.map(component => (
                  <Link
                    key={component}
                    href={`/layouts/components/${encodeURIComponent(component)}`}
                    className="rounded bg-muted px-2 py-1 font-mono transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {component}
                  </Link>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Import</h4>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                <code>{`import {
  HeroSection,
  ServicesSection,
  CTASection,
  FooterSection,
} from '@/app/layouts/components';`}</code>
              </pre>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Usage</h4>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                <code>{`<HeroSection
  badge="Now available"
  headline="Build something amazing."
  primaryCta={{ label: 'Get Started', href: '/start' }}
/>

<ServicesSection
  headline="How we work"
  services={[...]}
/>`}</code>
              </pre>
            </div>
          </div>
        </Card>
      </div>
    </Page>
  );
}
