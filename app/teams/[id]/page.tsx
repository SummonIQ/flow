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
import { Edit, GitBranch, Trash2, Users, Workflow } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  ConnectionMode,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from 'sonner';

type Agent = {
  id: string;
  name: string;
  role: string;
};

type TeamMember = {
  id: string;
  agentId: string;
  agent: Agent;
  workflowRole: string | null;
  order: number;
  canAssign: boolean;
  canReview: boolean;
};

type Workflow = {
  id: string;
  name: string;
  description: string | null;
  stages?: any[];
  transitions?: any[];
  specializations?: string[];
};

type Team = {
  id: string;
  name: string;
  description: string | null;
  projectId: string | null;
  workflow: Workflow | null;
  workflowData: any;
  members: TeamMember[];
  _count: {
    tickets: number;
  };
};

interface TeamDetailsProps {
  params: Promise<{ id: string }>;
}

export default function TeamDetailsPage({ params }: TeamDetailsProps) {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamId, setTeamId] = useState<string>('');

  useEffect(() => {
    params.then(({ id }) => {
      setTeamId(id);
      loadTeam(id);
    });
  }, [params]);

  async function loadTeam(id: string) {
    try {
      const response = await fetch(`/api/teams/${id}`);
      const data = await response.json();
      setTeam(data);
    } catch (error) {
      console.error('Failed to load team:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTeam() {
    if (!team) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${team.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete team');
      }

      toast.success('Team deleted successfully');
      router.push('/teams');
    } catch (error) {
      console.error('Failed to delete team:', error);
      toast.error('Failed to delete team');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading team...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-destructive">Team not found</div>
      </div>
    );
  }

  const formatRole = (role: string) => {
    return role
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-background">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                <h1 className="text-xl font-semibold">{team.name}</h1>
                {team.workflow && (
                  <Badge variant="secondary" className="gap-1">
                    <GitBranch className="w-3 h-3" />
                    Workflow Enabled
                  </Badge>
                )}
              </div>
              {team.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {team.description}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Team
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{team.members.length}</span>
              <span className="text-muted-foreground">
                {team.members.length === 1 ? 'member' : 'members'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {team._count.tickets}{' '}
                {team._count.tickets === 1 ? 'ticket' : 'tickets'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content with Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="members" className="h-full flex flex-col">
          <div className="max-w-7xl px-6 pt-4">
            <TabsList>
              <TabsTrigger value="members">Members</TabsTrigger>
              {team.workflow && (
                <TabsTrigger value="workflow">Workflow</TabsTrigger>
              )}
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="members" className="flex-1 overflow-auto mt-0">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <MembersTab members={team.members} formatRole={formatRole} />
            </div>
          </TabsContent>

          {team.workflow && (
            <TabsContent value="workflow" className="flex-1 overflow-auto mt-0">
              <div className="max-w-7xl mx-auto px-6 py-6">
                <WorkflowTab teamId={teamId} />
              </div>
            </TabsContent>
          )}

          <TabsContent value="settings" className="flex-1 overflow-auto mt-0">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <SettingsTab team={team} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Members Tab Component
function MembersTab({
  members,
  formatRole,
}: {
  members: TeamMember[];
  formatRole: (role: string) => string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Team Members</h2>
        <Button size="sm" className="gap-2">
          Add Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member, index) => (
          <Card key={member.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{member.agent.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {member.workflowRole || formatRole(member.agent.role)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {member.canAssign && (
                  <Badge variant="secondary" className="text-xs">
                    Can assign
                  </Badge>
                )}
                {member.canReview && (
                  <Badge variant="secondary" className="text-xs">
                    Can review
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Workflow Tab Component
function WorkflowTab({ teamId }: { teamId: string }) {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    async function loadTeam() {
      const response = await fetch(`/api/teams/${teamId}`);
      const data = await response.json();
      setTeam(data);
    }
    loadTeam();
  }, [teamId]);

  if (!team?.workflow) {
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <div className="text-center py-12">
            <Workflow className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Workflow Assigned</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Assign a workflow to this team to manage their process
            </p>
            <Button onClick={() => router.push('/workflows')}>
              Browse Workflows
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const workflow = team.workflow;
  const stages = workflow.stages || [];
  const transitions = workflow.transitions || [];

  return (
    <div
      style={{
        height: 'calc(100vh - 200px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Tabs defaultValue="designer" className="h-full flex flex-col">
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">{workflow.name}</h2>
              {workflow.description && (
                <p className="text-sm text-muted-foreground">
                  {workflow.description}
                </p>
              )}
            </div>
          </div>

          <TabsList>
            <TabsTrigger value="designer">Designer</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="designer"
          className="flex-1 mt-0"
          style={{ minHeight: '500px', height: '100%' }}
        >
          <ReactFlowProvider>
            <WorkflowDesignerView stages={stages} transitions={transitions} />
          </ReactFlowProvider>
        </TabsContent>

        <TabsContent value="list" className="flex-1 overflow-auto mt-0">
          <div className="px-6 py-6">
            <Card className="p-6">
              <div className="space-y-4">
                {stages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3">
                      Workflow Stages
                    </h4>
                    <div className="space-y-2">
                      {stages.map((stage: any, index: number) => (
                        <div
                          key={stage.id}
                          className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">
                              {stage.name}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {stage.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {stage.agentRole?.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {workflow.specializations &&
                  workflow.specializations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3">
                        Specializations
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {workflow.specializations.map(
                          (spec: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {spec}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Workflow Designer View Component
function WorkflowDesignerView({
  stages,
  transitions,
}: {
  stages: any[];
  transitions: any[];
}) {
  if (!stages || stages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No workflow stages found</p>
        </div>
      </div>
    );
  }

  // Convert workflow stages to React Flow nodes
  const initialNodes: Node[] = stages.map((stage, index) => ({
    id: stage.id,
    type: 'default',
    position: {
      x: 200 + (index % 3) * 300,
      y: 100 + Math.floor(index / 3) * 250,
    },
    data: {
      label: (
        <Card className="w-full p-4 border-2 shadow-lg">
          <div className="flex items-start justify-between mb-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
              {index + 1}
            </div>
          </div>
          <h3 className="font-semibold text-sm mb-1">{stage.name}</h3>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {stage.description}
          </p>
          <div className="flex items-center justify-between text-xs">
            <Badge variant="outline" className="text-xs">
              {stage.agentRole
                ?.split('_')
                .map((w: string) => w.charAt(0))
                .join('')}
            </Badge>
          </div>
        </Card>
      ),
    },
    style: {
      background: 'transparent',
      border: 'none',
      padding: 0,
      width: 280,
    },
  }));

  // Convert transitions to React Flow edges
  const initialEdges: Edge[] = transitions.map((transition, index) => ({
    id: `e-${transition.from}-${transition.to}-${index}`,
    source: transition.from,
    target: transition.to,
    type: transition.type === 'feedback' ? 'smoothstep' : 'default',
    animated: transition.type === 'feedback',
    label: transition.condition,
    labelStyle: { fontSize: 12 },
    labelBgStyle: { opacity: 0.8 },
    style: {
      stroke: transition.type === 'feedback' ? '#3b82f6' : '#64748b',
      strokeWidth: 2,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: transition.type === 'feedback' ? '#3b82f6' : '#64748b',
    },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div style={{ width: '100%', height: '100%' }} className="bg-muted/20">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-background"
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        minZoom={0.1}
        maxZoom={2}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls className="!bg-card border-2 !border-border/50 rounded-lg shadow-lg [&>button]:!bg-card [&>button]:!border-border/50 [&>button]:!text-foreground [&>button:hover]:!bg-accent [&>button]:transition-colors" />
        <MiniMap
          nodeStrokeWidth={3}
          pannable
          zoomable
          maskColor="hsl(var(--muted) / 0.5)"
          nodeColor="hsl(var(--primary))"
          nodeBorderRadius={8}
          className="!bg-card border-2 !border-border/50 rounded-lg shadow-lg"
        />
      </ReactFlow>
    </div>
  );
}

// Settings Tab Component
function SettingsTab({ team }: { team: Team }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Team Settings</h2>
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Team Name</label>
              <p className="text-sm text-muted-foreground mt-1">{team.name}</p>
            </div>
            {team.description && (
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground mt-1">
                  {team.description}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Project</label>
              <p className="text-sm text-muted-foreground mt-1">
                {team.projectId || 'No project assigned'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-base font-semibold mb-4">Danger Zone</h3>
        <Card className="p-6 border-destructive">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm">Delete Team</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete this team and all associated data
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Team
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
