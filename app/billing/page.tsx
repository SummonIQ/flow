import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@summoniq/applab-ui';
import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';
import { CreditCard } from 'lucide-react';

const billingStats = [
  { label: 'Monthly recurring', value: '$84.2k', change: '+6.2%' },
  { label: 'Outstanding', value: '$12.4k', change: '6 invoices' },
  { label: 'Past due', value: '$3.1k', change: '2 invoices' },
  { label: 'Collected this week', value: '$18.9k', change: '12 payments' },
];

const invoices = [
  {
    id: 'INV-1042',
    client: 'Northwind Studio',
    amount: '$4,800',
    issued: 'Sep 4',
    due: 'Sep 18',
    status: 'Outstanding',
  },
  {
    id: 'INV-1041',
    client: 'Venture Atlas',
    amount: '$6,250',
    issued: 'Aug 29',
    due: 'Sep 12',
    status: 'Past due',
  },
  {
    id: 'INV-1040',
    client: 'Brightside Labs',
    amount: '$2,900',
    issued: 'Sep 2',
    due: 'Sep 16',
    status: 'Outstanding',
  },
  {
    id: 'INV-1039',
    client: 'Nova Health',
    amount: '$7,100',
    issued: 'Aug 25',
    due: 'Sep 9',
    status: 'Paid',
  },
  {
    id: 'INV-1038',
    client: 'Studio 88',
    amount: '$3,400',
    issued: 'Aug 21',
    due: 'Sep 5',
    status: 'Paid',
  },
];

const payoutSchedule = [
  { label: 'Next payout', value: 'Sep 20', detail: '$6,400 expected' },
  { label: 'Processing', value: '4 invoices', detail: 'Avg. 2 days' },
  { label: 'Auto-collect', value: '86%', detail: 'Success rate' },
];

export default function BillingPage() {
  const sectionShell =
    'rounded-2xl border border-border/60 bg-background/70 backdrop-blur-sm shadow-[0_20px_45px_-34px_rgba(0,0,0,0.58)]';

  return (
    <Page className="h-full bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--flow-icon-via)_12%,transparent)_0%,transparent_58%)]">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <span className="rounded-xl border border-border/60 bg-background/70 p-2.5 shadow-sm">
              <CreditCard className="h-5 w-5 text-amber-500" />
            </span>
            Billing
          </span>
        }
        description="Track invoices, collections, and recurring revenue."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary">Record payment</Button>
            <Button>Create invoice</Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {billingStats.map(stat => (
              <article
                key={stat.label}
                className="rounded-xl border border-border/60 bg-background/60 p-4"
              >
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-semibold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <section className={sectionShell}>
              <header className="border-b border-border/50 px-5 py-4">
                <h2 className="text-base font-semibold text-foreground">
                  Open invoices
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Prioritize outstanding and past due accounts.
                </p>
              </header>
              <div className="p-5">
                <div className="overflow-hidden rounded-xl border border-border/60">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Issued</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map(invoice => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.id}
                          </TableCell>
                          <TableCell>{invoice.client}</TableCell>
                          <TableCell>{invoice.issued}</TableCell>
                          <TableCell>{invoice.due}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                invoice.status === 'Past due'
                                  ? 'destructive'
                                  : invoice.status === 'Paid'
                                    ? 'secondary'
                                    : 'outline'
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {invoice.amount}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </section>

            <section className={sectionShell}>
              <header className="border-b border-border/50 px-5 py-4">
                <h2 className="text-base font-semibold text-foreground">
                  Payout schedule
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upcoming transfers and processing velocity.
                </p>
              </header>
              <div className="space-y-3 p-5">
                {payoutSchedule.map(item => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-border/60 bg-background/55 p-3"
                  >
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-semibold text-foreground">
                      {item.value}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </Page>
  );
}
