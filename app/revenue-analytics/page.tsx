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
import { ArrowRight, BarChart3, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const kpis = [
  {
    label: 'Revenue (30d)',
    value: '$18.4k',
    detail: 'Collected',
    icon: DollarSign,
  },
  {
    label: 'Outstanding',
    value: '$6.7k',
    detail: 'Invoices sent',
    icon: BarChart3,
  },
  {
    label: 'Forecast (30d)',
    value: '$24.1k',
    detail: 'If invoices paid',
    icon: TrendingUp,
  },
];

const byClient = [
  { client: 'Baseline Health', revenue: '$12.5k', status: 'Active' },
  { client: 'Northwind Labs', revenue: '$6.4k', status: 'Active' },
  { client: 'Harper & Co.', revenue: '$3.9k', status: 'Draft' },
];

const pipeline = [
  { stage: 'Qualified', value: '$8.2k', count: 3 },
  { stage: 'Proposal sent', value: '$12.5k', count: 2 },
  { stage: 'Negotiation', value: '$6.4k', count: 1 },
];

export default function RevenueAnalyticsPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-lime-500/10 p-2">
                <TrendingUp className="h-5 w-5 text-lime-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Revenue Analytics
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Understand cash flow, outstanding invoices, and forward-looking
              revenue signals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/invoices">Invoices</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/payments">Payments</Link>
            </Button>
            <Button asChild>
              <Link href="/business-tools">
                Back to Business Tools <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-3">
            {kpis.map(kpi => (
              <Card key={kpi.label}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {kpi.label}
                      </p>
                      <p className="text-xl font-semibold text-foreground">
                        {kpi.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {kpi.detail}
                      </p>
                    </div>
                    <span className="rounded-md bg-muted p-2 text-muted-foreground">
                      <kpi.icon className="h-4 w-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Revenue by client
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Concentration risk is real; track top accounts and renewals.
                </p>
              </div>
              <Report
                className="h-auto"
                data={byClient}
                definition={{
                  columns: [
                    { header: 'Client', key: 'client' },
                    { header: 'Revenue', key: 'revenue' },
                    { header: 'Status', key: 'status' },
                  ],
                  data: byClient,
                  view: 'table' as any,
                  sortBy: 'client',
                  activeFilters: [],
                  filters: [],
                }}
              />
            </section>

            <Card>
              <CardHeader>
                <CardTitle>Pipeline value</CardTitle>
                <CardDescription>
                  Forward-looking signal: what’s likely to close and when.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pipeline.map(p => (
                  <div
                    key={p.stage}
                    className="flex items-start justify-between rounded-lg border border-border/60 bg-muted/30 p-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{p.stage}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {p.count} deals
                      </p>
                    </div>
                    <Badge variant="secondary">{p.value}</Badge>
                  </div>
                ))}

                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Rule of thumb</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Forecast = (sent invoices) + (negotiation * 0.5) +
                    (qualified * 0.2)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
