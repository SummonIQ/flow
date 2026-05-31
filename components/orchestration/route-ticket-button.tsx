'use client';

/**
 * RouteTicketButton
 *
 * Button to route a ticket through the orchestration system
 */

import type { TicketProcessingResult } from '@/types/orchestration';
import { Button } from '@summoniq/applab-ui';
import { Zap } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Props {
  ticketId: string;
  projectId: string;
  onRouted?: (result: TicketProcessingResult) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export function RouteTicketButton({
  ticketId,
  projectId,
  onRouted,
  variant = 'default',
  size = 'default',
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleRoute = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/orchestration/route-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, projectId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to route ticket');
      }

      const result: TicketProcessingResult = await response.json();

      if (result.success) {
        toast.success('Ticket routed successfully', {
          description: result.message,
        });
        onRouted?.(result);
      } else {
        toast.error('Routing failed', {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error('Failed to route ticket', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleRoute}
      disabled={loading}
      variant={variant}
      size={size}
    >
      <Zap className="h-4 w-4 mr-sm" />
      {loading ? 'Routing...' : 'Auto-Route'}
    </Button>
  );
}
