import { Report } from '@summoniq/applab-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Download, FileText, Plus, Send } from 'lucide-react';
import Link from 'next/link';

const invoiceRows = [
  {
    id: 'INV-1042',
    client: 'Baseline Health',
    amount: '$4,500',
    due: '2026-02-15',
    status: 'Sent',
  },
  {
    id: 'INV-1041',
    client: 'Northwind Labs',
    amount: '$2,200',
    due: '2026-02-08',
    status: 'Overdue',
  },
  {
    id: 'INV-1040',
    client: 'Harper & Co.',
    amount: '$3,900',
    due: '2026-02-20',
    status: 'Draft',
  },
];

export default function InvoicesPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-lime-500/10 p-2">
                <FileText className="h-5 w-5 text-lime-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Invoices
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Create invoices, track status, and keep cash flow predictable.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New invoice
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Outstanding</p>
                <p className="text-xl font-semibold text-foreground">$6,700</p>
                <p className="text-xs text-muted-foreground">
                  Across 2 invoices
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Overdue</p>
                <p className="text-xl font-semibold text-foreground">$2,200</p>
                <p className="text-xs text-muted-foreground">1 invoice</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Paid (30d)</p>
                <p className="text-xl font-semibold text-foreground">$18,400</p>
                <p className="text-xs text-muted-foreground">Cash collected</p>
              </CardContent>
            </Card>
          </div>

          <section className="space-y-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Invoice list
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep invoice states clean: Draft → Sent → Paid (or Overdue).
              </p>
            </div>
            <Report
              className="h-auto"
              data={invoiceRows}
              definition={{
                columns: [
                  { header: 'Invoice', key: 'id' },
                  { header: 'Client', key: 'client' },
                  { header: 'Amount', key: 'amount' },
                  { header: 'Due', key: 'due' },
                  { header: 'Status', key: 'status' },
                ],
                data: invoiceRows,
                view: 'table' as any,
                sortBy: 'due',
                activeFilters: [],
                filters: [],
              }}
            />

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline">
                <Send className="mr-2 h-4 w-4" />
                Send reminder
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href="/billing">
                  Back to Billing <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href="/analytics">Analytics Overview</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
