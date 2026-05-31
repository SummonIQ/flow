import { Report } from '@summoniq/applab-ui';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, CreditCard, Download, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const payouts = [
  { id: 'PAYOUT-221', amount: '$4,500', date: '2026-02-01', status: 'Paid' },
  { id: 'PAYOUT-220', amount: '$2,200', date: '2026-01-25', status: 'Paid' },
  { id: 'PAYOUT-219', amount: '$1,100', date: '2026-01-18', status: 'Pending' },
];

export default function PaymentsPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-cyan-500/10 p-2">
                <CreditCard className="h-5 w-5 text-cyan-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Payments
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Track payouts, reconcile invoice payments, and enforce basic fraud
              checks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export ledger
            </Button>
            <Button>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Reconcile
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-semibold text-foreground">$1,100</p>
                <p className="text-xs text-muted-foreground">
                  Next payout queued
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Paid (30d)</p>
                <p className="text-xl font-semibold text-foreground">$6,700</p>
                <p className="text-xs text-muted-foreground">Settled payouts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Disputes</p>
                <p className="text-xl font-semibold text-foreground">0</p>
                <p className="text-xs text-muted-foreground">Good</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Payouts
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ledger view of settled and pending payments.
                </p>
              </div>
              <Report
                className="h-auto"
                data={payouts}
                definition={{
                  columns: [
                    { header: 'Payout', key: 'id' },
                    { header: 'Amount', key: 'amount' },
                    { header: 'Date', key: 'date' },
                    { header: 'Status', key: 'status' },
                  ],
                  data: payouts,
                  view: 'table' as any,
                  sortBy: 'date',
                  activeFilters: [],
                  filters: [],
                }}
              />
            </section>

            <Card>
              <CardHeader>
                <CardTitle>Reconciliation checklist</CardTitle>
                <CardDescription>
                  A quick set of checks before marking invoices as paid.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Match</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Amount + currency + invoice ID
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Confirm</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Payer email or reference
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Record</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Payment date + method
                  </p>
                </div>

                <div className="pt-1">
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/billing">
                      Back to Billing <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
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
