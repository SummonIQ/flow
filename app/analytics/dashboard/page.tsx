import { Report } from '@summoniq/applab-ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  PieChart,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

const kpis = [
  {
    label: 'Sessions',
    value: '12.4k',
    detail: '+8% vs last 7d',
    icon: Activity,
  },
  {
    label: 'Qualified leads',
    value: '46',
    detail: '+5 vs last 7d',
    icon: TrendingUp,
  },
  {
    label: 'Conversion',
    value: '0.37%',
    detail: 'Lead → qualified',
    icon: PieChart,
  },
  {
    label: 'Avg. time to qualify',
    value: '1.6d',
    detail: 'Median',
    icon: BarChart3,
  },
];

const topSources = [
  { source: 'Inbound form', sessions: 4320, leads: 18, quality: 'High' },
  { source: 'Referral', sessions: 820, leads: 9, quality: 'High' },
  { source: 'Cold email', sessions: 2100, leads: 12, quality: 'Medium' },
  { source: 'LinkedIn', sessions: 5160, leads: 7, quality: 'Low' },
];

const topSourceRows = topSources.map(row => ({
  ...row,
  sessions: row.sessions.toLocaleString(),
}));

const alerts = [
  {
    title: 'Spike in traffic from “LinkedIn” without lead lift',
    detail:
      'Consider updating the offer or routing to a higher-intent landing page.',
    severity: 'Watch',
  },
  {
    title: 'Lead response SLA drifting above 48h',
    detail:
      'New leads should receive first response within 24h for best conversion.',
    severity: 'Action',
  },
];

export default function AnalyticsDashboardPage() {
  const sectionShell =
    'rounded-2xl border border-border/60 bg-background/70 backdrop-blur-sm shadow-[0_20px_45px_-34px_rgba(0,0,0,0.58)]';

  return (
    <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--flow-icon-via)_12%,transparent)_0%,transparent_58%)]">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-indigo-500/10 p-2">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Analytics Dashboard
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Monitor acquisition, conversion, and operational SLAs. Prioritize
              action over vanity metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/analytics">Analytics overview</Link>
            </Button>
            <Button asChild>
              <Link href="/billing">Billing</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kpis.map(kpi => (
              <article
                key={kpi.label}
                className="rounded-xl border border-border/60 bg-background/60 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <p className="text-xl font-semibold text-foreground">
                      {kpi.value}
                    </p>
                    <p className="text-xs text-muted-foreground">{kpi.detail}</p>
                  </div>
                  <span className="rounded-lg border border-border/50 bg-background/70 p-2 text-muted-foreground">
                    <kpi.icon className="h-4 w-4" />
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className={sectionShell}>
              <header className="border-b border-border/50 px-5 py-4">
                <h2 className="text-base font-semibold text-foreground">
                  Trend (placeholder)
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Replace with real analytics charts once event ingestion is
                  wired.
                </p>
              </header>
              <div className="p-5">
                <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-border/60 bg-background/55">
                  <p className="text-sm text-muted-foreground">Chart area</p>
                </div>
              </div>
            </section>

            <section className={sectionShell}>
              <header className="border-b border-border/50 px-5 py-4">
                <h2 className="text-base font-semibold text-foreground">
                  Alerts
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Small issues become big issues quickly.
                </p>
              </header>
              <div className="space-y-3 p-5">
                {alerts.map(a => (
                  <div
                    key={a.title}
                    className="rounded-xl border border-border/60 bg-background/55 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {a.title}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {a.detail}
                        </p>
                      </div>
                      <Badge
                        variant={
                          a.severity === 'Action' ? 'secondary' : 'outline'
                        }
                      >
                        {a.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className={`${sectionShell} space-y-3 p-5`}>
            <div className="border-b border-border/50 pb-3">
              <h2 className="text-base font-semibold text-foreground">
                Top sources
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Compare volume vs quality. Optimize where quality and leverage
                intersect.
              </p>
            </div>
            <Report
              className="h-auto [&>div]:rounded-xl [&>div]:border-border/60"
              data={topSourceRows}
              definition={{
                columns: [
                  { header: 'Source', key: 'source' },
                  { header: 'Sessions', key: 'sessions' },
                  { header: 'Leads', key: 'leads' },
                  { header: 'Quality', key: 'quality' },
                ],
                data: topSourceRows,
                view: 'table' as any,
                sortBy: 'source',
                activeFilters: [],
                filters: [],
              }}
            />

            <div className="pt-3">
              <Button asChild size="sm" variant="ghost">
                <Link href="/billing">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Check spend vs ROI
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
