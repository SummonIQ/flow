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
  CheckCircle2,
  ShieldAlert,
  Timer,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';

const checks = [
  { name: 'Auth', detail: 'Token present + accepted', status: 'Pass' },
  { name: 'Latency', detail: 'p95 < 800ms', status: 'Watch' },
  { name: 'Schema', detail: 'Response shape matches contract', status: 'Pass' },
  { name: 'Rate limits', detail: 'No 429s in last run', status: 'Pass' },
];

const endpoints = [
  {
    method: 'GET',
    path: '/api/workflows',
    expected: '200',
    last: 'Today',
    status: 'Pass',
  },
  {
    method: 'GET',
    path: '/api/projects',
    expected: '200',
    last: 'Today',
    status: 'Pass',
  },
  {
    method: 'POST',
    path: '/api/leads/import',
    expected: '201',
    last: '—',
    status: 'Not run',
  },
];

export default function ApiValidationPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-emerald-500/10 p-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                API Validation
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Verify connectivity, contracts, and performance. Use this as your
              pre-flight before launches.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Wrench className="mr-2 h-4 w-4" />
              Run suite
            </Button>
            <Button asChild>
              <Link href="/api-setup">
                Back to API Setup <ArrowRight className="ml-2 h-4 w-4" />
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
                <CardTitle>Health checks</CardTitle>
                <CardDescription>
                  Fast signals that something is broken.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {checks.map(c => (
                  <div
                    key={c.name}
                    className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-muted/30 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {c.name}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {c.detail}
                      </p>
                    </div>
                    <Badge
                      variant={c.status === 'Pass' ? 'secondary' : 'outline'}
                    >
                      {c.status}
                    </Badge>
                  </div>
                ))}

                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium text-foreground">Last run</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Today · 11 checks
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <section className="space-y-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Endpoints
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Contracts are your source of truth. If responses drift, update
                  schema + regenerate client.
                </p>
              </div>
              <Report
                className="h-auto"
                data={endpoints}
                definition={{
                  columns: [
                    { header: 'Method', key: 'method' },
                    { header: 'Path', key: 'path' },
                    { header: 'Expected', key: 'expected' },
                    { header: 'Last', key: 'last' },
                    { header: 'Status', key: 'status' },
                  ],
                  data: endpoints,
                  view: 'table' as any,
                  sortBy: 'path',
                  activeFilters: [],
                  filters: [],
                }}
              />

              <div className="pt-3">
                <Button asChild size="sm" variant="ghost">
                  <Link href="/business-tools">
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    Back to Business Tools
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
