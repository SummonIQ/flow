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
import { ArrowRight, BarChart3, Mail, Plus, Send, Users } from 'lucide-react';
import Link from 'next/link';

const segments = [
  { name: 'Warm leads', count: 48, hint: 'Qualified + active conversations' },
  { name: 'Cold leads', count: 312, hint: 'Unreplied after first touch' },
  { name: 'Clients', count: 14, hint: 'Current or recent clients' },
];

const campaigns = [
  {
    name: 'Monthly newsletter',
    audience: 'Warm leads',
    status: 'Draft',
    sends: '—',
  },
  {
    name: 'Case study drip',
    audience: 'Cold leads',
    status: 'Scheduled',
    sends: '120',
  },
  {
    name: 'Client check-in',
    audience: 'Clients',
    status: 'Active',
    sends: '28',
  },
];

export default function EmailMarketingPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-rose-500/10 p-2">
                <Mail className="h-5 w-5 text-rose-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Email Marketing
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage segments and campaigns. Keep messaging consistent and
              measure outcomes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              View metrics
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New campaign
            </Button>
            <Button asChild variant="ghost">
              <Link href="/email-automation">
                Email automation <ArrowRight className="ml-2 h-4 w-4" />
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
                <CardTitle>Segments</CardTitle>
                <CardDescription>
                  Segments are the contract between lead gen and messaging.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {segments.map(s => (
                  <div
                    key={s.name}
                    className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-muted/30 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {s.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {s.hint}
                      </p>
                    </div>
                    <Badge variant="secondary">{s.count}</Badge>
                  </div>
                ))}

                <div className="pt-1">
                  <Button size="sm" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    New segment
                  </Button>
                </div>
              </CardContent>
            </Card>

            <section className="space-y-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Campaigns
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Keep campaigns short, with one primary CTA and a clear success
                  metric.
                </p>
              </div>
              <Report
                className="h-auto"
                data={campaigns}
                definition={{
                  columns: [
                    { header: 'Campaign', key: 'name' },
                    { header: 'Audience', key: 'audience' },
                    { header: 'Status', key: 'status' },
                    { header: 'Sends', key: 'sends' },
                  ],
                  data: campaigns,
                  view: 'table' as any,
                  sortBy: 'name',
                  activeFilters: [],
                  filters: [],
                }}
              />

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline">
                  <Send className="mr-2 h-4 w-4" />
                  Send test
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link href="/business-tools">Back to Business Tools</Link>
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
