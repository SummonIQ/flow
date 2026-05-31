'use client';

import { getPusherClient } from '@/lib/pusher/client';
import { Button } from '@summoniq/applab-ui';
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { AnimatePresence } from 'framer-motion';
import { Filter, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ActiveSessionsWidget } from '../components/active-sessions-widget';
import { CreateTicketModal } from '../components/create-ticket-modal';
import { KanbanCard, type KanbanTicket } from '../components/kanban-card';
import { KanbanColumn } from '../components/kanban-column';
import { TicketModal } from '../components/ticket-modal';
import { WorkSessionMonitor } from '../components/work-session-monitor';

const STATUSES = [
  { id: 'BACKLOG', name: 'Backlog', color: 'bg-gray-500' },
  { id: 'DESIGN', name: 'Design', color: 'bg-indigo-500' },
  { id: 'UNREFINED', name: 'Unrefined', color: 'bg-pink-500' },
  { id: 'READY', name: 'Ready', color: 'bg-green-500' },
  { id: 'TODO', name: 'To Do', color: 'bg-blue-500' },
  { id: 'IN_PROGRESS', name: 'In Progress', color: 'bg-yellow-500' },
  { id: 'IN_REVIEW', name: 'In Review', color: 'bg-purple-500' },
  { id: 'QA', name: 'QA', color: 'bg-orange-500' },
  { id: 'BLOCKED', name: 'Blocked', color: 'bg-red-500' },
  { id: 'DONE', name: 'Done', color: 'bg-green-500' },
];

interface KanbanTabProps {
  project: {
    name: string;
    path?: string;
  };
}

