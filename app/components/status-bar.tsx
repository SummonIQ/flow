'use client';

import { useNotifications } from '@/components/runtime/notifications-provider';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@summoniq/applab-ui';
import { Bell, Calendar, Check, Circle, Mail, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

function StatusDivider() {
  return <div className="w-px h-4 bg-border mx-1.5" />;
}

export function StatusBar() {
  const [mounted, setMounted] = useState(false);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [emailCount, setEmailCount] = useState({ unread: 0, synced: true });
  const [calendarCount, setCalendarCount] = useState({
    today: 0,
    synced: true,
  });
  const [clientCount, setClientCount] = useState(0);

  const { notifications, unreadCount, markRead, markAllRead, clearAll } =
    useNotifications();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch counts
  useEffect(() => {
    const fetchCounts = async () => {
      if (document.hidden) {
        return;
      }

      try {
        const [emailRes, calRes, clientRes] = await Promise.all([
          fetch('/api/emails/unread-count').catch(() => null),
          fetch('/api/meetings/today-count').catch(() => null),
          fetch('/api/clients/count').catch(() => null),
        ]);

        if (emailRes?.ok) {
          const data = await emailRes.json();
          const unread = data.count ?? 0;
          setEmailCount(prev =>
            prev.unread === unread && prev.synced
              ? prev
              : { unread, synced: true },
          );
        }

        if (calRes?.ok) {
          const data = await calRes.json();
          const today = data.count ?? 0;
          setCalendarCount(prev =>
            prev.today === today && prev.synced
              ? prev
              : { today, synced: true },
          );
        }

        if (clientRes?.ok) {
          const data = await clientRes.json();
          const count = data.count ?? 0;
          setClientCount(prev => (prev === count ? prev : count));
        }
      } catch {
        // ignore
      }
    };

    let interval: ReturnType<typeof setInterval> | null = null;

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const startPolling = () => {
      if (interval) return;
      interval = setInterval(fetchCounts, 60000);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
        return;
      }
      void fetchCounts();
      startPolling();
    };

    void fetchCounts();
    if (!document.hidden) {
      startPolling();
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopPolling();
    };
  }, []);

  if (!mounted) {
    return (
      <div className="h-6 border-t border-border bg-muted/30 flex items-center px-2 text-xs text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-6 border-t border-border bg-muted/30 flex items-center justify-between px-2 text-xs select-none">
      {/* Left side - Status indicators */}
      <div className="flex items-center gap-1">
        {/* Email Status */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-muted/50">
          <Mail className="h-3 w-3" />
          <span className="text-muted-foreground">
            {emailCount.unread > 0 ? `${emailCount.unread} unread` : 'Inbox'}
          </span>
          {emailCount.synced && (
            <Check className="h-2.5 w-2.5 text-emerald-500" />
          )}
        </div>

        <StatusDivider />

        {/* Calendar Status */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-muted/50">
          <Calendar className="h-3 w-3" />
          <span className="text-muted-foreground">
            {calendarCount.today > 0
              ? `${calendarCount.today} today`
              : 'Calendar'}
          </span>
          {calendarCount.synced && (
            <Check className="h-2.5 w-2.5 text-emerald-500" />
          )}
        </div>

        <StatusDivider />

        {/* Clients */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-muted/50">
          <Users className="h-3 w-3" />
          <span className="text-muted-foreground">{clientCount} clients</span>
        </div>
      </div>

      {/* Right side - Notifications */}
      <div className="flex items-center gap-1">
        <Popover open={showNotifPopover} onOpenChange={setShowNotifPopover}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                'flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-muted/50',
                unreadCount > 0 && 'text-amber-500',
              )}
            >
              <Bell className="h-3 w-3" />
              {unreadCount > 0 && (
                <span className="text-xs">{unreadCount}</span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <span className="font-medium text-sm">Notifications</span>
              {notifications.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={markAllRead}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={clearAll}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                  No notifications
                </div>
              ) : (
                notifications.slice(0, 10).map(notif => (
                  <button
                    key={notif.id}
                    onClick={() => markRead(notif.id)}
                    className={cn(
                      'w-full text-left px-3 py-2 hover:bg-muted/50 border-b last:border-b-0',
                      !notif.readAt && 'bg-muted/30',
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <Circle
                        className={cn(
                          'h-2 w-2 mt-1.5 shrink-0',
                          notif.kind === 'success' &&
                            'text-emerald-500 fill-emerald-500',
                          notif.kind === 'error' && 'text-red-500 fill-red-500',
                          notif.kind === 'warning' &&
                            'text-amber-500 fill-amber-500',
                          notif.kind === 'info' &&
                            'text-blue-500 fill-blue-500',
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {notif.title}
                        </p>
                        {notif.message && (
                          <p className="text-xs text-muted-foreground truncate">
                            {notif.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
