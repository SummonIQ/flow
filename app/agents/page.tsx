'use client';

import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';

import { Badge, Button, Card, Report, type ReportColumnDefinition } from '@summoniq/applab-ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Bot,
  ClipboardList,
  Code2,
  Cog,
  Edit,
  FlaskConical,
  LayoutGrid,
  List,
  Palette,
  Plus,
  Rocket,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CreateAgentModal } from './components/create-agent-modal';
import { EditAgentModal } from './components/edit-agent-modal';

type Agent = {
  id: string;
  name: string;
  role: string;
  specialization: string;
  description: string | null;
  systemPrompt: string;
  isDefault: boolean;
  isActive: boolean;
  maxConcurrentTasks: number;
  modelProvider: string;
  modelName: string;
  temperature: number;
  capabilities?: string[];
};

const roleIcons: Record<string, React.ReactNode> = {
  DESIGNER: <Palette className="w-5 h-5" />,
  FRONTEND_ENGINEER: <Code2 className="w-5 h-5" />,
  BACKEND_ENGINEER: <Cog className="w-5 h-5" />,
  FULLSTACK_ENGINEER: <Wrench className="w-5 h-5" />,
  QA_ENGINEER: <FlaskConical className="w-5 h-5" />,
  DEVOPS_ENGINEER: <Rocket className="w-5 h-5" />,
  PRODUCT_OWNER: <BarChart3 className="w-5 h-5" />,
  SCRUM_MASTER: <ClipboardList className="w-5 h-5" />,
  TECH_LEAD: <Users className="w-5 h-5" />,
  CUSTOM: <Bot className="w-5 h-5" />,
};

