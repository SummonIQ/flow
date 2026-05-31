"use client";

import { Radio, Zap, Bell, Activity } from "lucide-react";

export default function RealtimePage() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Radio className="w-4 h-4" />
            Real-time Features
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Real-time Features with Pusher
          </h1>
          <p className="text-xl text-muted-foreground">
            Implement real-time notifications, live updates, and collaborative
            features using Pusher across all projects.
          </p>
        </div>

        {/* Pusher Overview */}
        <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-6">
          <div className="flex items-start gap-4">
            <Radio className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                Pusher for Real-time Communication
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Projects use <strong>Pusher</strong> for real-time features like
                notifications, live updates, presence channels, and collaborative
                editing. Pusher provides a simple API for WebSocket-based real-time
                communication.
              </p>
            </div>
          </div>
        </div>

        {/* Setup & Configuration */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Setup & Configuration</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">1. Environment Variables</h3>
            <p className="text-sm text-muted-foreground">
              Add to your <code className="text-xs bg-muted px-1 py-0.5 rounded">.env</code> file:
            </p>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`# Pusher Configuration
PUSHER_APP_ID=your_app_id
PUSHER_SECRET=your_secret_key
NEXT_PUBLIC_PUSHER_KEY=your_public_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">2. Server-Side Setup</h3>
            <p className="text-sm text-muted-foreground">
              Create <code className="text-xs bg-muted px-1 py-0.5 rounded">lib/events/index.ts</code>:
            </p>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`import Pusher from "pusher";

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// Event type constants
export enum EventType {
  // User events
  USER_UPDATED = "user-updated",
  USER_STATUS = "user-status",

  // Content events
  POST_CREATED = "post-created",
  POST_UPDATED = "post-updated",
  POST_DELETED = "post-deleted",
  COMMENT_ADDED = "comment-added",

  // Notification events
  NOTIFICATION = "notification",

  // Collaboration events
  DOCUMENT_EDITED = "document-edited",
  CURSOR_MOVED = "cursor-moved",
}

// Channel helpers
export const Channels = {
  user: (userId: string) => \`private-user-\${userId}\`,
  post: (postId: string) => \`private-post-\${postId}\`,
  presence: (roomId: string) => \`presence-room-\${roomId}\`,
  public: (topic: string) => \`public-\${topic}\`,
};`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">3. Client-Side Setup</h3>
            <p className="text-sm text-muted-foreground">
              Create <code className="text-xs bg-muted px-1 py-0.5 rounded">lib/events/client.ts</code>:
            </p>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`

import Pusher from "pusher-js";

// Singleton Pusher instance
let pusherInstance: Pusher | null = null;

export function getPusher(): Pusher {
  if (!pusherInstance) {
    pusherInstance = new Pusher(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        authEndpoint: "/api/pusher/auth",
      }
    );
  }
  return pusherInstance;
}

// Cleanup function
export function disconnectPusher() {
  if (pusherInstance) {
    pusherInstance.disconnect();
    pusherInstance = null;
  }
}`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">4. Auth Endpoint (for Private Channels)</h3>
            <p className="text-sm text-muted-foreground">
              Create <code className="text-xs bg-muted px-1 py-0.5 rounded">app/api/pusher/auth/route.ts</code>:
            </p>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`import { NextRequest, NextResponse } from "next/server";
import { pusher } from "@/lib/events";
import { auth } from "@/lib/auth/server";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.text();
  const params = new URLSearchParams(body);
  const socketId = params.get("socket_id");
  const channelName = params.get("channel_name");

  if (!socketId || !channelName) {
    return NextResponse.json(
      { error: "Missing parameters" },
      { status: 400 }
    );
  }

  // Verify user has access to this channel
  if (channelName.includes("user")) {
    const userId = channelName.split("-").pop();
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }
  }

  const authResponse = pusher.authorizeChannel(
    socketId,
    channelName
  );

  return NextResponse.json(authResponse);
}`}
            </pre>
          </div>
        </div>

        {/* Triggering Events */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Triggering Events from Server
          </h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Event Trigger Functions</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// lib/events/triggers.ts
import { pusher, EventType, Channels } from "./index";

export async function triggerPostCreated(
  userId: string,
  post: { id: string; title: string; content: string }
) {
  await pusher.trigger(
    Channels.user(userId),
    EventType.POST_CREATED,
    post
  );
}

export async function triggerNotification(
  userId: string,
  notification: {
    id: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
  }
) {
  await pusher.trigger(
    Channels.user(userId),
    EventType.NOTIFICATION,
    notification
  );
}

export async function triggerPostUpdated(
  postId: string,
  updates: Partial<Post>
) {
  await pusher.trigger(
    Channels.post(postId),
    EventType.POST_UPDATED,
    updates
  );
}

// Batch trigger for multiple users
export async function triggerMultipleUsers(
  userIds: string[],
  eventType: EventType,
  data: any
) {
  const channels = userIds.map(Channels.user);
  await pusher.trigger(channels, eventType, data);
}`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Integration with Server Actions</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`"use server";

import { db } from "@/lib/db";
import { revalidateTag } from "next/cache";
import { triggerPostCreated, triggerNotification } from "@/lib/events/triggers";

export async function createPost(data: PostInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    // Create post in database
    const post = await db.post.create({
      data: {
        ...data,
        authorId: session.user.id,
      },
    });

    // Revalidate cache
    revalidateTag(\`user:\${session.user.id}:posts\`);

    // Trigger real-time event
    await triggerPostCreated(session.user.id, post);

    // Optionally notify followers
    const followers = await db.follow.findMany({
      where: { followingId: session.user.id },
      select: { followerId: true },
    });

    if (followers.length > 0) {
      await triggerMultipleUsers(
        followers.map(f => f.followerId),
        EventType.NOTIFICATION,
        {
          id: crypto.randomUUID(),
          message: \`\${session.user.name} created a new post\`,
          type: "info",
        }
      );
    }

    return { success: true, data: post };
  } catch (error) {
    return { success: false, error: "Failed to create post" };
  }
}`}
            </pre>
          </div>
        </div>

        {/* React Hooks */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6" />
            React Hooks for Real-time Updates
          </h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Custom Hook: useRealtimeUpdates</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`"use client";

import { useEffect } from "react";
import { getPusher } from "@/lib/events/client";
import { EventType } from "@/lib/events";
import type { Channel } from "pusher-js";

export function useRealtimeUpdates<T>(
  channelName: string,
  eventType: EventType,
  onUpdate: (data: T) => void
) {
  useEffect(() => {
    const pusher = getPusher();
    const channel = pusher.subscribe(channelName);

    channel.bind(eventType, onUpdate);

    return () => {
      channel.unbind(eventType, onUpdate);
      channel.unsubscribe();
    };
  }, [channelName, eventType, onUpdate]);
}

// Usage example:
export function PostsList({ userId }: { userId: string }) {
  const [posts, setPosts] = useState<Post[]>([]);

  useRealtimeUpdates<Post>(
    \`private-user-\${userId}\`,
    EventType.POST_CREATED,
    (newPost) => {
      setPosts((prev) => [newPost, ...prev]);
    }
  );

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Custom Hook: useNotifications</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`"use client";

import { useEffect } from "react";
import { getPusher } from "@/lib/events/client";
import { EventType, Channels } from "@/lib/events";
import { toast } from "sonner";

interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

export function useNotifications(userId: string) {
  useEffect(() => {
    const pusher = getPusher();
    const channel = pusher.subscribe(Channels.user(userId));

    channel.bind(
      EventType.NOTIFICATION,
      (notification: Notification) => {
        // Show toast notification
        toast[notification.type](notification.message);

        // Could also update a notifications state/store here
      }
    );

    return () => {
      channel.unbind(EventType.NOTIFICATION);
      channel.unsubscribe();
    };
  }, [userId]);
}

// Usage in layout or root component:
export function NotificationProvider({
  userId,
  children,
}: {
  userId: string;
  children: React.ReactNode;
}) {
  useNotifications(userId);
  return <>{children}</>;
}`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Custom Hook: usePresence</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`"use client";

import { useEffect, useState } from "react";
import { getPusher } from "@/lib/events/client";
import { Channels } from "@/lib/events";
import type { PresenceChannel } from "pusher-js";

interface PresenceMember {
  id: string;
  info: {
    name: string;
    avatar?: string;
  };
}

export function usePresence(roomId: string, user: PresenceMember) {
  const [members, setMembers] = useState<PresenceMember[]>([]);

  useEffect(() => {
    const pusher = getPusher();
    const channel = pusher.subscribe(
      Channels.presence(roomId)
    ) as PresenceChannel;

    // Set initial members
    channel.bind("pusher:subscription_succeeded", () => {
      const presentMembers: PresenceMember[] = [];
      channel.members.each((member: any) => {
        presentMembers.push({
          id: member.id,
          info: member.info,
        });
      });
      setMembers(presentMembers);
    });

    // Member added
    channel.bind("pusher:member_added", (member: any) => {
      setMembers((prev) => [
        ...prev,
        { id: member.id, info: member.info },
      ]);
    });

    // Member removed
    channel.bind("pusher:member_removed", (member: any) => {
      setMembers((prev) =>
        prev.filter((m) => m.id !== member.id)
      );
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [roomId]);

  return members;
}

// Usage:
export function CollaborativeEditor({ roomId, user }) {
  const presentUsers = usePresence(roomId, user);

  return (
    <div>
      <div className="flex items-center gap-2">
        {presentUsers.map((member) => (
          <Avatar key={member.id} user={member.info} />
        ))}
      </div>
      {/* Editor content */}
    </div>
  );
}`}
            </pre>
          </div>
        </div>

        {/* Common Patterns */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Common Use Cases
          </h2>

          <div className="grid gap-6">
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Live Notifications</h3>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// Server Action
export async function sendFriendRequest(toUserId: string) {
  const session = await getSession();

  // Create request in database
  await db.friendRequest.create({
    data: { fromUserId: session.user.id, toUserId },
  });

  // Send real-time notification
  await triggerNotification(toUserId, {
    id: crypto.randomUUID(),
    message: \`\${session.user.name} sent you a friend request\`,
    type: "info",
  });
}`}
              </pre>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Live Content Updates</h3>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// Client component
export function LivePostFeed() {
  const [posts, setPosts] = useState<Post[]>([]);

  // Listen for new posts
  useRealtimeUpdates<Post>(
    "public-feed",
    EventType.POST_CREATED,
    (newPost) => {
      setPosts((prev) => [newPost, ...prev]);
    }
  );

  // Listen for updates
  useRealtimeUpdates<{ id: string; updates: Partial<Post> }>(
    "public-feed",
    EventType.POST_UPDATED,
    ({ id, updates }) => {
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    }
  );

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}`}
              </pre>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Collaborative Editing</h3>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`export function CollaborativeDocument({ docId, userId }) {
  const [content, setContent] = useState("");
  const presentUsers = usePresence(\`doc-\${docId}\`, {
    id: userId,
    info: { name: user.name, avatar: user.avatar },
  });

  // Broadcast changes
  const handleChange = async (newContent: string) => {
    setContent(newContent);

    await pusher.trigger(
      Channels.post(docId),
      EventType.DOCUMENT_EDITED,
      { content: newContent, userId }
    );
  };

  // Receive changes from others
  useRealtimeUpdates<{ content: string; userId: string }>(
    Channels.post(docId),
    EventType.DOCUMENT_EDITED,
    ({ content, userId: editorId }) => {
      if (editorId !== userId) {
        setContent(content);
      }
    }
  );

  return (
    <div>
      <div className="flex gap-2">
        <span>Editing:</span>
        {presentUsers.map((u) => (
          <span key={u.id}>{u.info.name}</span>
        ))}
      </div>
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Best Practices</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="font-semibold">Use Private Channels</h3>
              <p className="text-sm text-muted-foreground">
                Use private channels for user-specific data to prevent unauthorized
                access. Implement proper authentication.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="font-semibold">Cleanup Subscriptions</h3>
              <p className="text-sm text-muted-foreground">
                Always unbind events and unsubscribe from channels in useEffect
                cleanup functions.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="font-semibold">Singleton Pattern</h3>
              <p className="text-sm text-muted-foreground">
                Use a singleton Pusher instance to avoid multiple connections and
                memory leaks.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="font-semibold">Event Constants</h3>
              <p className="text-sm text-muted-foreground">
                Define event types as constants to prevent typos and enable
                TypeScript autocompletion.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="font-semibold">Channel Naming</h3>
              <p className="text-sm text-muted-foreground">
                Use consistent channel naming: <code className="text-xs bg-muted px-1 py-0.5 rounded">private-user-{"{id}"}</code>,{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">presence-room-{"{id}"}</code>
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="font-semibold">Combine with Cache Revalidation</h3>
              <p className="text-sm text-muted-foreground">
                Use Pusher for instant UI updates, but also revalidate cache tags
                for data consistency.
              </p>
            </div>
          </div>
        </div>

        {/* Debugging */}
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-6">
          <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-3">
            Debugging Tips
          </h3>
          <ul className="text-sm text-amber-600 dark:text-amber-300 space-y-2">
            <li>
              • Use the{" "}
              <a
                href="https://dashboard.pusher.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Pusher Debug Console
              </a>{" "}
              to monitor events in real-time
            </li>
            <li>
              • Enable Pusher logging in development:{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                Pusher.logToConsole = true
              </code>
            </li>
            <li>
              • Check the browser Network tab for WebSocket connections
            </li>
            <li>
              • Verify channel authorization is working for private channels
            </li>
            <li>
              • Test with multiple browser tabs/windows to simulate multiple users
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
