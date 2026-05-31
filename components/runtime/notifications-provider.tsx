'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type AppNotificationKind = 'info' | 'success' | 'warning' | 'error';

export type AppNotification = {
  id: string;
  title: string;
  message?: string;
  kind: AppNotificationKind;
  createdAt: number;
  readAt?: number;
  href?: string;
};

type DbNotificationKind = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

type DbNotification = {
  id: string;
  kind: DbNotificationKind;
  title: string;
  message: string | null;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

type AddNotificationInput = {
  title: string;
  message?: string;
  kind?: AppNotificationKind;
  href?: string;
};

type NotificationsContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (input: AddNotificationInput) => string;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

function toClientKind(kind: DbNotificationKind): AppNotificationKind {
  switch (kind) {
    case 'SUCCESS':
      return 'success';
    case 'WARNING':
      return 'warning';
    case 'ERROR':
      return 'error';
    case 'INFO':
    default:
      return 'info';
  }
}

function toDbKind(kind: AppNotificationKind | undefined): DbNotificationKind {
  switch (kind) {
    case 'success':
      return 'SUCCESS';
    case 'warning':
      return 'WARNING';
    case 'error':
      return 'ERROR';
    case 'info':
    default:
      return 'INFO';
  }
}

function toClientNotification(n: DbNotification): AppNotification {
  return {
    id: n.id,
    title: n.title,
    message: n.message ?? undefined,
    href: n.href ?? undefined,
    kind: toClientKind(n.kind),
    createdAt: new Date(n.createdAt).getTime(),
    readAt: n.readAt ? new Date(n.readAt).getTime() : undefined,
  };
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as unknown;
    throw new Error(
      typeof (payload as { error?: string })?.error === 'string'
        ? (payload as { error: string }).error
        : `Request failed (${res.status})`,
    );
  }
  return (await res.json()) as T;
}

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await fetchJson<{
        notifications: DbNotification[];
        unreadCount: number;
      }>('/api/notifications?limit=50');

      const next = (Array.isArray(data.notifications) ? data.notifications : [])
        .map(toClientNotification)
        .slice(0, 200);
      setNotifications(next);
    } catch (error) {
      console.error('[NotificationsProvider] loadNotifications error:', error);
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const addNotification = useCallback((input: AddNotificationInput) => {
    const optimisticId = `optimistic-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const optimistic: AppNotification = {
      id: optimisticId,
      title: input.title,
      message: input.message,
      href: input.href,
      kind: input.kind ?? 'info',
      createdAt: Date.now(),
    };

    setNotifications(prev => [optimistic, ...prev].slice(0, 200));

    void fetchJson<{ notification: DbNotification }>('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: input.title,
        message: input.message,
        href: input.href,
        kind: toDbKind(input.kind),
      }),
    })
      .then(result => {
        const created = toClientNotification(result.notification);
        setNotifications(prev => {
          const withoutOptimistic = prev.filter(n => n.id !== optimisticId);
          return [created, ...withoutOptimistic].slice(0, 200);
        });
      })
      .catch(() => {
        // Leave optimistic notification in place if API fails.
      });

    return optimisticId;
  }, []);

  const markRead = useCallback((id: string) => {
    const now = Date.now();
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, readAt: n.readAt ?? now } : n)),
    );

    if (!id.startsWith('optimistic-')) {
      void fetchJson<{ notification: DbNotification }>(
        '/api/notifications/mark-read',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        },
      ).catch(() => {
        // ignore
      });
    }
  }, []);

  const markAllRead = useCallback(() => {
    const now = Date.now();
    setNotifications(prev =>
      prev.map(n => ({ ...n, readAt: n.readAt ?? now })),
    );
    void fetchJson<{ updated: number }>('/api/notifications/mark-all-read', {
      method: 'POST',
    }).catch(() => {
      // ignore
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    void fetchJson<{ deleted: number }>('/api/notifications/clear', {
      method: 'POST',
    }).catch(() => {
      // ignore
    });
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.readAt).length,
    [notifications],
  );

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markRead,
      markAllRead,
      clearAll,
    }),
    [
      notifications,
      unreadCount,
      addNotification,
      markRead,
      markAllRead,
      clearAll,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      'useNotifications must be used within NotificationsProvider',
    );
  }
  return ctx;
}
