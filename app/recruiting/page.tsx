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
  Compass,
  Network,
  Search,
  Sparkles,
  Target,
} from 'lucide-react';
import Link from 'next/link';

import { useEffect, useMemo } from 'react';

import { useRecruitingStore } from '@/lib/recruiting/store';

export default function RecruitingPage() {
  const hasHydrated = useRecruitingStore(state => state.hasHydrated);
  const ensureSeeded = useRecruitingStore(state => state.ensureSeeded);
  const roles = useRecruitingStore(state => state.roles);
  const candidates = useRecruitingStore(state => state.candidates);
  const tasks = useRecruitingStore(state => state.tasks);
  const toggleTask = useRecruitingStore(state => state.toggleTask);
  const moveCandidateStage = useRecruitingStore(
    state => state.moveCandidateStage,
  );

  useEffect(() => {
    if (!hasHydrated) return;
    ensureSeeded();
  }, [ensureSeeded, hasHydrated]);

  const computed = useMemo(() => {
    const activeRoles = roles.filter(r => r.status === 'open');
    const inPlay = new Set([
      'Sourced',
      'Contacted',
      'Screening',
      'Client loop',
      'Offer',
    ]);
    const candidatesInPlay = candidates.filter(c => inPlay.has(c.stage));
    const openTasks = tasks.filter(t => !t.done);

    const byRole = new Map<string, number>();
    for (const c of candidatesInPlay) {
      if (!c.roleId) continue;
      byRole.set(c.roleId, (byRole.get(c.roleId) ?? 0) + 1);
    }

    const roleRows = activeRoles
      .map(r => ({
        ...r,
        inPlayCount: byRole.get(r.id) ?? 0,
      }))
      .sort((a, b) => b.inPlayCount - a.inPlayCount)
      .slice(0, 5);

    const followUps = candidates
      .filter(c => c.stage === 'Contacted')
      .slice(0, 6);

    return {
      activeRolesCount: activeRoles.length,
      candidatesInPlayCount: candidatesInPlay.length,
      openTasksCount: openTasks.length,
      roleRows,
      followUps,
      openTasks: openTasks.slice(0, 6),
    };
  }, [candidates, roles, tasks]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-emerald-500/10 p-2">
                <Compass className="h-5 w-5 text-emerald-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Recruiting Hub
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              One place to source candidates, build pipelines, and turn warm
              intros into placements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/recruiting/candidates/search">
                <Search className="mr-2 h-4 w-4" />
                Candidate search
              </Link>
            </Button>
            <Button asChild>
              <Link href="/recruiting-dashboard">
                <Target className="mr-2 h-4 w-4" />
                View dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {computed.activeRolesCount} active roles
            </Badge>
            <Badge variant="secondary">
              {computed.candidatesInPlayCount} candidates in play
            </Badge>
            <Badge variant="secondary">
              {computed.openTasksCount} open tasks
            </Badge>
            {!hasHydrated ? (
              <Badge variant="outline">Loading workspace…</Badge>
            ) : null}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Quick actions</CardTitle>
                <CardDescription>
                  Start here when you’re moving fast — these are the high
                  leverage workflows.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">
                        Build a shortlist
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Search, filter, and score candidates for a specific
                        role.
                      </p>
                    </div>
                    <Badge variant="outline">Sourcing</Badge>
                  </div>
                  <div className="mt-4">
                    <Button asChild size="sm">
                      <Link href="/recruiting/candidates/search">
                        Open search <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">
                        Map warm network
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Track relationships, intros, and target companies.
                      </p>
                    </div>
                    <Badge variant="outline">Outbound</Badge>
                  </div>
                  <div className="mt-4">
                    <Button asChild size="sm" variant="outline">
                      <Link href="/recruiting/network-mapping">
                        Open mapping <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">
                        Training program
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        A structured playbook for sourcing → outreach →
                        placement.
                      </p>
                    </div>
                    <Badge variant="outline">Ops</Badge>
                  </div>
                  <div className="mt-4">
                    <Button asChild size="sm" variant="outline">
                      <Link href="/recruiting/training">
                        Start training <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">
                        AI-assisted outreach
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Generate role-specific messaging and follow-up
                        sequences.
                      </p>
                    </div>
                    <Badge variant="outline">Drafting</Badge>
                  </div>
                  <div className="mt-4">
                    <Button size="sm" variant="outline">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate templates
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today’s focus</CardTitle>
                <CardDescription>
                  Keep the system tight: clarity, cadence, and clean pipeline
                  states.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Primary goal</p>
                  <p className="mt-1 font-medium text-foreground">
                    Drive 3 candidates into Screening for your top role
                  </p>
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Follow-ups</p>
                  {computed.followUps.length ? (
                    <div className="mt-2 grid gap-2">
                      {computed.followUps.map(candidate => (
                        <div
                          key={candidate.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {candidate.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {candidate.headline}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              moveCandidateStage(candidate.id, 'Screening')
                            }
                          >
                            To Screening
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      No contacted candidates yet.
                    </p>
                  )}
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Open tasks</p>
                  {computed.openTasks.length ? (
                    <div className="mt-2 grid gap-2">
                      {computed.openTasks.map(task => (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => toggleTask(task.id)}
                          className="flex w-full items-center justify-between gap-2 rounded-md border border-border/60 bg-background/40 px-3 py-2 text-left"
                        >
                          <span className="truncate text-sm text-foreground">
                            {task.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Mark done
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      No open tasks.
                    </p>
                  )}
                </div>

                <div className="pt-1">
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/business-tools">
                      <Network className="mr-2 h-4 w-4" />
                      Back to Business Tools
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Roles needing attention</CardTitle>
                <CardDescription>
                  Focus on the roles where pipeline is thin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {computed.roleRows.length ? (
                  computed.roleRows.map(role => (
                    <div
                      key={role.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {role.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {role.company} • {role.location}
                        </p>
                      </div>
                      <Badge
                        variant={role.inPlayCount ? 'secondary' : 'outline'}
                      >
                        {role.inPlayCount} in play
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No roles yet. Create one from the dashboard.
                  </p>
                )}

                <div className="pt-1">
                  <Button asChild size="sm" variant="outline">
                    <Link href="/recruiting-dashboard">Open dashboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workflow shortcuts</CardTitle>
                <CardDescription>
                  Jump to the most-used screens.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href="/recruiting/candidates/search">
                    <Search className="mr-2 h-4 w-4" />
                    Candidate Search
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href="/recruiting/network-mapping">
                    <Network className="mr-2 h-4 w-4" />
                    Network Mapping
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href="/recruiting/training">
                    <Compass className="mr-2 h-4 w-4" />
                    Training Program
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
