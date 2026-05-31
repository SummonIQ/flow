"use client";

import { Zap, Server, RefreshCw, Radio, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function APIPatternsPage() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Server className="w-4 h-4" />
            API Patterns
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            API & Data Fetching Patterns
          </h1>
          <p className="text-xl text-muted-foreground">
            Server Actions, API routes, and caching strategies used across all
            projects.
          </p>
          <Link
            href="/architecture/realtime"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <Radio className="w-4 h-4" />
            Real-time features with Pusher
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Server Actions Overview */}
        <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-6">
          <div className="flex items-start gap-4">
            <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                Server Actions First
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                All projects prefer <strong>Server Actions</strong> over API routes for
                data mutations. Server Actions provide better type safety, automatic
                revalidation, and progressive enhancement.
              </p>
            </div>
          </div>
        </div>

        {/* Server Actions */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Server Actions</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Basic Server Action</h3>
            <p className="text-sm text-muted-foreground">
              Create <code className="text-xs bg-muted px-1 py-0.5 rounded">lib/[feature]/server-actions.ts</code>:
            </p>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";

export async function createPost(formData: FormData) {
  // Get current user
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Extract form data
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  // Validate (could use Zod here)
  if (!title || !content) {
    return { error: "Title and content are required" };
  }

  // Create post
  const post = await db.post.create({
    data: {
      title,
      content,
      authorId: session.user.id,
    },
  });

  // Revalidate affected paths
  revalidatePath("/posts");

  // Redirect to new post
  redirect(\`/posts/\${post.id}\`);
}`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Server Action with Zod Validation</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`"use server";

import { z } from "zod";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export async function createPost(input: z.infer<typeof createPostSchema>) {
  // Validate input
  const result = createPostSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: result.error.flatten().fieldErrors,
    };
  }

  try {
    const post = await db.post.create({
      data: result.data,
    });

    // Revalidate by tag
    revalidateTag(\`user:\${post.authorId}:posts\`);

    return {
      success: true,
      data: post,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to create post",
    };
  }
}`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Using Server Actions in Forms</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`

import { createPost } from "@/lib/posts/server-actions";
import { useActionState } from "react";

export function CreatePostForm() {
  const [state, formAction, pending] = useActionState(
    createPost,
    null
  );

  return (
    <form action={formAction}>
      <input
        name="title"
        placeholder="Title"
        required
      />
      <textarea
        name="content"
        placeholder="Content"
        required
      />

      {state?.error && (
        <p className="text-red-500">{state.error}</p>
      )}

      <button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create Post"}
      </button>
    </form>
  );
}`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Programmatic Server Action Calls</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`"use client";

import { createPost } from "@/lib/posts/server-actions";
import { useState } from "react";

export function CreatePostButton() {
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setLoading(true);
    try {
      const result = await createPost({
        title: "New Post",
        content: "Post content",
        status: "DRAFT",
      });

      if (result.success) {
        console.log("Created:", result.data);
      } else {
        console.error("Error:", result.error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleCreate} disabled={loading}>
      {loading ? "Creating..." : "Create Post"}
    </button>
  );
}`}
            </pre>
          </div>
        </div>

        {/* Caching Strategies */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <RefreshCw className="w-6 h-6" />
            Caching Strategies
          </h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Next.js 16 Cache Pattern</h3>
            <p className="text-sm text-muted-foreground">
              Use the <code className="text-xs bg-muted px-1 py-0.5 rounded">&apos;use cache&apos;</code> directive
              with cache tags:
            </p>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`"use cache";

import { cacheTag } from "next/cache";
import { db } from "@/lib/db";

export async function getUserPosts(userId: string) {
  cacheTag(\`user:\${userId}:posts\`);

  const posts = await db.post.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
  });

  return posts;
}

// Revalidate from Server Action:
import { revalidateTag } from "next/cache";

export async function createPost(data: PostData) {
  const post = await db.post.create({ data });

  // Revalidate the cache
  revalidateTag(\`user:\${post.authorId}:posts\`);

  return post;
}`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Cache Utility Helpers</h3>
            <p className="text-sm text-muted-foreground">
              Create <code className="text-xs bg-muted px-1 py-0.5 rounded">lib/cache/index.ts</code>:
            </p>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`import { revalidateTag, revalidatePath } from "next/cache";

// Cache tag builders
export const CacheTags = {
  user: (userId: string) => \`user:\${userId}\`,
  userPosts: (userId: string) => \`user:\${userId}:posts\`,
  post: (postId: string) => \`post:\${postId}\`,
  allPosts: () => "posts:all",
};

// Revalidation helpers
export const revalidate = {
  user: (userId: string) => {
    revalidateTag(CacheTags.user(userId));
  },
  userPosts: (userId: string) => {
    revalidateTag(CacheTags.userPosts(userId));
  },
  allPosts: () => {
    revalidateTag(CacheTags.allPosts());
    revalidatePath("/posts");
  },
};

// Usage in queries:
import { cacheTag } from "next/cache";
import { CacheTags } from "@/lib/cache";

export async function getUserPosts(userId: string) {
  "use cache";
  cacheTag(CacheTags.userPosts(userId));

  return await db.post.findMany({
    where: { authorId: userId },
  });
}`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Cache Lifetimes</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`"use cache";

import { cacheLife } from "next/cache";

// Short cache (5 minutes)
export async function getRealtimeData() {
  cacheLife("short");
  // fetch data
}

// Medium cache (1 hour)
export async function getPublicPosts() {
  cacheLife("medium");
  // fetch data
}

// Long cache (1 day)
export async function getStaticContent() {
  cacheLife("long");
  // fetch data
}

// Custom cache duration
export async function getData() {
  cacheLife({
    revalidate: 3600, // 1 hour in seconds
    stale: 300,       // 5 minutes stale time
  });
  // fetch data
}`}
            </pre>
          </div>
        </div>

        {/* API Routes */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">API Routes (When Needed)</h2>

          <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-600 dark:text-amber-300">
              <strong>Note:</strong> Prefer Server Actions for most use cases. Use API
              routes only for webhooks, third-party integrations, or when you need
              specific HTTP methods/headers.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">API Route Pattern</h3>
            <p className="text-sm text-muted-foreground">
              Create <code className="text-xs bg-muted px-1 py-0.5 rounded">app/api/posts/route.ts</code>:
            </p>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const posts = await db.post.findMany({
      where: { authorId: session.user.id },
    });

    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const post = await db.post.create({
      data: {
        ...body,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}`}
            </pre>
          </div>
        </div>

        {/* Data Fetching Patterns */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Data Fetching Patterns</h2>

          <div className="grid gap-6">
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Server Component Data Fetching</h3>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// app/posts/page.tsx
import { getPosts } from "@/lib/posts/query";

export default async function PostsPage() {
  const posts = await getPosts();

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
              <h3 className="text-lg font-semibold">Parallel Data Fetching</h3>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`export default async function DashboardPage() {
  // Fetch in parallel
  const [user, posts, stats] = await Promise.all([
    getUser(),
    getUserPosts(),
    getUserStats(),
  ]);

  return <Dashboard user={user} posts={posts} stats={stats} />;
}`}
              </pre>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Client-Side with TanStack Query</h3>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`"use client";

import { useQuery } from "@tanstack/react-query";
import { getPosts } from "@/lib/posts/query";

export function PostsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
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
              <h3 className="font-semibold">Prefer Server Actions</h3>
              <p className="text-sm text-muted-foreground">
                Use Server Actions for mutations. Better type safety and progressive
                enhancement than API routes.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="font-semibold">Cache Strategically</h3>
              <p className="text-sm text-muted-foreground">
                Use <code className="text-xs bg-muted px-1 py-0.5 rounded">&apos;use cache&apos;</code> with
                cache tags for granular revalidation.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="font-semibold">Validate Input</h3>
              <p className="text-sm text-muted-foreground">
                Always validate inputs with Zod before processing in Server Actions
                and API routes.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="font-semibold">Error Handling</h3>
              <p className="text-sm text-muted-foreground">
                Return structured error responses. Use try/catch blocks and provide
                helpful error messages.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="font-semibold">Authentication First</h3>
              <p className="text-sm text-muted-foreground">
                Always check authentication at the start of Server Actions and API
                routes.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="font-semibold">Revalidate Caches</h3>
              <p className="text-sm text-muted-foreground">
                After mutations, revalidate affected cache tags and paths for
                consistent data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
