'use client';

import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';

import { Badge, Button, Card } from '@summoniq/applab-ui';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Edit,
  GitBranch,
  Layers,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Users,
  Workflow as WorkflowIcon,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Workflow = {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  stages?: any[];
  transitions?: any[];
  specializations?: string[];
  createdAt: string;
  _count?: {
    teams: number;
  };
};

export default function WorkflowsPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadWorkflows();
  }, []);

  async function loadWorkflows() {
    try {
      const response = await fetch('/api/workflows');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setWorkflows(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load workflows:', error);
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredWorkflows = workflows.filter(
    workflow =>
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const defaultWorkflows = filteredWorkflows.filter(w => w.isDefault);
  const customWorkflows = filteredWorkflows.filter(w => !w.isDefault);
  const totalStages = workflows.reduce(
    (acc, w) => acc + (w.stages?.length || 0),
    0,
  );
  const totalTeamsUsing = workflows.reduce(
    (acc, w) => acc + (w._count?.teams || 0),
    0,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading workflows...
        </div>
      </div>
    );
  }

  return (
    <Page className="h-full">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-500/10">
              <WorkflowIcon className="w-5 h-5 text-green-500" />
            </div>
            Workflows
          </span>
        }
        description="Create and manage reusable workflows for your teams"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => router.push('/workflows/editor')}
            >
              <GitBranch className="w-4 h-4" />
              Visual Editor
            </Button>
            <Button
              className="gap-2"
              onClick={() => router.push('/workflows/new')}
            >
              <Plus className="w-4 h-4" />
              Create Workflow
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          {/* Stats Cards */}
          {workflows.length > 0 && (
            <div className="flex flex-wrap gap-3">
              <Card className="p-3 min-w-[120px] bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
                <div className="flex items-start gap-2">
                  <div className="p-2 rounded-md bg-green-500/10">
                    <WorkflowIcon className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold leading-none">
                      {workflows.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3 min-w-[120px] bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
                <div className="flex items-start gap-2">
                  <div className="p-2 rounded-md bg-blue-500/10">
                    <Layers className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold leading-none">
                      {totalStages}
                    </p>
                    <p className="text-xs text-muted-foreground">Stages</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3 min-w-[120px] bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
                <div className="flex items-start gap-2">
                  <div className="p-2 rounded-md bg-purple-500/10">
                    <Users className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold leading-none">
                      {totalTeamsUsing}
                    </p>
                    <p className="text-xs text-muted-foreground">Teams</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3 min-w-[120px] bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
                <div className="flex items-start gap-2">
                  <div className="p-2 rounded-md bg-amber-500/10">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold leading-none">
                      {defaultWorkflows.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Default</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Search */}
          {workflows.length > 0 && (
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {/* Default Workflows */}
          {defaultWorkflows.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h2 className="font-semibold">Default Workflows</h2>
                <Badge variant="secondary" className="text-xs">
                  {defaultWorkflows.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {defaultWorkflows.map((workflow, index) => (
                  <motion.div
                    key={workflow.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <WorkflowCard workflow={workflow} router={router} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Workflows */}
          {customWorkflows.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <h2 className="font-semibold">Custom Workflows</h2>
                <Badge variant="secondary" className="text-xs">
                  {customWorkflows.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customWorkflows.map((workflow, index) => (
                  <motion.div
                    key={workflow.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <WorkflowCard workflow={workflow} router={router} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredWorkflows.length === 0 && (
            <Card className="border-dashed">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <WorkflowIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No workflows found' : 'No workflows yet'}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Create your first workflow to define how your teams work together'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => router.push('/workflows/new')}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Workflow
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </Page>
  );
}

function WorkflowCard({
  workflow,
  router,
}: {
  workflow: Workflow;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <Card
      className="p-5 hover:shadow-lg hover:border-green-500/50 transition-all cursor-pointer group"
      onClick={() => router.push(`/workflows/${workflow.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-base group-hover:text-green-500 transition-colors truncate">
              {workflow.name}
            </h3>
            {workflow.isDefault && (
              <Badge
                variant="secondary"
                className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20 shrink-0"
              >
                Default
              </Badge>
            )}
          </div>
          {workflow.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {workflow.description}
            </p>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={e => {
              e.stopPropagation();
              router.push(`/workflows/${workflow.id}`);
            }}
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          {!workflow.isDefault && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={e => e.stopPropagation()}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Stages Preview */}
      {workflow.stages && workflow.stages.length > 0 && (
        <div className="flex items-center gap-1 mb-4 overflow-hidden">
          {workflow.stages.slice(0, 4).map((stage: any, idx: number) => (
            <div key={idx} className="flex items-center">
              <Badge
                variant="outline"
                className="text-[10px] shrink-0 bg-muted/50"
              >
                {stage.name || `Stage ${idx + 1}`}
              </Badge>
              {idx < Math.min(workflow.stages!.length - 1, 3) && (
                <ArrowRight className="w-3 h-3 text-muted-foreground mx-1 shrink-0" />
              )}
            </div>
          ))}
          {workflow.stages.length > 4 && (
            <Badge variant="outline" className="text-[10px] shrink-0">
              +{workflow.stages.length - 4}
            </Badge>
          )}
        </div>
      )}

      {/* Stats Row */}
      <div className="flex items-center gap-4 pt-3 border-t border-border">
        {workflow.stages && (
          <div className="flex items-center gap-1.5 text-sm">
            <Layers className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium">{workflow.stages.length}</span>
            <span className="text-muted-foreground">stages</span>
          </div>
        )}
        {workflow._count && workflow._count.teams > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium">{workflow._count.teams}</span>
            <span className="text-muted-foreground">
              {workflow._count.teams === 1 ? 'team' : 'teams'}
            </span>
          </div>
        )}
      </div>

      {/* Specializations */}
      {workflow.specializations && workflow.specializations.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {workflow.specializations.slice(0, 3).map((spec, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-[10px] bg-primary/5"
            >
              {spec}
            </Badge>
          ))}
          {workflow.specializations.length > 3 && (
            <Badge variant="secondary" className="text-[10px]">
              +{workflow.specializations.length - 3}
            </Badge>
          )}
        </div>
      )}
    </Card>
  );
}
