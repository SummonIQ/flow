'use client';

import { useState, useEffect, DragEvent } from 'react';
import { Plus, Filter, Search, GripVertical } from 'lucide-react';
import { Button, Input, Badge } from '@summoniq/applab-ui';
import { TicketCard } from '../components/ticket-card';
import { TicketModal } from '../components/ticket-modal';
import { toast } from 'sonner';

interface TicketsTabProps {
  project: {
    name: string;
    description?: string;
  };
}

const TICKET_STATUSES = [
  { key: 'BACKLOG', label: 'Backlog', color: 'bg-gray-100 dark:bg-gray-800' },
  { key: 'TODO', label: 'To Do', color: 'bg-blue-100 dark:bg-blue-900' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-100 dark:bg-yellow-900' },
  { key: 'IN_REVIEW', label: 'In Review', color: 'bg-purple-100 dark:bg-purple-900' },
  { key: 'QA', label: 'QA', color: 'bg-orange-100 dark:bg-orange-900' },
  { key: 'DONE', label: 'Done', color: 'bg-green-100 dark:bg-green-900' },
];

export function TicketsTab({ project }: TicketsTabProps) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterAssignee, setFilterAssignee] = useState<string>('');
  const [draggedTicket, setDraggedTicket] = useState<any>(null);
  const [draggedOverStatus, setDraggedOverStatus] = useState<string | null>(null);

  // Fetch tickets
  useEffect(() => {
    loadTickets();
    loadAgentsAndTeams();
  }, [project.name]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${encodeURIComponent(project.name)}/tickets`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      
      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const loadAgentsAndTeams = async () => {
    try {
      // Fetch agents from API
      const agentsResponse = await fetch('/api/agents');
      if (agentsResponse.ok) {
        const agentsData = await agentsResponse.json();
        setAgents(agentsData);
        console.log('Loaded agents:', agentsData);
      } else {
        console.error('Failed to fetch agents');
      }
      
      // Fetch teams from API
      const teamsResponse = await fetch('/api/teams');
      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        setTeams(teamsData);
        console.log('Loaded teams:', teamsData);
      } else {
        console.error('Failed to fetch teams');
      }
    } catch (error) {
      console.error('Error loading agents/teams:', error);
    }
  };

  const handleCreateTicket = async (ticketData: any) => {
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(project.name)}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create ticket');
      }
      
      const newTicket = await response.json();
      console.log('Created ticket:', newTicket);
      
      // Reload tickets to show the new one
      await loadTickets();
      setShowTicketModal(false);
      setEditingTicket(null);
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  };

  const handleUpdateTicket = async (ticketData: any) => {
    if (!editingTicket?.id) return;
    
    try {
      const response = await fetch(`/api/tickets/${editingTicket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update ticket');
      }
      
      const updatedTicket = await response.json();
      console.log('Updated ticket:', updatedTicket);
      
      // Reload tickets to show the changes
      await loadTickets();
      setShowTicketModal(false);
      setEditingTicket(null);
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete ticket');
      }
      
      toast.success('Ticket deleted successfully');
      await loadTickets();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error('Failed to delete ticket');
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update ticket status');
      }
      
      const result = await response.json();
      toast.success(`Ticket moved to ${newStatus.replace(/_/g, ' ')}`);
      
      // Show assignee change if applicable
      if (result.transition?.assignee) {
        toast.info(`Assigned to ${result.transition.assignee.name}`);
      }
      
      await loadTickets();
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('Failed to update ticket status');
    }
  };

  const handleEditTicket = (ticket: any) => {
    setEditingTicket(ticket);
    setShowTicketModal(true);
  };

  // Drag and drop handlers
  const handleDragStart = (e: DragEvent<HTMLDivElement>, ticket: any) => {
    setDraggedTicket(ticket);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (status: string) => {
    setDraggedOverStatus(status);
  };

  const handleDragLeave = () => {
    setDraggedOverStatus(null);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>, newStatus: string) => {
    e.preventDefault();
    setDraggedOverStatus(null);
    
    if (draggedTicket && draggedTicket.status !== newStatus) {
      await handleStatusChange(draggedTicket.id, newStatus);
    }
    
    setDraggedTicket(null);
  };

  // Filter tickets based on search and filters
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = !searchQuery || 
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = !filterPriority || ticket.priority === filterPriority;
    const matchesAssignee = !filterAssignee || ticket.assignedToId === filterAssignee;
    
    return matchesSearch && matchesPriority && matchesAssignee;
  });

  // Group tickets by status
  const ticketsByStatus = TICKET_STATUSES.reduce((acc, status) => {
    acc[status.key] = filteredTickets.filter(ticket => ticket.status === status.key);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets..."
              className="pl-9"
            />
          </div>
        </div>
        
        <Button
          onClick={() => {
            setEditingTicket(null);
            setShowTicketModal(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Ticket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold">{tickets.length}</div>
          <div className="text-sm text-muted-foreground">Total Tickets</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold">
            {tickets.filter(t => t.status === 'IN_PROGRESS').length}
          </div>
          <div className="text-sm text-muted-foreground">In Progress</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold">
            {tickets.filter(t => t.status === 'BLOCKED').length}
          </div>
          <div className="text-sm text-muted-foreground">Blocked</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold">
            {tickets.filter(t => t.status === 'DONE').length}
          </div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {TICKET_STATUSES.map(status => (
            <div
              key={status.key}
              className="flex-shrink-0 w-80"
            >
              <div className={`rounded-t-lg px-4 py-2 ${status.color}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">
                    {status.label}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {ticketsByStatus[status.key]?.length || 0}
                  </Badge>
                </div>
              </div>
              
              <div 
                className={`bg-secondary/10 rounded-b-lg p-2 min-h-[400px] space-y-2 transition-colors ${
                  draggedOverStatus === status.key ? 'bg-primary/10 ring-2 ring-primary' : ''
                }`}
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter(status.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status.key)}
              >
                {ticketsByStatus[status.key]?.map(ticket => (
                  <div
                    key={ticket.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, ticket)}
                    className={`cursor-move ${draggedTicket?.id === ticket.id ? 'opacity-50' : ''}`}
                  >
                    <TicketCard
                      ticket={ticket}
                      onClick={() => console.log('View ticket:', ticket)}
                      onEdit={() => handleEditTicket(ticket)}
                      onDelete={() => handleDeleteTicket(ticket.id)}
                      onStatusChange={(newStatus) => handleStatusChange(ticket.id, newStatus)}
                      isDragging={draggedTicket?.id === ticket.id}
                    />
                  </div>
                ))}
                
                {(!ticketsByStatus[status.key] || ticketsByStatus[status.key].length === 0) && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No tickets
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ticket Modal */}
      <TicketModal
        open={showTicketModal}
        onOpenChange={(open) => {
          setShowTicketModal(open);
          if (!open) setEditingTicket(null);
        }}
        projectName={project.name}
        ticket={editingTicket}
        agents={agents}
        teams={teams}
        onSave={editingTicket ? handleUpdateTicket : handleCreateTicket}
      />
    </div>
  );
}
