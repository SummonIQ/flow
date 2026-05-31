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
  Brain,
  ClipboardList,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

const insights = [
  {
    title: 'Referrals outperform cold by ~3x',
    detail:
      'Shift weekly time toward connector outreach and warm intro mapping.',
    tag: 'Growth',
  },
  {
    title: 'Overdue invoice risk rising',
    detail: 'Set a 7-day reminder + automate follow-ups for “Sent” invoices.',
    tag: 'Finance',
  },
  {
    title: 'Lead response SLA drifting',
    detail:
      'Create a daily triage window and enforce a “first response in 24h” rule.',
    tag: 'Ops',
  },
];

const decisions = [
  { name: 'Prioritize high-intent channels', owner: 'You', cadence: 'Weekly' },
  { name: 'Review pipeline hygiene', owner: 'You', cadence: 'Daily' },
  { name: 'Audit pricing vs scope creep', owner: 'You', cadence: 'Monthly' },
];

export default function BusinessIntelligencePage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-fuchsia-500/10 p-2">
                <Brain className="h-5 w-5 text-fuchsia-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Business Intelligence
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Turn data into decisions. Focus on levers: channel quality, cycle
              times, and cash flow.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate brief
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
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Primary focus</p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  Improve lead quality
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Optimize sources, not volume
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">
                  Operational lever
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  Reduce cycle time
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  First response + follow-up cadence
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Financial lever</p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  Tighten collections
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Invoices → reminders → payouts
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Insights</CardTitle>
                <CardDescription>
                  Short, actionable, and tied to a decision. Avoid “interesting
                  but useless”.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.map(i => (
                  <div
                    key={i.title}
                    className="rounded-lg border border-border/60 bg-muted/30 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {i.title}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {i.detail}
                        </p>
                      </div>
                      <Badge variant="outline">{i.tag}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Decision log</CardTitle>
                  <CardDescription>
                    A lightweight record of what you decided and how often you
                    revisit it.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {decisions.map(d => (
                    <div
                      key={d.name}
                      className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {d.name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Owner: {d.owner}
                        </p>
                      </div>
                      <Badge variant="secondary">{d.cadence}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick links</CardTitle>
                  <CardDescription>
                    Go straight to the source pages.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/analytics/dashboard">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Analytics dashboard
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/invoices">
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Invoices
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/lead-generation">
                      <Lightbulb className="mr-2 h-4 w-4" />
                      Lead Generation
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
