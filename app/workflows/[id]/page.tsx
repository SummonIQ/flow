'use client';

import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';

import {
  Badge,
  Button,
  Card,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@summoniq/applab-ui';
import { ArrowLeft, Edit, Save, Settings, Trash2, X } from 'lucide-react';
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

type WorkflowStage = {
  id: string;
  name: string;
  description: string;
  agentRole: string | null;
};

type WorkflowTransition = {
  from: string;
  to: string;
  condition: string;
  type?: string;
};

type Workflow = {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  stages: WorkflowStage[];
  transitions: WorkflowTransition[];
  specializations: string[];
  createdAt: string;
  teams?: Array<{
    id: string;
    name: string;
  }>;
  _count?: {
    teams: number;
  };
};

interface WorkflowDetailProps {
  params: Promise<{ id: string }>;
}

export default function WorkflowDetail({ params }: WorkflowDetailProps) {
  const router = useRouter();
  const [workflowId, setWorkflowId] = useState<string>('');
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    params.then(p => {
      setWorkflowId(p.id);
      loadWorkflow(p.id);
    });
  }, [params]);

  async function loadWorkflow(id: string) {
    try {
      const response = await fetch(`/api/workflows/${id}`);
      if (!response.ok) throw new Error('Workflow not found');
      const data = await response.json();
      setWorkflow(data);
    } catch (error) {
      console.error('Failed to load workflow:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!workflow) return;

    if (!confirm(`Are you sure you want to delete "${workflow.name}"?`)) return;

    try {
      const response = await fetch(`/api/workflows/${workflow.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to delete workflow');
        return;
      }

      router.push('/workflows');
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      alert('Failed to delete workflow');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading workflow...</div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Workflow not found</h2>
          <Button onClick={() => router.push('/workflows')}>
            Back to Workflows
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Page className="h-full">
      {/* Header */}
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {workflow.name}
            {workflow.isDefault ? (
              <Badge variant="secondary">Default</Badge>
            ) : null}
          </span>
        }
        description={workflow.description ? workflow.description : null}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setEditing(!editing)}
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/workflows')}
            className="gap-2 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div>
              {workflow.stages.length}{' '}
              {workflow.stages.length === 1 ? 'stage' : 'stages'}
            </div>
            {workflow._count ? (
              <div>
                Used by {workflow._count.teams}{' '}
                {workflow._count.teams === 1 ? 'team' : 'teams'}
              </div>
            ) : null}
          </div>
        </div>
      </PageHeader>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="designer" className="h-full flex flex-col">
          <div className="border-b px-6 pt-4">
            <TabsList>
              <TabsTrigger value="designer">Designer</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="designer"
            className="flex-1 mt-0"
            style={{ minHeight: '500px', height: 'calc(100vh - 300px)' }}
          >
            <ReactFlowProvider>
              <WorkflowDesignerView
                stages={workflow.stages}
                transitions={workflow.transitions}
              />
            </ReactFlowProvider>
          </TabsContent>

          <TabsContent value="details" className="flex-1 overflow-auto mt-0">
            <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
              {/* Workflow Stages */}
              {workflow.stages.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Workflow Stages
                  </h2>
                  <div className="space-y-3">
                    {workflow.stages.map((stage, index) => (
                      <div
                        key={stage.id}
                        className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{stage.name}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {stage.agentRole?.replace(/_/g, ' ') || 'No Role'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {stage.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Transitions */}
              {workflow.transitions.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Transitions</h2>
                  <div className="space-y-2">
                    {workflow.transitions.map((transition, index) => {
                      const fromStage = workflow.stages.find(
                        s => s.id === transition.from,
                      );
                      const toStage = workflow.stages.find(
                        s => s.id === transition.to,
                      );
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                        >
                          <Badge variant="outline" className="text-xs">
                            {fromStage?.name}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            →
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {toStage?.name}
                          </Badge>
                          <span className="text-sm text-muted-foreground flex-1">
                            {transition.condition}
                          </span>
                          {transition.type === 'feedback' && (
                            <Badge variant="secondary" className="text-xs">
                              Feedback
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* Specializations */}
              {workflow.specializations.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Specializations
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {workflow.specializations.map((spec, index) => (
                      <Badge key={index} variant="outline">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              {/* Teams Using This Workflow */}
              {workflow.teams && workflow.teams.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Teams Using This Workflow
                  </h2>
                  <div className="space-y-2">
                    {workflow.teams.map(team => (
                      <div
                        key={team.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-pointer"
                        onClick={() => router.push(`/teams/${team.id}`)}
                      >
                        <span className="font-medium">{team.name}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Page>
  );
}

// Workflow Designer View Component
function WorkflowDesignerView({
  stages,
  transitions,
}: {
  stages: WorkflowStage[];
  transitions: WorkflowTransition[];
}) {
  const [selectedNode, setSelectedNode] = useState<WorkflowStage | null>(null);

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
          <Badge variant="outline" className="text-xs">
            {stage.agentRole
              ?.split('_')
              .map((w: string) => w.charAt(0))
              .join('')}
          </Badge>
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

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const stage = stages.find(s => s.id === node.id);
      if (stage) {
        setSelectedNode(stage);
      }
    },
    [stages],
  );

  const handlePropertyChange = (field: keyof WorkflowStage, value: string) => {
    if (!selectedNode) return;
    setSelectedNode({ ...selectedNode, [field]: value });
    // TODO: Save changes to backend
  };

  return (
    <div
      style={{ width: '100%', height: '100%' }}
      className="bg-muted/20 relative"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
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

      {/* Properties Slide Panel */}
      {selectedNode && (
        <>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 z-10"
            onClick={() => setSelectedNode(null)}
          />

          {/* Slide Panel */}
          <div className="absolute top-0 right-0 bottom-0 w-96 bg-background border-l border-border shadow-2xl z-20 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Stage Properties</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNode(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {/* Stage Name */}
              <div className="space-y-2">
                <Label htmlFor="stage-name">Stage Name</Label>
                <Input
                  id="stage-name"
                  value={selectedNode.name}
                  onChange={e => handlePropertyChange('name', e.target.value)}
                  placeholder="Enter stage name"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="stage-description">Description</Label>
                <Textarea
                  id="stage-description"
                  value={selectedNode.description}
                  onChange={e =>
                    handlePropertyChange('description', e.target.value)
                  }
                  placeholder="Enter stage description"
                  rows={4}
                />
              </div>

              {/* Agent Role */}
              <div className="space-y-2">
                <Label htmlFor="stage-role">Agent Role</Label>
                <select
                  id="stage-role"
                  value={selectedNode.agentRole || ''}
                  onChange={e =>
                    handlePropertyChange('agentRole', e.target.value)
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">No Role</option>
                  <option value="PRODUCT_OWNER">Product Owner</option>
                  <option value="DESIGNER">Designer</option>
                  <option value="TECH_LEAD">Tech Lead</option>
                  <option value="FRONTEND_ENGINEER">Frontend Engineer</option>
                  <option value="BACKEND_ENGINEER">Backend Engineer</option>
                  <option value="FULLSTACK_ENGINEER">Fullstack Engineer</option>
                  <option value="QA_ENGINEER">QA Engineer</option>
                  <option value="DEVOPS_ENGINEER">DevOps Engineer</option>
                  <option value="SCRUM_MASTER">Scrum Master</option>
                </select>
              </div>

              {/* Info Card */}
              <Card className="p-4 bg-muted/50">
                <h4 className="font-medium text-sm mb-2">Stage Info</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stage ID:</span>
                    <span className="font-mono text-xs">{selectedNode.id}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedNode(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  // TODO: Save changes to backend
                  console.log('Save changes:', selectedNode);
                  setSelectedNode(null);
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
