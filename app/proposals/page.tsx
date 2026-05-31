import { Report } from '@summoniq/applab-ui';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, FileText, Plus, Send, Sparkles } from 'lucide-react';
import Link from 'next/link';

const stages = [
  { name: 'Draft', count: 2 },
  { name: 'Sent', count: 3 },
  { name: 'Negotiation', count: 1 },
  { name: 'Won', count: 4 },
];

const proposals = [
  {
    name: 'Baseline Health — Website Refresh',
    client: 'Baseline Health',
    value: '$12,500',
    stage: 'Sent',
    updated: 'Today',
  },
  {
    name: 'Harper & Co. — Brand + Landing',
    client: 'Harper & Co.',
    value: '$9,800',
    stage: 'Draft',
    updated: 'Yesterday',
  },
  {
    name: 'Northwind Labs — Analytics + SEO',
    client: 'Northwind Labs',
    value: '$6,400',
    stage: 'Negotiation',
    updated: 'Mon',
  },
];

export default function ProposalsPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-slate-500/10 p-2">
                <FileText className="h-5 w-5 text-slate-300" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Proposals
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Draft, send, and track proposals. Keep scope clear and the next
              step explicit.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate outline
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New proposal
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-4">
            {stages.map(s => (
              <Card key={s.name}>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{s.name}</p>
                  <p className="text-xl font-semibold text-foreground">
                    {s.count}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Pipeline
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use stages to enforce clarity: no “sent” proposal without an
                  agreed follow-up date.
                </p>
              </div>
              <Report
                className="h-auto"
                data={proposals}
                definition={{
                  columns: [
                    { header: 'Proposal', key: 'name' },
                    { header: 'Client', key: 'client' },
                    { header: 'Value', key: 'value' },
                    { header: 'Stage', key: 'stage' },
                    { header: 'Updated', key: 'updated' },
                  ],
                  data: proposals,
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
                  <CardTitle>Send checklist</CardTitle>
                  <CardDescription>
                    Before you hit send, reduce ambiguity.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">
                      Must include
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Scope, timeline, price, and what “done” means.
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Next step</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      A clear ask: “Can we confirm by Friday?” or “Book a 20m
                      call”.
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Send className="mr-2 h-4 w-4" />
                    Send test email
                  </Button>
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
