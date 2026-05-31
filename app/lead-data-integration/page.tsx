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
import {
  ArrowRight,
  Database,
  FileSpreadsheet,
  Link2,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

const connectors = [
  {
    name: 'CSV / Spreadsheet',
    status: 'Enabled',
    detail: 'Upload lists, map fields, and dedupe on email/domain.',
  },
  {
    name: 'LinkedIn Tools',
    status: 'Disconnected',
    detail: 'Search + enrichment (requires auth / tokens).',
  },
  {
    name: 'Website forms',
    status: 'Planned',
    detail: 'POST endpoint + webhook verification.',
  },
];

const mappings = [
  { from: 'company', to: 'Company.name', rule: 'trim + normalize spacing' },
  { from: 'website', to: 'Company.website', rule: 'ensure https://' },
  { from: 'email', to: 'Contact.email', rule: 'lowercase' },
  { from: 'role', to: 'Contact.role', rule: 'optional' },
];

export default function LeadDataIntegrationPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-slate-500/10 p-2">
                <Database className="h-5 w-5 text-slate-300" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Lead Data Integration
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Connect sources, map fields, and enforce data hygiene (dedupe,
              normalization, compliance).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Validate
            </Button>
            <Button asChild>
              <Link href="/lead-generation">
                <ArrowRight className="mr-2 h-4 w-4" />
                Back to Lead Gen
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Connectors</CardTitle>
                <CardDescription>
                  Each source can have its own mapping + dedupe rules.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {connectors.map(c => (
                  <div
                    key={c.name}
                    className="rounded-lg border border-border/60 bg-muted/30 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {c.name}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {c.detail}
                        </p>
                      </div>
                      <Badge
                        variant={
                          c.status === 'Enabled' ? 'secondary' : 'outline'
                        }
                      >
                        {c.status}
                      </Badge>
                    </div>
                  </div>
                ))}

                <div className="pt-1">
                  <Button size="sm" variant="outline">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    New CSV import
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <section className="space-y-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Field mapping
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Normalize data on ingestion so downstream outreach stays
                    clean.
                  </p>
                </div>
                <Report
                  className="h-auto"
                  data={mappings}
                  definition={{
                    columns: [
                      { header: 'Source field', key: 'from' },
                      { header: 'Destination', key: 'to' },
                      { header: 'Rule', key: 'rule' },
                    ],
                    data: mappings,
                    view: 'table' as any,
                    sortBy: 'from',
                    activeFilters: [],
                    filters: [],
                  }}
                />
              </section>

              <Card>
                <CardHeader>
                  <CardTitle>Dedupe rules</CardTitle>
                  <CardDescription>
                    Prevent duplicate contacts and conflicting company records.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">
                      Primary keys
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Contact.email, Company.website/domain
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">
                      Merge strategy
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Prefer non-empty values, keep a source trace per field.
                    </p>
                  </div>
                  <div className="pt-1">
                    <Button asChild size="sm" variant="ghost">
                      <Link href="/business-tools">
                        <Link2 className="mr-2 h-4 w-4" />
                        Back to Business Tools
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
