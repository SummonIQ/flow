'use client';

import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@summoniq/applab-ui';
import {
  Activity,
  AlertCircle,
  ArrowRightLeft,
  BarChart3,
  CheckCircle,
  Hand,
  Pause,
  Play,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Agent {
  id: string;
  name: string;
  role: string;
  specialization: string;
  isActive: boolean;
  maxConcurrentTasks: number;
}

interface AgentStats {
  agentId: string;
  agentName: string;
  role: string;
  activeTickets: number;
  completedToday: number;
  inReview: number;
  blocked: number;
  averageCompletionTime: string;
  utilizationRate: number;
}

interface AgentsTabProps {
  project: {
    name: string;
    description?: string;
  };
}

const ROLE_COLORS: Record<string, string> = {
  PRODUCT_OWNER: 'bg-purple-100 text-purple-800',
  TECH_LEAD: 'bg-blue-100 text-blue-800',
  FRONTEND_ENGINEER: 'bg-green-100 text-green-800',
  BACKEND_ENGINEER: 'bg-yellow-100 text-yellow-800',
  FULLSTACK_ENGINEER: 'bg-indigo-100 text-indigo-800',
  QA_ENGINEER: 'bg-red-100 text-red-800',
  DESIGNER: 'bg-pink-100 text-pink-800',
  DEVOPS_ENGINEER: 'bg-gray-100 text-gray-800',
  SCRUM_MASTER: 'bg-orange-100 text-orange-800',
};

export function AgentsTab({ project }: AgentsTabProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentStats, setAgentStats] = useState<AgentStats[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [project.name]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load agents
      const [agentsRes, ticketsRes] = await Promise.all([
        fetch('/api/agents'),
        fetch(`/api/projects/${encodeURIComponent(project.name)}/tickets`),
      ]);

      let agentsData: Agent[] = [];
      if (agentsRes.ok) {
        agentsData = await agentsRes.json();
        setAgents(agentsData);
      }

      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        const ticketArray = ticketsData.tickets || ticketsData;
        setTickets(Array.isArray(ticketArray) ? ticketArray : []);

        // Calculate agent stats from tickets
        calculateAgentStats(agentsData, ticketArray);
      }
    } catch (error) {
      console.error('Error loading agent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAgentStats = (agentList: Agent[], ticketList: any[]) => {
    const stats: AgentStats[] = agentList.map(agent => {
      const agentTickets = ticketList.filter(t => t.assignedToId === agent.id);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return {
        agentId: agent.id,
        agentName: agent.name,
        role: agent.role,
        activeTickets: agentTickets.filter(t =>
          ['IN_PROGRESS', 'TODO', 'DESIGN'].includes(t.status),
        ).length,
        completedToday: agentTickets.filter(
          t => t.status === 'DONE' && new Date(t.completedAt) >= today,
        ).length,
        inReview: agentTickets.filter(t => t.status === 'IN_REVIEW').length,
        blocked: agentTickets.filter(t => t.status === 'BLOCKED').length,
        averageCompletionTime: '2.5 days', // This would need actual calculation
        utilizationRate: Math.min(
          100,
          (agentTickets.filter(t => !['DONE', 'BACKLOG'].includes(t.status))
            .length /
            agent.maxConcurrentTasks) *
            100,
        ),
      };
    });

    setAgentStats(stats);
  };

  const getAgentInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getRoleDisplay = (role: string) => {
    return role.replace(/_/g, ' ');
  };

  const getSelectedAgentStats = () => {
    if (!selectedAgent) return null;
    return agentStats.find(s => s.agentId === selectedAgent);
  };

  const getSelectedAgentTickets = () => {
    if (!selectedAgent) return [];
    return tickets.filter(t => t.assignedToId === selectedAgent);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading agent dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Agent Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor agent workload and performance
        </p>
      </div>

      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{agents.length}</div>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {agents.filter(a => a.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Active Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {
                  tickets.filter(t => !['DONE', 'BACKLOG'].includes(t.status))
                    .length
                }
              </div>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Completed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {
                  tickets.filter(t => {
                    if (t.status !== 'DONE' || !t.completedAt) return false;
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return new Date(t.completedAt) >= today;
                  }).length
                }
              </div>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Team velocity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Blocked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {tickets.filter(t => t.status === 'BLOCKED').length}
              </div>
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Agent Workload</CardTitle>
              <CardDescription>
                Click on an agent to see detailed information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentStats.map(stat => {
                  const agent = agents.find(a => a.id === stat.agentId);
                  if (!agent) return null;

                  return (
                    <div
                      key={stat.agentId}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedAgent === stat.agentId
                          ? 'border-primary bg-accent'
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => setSelectedAgent(stat.agentId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {getAgentInitials(stat.agentName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{stat.agentName}</div>
                            <div className="text-sm text-muted-foreground">
                              {getRoleDisplay(stat.role)}
                            </div>
                          </div>
                        </div>
                        <Badge className={ROLE_COLORS[stat.role] || ''}>
                          {agent.specialization.replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Active</div>
                          <div className="font-medium">
                            {stat.activeTickets}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Review</div>
                          <div className="font-medium">{stat.inReview}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Blocked</div>
                          <div className="font-medium text-red-600">
                            {stat.blocked}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Today</div>
                          <div className="font-medium text-green-600">
                            {stat.completedToday}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">
                            Utilization
                          </span>
                          <span>{Math.round(stat.utilizationRate)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${stat.utilizationRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent Details */}
        <div>
          {selectedAgent ? (
            <Card>
              <CardHeader>
                <CardTitle>Agent Details</CardTitle>
                <CardDescription>
                  {agents.find(a => a.id === selectedAgent)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Tickets */}
                  <div>
                    <h4 className="font-medium mb-2">Current Tickets</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {getSelectedAgentTickets().map(ticket => (
                        <div key={ticket.id} className="p-2 border rounded-md">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {ticket.title}
                              </div>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {ticket.status.replace(/_/g, ' ')}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {ticket.priority}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {getSelectedAgentTickets().length === 0 && (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          No tickets assigned
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Session Controls */}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Session Controls</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        <Pause className="w-4 h-4 mr-1" />
                        Pause
                      </Button>
                      <Button variant="outline" size="sm">
                        <Play className="w-4 h-4 mr-1" />
                        Resume
                      </Button>
                      <Button variant="outline" size="sm">
                        <ArrowRightLeft className="w-4 h-4 mr-1" />
                        Handoff
                      </Button>
                      <Button variant="outline" size="sm">
                        <Hand className="w-4 h-4 mr-1" />
                        Human Input
                      </Button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        size="sm"
                      >
                        <Activity className="w-4 h-4 mr-2" />
                        View Activity Log
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        size="sm"
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Performance Report
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
                Select an agent to view details
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
