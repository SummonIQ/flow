import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowRight,
  Database,
  Download,
  Filter,
  Radar,
  Sparkles,
  Upload,
} from 'lucide-react';
import Link from 'next/link';

const leadSources = [
  {
    name: 'CSV imports',
    detail: 'Manual uploads and ad-hoc lists',
    status: 'Ready',
  },
  {
    name: 'LinkedIn tools',
    detail: 'Search + extract + enrichment workflows',
    status: 'Connect',
  },
  {
    name: 'Website forms',
    detail: 'Inbound leads from landing pages',
    status: 'Pending',
  },
];

const campaigns = [
  {
    name: 'Agency services — B2B SaaS founders',
    metric: '18% reply rate',
    stage: 'Running',
  },
  {
    name: 'Recruiting — design engineers',
    metric: '42 prospects',
    stage: 'Draft',
  },
  {
    name: 'Upsell — existing clients',
    metric: '3 warm intros',
    stage: 'Planned',
  },
];

export default function LeadGenerationPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-amber-500/10 p-2">
                <Radar className="h-5 w-5 text-amber-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Lead Generation
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Build lists, enrich contacts, and track handoffs into outreach and
              pipeline.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/lead-generation/search">
                <Filter className="mr-2 h-4 w-4" />
                Prospect discovery
              </Link>
            </Button>
            <Button>
              <Sparkles className="mr-2 h-4 w-4" />
              Enrich list
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Active campaigns</CardTitle>
                <CardDescription>
                  Keep your lead gen organized by intent so follow-up stays
                  consistent.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {campaigns.map(c => (
                  <div
                    key={c.name}
                    className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-muted/30 p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {c.name}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {c.metric}
                      </p>
                    </div>
                    <Badge
                      variant={c.stage === 'Running' ? 'secondary' : 'outline'}
                    >
                      {c.stage}
                    </Badge>
                  </div>
                ))}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button size="sm" variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Import leads
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export list
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data sources</CardTitle>
                  <CardDescription>
                    Connect lead sources and standardize ingestion so you can
                    dedupe + enrich.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {leadSources.map(source => (
                    <div
                      key={source.name}
                      className="rounded-lg border border-border/60 bg-muted/30 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {source.name}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {source.detail}
                          </p>
                        </div>
                        <Badge
                          variant={
                            source.status === 'Ready' ? 'secondary' : 'outline'
                          }
                        >
                          {source.status}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  <div className="pt-1">
                    <Button asChild size="sm" variant="ghost">
                      <Link href="/lead-data-integration">
                        <Database className="mr-2 h-4 w-4" />
                        Manage integrations
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/business-tools">Back to Business Tools</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
