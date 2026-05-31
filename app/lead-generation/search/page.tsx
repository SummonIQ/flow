import { Report } from '@summoniq/applab-ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Filter, ListPlus, Search, Sparkles, Upload } from 'lucide-react';
import Link from 'next/link';

const segments = [
  { name: 'Founders (Seed–Series A)', hint: 'US + EU, B2B SaaS', count: 132 },
  { name: 'Heads of Marketing', hint: 'Demand gen, PLG', count: 88 },
  { name: 'Recruiting leads', hint: 'Hiring design engineers', count: 41 },
];

const sampleResults = [
  {
    name: 'Harper & Co.',
    title: 'CTO',
    person: 'Riley Chen',
    signal: 'Hiring: 2 eng roles',
    fit: 'High',
  },
  {
    name: 'Northwind Labs',
    title: 'Founder',
    person: 'Alex Morgan',
    signal: 'Raised seed (recent)',
    fit: 'Medium',
  },
  {
    name: 'Baseline Health',
    title: 'Head of Growth',
    person: 'Taylor Singh',
    signal: 'PLG experiments',
    fit: 'High',
  },
];

const sampleResultRows = sampleResults.map(row => ({
  ...row,
  prospect: `${row.person} · ${row.title}`,
}));

export default function LeadGenerationSearchPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-orange-500/10 p-2">
                <Search className="h-5 w-5 text-orange-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Prospect Discovery
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Build targeted lists by role, industry, and intent signals. Save
              segments, then export to outreach.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Sparkles className="mr-2 h-4 w-4" />
              AI narrow
            </Button>
            <Button>
              <ListPlus className="mr-2 h-4 w-4" />
              Save segment
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Start broad, then apply intent signals (funding, hiring, tech
                  stack, keywords).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Target role
                  </p>
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="e.g. founder, CTO, head of growth"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Industry
                    </p>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="B2B SaaS, health, fintech"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Geo
                    </p>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="US, EU, Remote"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Intent signals
                  </p>
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="hiring, raised, rebrand, website refresh"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Apply
                  </Button>
                  <Button size="sm" variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload list
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/lead-generation">Back to Lead Gen</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Saved segments</CardTitle>
                  <CardDescription>
                    Re-run the same audience definition across new signals and
                    sources.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {segments.map(s => (
                    <div
                      key={s.name}
                      className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {s.name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {s.hint}
                        </p>
                      </div>
                      <Badge variant="secondary">{s.count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <section className="space-y-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Results preview
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Score quickly, then add to a list for export or outreach.
                  </p>
                </div>
                <Report
                  className="h-auto"
                  data={sampleResultRows}
                  definition={{
                    columns: [
                      { header: 'Company', key: 'name' },
                      { header: 'Prospect', key: 'prospect' },
                      { header: 'Signal', key: 'signal' },
                      { header: 'Fit', key: 'fit' },
                    ],
                    data: sampleResultRows,
                    view: 'table' as any,
                    sortBy: 'name',
                    activeFilters: [],
                    filters: [],
                  }}
                />

                <div className="pt-3">
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/business-tools">Back to Business Tools</Link>
                  </Button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
