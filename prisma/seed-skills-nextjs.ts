import { PrismaClient, SkillCategory } from '@prisma/client';

const prisma = new PrismaClient();

interface SkillSeed {
  name: string;
  displayName: string;
  description: string;
  category: SkillCategory;
  content: string;
  tags: string[];
  isOfficial?: boolean;
}

const skills: SkillSeed[] = [
  {
    name: 'nextjs-performance',
    displayName: 'Next.js Performance Optimization',
    description:
      'Optimize Next.js applications for speed and Core Web Vitals. Use when improving LCP, FID, CLS, or overall page performance.',
    category: 'PERFORMANCE',
    content: `# Next.js Performance Optimization

## Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

## Image Optimization
\`\`\`tsx
import Image from 'next/image';

// Optimized hero image
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // Preload for LCP
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// Responsive images
<Image
  src="/photo.jpg"
  alt="Photo"
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  className="object-cover"
/>
\`\`\`

## Font Optimization
\`\`\`tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevent FOIT
  preload: true,
});
\`\`\`

## Bundle Analysis
\`\`\`bash
# Install analyzer
bun add -D @next/bundle-analyzer

# next.config.ts
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true bun run build
\`\`\`

## Dynamic Imports
\`\`\`tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false, // Client-only if needed
});

// Named exports
const Modal = dynamic(() =>
  import('./Modal').then(mod => mod.Modal)
);
\`\`\`

## Script Optimization
\`\`\`tsx
import Script from 'next/script';

// Load after page is interactive
<Script src="/analytics.js" strategy="afterInteractive" />

// Load when browser is idle
<Script src="/chat-widget.js" strategy="lazyOnload" />

// Worker thread (experimental)
<Script src="/heavy-script.js" strategy="worker" />
\`\`\`

## Prefetching
\`\`\`tsx
import Link from 'next/link';

// Automatic prefetch (default)
<Link href="/about">About</Link>

// Disable prefetch for less important links
<Link href="/rarely-visited" prefetch={false}>
  Rarely Visited
</Link>
\`\`\``,
    tags: ['nextjs', 'performance', 'optimization', 'core-web-vitals', 'lcp'],
    isOfficial: true,
  },
  {
    name: 'nextjs-best-practices',
    displayName: 'Next.js Best Practices',
    description:
      'Follow Next.js best practices for maintainable and scalable applications. Use when structuring projects or reviewing code quality.',
    category: 'ARCHITECTURE',
    content: `# Next.js Best Practices

## Project Structure
\`\`\`
app/
├── (auth)/           # Route groups
│   ├── login/
│   └── register/
├── (dashboard)/
│   ├── layout.tsx
│   └── page.tsx
├── api/
│   └── route.ts
├── components/       # Shared components
├── lib/              # Utilities
├── hooks/            # Custom hooks
└── types/            # TypeScript types
\`\`\`

## Server Components First
\`\`\`tsx
// Default: Server Component
export default async function Page() {
  const data = await fetchData(); // Direct DB/API access
  return <div>{data.title}</div>;
}

// Only add 'use client' when needed
'use client';
export function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
\`\`\`

## Data Fetching Patterns
\`\`\`tsx
// Parallel fetching
async function Dashboard() {
  const [user, posts, stats] = await Promise.all([
    getUser(),
    getPosts(),
    getStats(),
  ]);
  return <DashboardView user={user} posts={posts} stats={stats} />;
}

// Sequential when dependent
async function UserPosts({ userId }: { userId: string }) {
  const user = await getUser(userId);
  const posts = await getPosts(user.id); // Needs user.id
  return <PostList posts={posts} />;
}
\`\`\`

## Error Handling
\`\`\`tsx
// app/error.tsx - Catches errors in segment
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// app/not-found.tsx - Custom 404
export default function NotFound() {
  return <div>Page not found</div>;
}
\`\`\`

## Loading States
\`\`\`tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />;
}

// Streaming with Suspense
import { Suspense } from 'react';

export default function Page() {
  return (
    <>
      <Header />
      <Suspense fallback={<PostsSkeleton />}>
        <Posts />
      </Suspense>
    </>
  );
}
\`\`\`

## Environment Variables
\`\`\`bash
# Server-only (never exposed)
DATABASE_URL=...
API_SECRET=...

# Client-accessible (public)
NEXT_PUBLIC_API_URL=...
\`\`\`

## Type Safety
\`\`\`tsx
// Typed params and searchParams
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page } = await searchParams;
  // ...
}
\`\`\``,
    tags: ['nextjs', 'best-practices', 'architecture', 'patterns'],
    isOfficial: true,
  },
  {
    name: 'nextjs-rendering-modes',
    displayName: 'Next.js Rendering Modes',
    description:
      'Understand SSR, SSG, ISR, and client-side rendering in Next.js. Use when choosing the right rendering strategy for your pages.',
    category: 'FRONTEND',
    content: `# Next.js Rendering Modes

## Overview
| Mode | When Generated | Use Case |
|------|---------------|----------|
| SSG | Build time | Static content |
| ISR | Build + revalidate | Semi-static content |
| SSR | Request time | Dynamic/personalized |
| CSR | Browser | Interactive widgets |

## Static Site Generation (SSG)
\`\`\`tsx
// Default behavior - generated at build time
export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  return <Article post={post} />;
}

// Generate static paths
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map(post => ({ slug: post.slug }));
}
\`\`\`

## Incremental Static Regeneration (ISR)
\`\`\`tsx
// Revalidate every 60 seconds
async function getPost(slug: string) {
  const res = await fetch(\`https://api.example.com/posts/\${slug}\`, {
    next: { revalidate: 60 },
  });
  return res.json();
}

// On-demand revalidation
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: Request) {
  const { path, tag } = await request.json();
  
  if (path) revalidatePath(path);
  if (tag) revalidateTag(tag);
  
  return Response.json({ revalidated: true });
}
\`\`\`

## Server-Side Rendering (SSR)
\`\`\`tsx
// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Or use no-store fetch
async function getUser() {
  const res = await fetch('https://api.example.com/user', {
    cache: 'no-store',
  });
  return res.json();
}

export default async function Dashboard() {
  const user = await getUser();
  return <DashboardView user={user} />;
}
\`\`\`

## Client-Side Rendering (CSR)
\`\`\`tsx
'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function LiveStats() {
  const { data, error, isLoading } = useSWR('/api/stats', fetcher, {
    refreshInterval: 5000, // Poll every 5s
  });
  
  if (isLoading) return <Skeleton />;
  if (error) return <Error />;
  
  return <StatsDisplay stats={data} />;
}
\`\`\`

## Hybrid Approach
\`\`\`tsx
// Static shell + dynamic content
export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id); // Static
  
  return (
    <>
      <ProductInfo product={product} />
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={id} /> {/* Streamed */}
      </Suspense>
      <RealtimeStock productId={id} /> {/* Client */}
    </>
  );
}
\`\`\`

## Route Segment Config
\`\`\`tsx
// Force static generation
export const dynamic = 'force-static';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Revalidation time
export const revalidate = 3600; // 1 hour

// Runtime
export const runtime = 'edge'; // or 'nodejs'
\`\`\``,
    tags: ['nextjs', 'ssr', 'ssg', 'isr', 'rendering', 'csr'],
    isOfficial: true,
  },
  {
    name: 'nextjs-security',
    displayName: 'Next.js Security',
    description:
      'Implement security best practices in Next.js applications. Use when hardening apps against XSS, CSRF, and other vulnerabilities.',
    category: 'SECURITY',
    content: `# Next.js Security

## Server Actions Security
\`\`\`tsx
'use server';

import { z } from 'zod';
import { headers } from 'next/headers';

const schema = z.object({
  email: z.string().email(),
  message: z.string().min(1).max(1000),
});

export async function submitForm(formData: FormData) {
  // Validate input
  const result = schema.safeParse({
    email: formData.get('email'),
    message: formData.get('message'),
  });
  
  if (!result.success) {
    return { error: 'Invalid input' };
  }
  
  // Rate limiting (example)
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for');
  if (await isRateLimited(ip)) {
    return { error: 'Too many requests' };
  }
  
  // Process safely
  await processForm(result.data);
  return { success: true };
}
\`\`\`

## Content Security Policy
\`\`\`tsx
// next.config.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data:",
      "font-src 'self'",
      "connect-src 'self' https://api.example.com",
    ].join('; '),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
];

export default {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
\`\`\`

## Authentication Middleware
\`\`\`tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  
  // Protect routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Validate token (simplified)
    if (!isValidToken(token)) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*'],
};
\`\`\`

## XSS Prevention
\`\`\`tsx
// React auto-escapes by default
<div>{userInput}</div> // Safe

// Dangerous - only with trusted HTML
import DOMPurify from 'isomorphic-dompurify';

function SafeHTML({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'a'],
    ALLOWED_ATTR: ['href'],
  });
  
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
\`\`\`

## API Route Security
\`\`\`tsx
// app/api/data/route.ts
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const headersList = await headers();
  
  // Verify origin
  const origin = headersList.get('origin');
  if (origin !== process.env.ALLOWED_ORIGIN) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Verify API key for external access
  const apiKey = headersList.get('x-api-key');
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Process request
  const body = await request.json();
  // ...
}
\`\`\`

## Environment Security
\`\`\`bash
# Never expose these to client
DATABASE_URL=...
JWT_SECRET=...
API_SECRET=...

# Only NEXT_PUBLIC_* is exposed
NEXT_PUBLIC_API_URL=https://api.example.com
\`\`\``,
    tags: ['nextjs', 'security', 'xss', 'csrf', 'authentication'],
    isOfficial: true,
  },
  {
    name: 'sentry-nextjs',
    displayName: 'Sentry for Next.js',
    description:
      'Monitor errors and performance with Sentry in Next.js. Use when setting up error tracking, performance monitoring, or debugging production issues.',
    category: 'MONITORING',
    content: `# Sentry for Next.js

## Installation
\`\`\`bash
bunx @sentry/wizard@latest -i nextjs
\`\`\`

## Configuration
\`\`\`typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration(),
    Sentry.browserTracingIntegration(),
  ],
});
\`\`\`

\`\`\`typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
\`\`\`

## Error Boundary Integration
\`\`\`tsx
// app/global-error.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  );
}
\`\`\`

## Manual Error Capture
\`\`\`typescript
import * as Sentry from '@sentry/nextjs';

// Capture exception
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { section: 'checkout' },
    extra: { userId, orderId },
  });
}

// Capture message
Sentry.captureMessage('User completed onboarding', 'info');

// Set user context
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});
\`\`\`

## Performance Monitoring
\`\`\`typescript
import * as Sentry from '@sentry/nextjs';

// Custom transaction
const transaction = Sentry.startTransaction({
  name: 'processOrder',
  op: 'task',
});

try {
  const span = transaction.startChild({
    op: 'db.query',
    description: 'SELECT * FROM orders',
  });
  
  await db.orders.findMany();
  span.finish();
  
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
\`\`\`

## Server Action Monitoring
\`\`\`typescript
'use server';

import * as Sentry from '@sentry/nextjs';

export async function createOrder(formData: FormData) {
  return Sentry.withServerActionInstrumentation(
    'createOrder',
    async () => {
      // Your server action logic
      const order = await processOrder(formData);
      return { success: true, orderId: order.id };
    }
  );
}
\`\`\`

## Source Maps
\`\`\`typescript
// next.config.ts
import { withSentryConfig } from '@sentry/nextjs';

export default withSentryConfig(nextConfig, {
  org: 'your-org',
  project: 'your-project',
  silent: true,
  hideSourceMaps: true,
});
\`\`\``,
    tags: ['sentry', 'monitoring', 'error-tracking', 'performance', 'nextjs'],
    isOfficial: true,
  },
  {
    name: 'nextjs-caching-deep',
    displayName: 'Next.js Advanced Caching',
    description:
      'Master Next.js caching mechanisms for optimal performance. Use when fine-tuning cache behavior, debugging cache issues, or implementing cache invalidation.',
    category: 'PERFORMANCE',
    content: `# Next.js Advanced Caching

## Cache Layers
1. **Request Memoization** - Dedupes identical requests in single render
2. **Data Cache** - Persists fetch results across requests
3. **Full Route Cache** - Caches rendered HTML and RSC payload
4. **Router Cache** - Client-side cache for navigations

## Fetch Caching
\`\`\`typescript
// Cached indefinitely (default)
fetch(url);
fetch(url, { cache: 'force-cache' });

// Never cached
fetch(url, { cache: 'no-store' });

// Revalidate after time
fetch(url, { next: { revalidate: 3600 } });

// Tag for on-demand invalidation
fetch(url, { next: { tags: ['posts'] } });
\`\`\`

## React Cache (Request Memoization)
\`\`\`typescript
import { cache } from 'react';

// Memoized per request
export const getUser = cache(async (id: string) => {
  const user = await db.user.findUnique({ where: { id } });
  return user;
});

// Called multiple times but only executes once per request
const user1 = await getUser('1');
const user2 = await getUser('1'); // Returns cached result
\`\`\`

## unstable_cache
\`\`\`typescript
import { unstable_cache } from 'next/cache';

const getCachedPosts = unstable_cache(
  async (authorId: string) => {
    return db.post.findMany({ where: { authorId } });
  },
  ['posts'], // Cache key parts
  {
    tags: ['posts'],
    revalidate: 3600,
  }
);
\`\`\`

## On-Demand Revalidation
\`\`\`typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: Request) {
  const { secret, tag, path } = await request.json();
  
  // Validate secret
  if (secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ error: 'Invalid secret' }, { status: 401 });
  }
  
  // Revalidate by tag
  if (tag) {
    revalidateTag(tag);
  }
  
  // Revalidate by path
  if (path) {
    revalidatePath(path);
    // Or revalidate layout
    revalidatePath(path, 'layout');
  }
  
  return Response.json({ revalidated: true, now: Date.now() });
}
\`\`\`

## Server Action Cache Invalidation
\`\`\`typescript
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

export async function createPost(formData: FormData) {
  const post = await db.post.create({
    data: { title: formData.get('title') as string },
  });
  
  // Invalidate related caches
  revalidateTag('posts');
  revalidatePath('/blog');
  
  return { success: true, id: post.id };
}
\`\`\`

## Route Segment Config
\`\`\`typescript
// Force dynamic (no caching)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Force static with revalidation
export const dynamic = 'force-static';
export const revalidate = 3600;

// Error on dynamic usage (ensure static)
export const dynamic = 'error';
\`\`\`

## Cache Debugging
\`\`\`typescript
// Log cache status
async function fetchWithLogging(url: string) {
  const res = await fetch(url);
  console.log('Cache status:', res.headers.get('x-vercel-cache'));
  return res.json();
}
\`\`\``,
    tags: ['nextjs', 'caching', 'performance', 'revalidation', 'isr'],
    isOfficial: true,
  },
  {
    name: 'nextjs-api-patterns',
    displayName: 'Next.js API Patterns',
    description:
      'Design robust APIs with Next.js Route Handlers. Use when building REST APIs, handling webhooks, or creating backend endpoints.',
    category: 'API',
    content: `# Next.js API Patterns

## RESTful Route Handler
\`\`\`typescript
// app/api/posts/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';

const postSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  const posts = await db.post.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
  
  return NextResponse.json({
    data: posts,
    pagination: { page, limit },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = postSchema.parse(body);
    
    const post = await db.post.create({ data: validated });
    
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', issues: error.issues },
        { status: 400 }
      );
    }
    throw error;
  }
}
\`\`\`

## Dynamic Route Handler
\`\`\`typescript
// app/api/posts/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const post = await db.post.findUnique({ where: { id } });
  
  if (!post) {
    return NextResponse.json(
      { error: 'Post not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(post);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  
  const post = await db.post.update({
    where: { id },
    data: body,
  });
  
  return NextResponse.json(post);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  await db.post.delete({ where: { id } });
  
  return new Response(null, { status: 204 });
}
\`\`\`

## Webhook Handler
\`\`\`typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }
  
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object);
      break;
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object);
      break;
  }
  
  return NextResponse.json({ received: true });
}
\`\`\`

## Streaming Response
\`\`\`typescript
// app/api/stream/route.ts
export async function GET() {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 100));
        controller.enqueue(encoder.encode(\`data: \${i}\\n\\n\`));
      }
      controller.close();
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
\`\`\``,
    tags: ['nextjs', 'api', 'rest', 'webhooks', 'routes'],
    isOfficial: true,
  },
  {
    name: 'nextjs-testing',
    displayName: 'Next.js Testing',
    description:
      'Test Next.js applications with Playwright and other tools. Use when writing integration tests, e2e tests, or testing server components.',
    category: 'TESTING',
    content: `# Next.js Testing

## Playwright Setup
\`\`\`bash
bun add -D @playwright/test
bunx playwright install
\`\`\`

\`\`\`typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
\`\`\`

## Page Tests
\`\`\`typescript
// tests/home.spec.ts
import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  
  await expect(page).toHaveTitle(/My App/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('navigation works', async ({ page }) => {
  await page.goto('/');
  
  await page.getByRole('link', { name: 'About' }).click();
  
  await expect(page).toHaveURL('/about');
  await expect(page.getByRole('heading', { name: 'About Us' })).toBeVisible();
});
\`\`\`

## Form Testing
\`\`\`typescript
test('contact form submission', async ({ page }) => {
  await page.goto('/contact');
  
  await page.getByLabel('Name').fill('John Doe');
  await page.getByLabel('Email').fill('john@example.com');
  await page.getByLabel('Message').fill('Hello, this is a test message.');
  
  await page.getByRole('button', { name: 'Send' }).click();
  
  await expect(page.getByText('Message sent successfully')).toBeVisible();
});
\`\`\`

## API Route Testing
\`\`\`typescript
test('API returns correct data', async ({ request }) => {
  const response = await request.get('/api/posts');
  
  expect(response.ok()).toBeTruthy();
  
  const data = await response.json();
  expect(data.data).toBeInstanceOf(Array);
  expect(data.data.length).toBeGreaterThan(0);
});

test('API handles POST correctly', async ({ request }) => {
  const response = await request.post('/api/posts', {
    data: {
      title: 'Test Post',
      content: 'This is test content.',
    },
  });
  
  expect(response.status()).toBe(201);
  
  const post = await response.json();
  expect(post.title).toBe('Test Post');
});
\`\`\`

## Authentication Testing
\`\`\`typescript
test.describe('authenticated routes', () => {
  test.use({
    storageState: 'tests/.auth/user.json',
  });
  
  test('dashboard is accessible when logged in', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});

// Setup auth state
test('login and save state', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  
  await page.context().storageState({ path: 'tests/.auth/user.json' });
});
\`\`\`

## Visual Regression
\`\`\`typescript
test('homepage visual regression', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});
\`\`\``,
    tags: ['nextjs', 'testing', 'playwright', 'e2e', 'integration'],
    isOfficial: true,
  },
  {
    name: 'nextjs-deployment',
    displayName: 'Next.js Deployment',
    description:
      'Deploy Next.js applications to various platforms. Use when deploying to Vercel, Docker, or self-hosted environments.',
    category: 'DEPLOYMENT',
    content: `# Next.js Deployment

## Vercel Deployment
\`\`\`bash
# Install Vercel CLI
bun add -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
\`\`\`

## Docker Deployment
\`\`\`dockerfile
# Dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN npm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
\`\`\`

\`\`\`typescript
// next.config.ts - Enable standalone output
export default {
  output: 'standalone',
};
\`\`\`

## Environment Variables
\`\`\`bash
# .env.production
DATABASE_URL=postgresql://...
NEXT_PUBLIC_API_URL=https://api.production.com

# Build-time vs Runtime
# Build-time: embedded during build
NEXT_PUBLIC_* variables

# Runtime: read at request time
# Use process.env in Server Components/API routes
\`\`\`

## Health Checks
\`\`\`typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database
    await db.$queryRaw\`SELECT 1\`;
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: 'Database connection failed' },
      { status: 503 }
    );
  }
}
\`\`\`

## Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Error tracking (Sentry) configured
- [ ] Analytics enabled
- [ ] Security headers set
- [ ] Image optimization configured
- [ ] Caching strategy defined
- [ ] Rate limiting implemented
- [ ] Health check endpoint
- [ ] Logging configured
- [ ] Source maps uploaded (not public)
- [ ] robots.txt and sitemap.xml

## Monitoring
\`\`\`typescript
// Vercel Analytics
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

// Speed Insights
import { SpeedInsights } from '@vercel/speed-insights/next';

<SpeedInsights />
\`\`\``,
    tags: ['nextjs', 'deployment', 'docker', 'vercel', 'production'],
    isOfficial: true,
  },
  {
    name: 'nextjs-internationalization',
    displayName: 'Next.js Internationalization',
    description:
      'Implement multi-language support in Next.js. Use when building apps for multiple locales or adding language switching.',
    category: 'FRONTEND',
    content: `# Next.js Internationalization (i18n)

## App Router i18n Setup
\`\`\`
app/
├── [locale]/
│   ├── layout.tsx
│   ├── page.tsx
│   └── about/
│       └── page.tsx
├── dictionaries/
│   ├── en.json
│   └── es.json
└── middleware.ts
\`\`\`

## Middleware for Locale Detection
\`\`\`typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

const locales = ['en', 'es', 'fr'];
const defaultLocale = 'en';

function getLocale(request: NextRequest): string {
  const headers = { 'accept-language': request.headers.get('accept-language') || '' };
  const languages = new Negotiator({ headers }).languages();
  return match(languages, locales, defaultLocale);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if locale is in pathname
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(\`/\${locale}/\`) || pathname === \`/\${locale}\`
  );
  
  if (pathnameHasLocale) return;
  
  // Redirect to locale
  const locale = getLocale(request);
  request.nextUrl.pathname = \`/\${locale}\${pathname}\`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
\`\`\`

## Dictionary Loading
\`\`\`typescript
// lib/dictionaries.ts
const dictionaries = {
  en: () => import('@/dictionaries/en.json').then(m => m.default),
  es: () => import('@/dictionaries/es.json').then(m => m.default),
  fr: () => import('@/dictionaries/fr.json').then(m => m.default),
};

export const getDictionary = async (locale: string) => {
  return dictionaries[locale as keyof typeof dictionaries]();
};
\`\`\`

## Dictionary Files
\`\`\`json
// dictionaries/en.json
{
  "common": {
    "welcome": "Welcome",
    "signIn": "Sign In",
    "signOut": "Sign Out"
  },
  "home": {
    "title": "Home",
    "description": "Welcome to our application"
  }
}
\`\`\`

\`\`\`json
// dictionaries/es.json
{
  "common": {
    "welcome": "Bienvenido",
    "signIn": "Iniciar Sesión",
    "signOut": "Cerrar Sesión"
  },
  "home": {
    "title": "Inicio",
    "description": "Bienvenido a nuestra aplicación"
  }
}
\`\`\`

## Using Translations
\`\`\`tsx
// app/[locale]/page.tsx
import { getDictionary } from '@/lib/dictionaries';

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  
  return (
    <div>
      <h1>{dict.home.title}</h1>
      <p>{dict.home.description}</p>
    </div>
  );
}
\`\`\`

## Language Switcher
\`\`\`tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';

export function LanguageSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(\`/\${locale}\`, \`/\${newLocale}\`);
    router.push(newPath);
  };
  
  return (
    <select value={locale} onChange={e => switchLocale(e.target.value)}>
      <option value="en">English</option>
      <option value="es">Español</option>
      <option value="fr">Français</option>
    </select>
  );
}
\`\`\`

## Static Generation for All Locales
\`\`\`tsx
export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }, { locale: 'fr' }];
}
\`\`\``,
    tags: [
      'nextjs',
      'i18n',
      'internationalization',
      'localization',
      'translations',
    ],
    isOfficial: true,
  },
];

async function main() {
  console.log('🚀 Seeding Next.js skills...');

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {
        displayName: skill.displayName,
        description: skill.description,
        category: skill.category,
        content: skill.content,
        tags: skill.tags,
        isOfficial: skill.isOfficial ?? false,
      },
      create: {
        name: skill.name,
        displayName: skill.displayName,
        description: skill.description,
        category: skill.category,
        content: skill.content,
        tags: skill.tags,
        isOfficial: skill.isOfficial ?? false,
      },
    });
    console.log(`  ✓ ${skill.displayName}`);
  }

  console.log(`\n✅ Seeded ${skills.length} Next.js skills`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
