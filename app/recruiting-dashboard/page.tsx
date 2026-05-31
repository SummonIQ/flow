'use client';

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
  BarChart3,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { useEffect, useMemo, useState } from 'react';

import { useRecruitingStore } from '@/lib/recruiting/store';

export default function RecruitingDashboardPage() {
  const hasHydrated = useRecruitingStore(state => state.hasHydrated);
  const ensureSeeded = useRecruitingStore(state => state.ensureSeeded);
  const roles = useRecruitingStore(state => state.roles);
  const candidates = useRecruitingStore(state => state.candidates);
  const tasks = useRecruitingStore(state => state.tasks);
  const activity = useRecruitingStore(state => state.activity);
  const pipelineStages = useRecruitingStore(state => state.pipelineStages);
  const addRole = useRecruitingStore(state => state.addRole);
  const addCandidate = useRecruitingStore(state => state.addCandidate);

  const [creatingRole, setCreatingRole] = useState(false);
  const [roleDraft, setRoleDraft] = useState({
    title: '',
    company: '',
    location: '',
  });

  const [creatingCandidate, setCreatingCandidate] = useState(false);
  const [candidateDraft, setCandidateDraft] = useState({
    name: '',
    headline: '',
    location: '',
    roleId: '',
  });

  useEffect(() => {
    if (!hasHydrated) return;
    ensureSeeded();
  }, [ensureSeeded, hasHydrated]);

  const computedKpis = useMemo(() => {
    const activeRoles = roles.filter(role => role.status === 'open');
    const pausedRoles = roles.filter(role => role.status === 'paused');
    const filledRoles = roles.filter(role => role.status === 'filled');

    const inPlayStages = new Set([
      'Sourced',
      'Contacted',
      'Screening',
      'Client loop',
      'Offer',
    ]);
    const candidatesInPlay = candidates.filter(c => inPlayStages.has(c.stage));
    const dueTasks = tasks.filter(t => !t.done);

    return [
      {
        label: 'Active roles',
        value: String(activeRoles.length),
        detail: `${pausedRoles.length} paused, ${filledRoles.length} filled`,
        icon: Users,
      },
      {
        label: 'Candidates in play',
        value: String(candidatesInPlay.length),
        detail: `${candidates.filter(c => c.stage === 'Sourced').length} sourced`,
        icon: Search,
      },
      {
        label: 'Open tasks',
        value: String(dueTasks.length),
        detail: dueTasks.length ? 'Keep cadence tight today' : 'All caught up',
        icon: CheckCircle2,
      },
      {
        label: 'Time-to-first-call',
        value: '—',
        detail: 'Will compute once calls are tracked',
        icon: Clock,
      },
    ];
  }, [candidates, roles, tasks]);

  const pipeline = useMemo(() => {
    return pipelineStages
      .filter(stage => stage !== 'Rejected')
      .map(stage => ({
        stage,
        count: candidates.filter(c => c.stage === stage).length,
      }));
  }, [candidates, pipelineStages]);

  const recentActivity = useMemo(() => {
    return activity.slice(0, 8);
  }, [activity]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-sky-500/10 p-2">
                <BarChart3 className="h-5 w-5 text-sky-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Recruiting Dashboard
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              A quick pulse check on pipeline health, outreach velocity, and
              what needs attention.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/recruiting/candidates/search">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCreatingRole(prev => !prev);
                setCreatingCandidate(false);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New role
            </Button>
            <Button
              onClick={() => {
                setCreatingCandidate(prev => !prev);
                setCreatingRole(false);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New candidate
            </Button>
            <Button asChild>
              <Link href="/recruiting">
                <ArrowRight className="mr-2 h-4 w-4" />
                Recruiting Hub
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          {creatingRole ? (
            <Card>
              <CardHeader>
                <CardTitle>Create role</CardTitle>
                <CardDescription>
                  Track a requisition so candidates can be tied to an outcome.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                <input
                  value={roleDraft.title}
                  onChange={event =>
                    setRoleDraft(prev => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Role title"
                />
                <input
                  value={roleDraft.company}
                  onChange={event =>
                    setRoleDraft(prev => ({
                      ...prev,
                      company: event.target.value,
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Company"
                />
                <div className="flex gap-2">
                  <input
                    value={roleDraft.location}
                    onChange={event =>
                      setRoleDraft(prev => ({
                        ...prev,
                        location: event.target.value,
                      }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Location"
                  />
                  <Button
                    disabled={
                      !roleDraft.title.trim() ||
                      !roleDraft.company.trim() ||
                      !roleDraft.location.trim()
                    }
                    onClick={() => {
                      addRole({
                        title: roleDraft.title.trim(),
                        company: roleDraft.company.trim(),
                        location: roleDraft.location.trim(),
                      });
                      setRoleDraft({ title: '', company: '', location: '' });
                      setCreatingRole(false);
                    }}
                  >
                    Create
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {creatingCandidate ? (
            <Card>
              <CardHeader>
                <CardTitle>Add candidate</CardTitle>
                <CardDescription>
                  Add someone to your pipeline. You can move them between
                  stages.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <input
                  value={candidateDraft.name}
                  onChange={event =>
                    setCandidateDraft(prev => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Candidate name"
                />
                <input
                  value={candidateDraft.headline}
                  onChange={event =>
                    setCandidateDraft(prev => ({
                      ...prev,
                      headline: event.target.value,
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Headline / role"
                />
                <input
                  value={candidateDraft.location}
                  onChange={event =>
                    setCandidateDraft(prev => ({
                      ...prev,
                      location: event.target.value,
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Location"
                />
                <div className="flex gap-2">
                  <select
                    value={candidateDraft.roleId}
                    onChange={event =>
                      setCandidateDraft(prev => ({
                        ...prev,
                        roleId: event.target.value,
                      }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Unassigned role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.title} • {role.company}
                      </option>
                    ))}
                  </select>
                  <Button
                    disabled={
                      !candidateDraft.name.trim() ||
                      !candidateDraft.headline.trim() ||
                      !candidateDraft.location.trim()
                    }
                    onClick={() => {
                      addCandidate({
                        name: candidateDraft.name.trim(),
                        headline: candidateDraft.headline.trim(),
                        location: candidateDraft.location.trim(),
                        roleId: candidateDraft.roleId || undefined,
                      });
                      setCandidateDraft({
                        name: '',
                        headline: '',
                        location: '',
                        roleId: '',
                      });
                      setCreatingCandidate(false);
                    }}
                  >
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {computedKpis.map(kpi => (
              <Card key={kpi.label}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {kpi.label}
                      </p>
                      <p className="text-xl font-semibold text-foreground">
                        {kpi.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {kpi.detail}
                      </p>
                    </div>
                    <span className="rounded-md bg-muted p-2 text-muted-foreground">
                      <kpi.icon className="h-4 w-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline snapshot</CardTitle>
                <CardDescription>
                  Count by stage (keep this honest — each move should represent
                  a real next step).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pipeline.map(row => (
                  <div
                    key={row.stage}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium text-foreground">{row.stage}</p>
                    </div>
                    <Badge variant="secondary">{row.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
                <CardDescription>
                  What changed last — useful for maintaining daily cadence.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.map(item => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-border/60 bg-muted/30 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.meta}
                        </p>
                      </div>
                      <Badge variant="outline">{item.badge}</Badge>
                    </div>
                  </div>
                ))}

                <div className="pt-1">
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/business-tools">Back to Business Tools</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
