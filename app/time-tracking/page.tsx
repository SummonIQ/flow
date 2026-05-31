import { Report } from '@summoniq/applab-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Clock, Play, Square, Timer } from 'lucide-react';
import Link from 'next/link';

const entries = [
  {
    project: 'Baseline Health',
    description: 'Landing page iterations',
    hours: '2.5',
    date: '2026-02-01',
    billable: true,
  },
  {
    project: 'Northwind Labs',
    description: 'Analytics instrumentation',
    hours: '1.75',
    date: '2026-02-01',
    billable: true,
  },
  {
    project: 'Internal',
    description: 'Proposal writing',
    hours: '1.0',
    date: '2026-01-31',
    billable: false,
  },
];

const entryRows = entries.map(entry => ({
  ...entry,
  billable: entry.billable ? 'Billable' : 'Non-billable',
}));

export default function TimeTrackingPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-purple-500/10 p-2">
                <Clock className="h-5 w-5 text-purple-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Time Tracking
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Capture billable hours, keep notes consistent, and push cleanly
              into invoicing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Play className="mr-2 h-4 w-4" />
              Start timer
            </Button>
            <Button variant="outline">
              <Square className="mr-2 h-4 w-4" />
              Stop
            </Button>
            <Button>
              <Timer className="mr-2 h-4 w-4" />
              Add entry
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Today</p>
                <p className="text-xl font-semibold text-foreground">4.25h</p>
                <p className="text-xs text-muted-foreground">3 entries</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Billable (7d)</p>
                <p className="text-xl font-semibold text-foreground">18.5h</p>
                <p className="text-xs text-muted-foreground">Invoice-ready</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Unbilled</p>
                <p className="text-xl font-semibold text-foreground">$3,700</p>
                <p className="text-xs text-muted-foreground">Est. value</p>
              </CardContent>
            </Card>
          </div>

          <section className="space-y-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Recent entries
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep descriptions short and outcome-based. This becomes invoice
                line items.
              </p>
            </div>
            <Report
              className="h-auto"
              data={entryRows}
              definition={{
                columns: [
                  { header: 'Project', key: 'project' },
                  { header: 'Description', key: 'description' },
                  { header: 'Hours', key: 'hours' },
                  { header: 'Date', key: 'date' },
                  { header: 'Billable', key: 'billable' },
                ],
                data: entryRows,
                view: 'table' as any,
                sortBy: 'date',
                activeFilters: [],
                filters: [],
              }}
            />

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button asChild size="sm" variant="ghost">
                <Link href="/billing">
                  Back to Billing <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href="/invoices">Create invoice</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
