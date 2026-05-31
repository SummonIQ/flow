import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, Download, Globe, Search, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

const tools = [
  {
    name: 'Prospect search',
    status: 'Disconnected',
    detail: 'Requires access token + cookie/session strategy.',
  },
  {
    name: 'Company enrichment',
    status: 'Disconnected',
    detail: 'Scrape-safe mode + strict rate limiting.',
  },
  {
    name: 'Export to CSV',
    status: 'Ready',
    detail: 'Works once you have structured results.',
  },
];

const savedSearches = [
  {
    name: 'Seed founders (B2B SaaS)',
    query: 'Founder AND Seed AND B2B SaaS',
    last: '—',
  },
  { name: 'Heads of Growth (PLG)', query: 'Head of Growth AND PLG', last: '—' },
];

export default function LinkedinIntegrationPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-blue-500/10 p-2">
                <Globe className="h-5 w-5 text-blue-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                LinkedIn Tools
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Build targeted lists and export into lead gen. Keep usage
              conservative and rate-limited.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              New search
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button asChild>
              <Link href="/lead-generation/search">
                Prospect discovery <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card>
              <CardHeader>
                <CardTitle>Tooling status</CardTitle>
                <CardDescription>
                  LinkedIn access often requires careful session management.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {tools.map(t => (
                  <div
                    key={t.name}
                    className="rounded-lg border border-border/60 bg-muted/30 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {t.name}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {t.detail}
                        </p>
                      </div>
                      <Badge
                        variant={t.status === 'Ready' ? 'secondary' : 'outline'}
                      >
                        {t.status}
                      </Badge>
                    </div>
                  </div>
                ))}

                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">
                        Rate limit mode
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Conservative (recommended)
                      </p>
                    </div>
                    <Badge variant="outline">Safe</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Saved searches</CardTitle>
                <CardDescription>
                  These become reusable segments. Keep them narrow and
                  intent-based.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {savedSearches.map(s => (
                  <div
                    key={s.name}
                    className="rounded-lg border border-border/60 bg-muted/30 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {s.name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {s.query}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Last: {s.last}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      If this stays disconnected, use CSV imports as the source
                      of truth.
                    </p>
                  </div>
                </div>

                <div className="pt-1">
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/business-tools">Back to Business Tools</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
