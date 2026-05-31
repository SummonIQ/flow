'use client';

import { Calendar, CheckCircle2, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge, Button, Card } from '@summoniq/applab-ui';

type Props = {
  connectedEmail: string | null;
  isConnected: boolean;
};

function MicrosoftLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 23 23" className={className} aria-hidden="true">
      <title>Microsoft</title>
      <path fill="#f35325" d="M1 1h10v10H1z" />
      <path fill="#81bc06" d="M12 1h10v10H12z" />
      <path fill="#05a6f0" d="M1 12h10v10H1z" />
      <path fill="#ffba08" d="M12 12h10v10H12z" />
    </svg>
  );
}

export function OutlookCalendarForm({ connectedEmail, isConnected }: Props) {
  const router = useRouter();
  const [disconnecting, setDisconnecting] = useState(false);

  const handleConnect = () => {
    window.location.href = '/api/integrations/outlook/connect';
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const res = await fetch('/api/integrations/outlook/disconnect', {
        method: 'POST',
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || 'Failed to disconnect Outlook');
      }

      toast.success('Outlook disconnected');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to disconnect Outlook',
      );
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-blue-500/5" />
      <div className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-500/20 to-blue-600/10 ring-1 ring-blue-500/20">
              <MicrosoftLogo className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Microsoft Outlook</h3>
                {isConnected && (
                  <Badge className="rounded-full border-transparent bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600">
                    Connected
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Calendar & Email</p>
            </div>
          </div>
        </div>

        {isConnected ? (
          <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Successfully connected
                </p>
                {connectedEmail && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {connectedEmail}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Calendar sync</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                <span>Email access</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          {isConnected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              disabled={disconnecting}
            >
              {disconnecting ? 'Disconnecting…' : 'Disconnect'}
            </Button>
          ) : (
            <Button size="sm" onClick={handleConnect}>
              Connect with Microsoft
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
