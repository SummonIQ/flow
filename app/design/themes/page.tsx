import { Button, Card } from '@summoniq/applab-ui';
import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';
import { ArrowRight, Brush } from 'lucide-react';
import Link from 'next/link';

const themes = [
  {
    id: 'zen',
    name: 'Zen',
    description:
      'A purple/fuchsia/pink gradient theme with glass morphism effects. Perfect for modern SaaS landing pages.',
    preview: {
      primary: 'from-purple-600 via-fuchsia-600 to-pink-600',
      background: 'bg-white',
      accent: 'bg-fuchsia-50',
    },
    features: ['Glass cards', 'Aurora backgrounds', 'Gradient CTAs'],
  },
];

export default function ThemesPage() {
  return (
    <Page className="h-full">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <span className="rounded-lg bg-fuchsia-500/10 p-2">
              <Brush className="h-5 w-5 text-fuchsia-500" />
            </span>
            Themes
          </span>
        }
        description="Pre-built landing page themes and design systems for your projects."
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {themes.map(theme => (
            <Card key={theme.id} className="overflow-hidden">
              {/* Theme Preview */}
              <div
                className={`relative h-40 ${theme.preview.background} overflow-hidden`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${theme.preview.primary} opacity-20`}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`rounded-xl bg-gradient-to-br ${theme.preview.primary} px-6 py-3 text-sm font-semibold text-white shadow-lg`}
                  >
                    {theme.name}
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                  {theme.features.map(feature => (
                    <span
                      key={feature}
                      className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-gray-700 backdrop-blur-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Theme Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{theme.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {theme.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    asChild
                    variant="default"
                    size="sm"
                    className="flex-1"
                  >
                    <Link href={`/design/themes/${theme.id}`}>
                      View Theme
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Page>
  );
}
