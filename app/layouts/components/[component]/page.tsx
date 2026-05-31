import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Page, PageHeader } from '@/components/ui/page-layout';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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

type AvailableComponent = (typeof availableComponents)[number];

function isAvailableComponent(value: string): value is AvailableComponent {
  return (availableComponents as readonly string[]).includes(value);
}

export default async function LayoutComponentPage({
  params,
}: Readonly<{ params: Promise<{ component: string }> }>) {
  const { component } = await params;
  const decoded = decodeURIComponent(component);

  if (!isAvailableComponent(decoded)) {
    notFound();
  }

  return (
    <Page className="h-full">
      <PageHeader
        title={decoded}
        description="Reusable layout section component"
        actions={
          <Link
            href="/layouts"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to Layouts
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold leading-none">{decoded}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Import and compose this section inside your landing page route.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Layout Component
              </Badge>
              <Badge variant="outline" className="text-xs">
                /app/layouts/components
              </Badge>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-sm font-semibold">Import</h3>
            <pre className="mt-3 rounded-lg bg-muted p-4 text-sm overflow-x-auto">
              <code>{`import { ${decoded} } from '@/app/layouts/components';`}</code>
            </pre>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold">Usage</h3>
            <pre className="mt-3 rounded-lg bg-muted p-4 text-sm overflow-x-auto">
              <code>{`<${decoded}
  // props vary by component
/>`}</code>
            </pre>
          </Card>
        </div>
      </div>
    </Page>
  );
}
