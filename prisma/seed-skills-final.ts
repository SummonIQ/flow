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
    name: 'nextjs-middleware',
    displayName: 'Next.js Middleware',
    description:
      'Implement middleware for authentication, redirects, and request modification. Use when adding route protection or request/response modification.',
    category: 'BACKEND',
    content: `# Next.js Middleware

## Basic Middleware
\`\`\`typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add custom header
  const response = NextResponse.next();
  response.headers.set('x-custom-header', 'value');
  return response;
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
};
\`\`\`

## Auth Protection
\`\`\`typescript
export function middleware(request: NextRequest) {
  const token = request.cookies.get('session');
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}
\`\`\``,
    tags: ['nextjs', 'middleware', 'auth', 'routing'],
    isOfficial: true,
  },
  {
    name: 'nextjs-parallel-routes',
    displayName: 'Next.js Parallel Routes',
    description:
      'Create parallel routes for complex layouts with independent loading states. Use when building dashboards or multi-panel UIs.',
    category: 'FRONTEND',
    content: `# Parallel Routes

## Directory Structure
\`\`\`
app/
├── layout.tsx
├── page.tsx
├── @analytics/
│   └── page.tsx
└── @team/
    └── page.tsx
\`\`\`

## Layout with Slots
\`\`\`tsx
// app/layout.tsx
export default function Layout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <main className="col-span-2">{children}</main>
      <aside>
        {analytics}
        {team}
      </aside>
    </div>
  );
}
\`\`\``,
    tags: ['nextjs', 'routing', 'layouts', 'parallel-routes'],
    isOfficial: true,
  },
  {
    name: 'nextjs-intercepting-routes',
    displayName: 'Next.js Intercepting Routes',
    description:
      'Intercept routes for modal patterns while preserving URL. Use when implementing modals that should be shareable via URL.',
    category: 'FRONTEND',
    content: `# Intercepting Routes

## Modal Pattern
\`\`\`
app/
├── feed/
│   └── page.tsx
├── photo/
│   └── [id]/
│       └── page.tsx
└── @modal/
    └── (.)photo/
        └── [id]/
            └── page.tsx
\`\`\`

## Interception Conventions
- \`(.)\` - Same level
- \`(..)\` - One level up
- \`(..)(..)\` - Two levels up
- \`(...)\` - From root

## Modal Component
\`\`\`tsx
// app/@modal/(.)photo/[id]/page.tsx
export default async function PhotoModal({ params }) {
  const { id } = await params;
  return (
    <Dialog>
      <Photo id={id} />
    </Dialog>
  );
}
\`\`\``,
    tags: ['nextjs', 'routing', 'modals', 'intercepting-routes'],
    isOfficial: true,
  },
  {
    name: 'react-suspense-patterns',
    displayName: 'React Suspense Patterns',
    description:
      'Use Suspense for loading states and streaming. Use when implementing loading UI, error boundaries, or progressive rendering.',
    category: 'FRONTEND',
    content: `# React Suspense

## Basic Suspense
\`\`\`tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      <Header />
      <Suspense fallback={<PostsSkeleton />}>
        <Posts />
      </Suspense>
    </div>
  );
}
\`\`\`

## Nested Suspense
\`\`\`tsx
<Suspense fallback={<PageSkeleton />}>
  <Header />
  <Suspense fallback={<SidebarSkeleton />}>
    <Sidebar />
  </Suspense>
  <Suspense fallback={<ContentSkeleton />}>
    <Content />
  </Suspense>
</Suspense>
\`\`\`

## Error Boundary
\`\`\`tsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<Error />}>
  <Suspense fallback={<Loading />}>
    <AsyncComponent />
  </Suspense>
</ErrorBoundary>
\`\`\``,
    tags: ['react', 'suspense', 'loading', 'streaming'],
    isOfficial: true,
  },
  {
    name: 'react-19-features',
    displayName: 'React 19 Features',
    description:
      'Use React 19 features including use(), Actions, and useOptimistic. Use when leveraging new React patterns.',
    category: 'FRONTEND',
    content: `# React 19 Features

## use() Hook
\`\`\`tsx
import { use } from 'react';

function Comments({ commentsPromise }) {
  const comments = use(commentsPromise);
  return comments.map(c => <Comment key={c.id} comment={c} />);
}
\`\`\`

## useOptimistic
\`\`\`tsx
import { useOptimistic } from 'react';

function Messages({ messages }) {
  const [optimistic, addOptimistic] = useOptimistic(
    messages,
    (state, newMessage) => [...state, { ...newMessage, sending: true }]
  );
  
  async function send(formData) {
    const message = { text: formData.get('text') };
    addOptimistic(message);
    await sendMessage(message);
  }
  
  return (
    <form action={send}>
      {optimistic.map(m => <Message key={m.id} message={m} />)}
    </form>
  );
}
\`\`\`

## useActionState
\`\`\`tsx
import { useActionState } from 'react';

function Form() {
  const [state, action, pending] = useActionState(submitAction, null);
  
  return (
    <form action={action}>
      <button disabled={pending}>
        {pending ? 'Submitting...' : 'Submit'}
      </button>
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}
\`\`\``,
    tags: ['react', 'react-19', 'hooks', 'actions'],
    isOfficial: true,
  },
  {
    name: 'typescript-generics',
    displayName: 'TypeScript Generics',
    description:
      'Write reusable type-safe code with TypeScript generics. Use when creating flexible APIs, utilities, or component props.',
    category: 'FRONTEND',
    content: `# TypeScript Generics

## Basic Generics
\`\`\`typescript
function identity<T>(value: T): T {
  return value;
}

const str = identity('hello'); // string
const num = identity(42); // number
\`\`\`

## Generic Constraints
\`\`\`typescript
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(item: T): T {
  console.log(item.length);
  return item;
}
\`\`\`

## Generic Components
\`\`\`tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map(renderItem)}</ul>;
}

<List
  items={users}
  renderItem={user => <li key={user.id}>{user.name}</li>}
/>
\`\`\`

## Utility Types
\`\`\`typescript
type Partial<T> = { [P in keyof T]?: T[P] };
type Required<T> = { [P in keyof T]-?: T[P] };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
\`\`\``,
    tags: ['typescript', 'generics', 'types', 'reusability'],
    isOfficial: true,
  },
  {
    name: 'typescript-utility-types',
    displayName: 'TypeScript Utility Types',
    description:
      'Use built-in and custom utility types for type manipulation. Use when transforming or deriving types.',
    category: 'FRONTEND',
    content: `# TypeScript Utility Types

## Built-in Utilities
\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

// Make all properties optional
type PartialUser = Partial<User>;

// Make all properties required
type RequiredUser = Required<User>;

// Pick specific properties
type UserPreview = Pick<User, 'id' | 'name'>;

// Omit specific properties
type UserWithoutEmail = Omit<User, 'email'>;

// Extract from union
type AdminRole = Extract<User['role'], 'admin'>;

// Exclude from union
type NonAdminRole = Exclude<User['role'], 'admin'>;
\`\`\`

## Record Type
\`\`\`typescript
type UserRoles = Record<string, User['role']>;
const roles: UserRoles = {
  alice: 'admin',
  bob: 'user',
};
\`\`\`

## ReturnType & Parameters
\`\`\`typescript
function createUser(name: string, email: string) {
  return { id: '1', name, email };
}

type UserReturn = ReturnType<typeof createUser>;
type UserParams = Parameters<typeof createUser>;
\`\`\``,
    tags: ['typescript', 'utility-types', 'types'],
    isOfficial: true,
  },
  {
    name: 'tailwind-responsive',
    displayName: 'Tailwind Responsive Design',
    description:
      'Build responsive layouts with Tailwind breakpoints. Use when creating mobile-first, adaptive designs.',
    category: 'STYLING',
    content: `# Tailwind Responsive Design

## Breakpoints
- \`sm\`: 640px
- \`md\`: 768px
- \`lg\`: 1024px
- \`xl\`: 1280px
- \`2xl\`: 1536px

## Mobile-First Pattern
\`\`\`tsx
<div className="
  grid grid-cols-1
  sm:grid-cols-2
  md:grid-cols-3
  lg:grid-cols-4
  gap-4
">
  {items.map(item => <Card key={item.id} />)}
</div>
\`\`\`

## Responsive Typography
\`\`\`tsx
<h1 className="text-2xl md:text-4xl lg:text-6xl font-bold">
  Responsive Heading
</h1>
\`\`\`

## Responsive Spacing
\`\`\`tsx
<section className="px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
  Content with responsive padding
</section>
\`\`\`

## Container
\`\`\`tsx
<div className="container mx-auto px-4">
  Centered content with max-width
</div>
\`\`\``,
    tags: ['tailwind', 'responsive', 'mobile-first', 'breakpoints'],
    isOfficial: true,
  },
  {
    name: 'tailwind-dark-mode',
    displayName: 'Tailwind Dark Mode',
    description:
      'Implement dark mode with Tailwind CSS. Use when adding theme switching or system preference detection.',
    category: 'STYLING',
    content: `# Tailwind Dark Mode

## Class-Based Dark Mode
\`\`\`tsx
// tailwind.config.ts
export default {
  darkMode: 'class',
};

// Component
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content adapts to theme
</div>
\`\`\`

## Theme Toggle
\`\`\`tsx
'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? <Sun /> : <Moon />}
    </button>
  );
}
\`\`\`

## CSS Variables for Theming
\`\`\`css
:root {
  --background: 255 255 255;
  --foreground: 10 10 10;
}

.dark {
  --background: 10 10 10;
  --foreground: 255 255 255;
}
\`\`\``,
    tags: ['tailwind', 'dark-mode', 'theming', 'css-variables'],
    isOfficial: true,
  },
  {
    name: 'prisma-relations',
    displayName: 'Prisma Relations',
    description:
      'Model database relationships with Prisma. Use when designing schemas with one-to-many, many-to-many, or self-relations.',
    category: 'DATABASE',
    content: `# Prisma Relations

## One-to-Many
\`\`\`prisma
model User {
  id    String @id @default(cuid())
  posts Post[]
}

model Post {
  id       String @id @default(cuid())
  author   User   @relation(fields: [authorId], references: [id])
  authorId String
}
\`\`\`

## Many-to-Many (Implicit)
\`\`\`prisma
model Post {
  id       String     @id @default(cuid())
  tags     Tag[]
}

model Tag {
  id    String @id @default(cuid())
  posts Post[]
}
\`\`\`

## Many-to-Many (Explicit)
\`\`\`prisma
model Post {
  id       String        @id @default(cuid())
  tags     PostOnTag[]
}

model Tag {
  id    String       @id @default(cuid())
  posts PostOnTag[]
}

model PostOnTag {
  post   Post   @relation(fields: [postId], references: [id])
  postId String
  tag    Tag    @relation(fields: [tagId], references: [id])
  tagId  String
  
  @@id([postId, tagId])
}
\`\`\`

## Self-Relation
\`\`\`prisma
model User {
  id        String  @id @default(cuid())
  followers User[]  @relation("UserFollows")
  following User[]  @relation("UserFollows")
}
\`\`\``,
    tags: ['prisma', 'database', 'relations', 'schema'],
    isOfficial: true,
  },
  {
    name: 'prisma-migrations',
    displayName: 'Prisma Migrations',
    description:
      'Manage database migrations with Prisma. Use when applying schema changes to production databases.',
    category: 'DATABASE',
    content: `# Prisma Migrations

## Development Workflow
\`\`\`bash
# Create and apply migration
bunx prisma migrate dev --name add_user_table

# Reset database (dev only)
bunx prisma migrate reset
\`\`\`

## Production Deployment
\`\`\`bash
# Apply pending migrations
bunx prisma migrate deploy

# Check migration status
bunx prisma migrate status
\`\`\`

## Generate Client
\`\`\`bash
bunx prisma generate
\`\`\`

## Push Without Migration (Dev)
\`\`\`bash
# Sync schema without creating migration
bunx prisma db push
\`\`\`

## Seed Data
\`\`\`typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { email: 'admin@example.com', name: 'Admin' },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
\`\`\``,
    tags: ['prisma', 'migrations', 'database', 'deployment'],
    isOfficial: true,
  },
  {
    name: 'bun-package-manager',
    displayName: 'Bun Package Manager',
    description:
      'Use Bun as a fast package manager and runtime. Use when managing dependencies or running scripts.',
    category: 'BUILD_TOOLS',
    content: `# Bun Package Manager

## Basic Commands
\`\`\`bash
# Install all dependencies
bun install

# Add dependency
bun add react

# Add dev dependency
bun add -D typescript

# Remove dependency
bun remove lodash

# Update dependencies
bun update
\`\`\`

## Running Scripts
\`\`\`bash
# Run package.json script
bun run dev

# Run TypeScript file directly
bun run script.ts

# Run with watch mode
bun --watch run dev
\`\`\`

## Lockfile
\`\`\`bash
# Uses bun.lockb (binary lockfile)
# Faster than npm/yarn lockfiles
\`\`\`

## Workspaces
\`\`\`json
// package.json
{
  "workspaces": ["apps/*", "packages/*"]
}
\`\`\`

## Run in Workspace
\`\`\`bash
bun run --filter @myapp/web dev
\`\`\``,
    tags: ['bun', 'package-manager', 'runtime', 'tooling'],
    isOfficial: true,
  },
  {
    name: 'turborepo-monorepo',
    displayName: 'Turborepo Monorepo',
    description:
      'Manage monorepos with Turborepo for fast builds and caching. Use when working with multi-package repositories.',
    category: 'BUILD_TOOLS',
    content: `# Turborepo

## Project Structure
\`\`\`
my-monorepo/
├── apps/
│   ├── web/
│   └── docs/
├── packages/
│   ├── ui/
│   └── config/
├── package.json
└── turbo.json
\`\`\`

## turbo.json
\`\`\`json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
\`\`\`

## Commands
\`\`\`bash
# Run all apps
turbo dev

# Run specific app
turbo dev --filter=web

# Build with cache
turbo build

# Run affected only
turbo build --filter=...[origin/main]
\`\`\``,
    tags: ['turborepo', 'monorepo', 'build', 'caching'],
    isOfficial: true,
  },
  {
    name: 'lucide-icons',
    displayName: 'Lucide Icons',
    description:
      'Use Lucide icons in React applications. Use when adding icons to UI components.',
    category: 'FRONTEND',
    content: `# Lucide Icons

## Installation
\`\`\`bash
bun add lucide-react
\`\`\`

## Basic Usage
\`\`\`tsx
import { Home, Settings, User, Mail } from 'lucide-react';

<Home className="h-5 w-5" />
<Settings className="h-5 w-5 text-muted-foreground" />
<User className="h-6 w-6 text-primary" />
\`\`\`

## With Button
\`\`\`tsx
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

<Button>
  <Plus className="mr-2 h-4 w-4" />
  Add Item
</Button>
\`\`\`

## Dynamic Icons
\`\`\`tsx
import * as Icons from 'lucide-react';

interface IconProps {
  name: keyof typeof Icons;
  className?: string;
}

function Icon({ name, className }: IconProps) {
  const LucideIcon = Icons[name] as React.ComponentType<{ className?: string }>;
  return <LucideIcon className={className} />;
}

<Icon name="Home" className="h-5 w-5" />
\`\`\``,
    tags: ['lucide', 'icons', 'react', 'ui'],
    isOfficial: true,
  },
  {
    name: 'sonner-toasts',
    displayName: 'Sonner Toast Notifications',
    description:
      'Show toast notifications with Sonner. Use when providing user feedback for actions.',
    category: 'FRONTEND',
    content: `# Sonner Toasts

## Setup
\`\`\`tsx
// app/layout.tsx
import { Toaster } from 'sonner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
\`\`\`

## Usage
\`\`\`tsx
import { toast } from 'sonner';

// Success
toast.success('Item saved successfully');

// Error
toast.error('Failed to save item');

// Loading
const id = toast.loading('Saving...');
await save();
toast.success('Saved!', { id });

// With description
toast.success('Item saved', {
  description: 'Your changes have been saved.',
});

// Promise
toast.promise(saveData(), {
  loading: 'Saving...',
  success: 'Saved!',
  error: 'Failed to save',
});

// With action
toast('Item deleted', {
  action: {
    label: 'Undo',
    onClick: () => undoDelete(),
  },
});
\`\`\``,
    tags: ['sonner', 'toasts', 'notifications', 'feedback'],
    isOfficial: true,
  },
  {
    name: 'react-flow-diagrams',
    displayName: 'React Flow Diagrams',
    description:
      'Build node-based diagrams with React Flow. Use when creating flowcharts, workflows, or visual editors.',
    category: 'FRONTEND',
    content: `# React Flow

## Basic Setup
\`\`\`tsx
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const nodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Start' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: 'End' } },
];

const edges = [
  { id: 'e1-2', source: '1', target: '2' },
];

function Flow() {
  return (
    <div style={{ height: 500 }}>
      <ReactFlow nodes={nodes} edges={edges}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
\`\`\`

## Custom Node
\`\`\`tsx
function CustomNode({ data }) {
  return (
    <div className="px-4 py-2 rounded bg-primary text-white">
      {data.label}
    </div>
  );
}

const nodeTypes = { custom: CustomNode };

<ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} />
\`\`\``,
    tags: ['react-flow', 'diagrams', 'flowcharts', 'visualization'],
    isOfficial: true,
  },
  {
    name: 'date-handling',
    displayName: 'Date Handling',
    description:
      'Work with dates using date-fns or native APIs. Use when formatting, parsing, or manipulating dates.',
    category: 'TOOLING',
    content: `# Date Handling

## date-fns
\`\`\`typescript
import { format, parseISO, addDays, differenceInDays } from 'date-fns';

// Format
format(new Date(), 'MMM d, yyyy'); // "Jan 16, 2026"
format(new Date(), 'EEEE, MMMM do'); // "Thursday, January 16th"

// Parse ISO string
const date = parseISO('2026-01-16T10:00:00Z');

// Add days
const nextWeek = addDays(new Date(), 7);

// Difference
const days = differenceInDays(endDate, startDate);
\`\`\`

## Relative Time
\`\`\`typescript
import { formatDistanceToNow } from 'date-fns';

formatDistanceToNow(new Date('2026-01-10'), { addSuffix: true });
// "6 days ago"
\`\`\`

## Intl.DateTimeFormat
\`\`\`typescript
const formatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

formatter.format(new Date()); // "Jan 16, 2026, 10:30 AM"
\`\`\``,
    tags: ['dates', 'date-fns', 'formatting', 'time'],
    isOfficial: true,
  },
  {
    name: 'file-uploads',
    displayName: 'File Uploads',
    description:
      'Handle file uploads in Next.js applications. Use when implementing file input, validation, or cloud storage.',
    category: 'FULLSTACK',
    content: `# File Uploads

## Form Upload
\`\`\`tsx
'use client';

function UploadForm() {
  async function handleSubmit(formData: FormData) {
    const file = formData.get('file') as File;
    
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    
    await fetch('/api/upload', {
      method: 'POST',
      body: uploadFormData,
    });
  }
  
  return (
    <form action={handleSubmit}>
      <input type="file" name="file" accept="image/*" />
      <button type="submit">Upload</button>
    </form>
  );
}
\`\`\`

## API Route Handler
\`\`\`typescript
// app/api/upload/route.ts
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Save to filesystem or upload to cloud
  // await fs.writeFile(path, buffer);
  // await uploadToS3(buffer, file.name);
  
  return Response.json({ success: true });
}
\`\`\``,
    tags: ['uploads', 'files', 'forms', 'storage'],
    isOfficial: true,
  },
  {
    name: 'websockets-realtime',
    displayName: 'WebSockets & Realtime',
    description:
      'Implement realtime features with WebSockets or Pusher. Use when building chat, notifications, or live updates.',
    category: 'FULLSTACK',
    content: `# Realtime Features

## Pusher Setup
\`\`\`typescript
// lib/pusher.ts
import Pusher from 'pusher';
import PusherClient from 'pusher-js';

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER! }
);
\`\`\`

## Subscribe to Channel
\`\`\`tsx
'use client';

import { useEffect } from 'react';
import { pusherClient } from '@/lib/pusher';

function Chat({ roomId }: { roomId: string }) {
  useEffect(() => {
    const channel = pusherClient.subscribe(\`room-\${roomId}\`);
    
    channel.bind('new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });
    
    return () => {
      pusherClient.unsubscribe(\`room-\${roomId}\`);
    };
  }, [roomId]);
}
\`\`\`

## Trigger Event
\`\`\`typescript
// API Route
await pusherServer.trigger(\`room-\${roomId}\`, 'new-message', {
  id: message.id,
  text: message.text,
  userId: message.userId,
});
\`\`\``,
    tags: ['websockets', 'realtime', 'pusher', 'chat'],
    isOfficial: true,
  },
  {
    name: 'url-search-params',
    displayName: 'URL Search Params',
    description:
      'Manage URL state with searchParams in Next.js. Use when implementing filters, pagination, or shareable state.',
    category: 'FRONTEND',
    content: `# URL Search Params

## Reading in Server Component
\`\`\`tsx
// app/search/page.tsx
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  
  const results = await search(q, Number(page) || 1);
  
  return <Results data={results} />;
}
\`\`\`

## Client-Side Navigation
\`\`\`tsx
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

function Filters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    router.push(\`\${pathname}?\${params.toString()}\`);
  }
  
  return (
    <select onChange={e => updateFilter('sort', e.target.value)}>
      <option value="newest">Newest</option>
      <option value="oldest">Oldest</option>
    </select>
  );
}
\`\`\``,
    tags: ['nextjs', 'url', 'search-params', 'routing'],
    isOfficial: true,
  },
];

async function main() {
  console.log('🚀 Seeding final skills...');

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

  console.log(`\n✅ Seeded ${skills.length} final skills`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
