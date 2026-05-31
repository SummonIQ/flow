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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@summoniq/applab-ui';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Code2,
  Edit,
  FlaskConical,
  GripVertical,
  Palette,
  Plus,
  Save,
  Trash2,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

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
};

type WorkflowStage = {
  id: string;
  name: string;
  description: string;
  agentRole: string;
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
  stages: WorkflowStage[];
  transitions: WorkflowTransition[];
  specializations: string[];
};

type Team = {
  id: string;
  name: string;
  description: string | null;
  workflow: Workflow | null;
  workflowData: {
    stages: WorkflowStage[];
    transitions: WorkflowTransition[];
    specializations: string[];
  } | null;
  members: TeamMember[];
};

interface WorkflowDesignerProps {
  params: Promise<{ id: string }>;
}

export default function WorkflowDesigner({ params }: WorkflowDesignerProps) {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading workflow...</div>
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

  // Support both new workflow relation and legacy workflowData
  const workflowSource = team.workflow || team.workflowData;
  const stages = workflowSource?.stages || [];
  const transitions = workflowSource?.transitions || [];
  const specializations = workflowSource?.specializations || [];

  return (
    <Page className="h-full">
      {/* Header */}
      <PageHeader
        title={`${team.name} - Workflow`}
        description={team.description}
        actions={
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Workflow
              </Button>
            )}
          </div>
        }
      >
        {/* Team Members */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">
            Team:
          </span>
          {team.members.map(member => (
            <Badge key={member.id} variant="secondary" className="gap-1">
              {member.agent.name.split(' - ')[0]}
              {member.workflowRole ? (
                <span className="text-xs text-muted-foreground">
                  • {member.workflowRole}
                </span>
              ) : null}
            </Badge>
          ))}
        </div>
      </PageHeader>

      {/* Content with Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="freeform2" className="h-full flex flex-col">
          <div className="px-6 pt-4">
            <TabsList>
              <TabsTrigger value="freeform2">Designer</TabsTrigger>
              <TabsTrigger value="freeform">Simple</TabsTrigger>
              <TabsTrigger value="horizontal">List View</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="horizontal" className="flex-1 overflow-auto mt-0">
            <HorizontalWorkflowView
              stages={stages}
              transitions={transitions}
              specializations={specializations}
              editing={editing}
            />
          </TabsContent>

          <TabsContent value="freeform" className="flex-1 mt-0">
            <FreeformWorkflowView
              stages={stages}
              transitions={transitions}
              editing={editing}
            />
          </TabsContent>

          <TabsContent value="freeform2" className="flex-1 mt-0">
            <EnhancedFreeformWorkflowView
              stages={stages}
              transitions={transitions}
              editing={editing}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Page>
  );
}

// Horizontal Workflow View Component
function HorizontalWorkflowView({
  stages,
  transitions,
  specializations,
  editing,
}: {
  stages: WorkflowStage[];
  transitions: WorkflowTransition[];
  specializations: string[];
  editing: boolean;
}) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">
      {/* Workflow Visualization */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Workflow Stages</h2>
        <div className="relative">
          {/* Stages */}
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map((stage: WorkflowStage, index: number) => (
              <div
                key={stage.id}
                className="flex items-center gap-4 flex-shrink-0"
              >
                <WorkflowStageCard
                  stage={stage}
                  index={index}
                  editing={editing}
                />
                {index < stages.length - 1 && (
                  <div className="flex flex-col items-center gap-1">
                    <ArrowRight className="w-6 h-6 text-muted-foreground" />
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {transitions.find(
                        (t: WorkflowTransition) => t.from === stage.id,
                      )?.condition || 'Next'}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Stage Button */}
          {editing && (
            <Button variant="outline" className="w-full mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Add Stage
            </Button>
          )}
        </div>
      </div>

      {/* Feedback Loops */}
      {transitions.some((t: WorkflowTransition) => t.type === 'feedback') && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Feedback Loops</h2>
          <div className="space-y-2">
            {transitions
              .filter((t: WorkflowTransition) => t.type === 'feedback')
              .map((transition: WorkflowTransition, index: number) => {
                const fromStage = stages.find(
                  (s: WorkflowStage) => s.id === transition.from,
                );
                const toStage = stages.find(
                  (s: WorkflowStage) => s.id === transition.to,
                );
                return (
                  <Card key={index} className="p-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{fromStage?.name}</Badge>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <Badge variant="outline">{toStage?.name}</Badge>
                      <span className="text-sm text-muted-foreground">
                        when: {transition.condition}
                      </span>
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* Specializations */}
      {specializations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Team Specializations</h2>
          <div className="flex flex-wrap gap-2">
            {specializations.map((spec: string, index: number) => (
              <Badge key={index} variant="secondary">
                {spec}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Workflow Metrics */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Estimated Timeline</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stages.map((stage: WorkflowStage) => (
            <Card key={stage.id} className="p-4">
              <div className="text-sm font-medium mb-1">{stage.name}</div>
              <Badge variant="secondary">
                {stage.agentRole.replace(/_/g, ' ')}
              </Badge>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkflowStageCard({
  stage,
  index,
  editing,
}: {
  stage: WorkflowStage;
  index: number;
  editing: boolean;
}) {
  const roleColors: Record<string, string> = {
    PRODUCT_OWNER: 'bg-blue-500/10 border-blue-500/20',
    DESIGNER: 'bg-purple-500/10 border-purple-500/20',
    TECH_LEAD: 'bg-orange-500/10 border-orange-500/20',
    FRONTEND_ENGINEER: 'bg-cyan-500/10 border-cyan-500/20',
    FULLSTACK_ENGINEER: 'bg-green-500/10 border-green-500/20',
    QA_ENGINEER: 'bg-pink-500/10 border-pink-500/20',
  };

  const roleIcons: Record<string, React.ReactNode> = {
    PRODUCT_OWNER: <BarChart3 className="w-5 h-5" />,
    DESIGNER: <Palette className="w-5 h-5" />,
    TECH_LEAD: <Users className="w-5 h-5" />,
    FRONTEND_ENGINEER: <Code2 className="w-5 h-5" />,
    FULLSTACK_ENGINEER: <Wrench className="w-5 h-5" />,
    QA_ENGINEER: <FlaskConical className="w-5 h-5" />,
  };

  return (
    <Card
      className={`w-64 p-4 border-2 ${
        roleColors[stage.agentRole] || 'bg-muted/10 border-border'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-white/50 dark:bg-black/20">
            {roleIcons[stage.agentRole] || <Bot className="w-5 h-5" />}
          </div>
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
            {index + 1}
          </div>
        </div>
        {editing && (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-destructive"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      <h3 className="font-semibold text-sm mb-1">{stage.name}</h3>
      <p className="text-xs text-muted-foreground mb-3">{stage.description}</p>

      <div className="flex items-center justify-between text-xs">
        <Badge variant="outline" className="text-xs">
          {stage.agentRole
            .split('_')
            .map(w => w.charAt(0))
            .join('')}
        </Badge>
      </div>
    </Card>
  );
}

// Freeform Workflow View Component with Draggable Canvas
function FreeformWorkflowView({
  stages,
  transitions,
  editing,
}: {
  stages: WorkflowStage[];
  transitions: WorkflowTransition[];
  editing: boolean;
}) {
  // Convert workflow stages to React Flow nodes
  const initialNodes: Node[] = stages.map((stage, index) => ({
    id: stage.id,
    type: 'default',
    position: {
      x: 200 + (index % 3) * 300,
      y: 100 + Math.floor(index / 3) * 250,
    },
    data: {
      label: <WorkflowNodeContent stage={stage} index={index} />,
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
    <div className="h-full w-full bg-muted/20">
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
        edgesFocusable={true}
        nodesFocusable={true}
        minZoom={0.1}
        maxZoom={2}
        translateExtent={[
          [-1000, -1000],
          [3000, 3000],
        ]}
        nodeExtent={[
          [-1000, -1000],
          [3000, 3000],
        ]}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="hsl(var(--muted-foreground))"
        />
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

// Custom Node Content Component
function WorkflowNodeContent({
  stage,
  index,
}: {
  stage: WorkflowStage;
  index: number;
}) {
  const roleColors: Record<string, string> = {
    PRODUCT_OWNER: 'bg-blue-500/10 border-blue-500/20',
    DESIGNER: 'bg-purple-500/10 border-purple-500/20',
    TECH_LEAD: 'bg-orange-500/10 border-orange-500/20',
    FRONTEND_ENGINEER: 'bg-cyan-500/10 border-cyan-500/20',
    FULLSTACK_ENGINEER: 'bg-green-500/10 border-green-500/20',
    QA_ENGINEER: 'bg-pink-500/10 border-pink-500/20',
  };

  const roleIcons: Record<string, React.ReactNode> = {
    PRODUCT_OWNER: <BarChart3 className="w-5 h-5" />,
    DESIGNER: <Palette className="w-5 h-5" />,
    TECH_LEAD: <Users className="w-5 h-5" />,
    FRONTEND_ENGINEER: <Code2 className="w-5 h-5" />,
    FULLSTACK_ENGINEER: <Wrench className="w-5 h-5" />,
    QA_ENGINEER: <FlaskConical className="w-5 h-5" />,
  };

  return (
    <Card
      className={`w-full p-4 border-2 shadow-lg ${
        roleColors[stage.agentRole] || 'bg-muted/10 border-border'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-white/50 dark:bg-black/20">
            {roleIcons[stage.agentRole] || <Bot className="w-5 h-5" />}
          </div>
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
            {index + 1}
          </div>
        </div>
      </div>

      <h3 className="font-semibold text-sm mb-1">{stage.name}</h3>
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
        {stage.description}
      </p>

      <div className="flex items-center justify-between text-xs">
        <Badge variant="outline" className="text-xs">
          {stage.agentRole
            .split('_')
            .map(w => w.charAt(0))
            .join('')}
        </Badge>
      </div>
    </Card>
  );
}

// Enhanced Freeform Workflow View with Toolbar and Properties Editor
function EnhancedFreeformWorkflowView({
  stages,
  transitions,
  editing,
}: {
  stages: WorkflowStage[];
  transitions: WorkflowTransition[];
  editing: boolean;
}) {
  // Convert workflow stages to React Flow nodes
  const initialNodes: Node[] = stages.map((stage, index) => ({
    id: stage.id,
    type: 'default',
    position: {
      x: 200 + (index % 3) * 300,
      y: 100 + Math.floor(index / 3) * 250,
    },
    data: {
      label: <WorkflowNodeContent stage={stage} index={index} />,
      stage,
      index,
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
    data: { condition: transition.condition, transitionType: transition.type },
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
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  const addNewNode = useCallback(
    (roleType: string) => {
      const newId = `stage-new-${Date.now()}`;
      const newNode: Node = {
        id: newId,
        type: 'default',
        position: { x: 400, y: 200 },
        data: {
          label: (
            <WorkflowNodeContent
              stage={{
                id: newId,
                name: 'New Stage',
                description: 'New workflow stage',
                agentRole: roleType,
              }}
              index={nodes.length}
            />
          ),
          stage: {
            id: newId,
            name: 'New Stage',
            description: 'New workflow stage',
            agentRole: roleType,
          },
          index: nodes.length,
        },
        style: {
          background: 'transparent',
          border: 'none',
          padding: 0,
          width: 280,
        },
      };
      setNodes(nds => [...nds, newNode]);
    },
    [nodes.length, setNodes],
  );

  return (
    <div className="h-full w-full relative bg-muted/20">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-background"
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        edgesFocusable={true}
        nodesFocusable={true}
        minZoom={0.1}
        maxZoom={2}
        translateExtent={[
          [-1000, -1000],
          [3000, 3000],
        ]}
        nodeExtent={[
          [-1000, -1000],
          [3000, 3000],
        ]}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="hsl(var(--muted-foreground))"
        />
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

      {/* Floating Toolbar */}
      <NodeToolbar addNewNode={addNewNode} />

      {/* Properties Editor */}
      {(selectedNode || selectedEdge) && (
        <PropertiesPanel
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          onNodeUpdate={updatedNode => {
            setNodes(nds =>
              nds.map(n => (n.id === updatedNode.id ? updatedNode : n)),
            );
          }}
          onEdgeUpdate={updatedEdge => {
            setEdges(eds =>
              eds.map(e => (e.id === updatedEdge.id ? updatedEdge : e)),
            );
          }}
          onClose={() => {
            setSelectedNode(null);
            setSelectedEdge(null);
          }}
        />
      )}
    </div>
  );
}

// Node Toolbar Component
function NodeToolbar({
  addNewNode,
}: {
  addNewNode: (roleType: string) => void;
}) {
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const isDraggingRef = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        setPosition({
          x: e.clientX - dragStartPos.current.x,
          y: e.clientY - dragStartPos.current.y,
        });
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const nodeTypes = [
    {
      role: 'PRODUCT_OWNER',
      label: 'PO',
      icon: BarChart3,
      color: 'bg-blue-500',
    },
    {
      role: 'DESIGNER',
      label: 'Design',
      icon: Palette,
      color: 'bg-purple-500',
    },
    { role: 'TECH_LEAD', label: 'Tech', icon: Users, color: 'bg-orange-500' },
    {
      role: 'FRONTEND_ENGINEER',
      label: 'FE',
      icon: Code2,
      color: 'bg-cyan-500',
    },
    {
      role: 'FULLSTACK_ENGINEER',
      label: 'FS',
      icon: Wrench,
      color: 'bg-green-500',
    },
    {
      role: 'QA_ENGINEER',
      label: 'QA',
      icon: FlaskConical,
      color: 'bg-pink-500',
    },
  ];

  return (
    <Card
      className="absolute shadow-xl z-10 border-2"
      style={{ left: position.x, top: position.y }}
    >
      <div
        className="flex items-center gap-2 px-2 py-1.5 bg-muted/50 border-b cursor-move"
        onMouseDown={handleMouseDown}
      >
        <GripVertical className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs font-semibold">Add Node</span>
      </div>
      <div className="flex flex-col gap-1 p-2">
        {nodeTypes.map(type => {
          const Icon = type.icon;
          return (
            <Button
              key={type.role}
              variant="ghost"
              size="sm"
              onClick={() => addNewNode(type.role)}
              className="h-7 justify-start gap-2 text-xs hover:bg-accent"
            >
              <div className={`p-0.5 rounded ${type.color} text-white`}>
                <Icon className="w-3 h-3" />
              </div>
              {type.label}
            </Button>
          );
        })}
      </div>
    </Card>
  );
}

// Properties Panel Component
function PropertiesPanel({
  selectedNode,
  selectedEdge,
  onNodeUpdate,
  onEdgeUpdate,
  onClose,
}: {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  onNodeUpdate: (node: Node) => void;
  onEdgeUpdate: (edge: Edge) => void;
  onClose: () => void;
}) {
  const [nodeName, setNodeName] = useState('');
  const [nodeDescription, setNodeDescription] = useState('');
  const [edgeLabel, setEdgeLabel] = useState('');
  const [edgeType, setEdgeType] = useState('default');
  const [position, setPosition] = useState({
    x: window.innerWidth - 336,
    y: 16,
  });
  const isDraggingRef = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        setPosition({
          x: e.clientX - dragStartPos.current.x,
          y: e.clientY - dragStartPos.current.y,
        });
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (selectedNode?.data?.stage) {
      setNodeName(selectedNode.data.stage.name || '');
      setNodeDescription(selectedNode.data.stage.description || '');
    }
  }, [selectedNode]);

  useEffect(() => {
    if (selectedEdge) {
      setEdgeLabel((selectedEdge.label as string) || '');
      setEdgeType(selectedEdge.type || 'default');
    }
  }, [selectedEdge]);

  const handleNodeSave = () => {
    if (selectedNode) {
      const updatedNode = {
        ...selectedNode,
        data: {
          ...selectedNode.data,
          stage: {
            ...selectedNode.data.stage,
            name: nodeName,
            description: nodeDescription,
          },
          label: (
            <WorkflowNodeContent
              stage={{
                ...selectedNode.data.stage,
                name: nodeName,
                description: nodeDescription,
              }}
              index={selectedNode.data.index}
            />
          ),
        },
      };
      onNodeUpdate(updatedNode);
    }
  };

  const handleEdgeSave = () => {
    if (selectedEdge) {
      const isAnimated = edgeType === 'smoothstep';
      const updatedEdge = {
        ...selectedEdge,
        label: edgeLabel,
        type: edgeType,
        animated: isAnimated,
        style: {
          stroke: isAnimated ? '#3b82f6' : '#64748b',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isAnimated ? '#3b82f6' : '#64748b',
        },
      };
      onEdgeUpdate(updatedEdge);
    }
  };

  return (
    <Card
      className="absolute w-72 shadow-xl z-10 border-2"
      style={{ left: position.x, top: position.y }}
    >
      <div
        className="flex items-center justify-between px-2 py-1.5 bg-muted/50 border-b cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-3 h-3 text-muted-foreground" />
          <h3 className="text-xs font-semibold">
            {selectedNode ? 'Node' : 'Connection'}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0"
          onClick={onClose}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      <div className="p-3">
        {selectedNode && (
          <div className="space-y-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Name
              </label>
              <Input
                value={nodeName}
                onChange={e => setNodeName(e.target.value)}
                className="mt-1 h-8 text-sm"
                placeholder="Stage name"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Description
              </label>
              <Textarea
                value={nodeDescription}
                onChange={e => setNodeDescription(e.target.value)}
                className="mt-1 text-sm"
                placeholder="Stage description"
                rows={2}
              />
            </div>
            <Button onClick={handleNodeSave} className="w-full h-8" size="sm">
              <Save className="w-3 h-3 mr-1.5" />
              Save
            </Button>
          </div>
        )}

        {selectedEdge && (
          <div className="space-y-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Label
              </label>
              <Input
                value={edgeLabel}
                onChange={e => setEdgeLabel(e.target.value)}
                className="mt-1 h-8 text-sm"
                placeholder="Condition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Type
              </label>
              <div className="mt-1 space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={edgeType === 'default'}
                    onChange={() => setEdgeType('default')}
                    className="cursor-pointer"
                  />
                  <span className="text-xs">Normal</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={edgeType === 'smoothstep'}
                    onChange={() => setEdgeType('smoothstep')}
                    className="cursor-pointer"
                  />
                  <span className="text-xs">Feedback</span>
                </label>
              </div>
            </div>
            <Button onClick={handleEdgeSave} className="w-full h-8" size="sm">
              <Save className="w-3 h-3 mr-1.5" />
              Save
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
