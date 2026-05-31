'use client';

import { useState } from 'react';
import { Square, Loader2 } from 'lucide-react';
import { Button } from '@summoniq/applab-ui';
import { toast } from 'sonner';

interface StopWorkButtonProps {
  ticketId: string;
  agentName?: string;
  onWorkStopped?: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
}

export function StopWorkButton({
  ticketId,
  agentName,
  onWorkStopped,
  variant = 'destructive',
  size = 'default',
}: StopWorkButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleStopWork = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/tickets/${ticketId}/stop-work`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Stopped by user',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Stop Work] API Error:', errorData);
        throw new Error(errorData.error || 'Failed to stop work');
      }

      const data = await response.json();

      toast.success(data.message || 'Agent work stopped successfully');

      if (onWorkStopped) {
        onWorkStopped();
      }
    } catch (error) {
      console.error('[Stop Work] Full error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop work';
      toast.error(errorMessage, {
        description: 'Check console for details',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleStopWork}
      disabled={loading}
      variant={variant}
      size={size}
      className="gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Stopping...
        </>
      ) : (
        <>
          <Square className="w-4 h-4" />
          {agentName ? `Stop ${agentName}` : 'Stop Work'}
        </>
      )}
    </Button>
  );
}