const roleColors: Record<string, string> = {
  DESIGNER: 'from-pink-500 to-rose-500',
  FRONTEND_ENGINEER: 'from-blue-500 to-cyan-500',
  BACKEND_ENGINEER: 'from-green-500 to-emerald-500',
  FULLSTACK_ENGINEER: 'from-purple-500 to-violet-500',
  QA_ENGINEER: 'from-orange-500 to-amber-500',
  DEVOPS_ENGINEER: 'from-red-500 to-orange-500',
  PRODUCT_OWNER: 'from-indigo-500 to-blue-500',
  SCRUM_MASTER: 'from-teal-500 to-cyan-500',
  TECH_LEAD: 'from-violet-500 to-purple-500',
  CUSTOM: 'from-gray-500 to-slate-500',
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    try {
      const response = await fetch('/api/agents');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setAgents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load agents:', error);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }

  const formatRole = (role: string) =>
    role
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');

  const filteredAgents = agents.filter(
    agent =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatRole(agent.role).toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const defaultAgents = filteredAgents.filter(a => a.isDefault);
  const customAgents = filteredAgents.filter(a => !a.isDefault);
  const activeAgents = agents.filter(a => a.isActive).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading agents...
        </div>
      </div>
    );
  }

  return (
    <Page className="h-full">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Bot className="w-5 h-5 text-purple-500" />
            </div>
            AI Agents
          </span>
        }
        description="Manage your AI development team members"
        actions={
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Agent
          </Button>
        }
      />

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          {/* Stats Cards */}
          {agents.length > 0 && (
            <div className="flex flex-wrap gap-3">
              <Card className="p-3 min-w-[120px] bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
                <div className="flex items-start gap-2">
                  <div className="p-2 rounded-md bg-purple-500/10">
                    <Bot className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold leading-none">
                      {agents.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3 min-w-[120px] bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
                <div className="flex items-start gap-2">
                  <div className="p-2 rounded-md bg-green-500/10">
                    <Zap className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold leading-none">
                      {activeAgents}
                    </p>
                    <p className="text-xs text-muted-foreground">Active</p>
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
                      {defaultAgents.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Default</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3 min-w-[120px] bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
                <div className="flex items-start gap-2">
                  <div className="p-2 rounded-md bg-blue-500/10">
                    <Settings className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold leading-none">
                      {agents.filter(a => !a.isDefault).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Custom</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Search and View Toggle */}
          {agents.length > 0 && (
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center border border-border rounded-lg p-0.5 bg-muted/50">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-7 px-2.5"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-7 px-2.5"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Default Agents */}
          {defaultAgents.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h2 className="font-semibold">Default Agents</h2>
                <Badge variant="secondary" className="text-xs">
                  {defaultAgents.length}
                </Badge>
              </div>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {defaultAgents.map((agent, index) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <AgentCard agent={agent} onEdit={setEditingAgent} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <AgentsTable agents={defaultAgents} onEdit={setEditingAgent} />
              )}
            </div>
          )}

          {/* Custom Agents */}
          {customAgents.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-500" />
                <h2 className="font-semibold">Custom Agents</h2>
                <Badge variant="secondary" className="text-xs">
                  {customAgents.length}
                </Badge>
              </div>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customAgents.map((agent, index) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <AgentCard agent={agent} onEdit={setEditingAgent} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <AgentsTable agents={customAgents} onEdit={setEditingAgent} />
              )}
            </div>
          )}

          {/* Empty State */}
          {filteredAgents.length === 0 && (
            <Card className="border-dashed">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <Bot className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No agents found' : 'No agents yet'}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Create your first AI agent to start building your team'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Agent
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <CreateAgentModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              loadAgents();
              setShowCreateModal(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingAgent && (
          <EditAgentModal
            agent={editingAgent}
            onClose={() => setEditingAgent(null)}
            onSuccess={() => {
              loadAgents();
              setEditingAgent(null);
            }}
          />
        )}
      </AnimatePresence>
    </Page>
  );
}

function AgentCard({
  agent,
  onEdit,
}: {
  agent: Agent;
  onEdit: (agent: Agent) => void;
}) {
  const formatRole = (role: string) =>
    role
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');

  const formatSpec = (spec: string) =>
    spec
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');

  const gradientClass = roleColors[agent.role] || roleColors.CUSTOM;

  return (
    <Card
      className="group relative overflow-hidden rounded-xl hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer"
      onClick={() => onEdit(agent)}
    >
      {/* Corner gradients */}
      <div
        className={`absolute -top-12 -left-12 w-24 h-24 bg-gradient-to-br ${gradientClass} opacity-20 blur-2xl group-hover:opacity-30 transition-opacity`}
      />
      <div
        className={`absolute -bottom-12 -right-12 w-24 h-24 bg-gradient-to-tl ${gradientClass} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}
      />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${gradientClass} text-white shadow-lg shrink-0`}
          >
            {roleIcons[agent.role] || roleIcons.CUSTOM}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-base group-hover:text-primary transition-colors truncate">
                  {agent.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formatRole(agent.role)}
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={e => {
                    e.stopPropagation();
                    onEdit(agent);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                {!agent.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={e => e.stopPropagation()}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
          {agent.description || 'No description provided'}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="text-xs">
            {formatSpec(agent.specialization)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {agent.modelName}
          </Badge>
        </div>

        {/* Capabilities */}
        {agent.capabilities && agent.capabilities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {agent.capabilities.slice(0, 2).map((cap, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-xs bg-muted/80"
              >
                {cap}
              </Badge>
            ))}
            {agent.capabilities.length > 2 && (
              <Badge variant="secondary" className="text-xs bg-muted/80">
                +{agent.capabilities.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">
            Max: {agent.maxConcurrentTasks} tasks
          </span>
          <div className="flex items-center gap-2">
            {agent.isActive && (
              <span className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Active
              </span>
            )}
            {agent.isDefault && (
              <Badge variant="outline" className="text-xs">
                Default
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function AgentsTable({
  agents,
  onEdit,
}: {
  agents: Agent[];
  onEdit: (agent: Agent) => void;
}) {
  const formatRole = (role: string) =>
    role
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');

  const formatSpec = (spec: string) =>
    spec
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');

  const columns: ReportColumnDefinition<Agent>[] = [
    {
      header: 'Agent',
      key: 'name',
      cellFn: agent => {
        const gradientClass = roleColors[agent.role] || roleColors.CUSTOM;
        return (
          <div className="flex items-center gap-3">
            <div
              className={`p-1.5 rounded-lg bg-gradient-to-br ${gradientClass} text-white`}
            >
              {roleIcons[agent.role] || roleIcons.CUSTOM}
            </div>
            <div>
              <div className="font-medium text-sm">{agent.name}</div>
              <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                {agent.description}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Role',
      key: 'role',
      cellFn: agent => (
        <Badge variant="secondary" className="text-xs">
          {formatRole(agent.role)}
        </Badge>
      ),
    },
    {
      header: 'Specialization',
      key: 'specialization',
      cellFn: agent => (
        <span className="text-sm">{formatSpec(agent.specialization)}</span>
      ),
    },
    {
      header: 'Model',
      key: 'modelName',
      cellFn: agent => (
        <Badge variant="outline" className="text-xs">
          {agent.modelName}
        </Badge>
      ),
    },
    {
      header: 'Status',
      key: 'isActive',
      cellFn: agent =>
        agent.isActive ? (
          <span className="flex items-center gap-1.5 text-xs text-green-500">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Active
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Inactive</span>
        ),
    },
    {
      header: 'Actions',
      align: 'right',
      cellFn: agent => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={e => {
              e.stopPropagation();
              onEdit(agent);
            }}
          >
            <Edit className="w-3 h-3" />
          </Button>
          {!agent.isDefault && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive"
              onClick={e => e.stopPropagation()}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
          {agent.isDefault && (
            <Badge variant="outline" className="text-[10px]">
              Default
            </Badge>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card className="overflow-hidden">
      <Report<Agent>
        className="h-auto border-0 bg-transparent shadow-none"
        data={agents}
        definition={{
          columns,
          data: agents,
          view: 'table' as any,
          sortBy: 'name',
          activeFilters: [],
          filters: [],
        }}
        onRowClick={agent => onEdit(agent)}
        search={false}
      />
    </Card>
  );
}
