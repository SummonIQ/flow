import { Badge, Button } from '@summoniq/applab-ui';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { KanbanCard, type KanbanTicket } from './kanban-card';

type Status = {
  id: string;
  name: string;
  color: string;
};

interface KanbanColumnProps {
  status: Status;
  tickets: KanbanTicket[];
  onAddTicket: () => void;
  onWorkStarted?: (sessionId: string) => void;
  onWorkStopped?: () => void;
  onTicketClick?: (ticketId: string) => void;
}

export function KanbanColumn({
  status,
  tickets,
  onAddTicket,
  onWorkStarted,
  onWorkStopped,
  onTicketClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status.id,
  });

  return (
    <div className="flex flex-col w-[320px] flex-shrink-0">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${status.color}`} />
          <h3 className="font-semibold text-sm">{status.name}</h3>
          <Badge variant="secondary" className="text-xs">
            {tickets.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddTicket}
          className="h-6 w-6 p-0 hover:bg-accent"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-2 rounded-lg transition-colors min-h-[200px] ${
          isOver ? 'bg-accent/50 border-2 border-primary' : 'bg-muted/20'
        }`}
      >
        <SortableContext
          items={tickets.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {tickets.map(ticket => (
              <KanbanCard
                key={ticket.id}
                ticket={ticket}
                onWorkStarted={onWorkStarted}
                onWorkStopped={onWorkStopped}
                onClick={onTicketClick}
              />
            ))}
          </div>
        </SortableContext>

        {tickets.length === 0 && (
          <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
            Drop tickets here
          </div>
        )}
      </div>
    </div>
  );
}
