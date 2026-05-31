'use client';

import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';

import {
  WorkflowNode } from '@/components/workflows/workflow-node';
import { WorkflowToolbox } from '@/components/workflows/workflow-toolbox';
import type { WorkflowStep } from '@/types/workflows';
import {
  Badge,
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@summoniq/applab-ui';
import { ArrowLeft, GripVertical, Pause, Play, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import {
  PanelGroup,
  PanelResizeHandle,
  Panel as ResizablePanel,
} from 'react-resizable-panels';
import ReactFlow, {
  addEdge,
  Background,
  type Connection,
  ConnectionMode,
  Controls,
  type Edge,
  MiniMap,
  type Node,
  type NodeProps,
  Panel,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

function WorkflowStepNode(props: NodeProps<WorkflowStep>) {
  return <WorkflowNode {...props} />;
}

const nodeTypes = {
  workflowStep: WorkflowStepNode,
};

const initialNodes: Node[] = [
  {
    id: 'trigger',
    type: 'workflowStep',
    position: { x: 250, y: 20 },
    data: {
      id: 'trigger',
      workflowId: 'workflow-1',
      order: 0,
      type: 'trigger',
      name: 'Workflow Trigger',
      triggerType: 'manual',
      content: 'Manual trigger - Click to run workflow',
      isEnabled: true,
    } as WorkflowStep,
  },
];

const initialEdges: Edge[] = [];

export default function WorkflowEditorPage() {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState('New Agent Workflow');
  const [workflowStatus, setWorkflowStatus] = useState<
    'draft' | 'active' | 'paused'
  >('draft');
  const [isSaving, setIsSaving] = useState(false);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges(eds =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: true,
            style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
          },
          eds,
        ),
      ),
    [setEdges],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const bounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left - 140,
        y: event.clientY - bounds.top - 50,
      };

      const stepData: Partial<WorkflowStep> = {
        id: `step-${nodes.length + 1}`,
        workflowId: 'workflow-1',
        order: nodes.length + 1,
        type: type as WorkflowStep['type'],
        name: `${type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} Step`,
        content: '',
        isEnabled: true,
      };

      if (type === 'agent') {
        stepData.content = 'Configure AI agent task';
      } else if (type === 'delay') {
        stepData.delay = { value: 5, unit: 'minutes' };
        stepData.content = 'Wait 5 minutes';
      } else if (type === 'manual') {
        stepData.content = 'Manual task to complete';
      } else if (type === 'condition') {
        stepData.content = 'Check if condition is met';
      } else if (type === 'api_call') {
        stepData.content = 'Configure API endpoint';
      } else if (type === 'transform') {
        stepData.content = 'Transform data';
      }

      const newNode: Node = {
        id: stepData.id!,
        type: 'workflowStep',
        position,
        data: stepData,
      };

      setNodes(nds => nds.concat(newNode));
    },
    [nodes, setNodes],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const toggleWorkflowStatus = () => {
    setWorkflowStatus(prev => (prev === 'active' ? 'paused' : 'active'));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert nodes to workflow stages
      const stages = nodes.map((node, index) => ({
        id: node.id,
        name: node.data.name || `Stage ${index + 1}`,
        type: node.data.type,
        order: index,
        position: node.position,
        config: {
          content: node.data.content,
          triggerType: node.data.triggerType,
          delay: node.data.delay,
          agentId: node.data.agentId,
        },
      }));

      // Convert edges to workflow transitions
      const transitions = edges.map(edge => ({
        from: edge.source,
        to: edge.target,
        condition: edge.data?.condition,
      }));

      const workflowData = {
        name: workflowName,
        description: `Visual workflow with ${stages.length} stages`,
        stages,
        transitions,
        specializations: [],
      };

      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save workflow');
      }

      const savedWorkflow = await response.json();
      router.push(`/workflows/${savedWorkflow.id}`);
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert(error instanceof Error ? error.message : 'Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Page className="h-full bg-background">
      {/* Header */}
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {workflowName}
            <Badge
              variant={
                workflowStatus === 'active'
                  ? 'default'
                  : workflowStatus === 'paused'
                    ? 'secondary'
                    : 'outline'
              }
            >
              {workflowStatus}
            </Badge>
          </span>
        }
        description="Design agent workflows with drag-and-drop nodes"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={toggleWorkflowStatus}>
              {workflowStatus === 'active' ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Activate
                </>
              )}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Workflow'}
            </Button>
          </>
        }
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/workflows')}
          className="w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </PageHeader>

      {/* Main Content */}
      <PanelGroup
        direction="horizontal"
        className="flex-1 overflow-hidden"
        autoSaveId="workflow-editor-layout"
      >
        {/* Left Sidebar - Toolbox */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <div className="h-full border-r border-border/50 bg-muted/10 p-4 overflow-y-auto">
            <WorkflowToolbox />
          </div>
        </ResizablePanel>

        <PanelResizeHandle className="w-1 bg-border/30 hover:bg-border/60 transition-colors cursor-col-resize relative group">
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 flex items-center justify-center">
            <GripVertical className="w-4 h-4 text-muted-foreground group-hover:text-foreground/70 transition-colors" />
          </div>
        </PanelResizeHandle>

        {/* Center - Canvas */}
        <ResizablePanel defaultSize={selectedNode ? 60 : 80} minSize={40}>
          <div className="h-full relative bg-muted/30">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              connectionMode={ConnectionMode.Loose}
              nodeTypes={nodeTypes}
              fitView
              className="bg-muted/30"
              nodesDraggable={true}
              nodesConnectable={true}
              elementsSelectable={true}
            >
              <Background
                gap={16}
                size={0.5}
                color="hsl(var(--muted-foreground) / 0.2)"
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
              <Panel
                position="top-left"
                className="bg-background border border-border rounded-lg p-3 shadow-lg"
              >
                <div className="space-y-1 text-sm">
                  <div className="font-semibold">Agent Workflow:</div>
                  <div className="text-muted-foreground text-xs">
                    • Drag nodes from toolbox
                  </div>
                  <div className="text-muted-foreground text-xs">
                    • Connect with edges
                  </div>
                  <div className="text-muted-foreground text-xs">
                    • Click to edit properties
                  </div>
                </div>
              </Panel>
            </ReactFlow>
          </div>
        </ResizablePanel>

        {/* Right Sidebar - Properties (when node selected) */}
        {selectedNode && (
          <>
            <PanelResizeHandle className="w-1 bg-border/30 hover:bg-border/60 transition-colors cursor-col-resize relative group">
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 flex items-center justify-center">
                <GripVertical className="w-4 h-4 text-muted-foreground group-hover:text-foreground/70 transition-colors" />
              </div>
            </PanelResizeHandle>

            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
              <div className="h-full border-l border-border/50 bg-background flex flex-col">
                <div className="p-4 border-b border-border">
                  <h3 className="text-lg font-semibold">Step Properties</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Configure step behavior and settings
                  </p>
                </div>

                <Tabs
                  defaultValue="properties"
                  className="flex-1 flex flex-col"
                >
                  <TabsList className="mx-4 mt-4">
                    <TabsTrigger value="properties">Properties</TabsTrigger>
                    <TabsTrigger value="raw">Raw JSON</TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="properties"
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                  >
                    {/* Basic Info */}
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="step-name">Step Name</Label>
                        <input
                          id="step-name"
                          type="text"
                          className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm"
                          value={selectedNode.data.name}
                          onChange={e => {
                            setNodes(nds =>
                              nds.map(node =>
                                node.id === selectedNode.id
                                  ? {
                                      ...node,
                                      data: {
                                        ...node.data,
                                        name: e.target.value,
                                      },
                                    }
                                  : node,
                              ),
                            );
                          }}
                        />
                      </div>

                      <div>
                        <Label>Step Type</Label>
                        <div className="mt-1 px-3 py-2 bg-muted rounded-md text-sm font-mono">
                          {selectedNode.data.type}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="step-order">Step Order</Label>
                        <input
                          id="step-order"
                          type="number"
                          className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm"
                          value={selectedNode.data.order}
                          onChange={e => {
                            setNodes(nds =>
                              nds.map(node =>
                                node.id === selectedNode.id
                                  ? {
                                      ...node,
                                      data: {
                                        ...node.data,
                                        order: parseInt(e.target.value) || 0,
                                      },
                                    }
                                  : node,
                              ),
                            );
                          }}
                        />
                      </div>
                    </div>

                    {/* Trigger-specific fields */}
                    {selectedNode.data.type === 'trigger' && (
                      <div className="space-y-3 pt-3 border-t border-border">
                        <h4 className="font-semibold text-sm">
                          Trigger Configuration
                        </h4>
                        <div>
                          <Label htmlFor="trigger-type">Trigger Type</Label>
                          <Select
                            value={selectedNode.data.triggerType || 'manual'}
                            onValueChange={value => {
                              setNodes(nds =>
                                nds.map(node =>
                                  node.id === selectedNode.id
                                    ? {
                                        ...node,
                                        data: {
                                          ...node.data,
                                          triggerType: value,
                                        },
                                      }
                                    : node,
                                ),
                              );
                            }}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="manual">Manual</SelectItem>
                              <SelectItem value="scheduled">
                                Scheduled
                              </SelectItem>
                              <SelectItem value="webhook">Webhook</SelectItem>
                              <SelectItem value="event">Event</SelectItem>
                              <SelectItem value="api">API</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Agent-specific fields */}
                    {selectedNode.data.type === 'agent' && (
                      <div className="space-y-3 pt-3 border-t border-border">
                        <h4 className="font-semibold text-sm">
                          Agent Configuration
                        </h4>
                        <div>
                          <Label htmlFor="agent-id">Agent ID</Label>
                          <input
                            id="agent-id"
                            type="text"
                            className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm"
                            value={selectedNode.data.agentId || ''}
                            onChange={e => {
                              setNodes(nds =>
                                nds.map(node =>
                                  node.id === selectedNode.id
                                    ? {
                                        ...node,
                                        data: {
                                          ...node.data,
                                          agentId: e.target.value,
                                        },
                                      }
                                    : node,
                                ),
                              );
                            }}
                            placeholder="agent-123"
                          />
                        </div>
                        <div>
                          <Label htmlFor="agent-name">Agent Name</Label>
                          <input
                            id="agent-name"
                            type="text"
                            className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm"
                            value={selectedNode.data.agentName || ''}
                            onChange={e => {
                              setNodes(nds =>
                                nds.map(node =>
                                  node.id === selectedNode.id
                                    ? {
                                        ...node,
                                        data: {
                                          ...node.data,
                                          agentName: e.target.value,
                                        },
                                      }
                                    : node,
                                ),
                              );
                            }}
                            placeholder="My AI Agent"
                          />
                        </div>
                      </div>
                    )}

                    {/* Delay-specific fields */}
                    {selectedNode.data.type === 'delay' && (
                      <div className="space-y-3 pt-3 border-t border-border">
                        <h4 className="font-semibold text-sm">
                          Delay Configuration
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="delay-value">Duration</Label>
                            <input
                              id="delay-value"
                              type="number"
                              className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm"
                              value={selectedNode.data.delay?.value || 5}
                              onChange={e => {
                                setNodes(nds =>
                                  nds.map(node =>
                                    node.id === selectedNode.id
                                      ? {
                                          ...node,
                                          data: {
                                            ...node.data,
                                            delay: {
                                              ...node.data.delay,
                                              value:
                                                parseInt(e.target.value) || 1,
                                              unit:
                                                node.data.delay?.unit ||
                                                'minutes',
                                            },
                                          },
                                        }
                                      : node,
                                  ),
                                );
                              }}
                            />
                          </div>
                          <div>
                            <Label htmlFor="delay-unit">Unit</Label>
                            <Select
                              value={selectedNode.data.delay?.unit || 'minutes'}
                              onValueChange={value => {
                                setNodes(nds =>
                                  nds.map(node =>
                                    node.id === selectedNode.id
                                      ? {
                                          ...node,
                                          data: {
                                            ...node.data,
                                            delay: {
                                              ...node.data.delay,
                                              value:
                                                node.data.delay?.value || 5,
                                              unit: value,
                                            },
                                          },
                                        }
                                      : node,
                                  ),
                                );
                              }}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="seconds">Seconds</SelectItem>
                                <SelectItem value="minutes">Minutes</SelectItem>
                                <SelectItem value="hours">Hours</SelectItem>
                                <SelectItem value="days">Days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Content/Description */}
                    <div className="space-y-3 pt-3 border-t border-border">
                      <div>
                        <Label htmlFor="step-content">
                          Content / Description
                        </Label>
                        <textarea
                          id="step-content"
                          className="w-full mt-1 px-3 py-2 border border-border rounded-md min-h-[120px] text-sm font-mono"
                          value={selectedNode.data.content}
                          onChange={e => {
                            setNodes(nds =>
                              nds.map(node =>
                                node.id === selectedNode.id
                                  ? {
                                      ...node,
                                      data: {
                                        ...node.data,
                                        content: e.target.value,
                                      },
                                    }
                                  : node,
                              ),
                            );
                          }}
                          placeholder="Enter step description or configuration..."
                        />
                      </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="enabled"
                          checked={selectedNode.data.isEnabled}
                          onChange={e => {
                            setNodes(nds =>
                              nds.map(node =>
                                node.id === selectedNode.id
                                  ? {
                                      ...node,
                                      data: {
                                        ...node.data,
                                        isEnabled: e.target.checked,
                                      },
                                    }
                                  : node,
                              ),
                            );
                          }}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="enabled" className="cursor-pointer">
                          Enabled
                        </Label>
                      </div>
                    </div>

                    {/* Metrics (read-only) */}
                    {selectedNode.data.metrics && (
                      <div className="space-y-3 pt-3 border-t border-border">
                        <h4 className="font-semibold text-sm">
                          Metrics (Read-only)
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-muted p-2 rounded">
                            <div className="text-muted-foreground">
                              Executions
                            </div>
                            <div className="font-semibold">
                              {selectedNode.data.metrics.executions}
                            </div>
                          </div>
                          <div className="bg-muted p-2 rounded">
                            <div className="text-muted-foreground">
                              Successes
                            </div>
                            <div className="font-semibold text-green-600">
                              {selectedNode.data.metrics.successes}
                            </div>
                          </div>
                          <div className="bg-muted p-2 rounded">
                            <div className="text-muted-foreground">
                              Failures
                            </div>
                            <div className="font-semibold text-destructive">
                              {selectedNode.data.metrics.failures}
                            </div>
                          </div>
                          <div className="bg-muted p-2 rounded">
                            <div className="text-muted-foreground">
                              Avg Duration
                            </div>
                            <div className="font-semibold">
                              {selectedNode.data.metrics.avgDuration}ms
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent
                    value="raw"
                    className="flex-1 overflow-y-auto p-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="raw-json">Raw JSON Configuration</Label>
                      <textarea
                        id="raw-json"
                        className="w-full h-[calc(100vh-300px)] px-3 py-2 border border-border rounded-md text-xs font-mono"
                        value={JSON.stringify(selectedNode.data, null, 2)}
                        onChange={e => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            setNodes(nds =>
                              nds.map(node =>
                                node.id === selectedNode.id
                                  ? { ...node, data: parsed }
                                  : node,
                              ),
                            );
                          } catch (err) {
                            // Invalid JSON, don't update
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Edit the raw JSON data. Changes are applied on valid
                        JSON.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>
          </>
        )}
      </PanelGroup>
    </Page>
  );
}
