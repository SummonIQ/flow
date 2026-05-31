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
  Inbox,
  Link2,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

const queues = [
  { name: 'New', count: 12 },
  { name: 'Qualified', count: 5 },
  { name: 'Nurture', count: 19 },
  { name: 'Closed', count: 8 },
];

const leads = [
  {
    name: 'Baseline Health',
    request: 'Website refresh + brand system',
    source: 'Referral',
    value: '$12-18k',
    status: 'New',
  },
  {
    name: 'Northwind Labs',
    request: 'Landing page + analytics setup',
    source: 'Inbound form',
    value: '$6-9k',
    status: 'Qualified',
  },
  {
    name: 'Harper & Co.',
    request: 'Product marketing site + copy refresh',
    source: 'Cold email',
    value: '$10-14k',
    status: 'Nurture',
  },
];

export default function AgencyLeadsPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="flex w-full items-start justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-teal-500/10 p-2">
                <Inbox className="h-5 w-5 text-teal-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Agency Leads
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Triage inbound requests, qualify quickly, and hand off cleanly
              into proposals + onboarding.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Sparkles className="mr-2 h-4 w-4" />
              Summarize lead
            </Button>
            <Button>
              <MessageSquare className="mr-2 h-4 w-4" />
              New outreach
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-5 py-4">
        <div className="flex w-full flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Queues</CardTitle>
              <CardDescription>
                Keep triage tight. Every lead should have a next action.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {queues.map(q => (
                  <div
                    key={q.name}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {q.name}
                    </p>
                    <Badge variant="secondary">{q.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <section className="space-y-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Lead inbox
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Quick context + value estimate. Use this to decide: qualify,
                nurture, or close.
              </p>
            </div>
            <Report
              className="h-auto w-full"
              data={leads}
              definition={{
                columns: [
                  { header: 'Lead', key: 'name' },
                  { header: 'Request', key: 'request' },
                  { header: 'Source', key: 'source' },
                  { header: 'Value', key: 'value' },
                  { header: 'Status', key: 'status' },
                ],
                data: leads,
                view: 'table' as any,
                sortBy: 'name',
                activeFilters: [],
                filters: [],
              }}
            />

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">
                  Default next action
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  Send 3 qualifying questions
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Scope, timeline, budget range, then propose a short call.
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Handoff</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  Create proposal + kickoff checklist
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Convert qualified leads into proposal and onboarding plans.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button asChild size="sm" variant="ghost">
                <Link href="/lead-generation">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Go to Lead Generation
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href="/business-tools">
                  <Link2 className="mr-2 h-4 w-4" />
                  Back to Business Tools
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
