'use client';

import { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { Button } from '@summoniq/applab-ui';
import { toast } from 'sonner';

interface StartWorkButtonProps {
  ticketId: string;
  agentId?: string;
  agentName?: string;
  onWorkStarted?: (sessionId: string) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function StartWorkButton({
  ticketId,
  agentId,
  agentName,
  onWorkStarted,
  variant = 'default',
  size = 'default',
}: StartWorkButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleStartWork = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/tickets/${ticketId}/start-work`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          dryRun: false,
          enableTesting: true,
          requiresReview: true,
          enableFileAccess: true,
          enableMcpTools: true, // ✅ ENABLED - fetch, Playwright, Prisma tools
          enableBrowserValidation: true, // ✅ ENABLED - Validate UI in browser
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Start Work] API Error:', errorData);
        throw new Error(errorData.error || errorData.details || 'Failed to start work');
      }

      const data = await response.json();

      toast.success(data.message || 'Agent started working on ticket');

      if (onWorkStarted && data.session?.id) {
        onWorkStarted(data.session.id);
      }
    } catch (error) {
      console.error('[Start Work] Full error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start work';
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
      onClick={handleStartWork}
      disabled={loading}
      variant={variant}
      size={size}
      className="gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Starting...
        </>
      ) : (
        <>
          <Play className="w-4 h-4" />
          {agentName ? `Start ${agentName}` : 'Start Work'}
        </>
      )}
    </Button>
  );
}
