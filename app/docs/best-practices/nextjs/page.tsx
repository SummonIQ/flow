import { Code2, Server, FolderTree, FileCode, CheckCircle2, XCircle, List } from "lucide-react";

export default function NextJSBestPracticesPage() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Code2 className="w-4 h-4" />
            Next.js 16 Best Practices
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Next.js 16 App Router Best Practices
          </h1>
          <p className="text-xl text-muted-foreground">
            Essential patterns and conventions for building performant,
            maintainable Next.js applications.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="rounded-lg border border-border bg-muted/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <List className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">On This Page</h2>
          </div>
          <nav className="grid sm:grid-cols-2 gap-2 text-sm">
            <a href="#server-components" className="text-muted-foreground hover:text-foreground transition-colors">
              Server Components First
            </a>
            <a href="#server-actions" className="text-muted-foreground hover:text-foreground transition-colors">
              Server Actions
            </a>
            <a href="#file-organization" className="text-muted-foreground hover:text-foreground transition-colors">
              File Organization
            </a>
            <a href="#data-fetching" className="text-muted-foreground hover:text-foreground transition-colors">
              Data Fetching Patterns
            </a>
            <a href="#caching" className="text-muted-foreground hover:text-foreground transition-colors">
              Caching Strategies
            </a>
            <a href="#routing" className="text-muted-foreground hover:text-foreground transition-colors">
              Routing Conventions
            </a>
          </nav>
        </div>

        {/* Server Components First */}
        <div className="space-y-6" id="server-components">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Server className="w-6 h-6" />
            Server Components First
          </h2>

          <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  Core Principle: Default to Server Components
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  <strong>Always opt to create Server Components where possible to improve performance.</strong>{" "}
                  Server Components reduce JavaScript bundle size, enable direct database access, and improve initial page load times.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-green-700 dark:text-green-300">Do: Server Component</h3>
              </div>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// app/posts/page.tsx
import { db } from "@/lib/db";

export default async function PostsPage() {
  // Direct database access
  const posts = await db.post.findMany();

  return (
    <div>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  );
}`}
              </pre>
              <p className="text-xs text-green-600 dark:text-green-300">
                ✓ No JavaScript sent to client<br />
                ✓ Direct data access<br />
                ✓ Better performance
              </p>
            </div>

            <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="font-semibold text-red-700 dark:text-red-300">Don't: Unnecessary Client Component</h3>
              </div>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// app/posts/page.tsx
"use client"; // ❌ Unnecessary - no interactivity!

import { use } from "react";

export default function PostsPage() {
  // Fetching in Client Component
  const posts = use(
    fetch("/api/posts").then(res => res.json())
  );

  return (
    <div>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  );
}`}
              </pre>
              <p className="text-xs text-red-600 dark:text-red-300">
                ✗ Sends unnecessary JavaScript to client<br />
                ✗ Requires extra API route<br />
                ✗ Slower initial render<br />
                ✗ No SEO benefits
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">When to Use Client Components</h3>
            <p className="text-sm text-muted-foreground">
              Only add <code className="text-xs bg-muted px-1 py-0.5 rounded">"use client"</code> when you need:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Interactivity:</strong> Event handlers (onClick, onChange, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>State:</strong> useState, useReducer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Effects:</strong> useEffect, useLayoutEffect</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Browser APIs:</strong> localStorage, window, document</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Custom Hooks:</strong> Any hook that uses the above</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Component Composition Pattern</h3>
            <p className="text-sm text-muted-foreground">
              Keep Server Components as the container and nest Client Components for interactivity:
            </p>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// app/dashboard/page.tsx (Server Component)
import { getUserData } from "@/lib/user/query";
import { InteractiveChart } from "./_components/interactive-chart";

export default async function DashboardPage() {
  const data = await getUserData(); // Server-side data fetch

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Pass data to Client Component */}
      <InteractiveChart data={data} />
    </div>
  );
}

// app/dashboard/_components/interactive-chart.tsx (Client Component)
"use client";

import { useState } from "react";

interface Props {
  data: ChartData;
}

