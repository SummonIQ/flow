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
  // ==================== TOOLING ====================
  {
    name: 'eslint-configuration',
    displayName: 'ESLint Configuration',
    description:
      'Configure ESLint for TypeScript and React projects. Use when setting up linting, fixing lint errors, or customizing rules.',
    category: 'TOOLING',
    content: `# ESLint Configuration

## Basic Setup
\`\`\`bash
bun add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
\`\`\`

## eslint.config.js (Flat Config)
\`\`\`javascript
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
];
\`\`\`

## Common Rules
- \`no-console\`: Warn on console.log
- \`@typescript-eslint/no-floating-promises\`: Require await
- \`react-hooks/exhaustive-deps\`: Ensure hook deps`,
    tags: ['eslint', 'linting', 'tooling', 'typescript'],
    isOfficial: true,
  },
  {
    name: 'git-workflow',
    displayName: 'Git Workflow',
    description:
      'Git best practices including branching, commits, and collaboration. Use when working with version control or resolving conflicts.',
    category: 'VERSION_CONTROL',
    content: `# Git Workflow

## Conventional Commits
\`\`\`
feat(auth): add login with OAuth
fix(api): handle null response
docs(readme): update installation steps
refactor(utils): simplify date formatting
test(user): add unit tests for validation
chore(deps): update dependencies
\`\`\`

## Branch Naming
\`\`\`
feature/add-user-dashboard
fix/login-redirect-issue
refactor/optimize-queries
\`\`\`

## Common Commands
\`\`\`bash
# Create feature branch
git checkout -b feature/new-feature

# Stage and commit
git add .
git commit -m "feat: add new feature"

# Rebase before merge
git fetch origin
git rebase origin/main

# Interactive rebase
git rebase -i HEAD~3
\`\`\`

## Resolving Conflicts
\`\`\`bash
git fetch origin
git rebase origin/main
# Fix conflicts in files
git add .
git rebase --continue
\`\`\``,
    tags: ['git', 'version-control', 'workflow', 'commits'],
    isOfficial: true,
  },
  // ==================== DEVOPS ====================
  {
    name: 'docker-basics',
    displayName: 'Docker Basics',
    description:
      'Containerize applications with Docker for consistent development and deployment. Use when creating Dockerfiles or docker-compose configurations.',
    category: 'DEVOPS',
    content: `# Docker Basics

## Dockerfile for Next.js
\`\`\`dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN npm install

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
\`\`\`

## docker-compose.yml
\`\`\`yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/app
    depends_on:
      - db
  
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: app
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
\`\`\``,
    tags: ['docker', 'containers', 'devops', 'deployment'],
    isOfficial: true,
  },
  {
    name: 'environment-variables',
    displayName: 'Environment Variables',
    description:
      'Manage environment variables securely in Next.js applications. Use when configuring secrets, API keys, or environment-specific settings.',
    category: 'DEVOPS',
    content: `# Environment Variables

## File Structure
\`\`\`
.env              # Default values (committed)
.env.local        # Local overrides (gitignored)
.env.development  # Development values
.env.production   # Production values
\`\`\`

## Naming Convention
\`\`\`bash
# Server-only (never exposed to client)
DATABASE_URL=postgresql://...
API_SECRET=secret123

# Client-accessible (prefixed with NEXT_PUBLIC_)
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_ANALYTICS_ID=UA-123456
\`\`\`

## Type-Safe Env with Zod
\`\`\`typescript
// env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_SECRET: z.string().min(10),
  NEXT_PUBLIC_API_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
\`\`\`

## Usage
\`\`\`typescript
// Server-side
const dbUrl = process.env.DATABASE_URL;

// Client-side
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
\`\`\``,
    tags: ['env', 'environment', 'secrets', 'configuration'],
    isOfficial: true,
  },
  // ==================== UI COMPONENTS ====================
  {
    name: 'shadcn-ui-components',
    displayName: 'shadcn/ui Components',
    description:
      'Use shadcn/ui component library for building accessible UI. Use when adding buttons, forms, dialogs, or other UI primitives.',
    category: 'FRONTEND',
    content: `# shadcn/ui Components

## Installation
\`\`\`bash
bunx shadcn@latest init
bunx shadcn@latest add button card dialog
\`\`\`

## Button Variants
\`\`\`tsx
import { Button } from '@/components/ui/button';

<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
\`\`\`

## Form with Input
\`\`\`tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="Enter email" />
</div>
\`\`\`

## Dialog
\`\`\`tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <p>Dialog content here</p>
  </DialogContent>
</Dialog>
\`\`\``,
    tags: ['shadcn', 'ui', 'components', 'react', 'radix'],
    isOfficial: true,
  },
  {
    name: 'form-handling',
    displayName: 'Form Handling',
    description:
      'Build forms with react-hook-form and Zod validation. Use when creating input forms, handling validation, or managing form state.',
    category: 'FRONTEND',
    content: `# Form Handling

## Setup with react-hook-form + Zod
\`\`\`tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = (data: FormData) => {
    console.log(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">Submit</button>
    </form>
  );
}
\`\`\`

## With shadcn/ui Form
\`\`\`tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
\`\`\``,
    tags: ['forms', 'react-hook-form', 'validation', 'zod'],
    isOfficial: true,
  },
  // ==================== DATA FETCHING ====================
  {
    name: 'data-fetching-patterns',
    displayName: 'Data Fetching Patterns',
    description:
      'Fetch data in Next.js using various patterns. Use when loading data from APIs, databases, or external services.',
    category: 'FULLSTACK',
    content: `# Data Fetching Patterns

## Server Component Fetch
\`\`\`tsx
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  });
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();
  return posts.map(post => <PostCard key={post.id} post={post} />);
}
\`\`\`

## Parallel Data Fetching
\`\`\`tsx
export default async function Dashboard() {
  const [users, posts, stats] = await Promise.all([
    getUsers(),
    getPosts(),
    getStats(),
  ]);
  
  return (
    <>
      <UserList users={users} />
      <PostList posts={posts} />
      <StatsCard stats={stats} />
    </>
  );
}
\`\`\`

## Client-Side with SWR
\`\`\`tsx
'use client';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function UserProfile({ id }: { id: string }) {
  const { data, error, isLoading } = useSWR(\`/api/users/\${id}\`, fetcher);
  
  if (isLoading) return <Skeleton />;
  if (error) return <Error />;
  
  return <Profile user={data} />;
}
\`\`\`

## Streaming with Suspense
\`\`\`tsx
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
\`\`\``,
    tags: ['data-fetching', 'nextjs', 'swr', 'api', 'ssr'],
    isOfficial: true,
  },
  {
    name: 'caching-strategies',
    displayName: 'Caching Strategies',
    description:
      'Implement caching in Next.js for optimal performance. Use when optimizing data fetching, reducing API calls, or improving load times.',
    category: 'PERFORMANCE',
    content: `# Caching Strategies

## Fetch Cache Options
\`\`\`typescript
// Cache indefinitely (default for static)
fetch(url, { cache: 'force-cache' });

// Never cache
fetch(url, { cache: 'no-store' });

// Revalidate after time
fetch(url, { next: { revalidate: 3600 } });

// Revalidate on demand
fetch(url, { next: { tags: ['posts'] } });
\`\`\`

## On-Demand Revalidation
\`\`\`typescript
// app/api/revalidate/route.ts
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  const { tag, path } = await request.json();
  
  if (tag) revalidateTag(tag);
  if (path) revalidatePath(path);
  
  return Response.json({ revalidated: true });
}
\`\`\`

## React Cache
\`\`\`typescript
import { cache } from 'react';

export const getUser = cache(async (id: string) => {
  const user = await db.user.findUnique({ where: { id } });
  return user;
});

// Multiple calls in same request = one query
const user1 = await getUser('1');
const user2 = await getUser('1'); // Uses cached result
\`\`\`

## unstable_cache
\`\`\`typescript
import { unstable_cache } from 'next/cache';

const getCachedPosts = unstable_cache(
  async () => db.post.findMany(),
  ['posts'],
  { revalidate: 3600, tags: ['posts'] }
);
\`\`\``,
    tags: ['caching', 'performance', 'nextjs', 'revalidation'],
    isOfficial: true,
  },
  // ==================== SECURITY ====================
  {
    name: 'authentication-patterns',
    displayName: 'Authentication Patterns',
    description:
      'Implement authentication in Next.js applications. Use when adding login, session management, or protecting routes.',
    category: 'SECURITY',
    content: `# Authentication Patterns

## Middleware Protection
\`\`\`typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session');
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*'],
};
\`\`\`

## Session Validation
\`\`\`typescript
// lib/auth.ts
import { cookies } from 'next/headers';

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  
  if (!token) return null;
  
  try {
    const session = await verifyToken(token);
    return session;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}
\`\`\`

## Protected Page
\`\`\`tsx
// app/dashboard/page.tsx
import { requireAuth } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await requireAuth();
  
  return <Dashboard user={session.user} />;
}
\`\`\``,
    tags: ['auth', 'authentication', 'security', 'sessions'],
    isOfficial: true,
  },
  {
    name: 'input-sanitization',
    displayName: 'Input Sanitization',
    description:
      'Sanitize and validate user input to prevent security vulnerabilities. Use when handling user data, forms, or API inputs.',
    category: 'SECURITY',
    content: `# Input Sanitization

## Server Action Validation
\`\`\`typescript
'use server';

import { z } from 'zod';

const commentSchema = z.object({
  content: z.string()
    .min(1)
    .max(1000)
    .transform(str => str.trim()),
  postId: z.string().cuid(),
});

export async function createComment(formData: FormData) {
  const result = commentSchema.safeParse({
    content: formData.get('content'),
    postId: formData.get('postId'),
  });
  
  if (!result.success) {
    return { error: result.error.flatten() };
  }
  
  // Safe to use result.data
  await db.comment.create({ data: result.data });
}
\`\`\`

## HTML Sanitization
\`\`\`typescript
import DOMPurify from 'isomorphic-dompurify';

function SafeHTML({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'a', 'ul', 'li'],
    ALLOWED_ATTR: ['href'],
  });
  
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
\`\`\`

## SQL Injection Prevention
\`\`\`typescript
// Prisma automatically parameterizes queries
const user = await prisma.user.findFirst({
  where: { email: userInput }, // Safe
});

// For raw queries, use $queryRaw with template
const users = await prisma.$queryRaw\`
  SELECT * FROM users WHERE email = \${userInput}
\`;
\`\`\``,
    tags: ['security', 'validation', 'sanitization', 'xss'],
    isOfficial: true,
  },
  // ==================== MONITORING ====================
  {
    name: 'logging-patterns',
    displayName: 'Logging Patterns',
    description:
      'Implement structured logging for debugging and monitoring. Use when adding logs, debugging issues, or setting up observability.',
    category: 'MONITORING',
    content: `# Logging Patterns

## Structured Logging
\`\`\`typescript
// lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, context?: LogContext) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };
  
  console[level](JSON.stringify(entry));
}

export const logger = {
  debug: (msg: string, ctx?: LogContext) => log('debug', msg, ctx),
  info: (msg: string, ctx?: LogContext) => log('info', msg, ctx),
  warn: (msg: string, ctx?: LogContext) => log('warn', msg, ctx),
  error: (msg: string, ctx?: LogContext) => log('error', msg, ctx),
};
\`\`\`

## Request Logging
\`\`\`typescript
export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  
  logger.info('Request started', {
    requestId,
    method: 'POST',
    path: '/api/users',
  });
  
  try {
    const result = await processRequest();
    logger.info('Request completed', { requestId, status: 200 });
    return Response.json(result);
  } catch (error) {
    logger.error('Request failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown',
    });
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
\`\`\``,
    tags: ['logging', 'monitoring', 'debugging', 'observability'],
    isOfficial: true,
  },
  // ==================== MORE SKILLS ====================
  {
    name: 'nextjs-metadata',
    displayName: 'Next.js Metadata',
    description:
      'Configure SEO metadata and Open Graph tags in Next.js. Use when setting page titles, descriptions, or social sharing images.',
    category: 'FRONTEND',
    content: `# Next.js Metadata

## Static Metadata
\`\`\`tsx
// app/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My App',
  description: 'Description for SEO',
  openGraph: {
    title: 'My App',
    description: 'Description for social sharing',
    images: ['/og-image.png'],
  },
};
\`\`\`

## Dynamic Metadata
\`\`\`tsx
// app/posts/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      images: [post.coverImage],
    },
  };
}
\`\`\`

## Template
\`\`\`tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    template: '%s | My App',
    default: 'My App',
  },
};
\`\`\``,
    tags: ['nextjs', 'metadata', 'seo', 'opengraph'],
    isOfficial: true,
  },
  {
    name: 'nextjs-images',
    displayName: 'Next.js Image Optimization',
    description:
      'Optimize images with Next.js Image component. Use when displaying images, handling responsive images, or lazy loading.',
    category: 'PERFORMANCE',
    content: `# Next.js Image Optimization

## Basic Usage
\`\`\`tsx
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
/>
\`\`\`

## Responsive Image
\`\`\`tsx
<Image
  src="/photo.jpg"
  alt="Photo"
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
\`\`\`

## Priority Loading
\`\`\`tsx
// For above-the-fold images
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority
/>
\`\`\`

## Placeholder Blur
\`\`\`tsx
<Image
  src="/photo.jpg"
  alt="Photo"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
\`\`\`

## Remote Images
\`\`\`typescript
// next.config.ts
export default {
  images: {
    remotePatterns: [
      { hostname: 'images.unsplash.com' },
      { hostname: 'cdn.example.com' },
    ],
  },
};
\`\`\``,
    tags: ['nextjs', 'images', 'performance', 'optimization'],
    isOfficial: true,
  },
  {
    name: 'nextjs-fonts',
    displayName: 'Next.js Font Optimization',
    description:
      'Load and optimize fonts in Next.js. Use when adding custom fonts, Google Fonts, or local font files.',
    category: 'FRONTEND',
    content: `# Next.js Font Optimization

## Google Fonts
\`\`\`tsx
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export default function RootLayout({ children }) {
  return (
    <html className={\`\${inter.variable} \${robotoMono.variable}\`}>
      <body>{children}</body>
    </html>
  );
}
\`\`\`

## Local Fonts
\`\`\`tsx
import localFont from 'next/font/local';

const customFont = localFont({
  src: [
    { path: './fonts/Custom-Regular.woff2', weight: '400' },
    { path: './fonts/Custom-Bold.woff2', weight: '700' },
  ],
  variable: '--font-custom',
});
\`\`\`

## Using in Tailwind
\`\`\`css
/* globals.css */
@theme {
  --font-sans: var(--font-inter), system-ui, sans-serif;
  --font-mono: var(--font-mono), monospace;
}
\`\`\``,
    tags: ['nextjs', 'fonts', 'typography', 'performance'],
    isOfficial: true,
  },
  {
    name: 'react-context',
    displayName: 'React Context API',
    description:
      'Share state with React Context API. Use when passing data through component tree without prop drilling.',
    category: 'STATE_MANAGEMENT',
    content: `# React Context API

## Creating Context
\`\`\`tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
\`\`\`

## Using Context
\`\`\`tsx
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current: {theme}
    </button>
  );
}
\`\`\``,
    tags: ['react', 'context', 'state-management', 'providers'],
    isOfficial: true,
  },
  {
    name: 'tanstack-query',
    displayName: 'TanStack Query',
    description:
      'Manage server state with TanStack Query (React Query). Use when fetching, caching, and syncing server data.',
    category: 'FULLSTACK',
    content: `# TanStack Query

## Setup
\`\`\`tsx
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
\`\`\`

## Basic Query
\`\`\`tsx
import { useQuery } from '@tanstack/react-query';

function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(\`/api/users/\${userId}\`).then(r => r.json()),
  });
  
  if (isLoading) return <Skeleton />;
  if (error) return <Error message={error.message} />;
  
  return <Profile user={data} />;
}
\`\`\`

## Mutation
\`\`\`tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function CreatePost() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (newPost) => fetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify(newPost),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
  
  return (
    <button onClick={() => mutation.mutate({ title: 'New Post' })}>
      {mutation.isPending ? 'Creating...' : 'Create Post'}
    </button>
  );
}
\`\`\``,
    tags: ['react-query', 'tanstack', 'data-fetching', 'caching'],
    isOfficial: true,
  },
  {
    name: 'framer-motion',
    displayName: 'Framer Motion Animations',
    description:
      'Add animations with Framer Motion. Use when creating animated components, page transitions, or interactive UI.',
    category: 'FRONTEND',
    content: `# Framer Motion

## Basic Animation
\`\`\`tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Animated content
</motion.div>
\`\`\`

## Hover and Tap
\`\`\`tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>
\`\`\`

## AnimatePresence for Exit
\`\`\`tsx
import { AnimatePresence, motion } from 'framer-motion';

<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Fading content
    </motion.div>
  )}
</AnimatePresence>
\`\`\`

## Variants
\`\`\`tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

<motion.ul variants={containerVariants} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.li key={item.id} variants={itemVariants}>
      {item.name}
    </motion.li>
  ))}
</motion.ul>
\`\`\``,
    tags: ['framer-motion', 'animation', 'react', 'ui'],
    isOfficial: true,
  },
];

async function main() {
  console.log('🚀 Seeding more skills...');

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

  console.log(`\n✅ Seeded ${skills.length} more skills`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
