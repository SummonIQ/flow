'use client';

import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';

import { Badge, Button, Card } from '@summoniq/applab-ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Edit,
  GitBranch,
  Plus,
  Search,
  Ticket,
  Trash2,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CreateTeamModal } from './components/create-team-modal';

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

export default function TeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
    try {
      const response = await fetch('/api/teams');
      const data = await response.json();
      setTeams(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load teams:', error);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredTeams = teams.filter(
    team =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalMembers = teams.reduce((acc, t) => acc + t.members.length, 0);
  const totalTickets = teams.reduce((acc, t) => acc + t._count.tickets, 0);
  const teamsWithWorkflow = teams.filter(t => t.workflow).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading teams...
        </div>
      </div>
    );
  }

  return (
    <Page className="h-full">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            AI Agent Teams
          </span>
        }
        description="Create and manage teams of AI agents with custom workflows"
        actions={
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Team
          </Button>
        }
      />

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          {/* Stats Cards */}
          {teams.length > 0 && (
            <div className="flex flex-wrap gap-3">
              <Card className="p-3 min-w-[120px] bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
                <div className="flex items-start gap-2">
                  <div className="p-2 rounded-md bg-blue-500/10">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold leading-none">
                      {teams.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3 min-w-[120px] bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
                <div className="flex items-start gap-2">
                  <div className="p-2 rounded-md bg-purple-500/10">
                    <Activity className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold leading-none">
                      {totalMembers}
                    </p>
                    <p className="text-xs text-muted-foreground">Members</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3 min-w-[120px] bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
                <div className="flex items-start gap-2">
                  <div className="p-2 rounded-md bg-green-500/10">
                    <GitBranch className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold leading-none">
                      {teamsWithWorkflow}
                    </p>
                    <p className="text-xs text-muted-foreground">Workflows</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3 min-w-[120px] bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
                <div className="flex items-start gap-2">
                  <div className="p-2 rounded-md bg-amber-500/10">
                    <Ticket className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold leading-none">
                      {totalTickets}
                    </p>
                    <p className="text-xs text-muted-foreground">Tickets</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Search */}
          {teams.length > 0 && (
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {/* Teams Grid */}
          {filteredTeams.length === 0 ? (
            <Card className="border-dashed">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No teams found' : 'No teams yet'}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Create your first AI agent team to start collaborating on projects'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Team
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredTeams.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TeamCard team={team} onUpdate={loadTeams} router={router} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <CreateTeamModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              loadTeams();
              setShowCreateModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </Page>
  );
}

function TeamCard({
  team,
  onUpdate,
  router,
}: {
  team: Team;
  onUpdate: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <Card
      className="p-5 hover:shadow-lg hover:border-blue-500/50 transition-all cursor-pointer group"
      onClick={() => router.push(`/teams/${team.id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-base group-hover:text-blue-500 transition-colors truncate">
              {team.name}
            </h3>
            {team.workflow && (
              <Badge
                variant="secondary"
                className="gap-1 bg-green-500/10 text-green-600 border-green-500/20 shrink-0"
              >
                <GitBranch className="w-3 h-3" />
                {team.workflow.name}
              </Badge>
            )}
          </div>
          {team.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {team.description}
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
              router.push(`/teams/${team.id}`);
            }}
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={e => e.stopPropagation()}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Team Members */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex -space-x-2">
          {team.members.slice(0, 5).map(member => (
            <div
              key={member.id}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-background flex items-center justify-center text-xs font-medium text-white"
              title={member.agent.name}
            >
              {member.agent.name.charAt(0)}
            </div>
          ))}
          {team.members.length > 5 && (
            <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
              +{team.members.length - 5}
            </div>
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {team.members.length}{' '}
          {team.members.length === 1 ? 'member' : 'members'}
        </span>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-3 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5 text-sm">
          <Ticket className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-medium">{team._count.tickets}</span>
          <span className="text-muted-foreground">tickets</span>
        </div>
        {team.projectId && (
          <Badge variant="outline" className="text-xs">
            Project linked
          </Badge>
        )}
      </div>
    </Card>
  );
}
