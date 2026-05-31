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
import { ArrowRight, Calendar, CheckCircle2, Clock, Plus } from 'lucide-react';
import Link from 'next/link';

const upcoming = [
  {
    when: 'Today',
    title: 'Lead triage (daily)',
    detail: 'Review new leads + assign next actions',
    tag: 'Ops',
  },
  {
    when: 'Tomorrow',
    title: 'Client check-in — Baseline Health',
    detail: 'Confirm timeline + next deliverable',
    tag: 'Client',
  },
  {
    when: 'Fri',
    title: 'Invoice follow-up',
    detail: 'Send reminder for overdue invoice',
    tag: 'Finance',
  },
];

const milestones = [
  { name: 'Design system handoff', date: '2026-02-07', status: 'Planned' },
  { name: 'Landing page v1', date: '2026-02-10', status: 'In progress' },
  { name: 'Analytics baseline', date: '2026-02-12', status: 'Planned' },
];

export default function ExecutionCalendarPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-cyan-500/10 p-2">
                <Calendar className="h-5 w-5 text-cyan-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Execution Calendar
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Plan the week: cadence meetings, deliverables, and follow-ups.
              Make time visible.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New event
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
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming</CardTitle>
                <CardDescription>
                  This is your operational heartbeat. Keep it small and
                  repeatable.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcoming.map(item => (
                  <div
                    key={item.title}
                    className="rounded-lg border border-border/60 bg-muted/30 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.detail}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {item.when}
                        </div>
                      </div>
                      <Badge variant="outline">{item.tag}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <section className="space-y-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Milestones
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Deliverables and their current state (a simple alternative to
                  a full Gantt).
                </p>
              </div>
              <Report
                className="h-auto"
                data={milestones}
                definition={{
                  columns: [
                    { header: 'Milestone', key: 'name' },
                    { header: 'Date', key: 'date' },
                    { header: 'Status', key: 'status' },
                  ],
                  data: milestones,
                  view: 'table' as any,
                  sortBy: 'date',
                  activeFilters: [],
                  filters: [],
                }}
              />

              <div className="mt-4 rounded-lg border border-border/60 bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium text-foreground">Rule of thumb</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  If a milestone isn’t moving weekly, it’s blocked; capture the
                  blocker explicitly.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
