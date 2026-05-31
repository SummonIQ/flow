'use client';

/**
 * OrchestrationDashboard
 * 
 * Displays project orchestration status, team metrics, and routing insights
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Zap, CheckCircle2, Clock } from 'lucide-react';

interface OrchestrationStatus {
  projectId: string;
  team: {
    id: string;
    name: string;
    memberCount: number;
    capacity: number;
  };
  metrics: {
    activeTickets: number;
    totalTickets: number;
    completedTickets: number;
    utilization: number;
    completionRate: number;
  };
  routing: {
    strategy: string;
    specialistPoolEnabled: boolean;
  };
}

interface Props {
  projectId: string;
}

export function OrchestrationDashboard({ projectId }: Props) {
  const [status, setStatus] = useState<OrchestrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatus();
  }, [projectId]);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orchestration/${projectId}/status`);
      
      if (!response.ok) {
        throw new Error('Failed to load orchestration status');
      }

      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-lg">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Card>
    );
  }

  if (error || !status) {
    return (
      <Card className="p-lg">
        <div className="text-center text-destructive">
          {error || 'Failed to load orchestration status'}
        </div>
      </Card>
    );
  }

  const utilizationColor = 
    status.metrics.utilization >= 80 ? 'text-red-600' :
    status.metrics.utilization >= 60 ? 'text-yellow-600' :
    'text-green-600';

  return (
    <div className="space-y-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Agent Orchestration</h2>
          <p className="text-sm text-muted-foreground">
            Team: {status.team.name} • Strategy: {status.routing.strategy}
          </p>
        </div>
        <Badge variant={status.routing.specialistPoolEnabled ? 'default' : 'secondary'}>
          {status.routing.specialistPoolEnabled ? 'Hybrid Mode' : 'Core Team Only'}
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        {/* Team Size */}
        <Card className="p-md">
          <div className="flex items-center gap-sm">
            <div className="p-sm bg-blue-100 dark:bg-blue-900 rounded-md">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Team Size</p>
              <p className="text-2xl font-bold">{status.team.memberCount}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-sm">
            Capacity: {status.team.capacity} concurrent tasks
          </p>
        </Card>

        {/* Active Tickets */}
        <Card className="p-md">
          <div className="flex items-center gap-sm">
            <div className="p-sm bg-purple-100 dark:bg-purple-900 rounded-md">
              <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Tickets</p>
              <p className="text-2xl font-bold">{status.metrics.activeTickets}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-sm">
            {status.metrics.totalTickets} total tickets
          </p>
        </Card>

        {/* Completion Rate */}
        <Card className="p-md">
          <div className="flex items-center gap-sm">
            <div className="p-sm bg-green-100 dark:bg-green-900 rounded-md">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold">{status.metrics.completionRate}%</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-sm">
            {status.metrics.completedTickets} completed
          </p>
        </Card>

        {/* Utilization */}
        <Card className="p-md">
          <div className="flex items-center gap-sm">
            <div className="p-sm bg-orange-100 dark:bg-orange-900 rounded-md">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Utilization</p>
              <p className={`text-2xl font-bold ${utilizationColor}`}>
                {status.metrics.utilization}%
              </p>
            </div>
          </div>
          <Progress value={status.metrics.utilization} className="mt-sm h-2" />
        </Card>
      </div>

      {/* Routing Strategy Info */}
      <Card className="p-lg">
        <h3 className="font-semibold mb-md">Routing Strategy: {status.routing.strategy}</h3>
        <div className="space-y-sm text-sm">
          <div className="flex items-start gap-sm">
            <Badge variant="outline" className="mt-0.5">Core Team</Badge>
            <p className="text-muted-foreground flex-1">
              80% of tickets routed to core team members who build persistent context over time.
            </p>
          </div>
          {status.routing.specialistPoolEnabled && (
            <div className="flex items-start gap-sm">
              <Badge variant="outline" className="mt-0.5">Specialists</Badge>
              <p className="text-muted-foreground flex-1">
                20% of complex tickets routed to specialist pool for expert consultation.
              </p>
            </div>
          )}
          <div className="flex items-start gap-sm">
            <Badge variant="outline" className="mt-0.5">Tech Lead</Badge>
            <p className="text-muted-foreground flex-1">
              Intelligent routing decisions based on ticket complexity, domain, and team utilization.
            </p>
          </div>
        </div>
      </Card>

      {/* Tips */}
      <Card className="p-lg bg-muted/50">
        <h4 className="font-medium mb-sm">💡 Optimization Tips</h4>
        <ul className="text-sm space-y-1 text-muted-foreground">
          {status.metrics.utilization > 80 && (
            <li>• Core team is highly utilized. Complex tickets will route to specialist pool.</li>
          )}
          {status.metrics.utilization < 50 && (
            <li>• Core team has capacity. Even complex tickets will be assigned to core team for learning.</li>
          )}
          {status.metrics.completionRate < 60 && (
            <li>• Low completion rate detected. Consider reviewing ticket estimates and assignments.</li>
          )}
          {status.metrics.utilization >= 50 && status.metrics.utilization <= 80 && (
            <li>• Team utilization is optimal for the 80/20 hybrid model.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
