import { Badge, Button } from '@summoniq/applab-ui';
import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';
import {
  Calendar,
  Clock,
  CreditCard,
  FolderOpen,
  Mail,
  Sparkles,
  Users,
} from 'lucide-react';

import {
  getDashboardBilling,
  getDashboardClients,
  getDashboardMeetings,
  getDashboardProjects,
  getDashboardStats,
} from './actions/dashboard';

function formatCurrency(amount: number): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return `$${amount.toFixed(0)}`;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(date: Date | null): string {
  if (!date) return 'No date';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default async function HomePage() {
  const [statsRes, meetingsRes, projectsRes, clientsRes, billingRes] =
    await Promise.all([
      getDashboardStats(),
      getDashboardMeetings(),
      getDashboardProjects(),
      getDashboardClients(),
      getDashboardBilling(),
    ]);

  const stats = statsRes.success ? statsRes.data : null;
  const meetings = meetingsRes.success ? meetingsRes.data : [];
  const projects = projectsRes.success ? projectsRes.data : [];
  const clients = clientsRes.success ? clientsRes.data : [];
  const billing = billingRes.success ? billingRes.data : null;

  const highlights = [
    {
      title: 'Inbox',
      value: `${stats?.inbox.unread ?? 0} unread`,
      detail: stats?.inbox.detail ?? 'messages',
      icon: Mail,
      tone: 'text-indigo-500',
      surface: 'bg-indigo-500/10',
    },
    {
      title: 'Schedule',
      value: `${stats?.schedule.count ?? 0} meetings`,
      detail: stats?.schedule.detail ?? 'today',
      icon: Calendar,
      tone: 'text-emerald-500',
      surface: 'bg-emerald-500/10',
    },
    {
      title: 'Projects',
      value: `${stats?.projects.active ?? 0} active`,
      detail: stats?.projects.detail ?? 'in progress',
      icon: FolderOpen,
      tone: 'text-sky-500',
      surface: 'bg-sky-500/10',
    },
    {
      title: 'Billing',
      value: formatCurrency(stats?.billing.outstanding ?? 0) + ' due',
      detail: `${stats?.billing.invoiceCount ?? 0} invoices awaiting`,
      icon: CreditCard,
      tone: 'text-amber-500',
      surface: 'bg-amber-500/10',
    },
    {
      title: 'Clients',
      value: `${stats?.clients.total ?? 0} accounts`,
      detail: 'total clients',
      icon: Users,
      tone: 'text-rose-500',
      surface: 'bg-rose-500/10',
    },
  ];

  const billingSnapshot = [
    {
      label: 'Monthly recurring',
      value: formatCurrency(billing?.monthlyRecurring ?? 0),
      change: 'this month',
    },
    {
      label: 'Outstanding',
      value: formatCurrency(billing?.outstanding ?? 0),
      change: `${billing?.outstandingCount ?? 0} invoices`,
    },
    {
      label: 'Past due',
      value: formatCurrency(billing?.pastDue ?? 0),
      change: `${billing?.pastDueCount ?? 0} invoices`,
    },
    {
      label: 'Collected this week',
      value: formatCurrency(billing?.collectedThisWeek ?? 0),
      change: `${billing?.collectedCount ?? 0} payments`,
    },
  ];

  const sectionShell =
    'rounded-2xl border border-border/60 bg-background/70 backdrop-blur-sm shadow-[0_20px_45px_-34px_rgba(0,0,0,0.58)]';

  const listRow =
    'flex items-center justify-between gap-3 border-b border-border/50 px-4 py-3 last:border-b-0';

  return (
    <Page className="h-full bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--flow-icon-via)_12%,transparent)_0%,transparent_56%)]">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <span className="rounded-xl border border-border/60 bg-background/70 p-2.5 shadow-sm">
              <Sparkles className="h-5 w-5 text-primary" />
            </span>
            Flow Command Center
          </span>
        }
        description="Email, scheduling, projects, billing, and client management in one place."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary">Compose Email</Button>
            <Button variant="secondary">New Meeting</Button>
            <Button>New Invoice</Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {highlights.map(item => (
              <article
                key={item.title}
                className="group rounded-xl border border-border/60 bg-background/60 px-4 py-3 transition-colors hover:border-border"
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`rounded-lg border border-border/50 p-1.5 ${item.surface}`}
                  >
                    <item.icon className={`h-3.5 w-3.5 ${item.tone} opacity-90`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {item.title}
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {item.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.detail}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <section className={sectionShell}>
                <header className="border-b border-border/50 px-4 py-3">
                  <h2 className="text-base font-semibold text-foreground">
                    Today&apos;s schedule
                  </h2>
                </header>
                <div>
                  {meetings && meetings.length > 0 ? (
                    meetings.map(meeting => (
                      <div key={meeting.id} className={listRow}>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {meeting.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {meeting.client?.name ?? 'Internal'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 ml-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(meeting.startTime)}
                          </span>
                          <Badge variant="secondary">{meeting.type}</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No meetings scheduled today
                    </p>
                  )}
                </div>
              </section>

              <section className={sectionShell}>
                <header className="border-b border-border/50 px-4 py-3">
                  <h2 className="text-base font-semibold text-foreground">
                    Projects in flight
                  </h2>
                </header>
                <div>
                  {projects && projects.length > 0 ? (
                    projects.map(project => (
                      <div key={project.id} className={listRow}>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {project.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Due {formatDate(project.dueDate)}
                          </p>
                        </div>
                        <Badge
                          className="shrink-0 ml-2"
                          variant={
                            project.status === 'ON_HOLD'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No active projects
                    </p>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-3">
              <section className={sectionShell}>
                <header className="border-b border-border/50 px-4 py-3">
                  <h2 className="text-base font-semibold text-foreground">
                    Client pulse
                  </h2>
                </header>
                <div>
                  {clients && clients.length > 0 ? (
                    clients.map(client => (
                      <div key={client.id} className={listRow}>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {client.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {client.tier} · Owner:{' '}
                            {client.owner ?? 'Unassigned'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 text-xs">
                          <Badge
                            variant={
                              client.health === 'WATCH' ||
                              client.health === 'AT_RISK'
                                ? 'outline'
                                : 'secondary'
                            }
                          >
                            {client.health}
                          </Badge>
                          <span className="text-muted-foreground">
                            {client.nextTouchAt
                              ? `Next ${formatDate(client.nextTouchAt)}`
                              : 'No follow-up set'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No clients yet
                    </p>
                  )}
                </div>
              </section>

              <section className={sectionShell}>
                <header className="border-b border-border/50 px-4 py-3">
                  <h2 className="text-base font-semibold text-foreground">
                    Billing snapshot
                  </h2>
                </header>
                <div className="grid gap-3 p-4 sm:grid-cols-2">
                  {billingSnapshot.map(metric => (
                    <div
                      key={metric.label}
                      className="rounded-xl border border-border/60 bg-background/55 p-3"
                    >
                      <p className="text-xs text-muted-foreground">
                        {metric.label}
                      </p>
                      <p className="text-base font-semibold text-foreground">
                        {metric.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {metric.change}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