export function InteractiveChart({ data }: Props) {
  const [filter, setFilter] = useState("all");
  // Client-side interactivity
  return <div>...</div>;
}`}
            </pre>
          </div>
        </div>

        {/* Server Actions */}
        <div className="space-y-6" id="server-actions">
          <h2 className="text-2xl font-bold">Server Actions</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Server Actions Location</h3>
            <p className="text-sm text-muted-foreground">
              Place Server Actions in <code className="text-xs bg-muted px-1 py-0.5 rounded">lib/[feature]/server-actions.ts</code>:
            </p>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// lib/posts/server-actions.ts
"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";

export async function createPost(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const post = await db.post.create({
    data: {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      authorId: session.user.id,
    },
  });

  revalidateTag(\`user:\${session.user.id}:posts\`);
  return post;
}`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Server Action Best Practices</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong>Always validate inputs</strong> - Use Zod schemas to validate all inputs
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong>Check authentication first</strong> - Verify user session before any operations
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong>Revalidate caches</strong> - Use revalidateTag() or revalidatePath() after mutations
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong>Return typed responses</strong> - Return consistent success/error objects
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong>Use "use server" directive</strong> - Add at the top of the file or function
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* File Organization */}
        <div className="space-y-6" id="file-organization">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FolderTree className="w-6 h-6" />
            File Organization
          </h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Recommended Structure</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto font-mono">
{`app/
├── dashboard/
│   ├── page.tsx                    # Server Component
│   ├── layout.tsx                  # Layout
│   ├── loading.tsx                 # Loading UI
│   ├── error.tsx                   # Error boundary
│   └── _components/                # Page-specific components
│       ├── stats-card.tsx
│       └── quick-actions.tsx
│
lib/
├── dashboard/
│   ├── query.ts                    # Data fetching functions
│   ├── server-actions.ts           # Server Actions
│   └── schema.ts                   # Zod schemas
│
components/
└── ui/                             # Shared UI components
    ├── button.tsx
    └── card.tsx`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Logic Placement Guidelines</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-primary">Server Actions</h4>
                <p className="text-xs text-muted-foreground">
                  Location: <code className="text-xs bg-muted px-1 py-0.5 rounded">lib/[feature]/server-actions.ts</code>
                </p>
                <p className="text-xs text-muted-foreground">
                  For: Data mutations, form submissions, any write operations
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-primary">Query Functions</h4>
                <p className="text-xs text-muted-foreground">
                  Location: <code className="text-xs bg-muted px-1 py-0.5 rounded">lib/[feature]/query.ts</code>
                </p>
                <p className="text-xs text-muted-foreground">
                  For: Data fetching, database queries, cached queries
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-primary">Validation Schemas</h4>
                <p className="text-xs text-muted-foreground">
                  Location: <code className="text-xs bg-muted px-1 py-0.5 rounded">lib/[feature]/schema.ts</code>
                </p>
                <p className="text-xs text-muted-foreground">
                  For: Zod schemas, input validation, type inference
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-primary">Utility Functions</h4>
                <p className="text-xs text-muted-foreground">
                  Location: <code className="text-xs bg-muted px-1 py-0.5 rounded">lib/[category]/utils.ts</code>
                </p>
                <p className="text-xs text-muted-foreground">
                  For: Formatting, parsing, helpers, shared utilities
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-primary">Page Components</h4>
                <p className="text-xs text-muted-foreground">
                  Location: <code className="text-xs bg-muted px-1 py-0.5 rounded">app/[route]/_components/</code>
                </p>
                <p className="text-xs text-muted-foreground">
                  For: Components specific to a single page or route
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-primary">Shared Components</h4>
                <p className="text-xs text-muted-foreground">
                  Location: <code className="text-xs bg-muted px-1 py-0.5 rounded">components/</code>
                </p>
                <p className="text-xs text-muted-foreground">
                  For: Reusable UI components, layouts, forms
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Fetching */}
        <div className="space-y-6" id="data-fetching">
          <h2 className="text-2xl font-bold">Data Fetching Patterns</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Parallel Data Fetching</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// ✓ Good: Parallel fetching
export default async function Page() {
  const [user, posts, comments] = await Promise.all([
    getUser(),
    getPosts(),
    getComments(),
  ]);

  return <div>...</div>;
}

// ✗ Bad: Sequential fetching (slower)
export default async function Page() {
  const user = await getUser();
  const posts = await getPosts();
  const comments = await getComments();

  return <div>...</div>;
}`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Streaming with Suspense</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`import { Suspense } from "react";

