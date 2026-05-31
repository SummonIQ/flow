'use client';

import { ExternalLink, Link2, Trash2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button, Card, Input, Label } from '@summoniq/applab-ui';

type IcsConnection = {
  calendarId: string;
  calendarName: string;
  providerAccountId: string;
};

type Props = {
  connections: IcsConnection[];
};

export function IcsCalendarForm({ connections }: Props) {
  const router = useRouter();

  const [urlName, setUrlName] = useState('');
  const [url, setUrl] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const hasAny = connections.length > 0;

  const sortedConnections = useMemo(() => {
    return [...connections].sort((a, b) =>
      a.calendarName.localeCompare(b.calendarName),
    );
  }, [connections]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribing(true);

    try {
      const res = await fetch('/api/integrations/ics/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, name: urlName || undefined }),
      });

      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) throw new Error(data?.error || 'Failed to subscribe');

      toast.success('ICS feed added');
      setUrl('');
      setUrlName('');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to subscribe');
    } finally {
      setSubscribing(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Choose an .ics file first');
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.set('file', file);
      if (fileName.trim()) form.set('name', fileName.trim());

      const res = await fetch('/api/integrations/ics/upload', {
        method: 'POST',
        body: form,
      });

      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) throw new Error(data?.error || 'Failed to upload');

      toast.success('ICS file imported');
      setFile(null);
      setFileName('');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (calendarId: string) => {
    setDeletingId(calendarId);
    try {
      const res = await fetch(
        `/api/integrations/ics/${encodeURIComponent(calendarId)}`,
        {
          method: 'DELETE',
        },
      );

      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) throw new Error(data?.error || 'Failed to delete');

      toast.success('Removed');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Add by URL */}
      <Card className="relative overflow-hidden">
        <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-emerald-500/5" />
        <div className="relative p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <Link2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold">Subscribe to URL</h3>
              <p className="text-xs text-muted-foreground">
                Public .ics calendar feed
              </p>
            </div>
          </div>

          <form className="mt-4 space-y-3" onSubmit={handleSubscribe}>
            <div className="space-y-1.5">
              <Label htmlFor="ics-url" className="text-xs">
                ICS URL
              </Label>
              <Input
                id="ics-url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/calendar.ics"
                required
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ics-url-name" className="text-xs">
                Display name (optional)
              </Label>
              <Input
                id="ics-url-name"
                value={urlName}
                onChange={e => setUrlName(e.target.value)}
                placeholder="My shared calendar"
                className="h-9"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={subscribing}>
                <Link2 className="h-3.5 w-3.5" />
                {subscribing ? 'Adding…' : 'Subscribe'}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Upload file */}
      <Card className="relative overflow-hidden">
        <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-violet-500/5" />
        <div className="relative p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 ring-1 ring-violet-500/20">
              <Upload className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold">Import File</h3>
              <p className="text-xs text-muted-foreground">
                Upload an .ics file
              </p>
            </div>
          </div>

          <form className="mt-4 space-y-3" onSubmit={handleUpload}>
            <div className="space-y-1.5">
              <Label htmlFor="ics-file" className="text-xs">
                ICS file
              </Label>
              <Input
                id="ics-file"
                type="file"
                accept=".ics,text/calendar"
                onChange={e => setFile(e.target.files?.[0] || null)}
                required
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ics-file-name" className="text-xs">
                Display name (optional)
              </Label>
              <Input
                id="ics-file-name"
                value={fileName}
                onChange={e => setFileName(e.target.value)}
                placeholder="My imported calendar"
                className="h-9"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={uploading}>
                <Upload className="h-3.5 w-3.5" />
                {uploading ? 'Uploading…' : 'Import'}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Imported feeds list */}
      <Card className="lg:col-span-2">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted ring-1 ring-border">
                <ExternalLink className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Connected Feeds</h3>
                <p className="text-xs text-muted-foreground">
                  {hasAny
                    ? `${sortedConnections.length} feed${sortedConnections.length === 1 ? '' : 's'} syncing`
                    : 'No feeds connected yet'}
                </p>
              </div>
            </div>
          </div>

          {hasAny && (
            <div className="mt-4 space-y-2">
              {sortedConnections.map(connection => (
                <div
                  key={connection.calendarId}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="truncate text-sm font-medium">
                        {connection.calendarName}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate pl-4 text-xs text-muted-foreground">
                      {connection.providerAccountId}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => void handleDelete(connection.calendarId)}
                    disabled={deletingId === connection.calendarId}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              ))}
            </div>
          )}

          {!hasAny && (
            <div className="mt-4 rounded-lg border border-dashed border-border/60 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Add a URL subscription or import a file to get started.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
