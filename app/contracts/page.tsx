import { Report } from '@summoniq/applab-ui';
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
  FileSignature,
  ShieldCheck,
  Timer,
  Upload,
} from 'lucide-react';
import Link from 'next/link';

const contracts = [
  {
    name: 'Baseline Health — MSA',
    client: 'Baseline Health',
    status: 'Signed',
    renewal: '2026-06-01',
    risk: 'Low',
  },
  {
    name: 'Harper & Co. — SOW v2',
    client: 'Harper & Co.',
    status: 'Sent',
    renewal: '—',
    risk: 'Medium',
  },
  {
    name: 'Northwind Labs — Retainer',
    client: 'Northwind Labs',
    status: 'Negotiation',
    renewal: '—',
    risk: 'High',
  },
];

export default function ContractsPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-emerald-500/10 p-2">
                <FileSignature className="h-5 w-5 text-emerald-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Contracts
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Track MSAs, SOWs, and retainers. Reduce risk with consistent
              review + renewal reminders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Upload PDF
            </Button>
            <Button>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Run checklist
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="space-y-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Contract list
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Make status explicit. If it’s “sent”, capture who owns
                  signature and by when.
                </p>
              </div>
              <Report
                className="h-auto"
                data={contracts}
                definition={{
                  columns: [
                    { header: 'Contract', key: 'name' },
                    { header: 'Client', key: 'client' },
                    { header: 'Status', key: 'status' },
                    { header: 'Renewal', key: 'renewal' },
                    { header: 'Risk', key: 'risk' },
                  ],
                  data: contracts,
                  view: 'table' as any,
                  sortBy: 'name',
                  activeFilters: [],
                  filters: [],
                }}
              />
            </section>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Renewals</CardTitle>
                  <CardDescription>
                    Small reminder, big leverage.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium text-foreground">
                        Next renewal
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Baseline Health — 2026-06-01
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Schedule a check-in 30 days prior.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div>
                <Button asChild size="sm" variant="ghost">
                  <Link href="/clients">
                    Back to Clients <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