export function KanbanTab({ project }: KanbanTabProps) {
  const [tickets, setTickets] = useState<KanbanTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('BACKLOG');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [filterAgent, setFilterAgent] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [filterQuick, setFilterQuick] = useState<
    'blocked' | 'review' | 'unassigned' | null
  >(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  useEffect(() => {
    loadTickets();
    loadAgents();
    loadTeams();
  }, [project.name]);

  // Set up Pusher real-time updates
  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`project-${project.name}`);

    // Handle ticket updates (status changes, reassignments)
    channel.bind('ticket-updated', (data: { ticket: KanbanTicket }) => {
      console.log('[Pusher] Ticket updated:', data.ticket);
      setTickets(prev =>
        prev.map(ticket =>
          ticket.id === data.ticket.id ? data.ticket : ticket,
        ),
      );
      toast.info(`Ticket "${data.ticket.title}" updated`, {
        description: `Moved to ${data.ticket.status}`,
      });
    });

    // Handle new ticket creation
    channel.bind('ticket-created', (data: { ticket: KanbanTicket }) => {
      console.log('[Pusher] Ticket created:', data.ticket);
      setTickets(prev => [...prev, data.ticket]);
      toast.success(`New ticket created: "${data.ticket.title}"`);
    });

    // Handle ticket deletion
    channel.bind('ticket-deleted', (data: { ticketId: string }) => {
      console.log('[Pusher] Ticket deleted:', data.ticketId);
      setTickets(prev => prev.filter(ticket => ticket.id !== data.ticketId));
      toast.info('Ticket deleted');
    });

    // Cleanup on unmount
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`project-${project.name}`);
    };
  }, [project.name]);

  async function loadTickets() {
    try {
      setError(null);
      const response = await fetch(
        `/api/projects/${encodeURIComponent(project.name)}/tickets`,
      );

      if (!response.ok) {
        throw new Error(
          `API returned ${response.status}: ${response.statusText}`,
        );
      }

      const data = await response.json();

      // Handle API response format which includes tickets and pagination
      if (data.tickets && Array.isArray(data.tickets)) {
        setTickets(data.tickets);
        setError(null);
      } else if (Array.isArray(data)) {
        // Fallback for direct array response
        setTickets(data);
        setError(null);
      } else {
        console.error('API returned non-array data:', data);
        const errorMsg = data.error
          ? `${data.error}${data.details ? `: ${data.details}` : ''}`
          : 'API returned invalid data format';
        setError(errorMsg);
        setTickets([]);
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setError(`Failed to load tickets: ${errorMessage}`);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadAgents() {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  }

  async function loadTeams() {
    try {
      const response = await fetch('/api/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  }

  const handleTicketClick = async (ticketId: string) => {
    try {
      // Fetch full ticket details
      const response = await fetch(`/api/tickets/${ticketId}`);
      if (response.ok) {
        const ticket = await response.json();
        setSelectedTicket(ticket);
        setShowTicketModal(true);
      } else {
        toast.error('Failed to load ticket details');
      }
    } catch (error) {
      console.error('Failed to load ticket:', error);
      toast.error('Failed to load ticket details');
    }
  };

  const handleTicketUpdate = async (ticketData: any) => {
    try {
      const response = await fetch(`/api/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      });

      if (response.ok) {
        await loadTickets();
        setShowTicketModal(false);
        setSelectedTicket(null);
      } else {
        throw new Error('Failed to update ticket');
      }
    } catch (error) {
      console.error('Failed to update ticket:', error);
      throw error;
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTicket = tickets.find(t => t.id === active.id);
    const overColumn = over.id as string;

    if (!activeTicket) return;

    // Check if dropped on a column (status change)
    if (STATUSES.some(s => s.id === overColumn)) {
      const newStatus = overColumn;
      const ticketsInNewStatus = tickets.filter(t => t.status === newStatus);

      // Update ticket status using transition API for auto-assignment
      try {
        const response = await fetch(
          `/api/tickets/${activeTicket.id}/transition`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              newStatus: newStatus,
            }),
          },
        );

        if (response.ok) {
          const result = await response.json();

          // Show toast for status change
          toast.success(`Moved to ${newStatus.replace(/_/g, ' ')}`);

          // Show notification if agent was reassigned
          if (
            result.transition?.assignee &&
            result.transition.assignee.id !== activeTicket.assignedTo?.id
          ) {
            toast.info(`Reassigned to ${result.transition.assignee.name}`);
          }
        } else {
          toast.error('Failed to update ticket status');
        }

        loadTickets();
      } catch (error) {
        console.error('Failed to update ticket:', error);
        toast.error('Failed to update ticket status');
      }
    }
  };

  const activeTicket = activeId ? tickets.find(t => t.id === activeId) : null;

  const getTicketsByStatus = (status: string) => {
    return tickets
      .filter(t => {
        if (t.status !== status) return false;
        if (filterAgent && t.assignedTo?.id !== filterAgent) return false;
        if (filterPriority && t.priority !== filterPriority) return false;
        if (filterQuick === 'blocked' && t.status !== 'BLOCKED') return false;
        if (filterQuick === 'review' && t.status !== 'IN_REVIEW') return false;
        if (filterQuick === 'unassigned' && t.assignedTo) return false;
        return true;
      })
      .sort((a, b) => a.position - b.position);
  };

  const hasActiveFilters = filterAgent || filterPriority || filterQuick;

  const clearFilters = () => {
    setFilterAgent(null);
    setFilterPriority(null);
    setFilterQuick(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading kanban board...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="text-destructive font-semibold">
          Failed to load tickets
        </div>
        <div className="text-sm text-muted-foreground max-w-md text-center">
          {error}
        </div>
        <Button onClick={() => loadTickets()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Active Work Session Monitor */}
      {activeSessionId && (
        <WorkSessionMonitor sessionId={activeSessionId} autoRefresh />
      )}

      {/* Active Sessions Widget */}
      <ActiveSessionsWidget projectName={project.name} autoRefresh />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Kanban Board</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage project tasks and track progress
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedStatus('BACKLOG');
            setShowCreateModal(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Ticket
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          Filters:
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterAgent || ''}
            onChange={e => setFilterAgent(e.target.value || null)}
            className="h-8 px-2 text-sm border rounded-md bg-background"
          >
            <option value="">All Agents</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
          <select
            value={filterPriority || ''}
            onChange={e => setFilterPriority(e.target.value || null)}
            className="h-8 px-2 text-sm border rounded-md bg-background"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          <Button
            variant={filterQuick === 'blocked' ? 'default' : 'outline'}
            size="sm"
            onClick={() =>
              setFilterQuick(filterQuick === 'blocked' ? null : 'blocked')
            }
          >
            Blocked
          </Button>
          <Button
            variant={filterQuick === 'review' ? 'default' : 'outline'}
            size="sm"
            onClick={() =>
              setFilterQuick(filterQuick === 'review' ? null : 'review')
            }
          >
            In Review
          </Button>
          <Button
            variant={filterQuick === 'unassigned' ? 'default' : 'outline'}
            size="sm"
            onClick={() =>
              setFilterQuick(filterQuick === 'unassigned' ? null : 'unassigned')
            }
          >
            Unassigned
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full pb-4 min-w-max">
            {STATUSES.map(status => {
              const statusTickets = getTicketsByStatus(status.id);
              return (
                <KanbanColumn
                  key={status.id}
                  status={status}
                  tickets={statusTickets}
                  onAddTicket={() => {
                    setSelectedStatus(status.id);
                    setShowCreateModal(true);
                  }}
                  onWorkStarted={sessionId => {
                    setActiveSessionId(sessionId);
                    toast.success('Agent started working');
                  }}
                  onWorkStopped={() => {
                    setActiveSessionId(null);
                    loadTickets();
                  }}
                  onTicketClick={handleTicketClick}
                />
              );
            })}
          </div>

          <DragOverlay>
            {activeTicket ? (
              <KanbanCard ticket={activeTicket} isDragging />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <CreateTicketModal
            projectId={project.name}
            initialStatus={selectedStatus}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              loadTickets();
              setShowCreateModal(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Ticket Detail Modal */}
      <TicketModal
        open={Boolean(selectedTicket && showTicketModal)}
        onOpenChange={open => {
          setShowTicketModal(open);
          if (!open) {
            setSelectedTicket(null);
          }
        }}
        projectName={project.name}
        ticket={selectedTicket ?? undefined}
        agents={agents}
        teams={teams}
        onSave={handleTicketUpdate}
      />
    </div>
  );
}
