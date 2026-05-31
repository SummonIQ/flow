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
  Bolt,
  Clock,
  PlayCircle,
  Plus,
  Workflow,
} from 'lucide-react';
import Link from 'next/link';

const sequences = [
  {
    name: 'Inbound lead → qualify → proposal',
    trigger: 'New lead created',
    steps: 7,
    status: 'Active',
    lastRun: 'Today',
  },
  {
    name: 'Recruiting: shortlist → outreach → follow-up',
    trigger: 'Saved search run',
    steps: 5,
    status: 'Draft',
    lastRun: '—',
  },
  {
    name: 'Client retention: monthly check-in',
    trigger: 'Client nextTouchAt due',
    steps: 4,
    status: 'Active',
    lastRun: 'Yesterday',
  },
];

const runLog = [
  {
    name: 'Inbound lead → qualify → proposal',
    outcome: 'Queued 3 tasks',
    when: '2 hours ago',
  },
  {
    name: 'Client retention: monthly check-in',
    outcome: 'Sent 1 reminder',
    when: 'Yesterday',
  },
  {
    name: 'Inbound lead → qualify → proposal',
    outcome: 'Created 1 draft proposal',
    when: 'Mon',
  },
];

export default function AutomationSequencesPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-yellow-500/10 p-2">
                <Workflow className="h-5 w-5 text-yellow-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Automation Sequences
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Build repeatable operational flows: triggers → steps → approvals →
              outcomes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <PlayCircle className="mr-2 h-4 w-4" />
              Run now
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New sequence
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">
                  Active sequences
                </p>
                <p className="text-xl font-semibold text-foreground">2</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Running on schedule / triggers
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Drafts</p>
                <p className="text-xl font-semibold text-foreground">1</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Needs review + activation
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Runs this week</p>
                <p className="text-xl font-semibold text-foreground">14</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Across lead gen + ops
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="space-y-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Sequences
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Keep these small and opinionated. Each step should end with a
                  clear handoff.
                </p>
              </div>
              <Report
                className="h-auto"
                data={sequences}
                definition={{
                  columns: [
                    { header: 'Sequence', key: 'name' },
                    { header: 'Trigger', key: 'trigger' },
                    { header: 'Steps', key: 'steps' },
                    { header: 'Status', key: 'status' },
                    { header: 'Last run', key: 'lastRun' },
                  ],
                  data: sequences,
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
                  <CardTitle>Run log</CardTitle>
                  <CardDescription>
                    Recent automation outcomes for debugging + trust.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {runLog.map(row => (
                    <div
                      key={`${row.name}-${row.when}`}
                      className="rounded-lg border border-border/60 bg-muted/30 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {row.name}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {row.outcome}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {row.when}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Guidelines</CardTitle>
                  <CardDescription>
                    Make automation boring and reliable.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Principle</p>
                    <p className="mt-1 font-medium text-foreground">
                      Every step produces an artifact
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Task, note, message, or handoff.
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Principle</p>
                    <p className="mt-1 font-medium text-foreground">
                      Use approvals for high-risk actions
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Invoices, emails, deletions.
                    </p>
                  </div>
                  <div className="pt-1">
                    <Button asChild size="sm" variant="ghost">
                      <Link href="/business-tools">
                        <Bolt className="mr-2 h-4 w-4" />
                        Back to Business Tools
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
