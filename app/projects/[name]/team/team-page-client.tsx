'use client';

import {
  Badge,
  Button,
  Card,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@summoniq/applab-ui';
import { GitBranch, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AgentsTab } from '../tabs/agents-tab';

type TeamMember = {
  id: string;
  workflowRole: string | null;
  order: number;
  canAssign: boolean;
  canReview: boolean;
  agent: {
    id: string;
    name: string;
    role: string;
  };
};

type Team = {
  id: string;
  name: string;
  description: string | null;
  workflow: {
    id: string;
    name: string;
    description: string | null;
  } | null;
  members: TeamMember[];
  _count: { tickets: number };
};

export function TeamPageClient({
  projectName,
  initialTab,
}: {
  projectName: string;
  initialTab?: string;
}) {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  const defaultTab = useMemo(() => {
    if (initialTab === 'agents') return 'agents';
    return 'overview';
  }, [initialTab]);

  useEffect(() => {
    let cancelled = false;

    async function loadTeam() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/projects/${encodeURIComponent(projectName)}/team`,
        );
        const json = (await res.json().catch(() => ({}))) as {
          success?: boolean;
          team?: Team | null;
        };

        if (!cancelled) {
          setTeam(json.team ?? null);
        }
      } catch {
        if (!cancelled) setTeam(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTeam();

    return () => {
      cancelled = true;
    };
  }, [projectName]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Team</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Team information and agent dashboard for this project
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading team…</div>
          ) : team ? (
            <div className="space-y-4">
              <Card className="p-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <div className="text-xl font-semibold truncate">
                      {team.name}
                    </div>
                    {team.description ? (
                      <div className="text-sm text-muted-foreground mt-1">
                        {team.description}
                      </div>
                    ) : null}

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                      <div className="inline-flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {team.members.length}
                        </span>
                        <span className="text-muted-foreground">
                          {team.members.length === 1 ? 'member' : 'members'}
                        </span>
                      </div>

                      <Badge variant="outline">
                        {team._count.tickets}{' '}
                        {team._count.tickets === 1 ? 'ticket' : 'tickets'}
                      </Badge>

                      {team.workflow ? (
                        <Badge variant="secondary" className="gap-1">
                          <GitBranch className="h-3 w-3" />
                          {team.workflow.name}
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => router.push('/teams')}
                    >
                      View Teams
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/teams/${team.id}`)}
                    >
                      Open Team
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-base font-semibold">Members</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {team.members.map(member => (
                    <div
                      key={member.id}
                      className="rounded-lg border border-border bg-background p-4"
                    >
                      <div className="font-medium text-sm">
                        {member.agent.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {member.workflowRole || member.agent.role}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {member.canAssign ? (
                          <Badge variant="secondary" className="text-xs">
                            Can assign
                          </Badge>
                        ) : null}
                        {member.canReview ? (
                          <Badge variant="secondary" className="text-xs">
                            Can review
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-10">
              <div className="text-center text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No team assigned to this project yet</p>
                <p className="text-xs mt-1">
                  Assign a team to this project to see members and workflow
                  information.
                </p>
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/teams')}
                  >
                    Go to Teams
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="agents" className="mt-6">
          <AgentsTab project={{ name: projectName, description: '' }} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
