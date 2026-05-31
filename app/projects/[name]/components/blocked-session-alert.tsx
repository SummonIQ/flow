'use client';

import { useState } from 'react';
import { AlertCircle, Play, Loader2 } from 'lucide-react';
import { Button } from '@summoniq/applab-ui';
import { toast } from 'sonner';
import type { WorkSession, BlockingIssue } from '@/lib/orchestration/agent-executor';

interface BlockedSessionAlertProps {
  session: WorkSession;
  onResume?: () => void;
}

export function BlockedSessionAlert({ session, onResume }: BlockedSessionAlertProps) {
  const [resuming, setResuming] = useState(false);

  if (session.status !== 'BLOCKED' || !session.blockingIssue) {
    return null;
  }

  const issue = session.blockingIssue;

  const handleResume = async () => {
    setResuming(true);

    try {
      const response = await fetch(`/api/work-sessions/${session.id}/resume`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to resume session');
      }

      toast.success('Work session resumed');
      onResume?.();
    } catch (error) {
      console.error('Failed to resume session:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to resume session'
      );
    } finally {
      setResuming(false);
    }
  };

  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div>
            <h3 className="font-semibold text-orange-900">Work Blocked</h3>
            <p className="text-sm text-orange-700">{issue.description}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-orange-900">Required Actions:</p>
            <ul className="space-y-1 text-sm text-orange-700">
              {issue.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-orange-500 font-mono">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {issue.type === 'DATABASE_NEEDED' && (
            <div className="mt-3 rounded-md bg-orange-100 p-3 text-sm text-orange-800">
              <p className="font-medium mb-2">Database Setup Guide:</p>
              <ol className="space-y-1 list-decimal list-inside">
                <li>Install Prisma: <code className="bg-white px-1 rounded">npm install prisma @prisma/client</code></li>
                <li>Add DATABASE_URL to .env file</li>
                <li>Run migrations: <code className="bg-white px-1 rounded">npx prisma migrate dev</code></li>
                <li>Click "Resume Work" below</li>
              </ol>
            </div>
          )}

          {issue.type === 'ENV_VAR_NEEDED' && (
            <div className="mt-3 rounded-md bg-orange-100 p-3 text-sm text-orange-800">
              <p className="font-medium mb-2">Environment Variable Setup:</p>
              <p>Add the required variables to your <code className="bg-white px-1 rounded">.env</code> file and restart the development server.</p>
            </div>
          )}

          <Button
            onClick={handleResume}
            disabled={resuming}
            variant="outline"
            size="sm"
            className="mt-3 gap-2"
          >
            {resuming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Resuming...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Resume Work
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
