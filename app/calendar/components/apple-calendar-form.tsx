'use client';

import { Calendar, CheckCircle2, KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge, Button, Card, Input, Label } from '@summoniq/applab-ui';

type Props = {
  initialIcloudEmail: string;
  isConnected: boolean;
};

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <title>Apple</title>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

export function AppleCalendarForm({ initialIcloudEmail, isConnected }: Props) {
  const router = useRouter();
  const [icloudEmail, setIcloudEmail] = useState(initialIcloudEmail);
  const [appPassword, setAppPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/integrations/apple/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icloudEmail, appPassword }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || 'Failed to connect Apple Calendar');
      }

      toast.success('Apple Calendar connected');
      setAppPassword('');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to connect Apple Calendar',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const res = await fetch('/api/integrations/apple/disconnect', {
        method: 'POST',
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || 'Failed to disconnect Apple Calendar');
      }

      toast.success('Apple Calendar disconnected');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to disconnect Apple Calendar',
      );
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-zinc-500/5" />
      <div className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-zinc-200 to-zinc-100 ring-1 ring-zinc-300/50 dark:from-zinc-700 dark:to-zinc-800 dark:ring-zinc-600/50">
              <AppleLogo className="h-6 w-6 text-zinc-800 dark:text-zinc-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Apple Calendar</h3>
                {isConnected && (
                  <Badge className="rounded-full border-transparent bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600">
                    Connected
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">iCloud CalDAV</p>
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
                {icloudEmail && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {icloudEmail}
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
                <KeyRound className="h-3.5 w-3.5" />
                <span>App password</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleConnect} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="icloudEmail" className="text-xs">
                iCloud Email
              </Label>
              <Input
                id="icloudEmail"
                value={icloudEmail}
                onChange={e => setIcloudEmail(e.target.value)}
                placeholder="you@icloud.com"
                disabled={saving || disconnecting}
                autoComplete="email"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="appPassword" className="text-xs">
                App-Specific Password
              </Label>
              <Input
                id="appPassword"
                value={appPassword}
                onChange={e => setAppPassword(e.target.value)}
                placeholder="xxxx-xxxx-xxxx-xxxx"
                disabled={saving || disconnecting}
                autoComplete="off"
                type="password"
                className="h-9"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {isConnected && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={saving || disconnecting}
              >
                {disconnecting ? 'Disconnecting…' : 'Disconnect'}
              </Button>
            )}
            <Button type="submit" size="sm" disabled={saving || disconnecting}>
              {saving ? 'Saving…' : isConnected ? 'Update' : 'Connect'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