export default function Page() {
  return (
    <div>
      <Suspense fallback={<LoadingSkeleton />}>
        <SlowComponent />
      </Suspense>
      <FastComponent />
    </div>
  );
}

async function SlowComponent() {
  const data = await slowFetch();
  return <div>{data}</div>;
}`}
            </pre>
          </div>
        </div>

        {/* Caching */}
        <div className="space-y-6" id="caching">
          <h2 className="text-2xl font-bold">Caching Strategies</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Using Cache Tags</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// lib/posts/query.ts
"use cache";

import { cacheTag } from "next/cache";
import { db } from "@/lib/db";

export async function getUserPosts(userId: string) {
  cacheTag(\`user:\${userId}:posts\`);

  return await db.post.findMany({
    where: { authorId: userId },
  });
}

// Revalidate in server action:
import { revalidateTag } from "next/cache";

export async function createPost(data: PostData) {
  const post = await db.post.create({ data });
  revalidateTag(\`user:\${post.authorId}:posts\`);
  return post;
}`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Cache Tag Organization</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// lib/cache/tags.ts
export const CacheTags = {
  user: (id: string) => \`user:\${id}\`,
  userPosts: (id: string) => \`user:\${id}:posts\`,
  post: (id: string) => \`post:\${id}\`,
  allPosts: () => "posts:all",
};

// Usage:
import { CacheTags } from "@/lib/cache/tags";

cacheTag(CacheTags.userPosts(userId));`}
            </pre>
          </div>
        </div>

        {/* Routing Conventions */}
        <div className="space-y-6" id="routing">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileCode className="w-6 h-6" />
            Routing Conventions
          </h2>

          <div className="grid gap-4">
            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="text-sm font-semibold">Route Groups</h3>
              <p className="text-xs text-muted-foreground">
                Use <code className="text-xs bg-muted px-1 py-0.5 rounded">(group)</code> to organize routes without affecting URLs
              </p>
              <pre className="text-xs bg-muted p-2 rounded font-mono">
{`app/
├── (marketing)/
│   ├── about/page.tsx      # /about
│   └── contact/page.tsx    # /contact
└── (dashboard)/
    └── settings/page.tsx   # /settings`}
              </pre>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="text-sm font-semibold">Private Folders</h3>
              <p className="text-xs text-muted-foreground">
                Use <code className="text-xs bg-muted px-1 py-0.5 rounded">_folder</code> to exclude from routing
              </p>
              <pre className="text-xs bg-muted p-2 rounded font-mono">
{`app/
└── dashboard/
    ├── page.tsx
    └── _components/      # Not a route
        └── widget.tsx`}
              </pre>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="text-sm font-semibold">Dynamic Routes</h3>
              <p className="text-xs text-muted-foreground">
                Use <code className="text-xs bg-muted px-1 py-0.5 rounded">[param]</code> for dynamic segments
              </p>
              <pre className="text-xs bg-muted p-2 rounded font-mono">
{`app/
└── posts/
    └── [id]/
        └── page.tsx      # /posts/123`}
              </pre>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="text-sm font-semibold">Catch-all Routes</h3>
              <p className="text-xs text-muted-foreground">
                Use <code className="text-xs bg-muted px-1 py-0.5 rounded">[...slug]</code> for catch-all segments
              </p>
              <pre className="text-xs bg-muted p-2 rounded font-mono">
{`app/
└── blog/
    └── [...slug]/
        └── page.tsx      # /blog/a/b/c`}
              </pre>
            </div>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-6">
          <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-4">
            Quick Reference: Next.js 16 Best Practices
          </h3>
          <ul className="text-sm text-amber-600 dark:text-amber-300 space-y-2">
            <li>✓ Default to Server Components for better performance</li>
            <li>✓ Use Server Actions for data mutations</li>
            <li>✓ Place logic in lib/[feature]/ directories</li>
            <li>✓ Use _components/ for page-specific components</li>
            <li>✓ Implement parallel data fetching with Promise.all()</li>
            <li>✓ Use Suspense for streaming UI</li>
            <li>✓ Tag caches with descriptive cache tags</li>
            <li>✓ Revalidate caches after mutations</li>
            <li>✓ Validate all inputs with Zod schemas</li>
            <li>✓ Check authentication in Server Actions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
