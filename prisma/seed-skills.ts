import { PrismaClient, SkillCategory } from '@prisma/client';

const prisma = new PrismaClient();

interface SkillSeed {
  name: string;
  displayName: string;
  description: string;
  category: SkillCategory;
  content: string;
  license?: string;
  compatibility?: string;
  author?: string;
  version?: string;
  allowedTools?: string[];
  tags: string[];
  isOfficial?: boolean;
}

const skills: SkillSeed[] = [
  // ==================== FRONTEND ====================
  {
    name: 'nextjs-app-router',
    displayName: 'Next.js App Router',
    description:
      'Build applications with Next.js 16 App Router patterns including Server Components, Server Actions, and streaming. Use when creating pages, layouts, or routes in Next.js.',
    category: 'FRONTEND',
    content: `# Next.js App Router Patterns

## Server Components (Default)
- All components in \`app/\` are Server Components by default
- Can directly access databases, file system, and secrets
- Cannot use hooks, browser APIs, or event handlers

## Client Components
\`\`\`tsx
'use client';
import { useState } from 'react';
export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
\`\`\`

## Page Structure
\`\`\`tsx
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const data = await fetchData(); // Server-side fetch
  return <Dashboard data={data} />;
}
\`\`\`

## Layouts
\`\`\`tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
\`\`\`

## Server Actions
\`\`\`tsx
'use server';
export async function createItem(formData: FormData) {
  const name = formData.get('name');
  await db.item.create({ data: { name } });
  revalidatePath('/items');
}
\`\`\`

## Route Handlers
\`\`\`tsx
// app/api/items/route.ts
export async function GET() {
  const items = await db.item.findMany();
  return Response.json(items);
}
\`\`\``,
    license: 'MIT',
    author: 'SummonIQ',
    version: '1.0.0',
    tags: ['nextjs', 'react', 'app-router', 'server-components', 'ssr'],
    isOfficial: true,
  },
  {
    name: 'react-server-components',
    displayName: 'React Server Components',
    description:
      'Implement React Server Components for optimal performance. Use when deciding component boundaries, data fetching patterns, or optimizing bundle size.',
    category: 'FRONTEND',
    content: `# React Server Components

## When to Use Server Components
- Data fetching from databases/APIs
- Accessing backend resources
- Keeping sensitive data on server
- Large dependencies that should stay on server

## When to Use Client Components
- Interactivity (onClick, onChange)
- Browser APIs (localStorage, geolocation)
- React hooks (useState, useEffect)
- Class components

## Composition Pattern
\`\`\`tsx
// ServerComponent.tsx (no directive needed)
import { ClientButton } from './ClientButton';

export async function ServerComponent() {
  const data = await fetchData();
  return (
    <div>
      <h1>{data.title}</h1>
      <ClientButton onClick={() => {}} />
    </div>
  );
}
\`\`\`

## Passing Server Data to Client
\`\`\`tsx
// Pass serializable props only
<ClientComponent 
  initialData={await getData()} 
  userId={session.userId}
/>
\`\`\`

## Streaming with Suspense
\`\`\`tsx
<Suspense fallback={<Loading />}>
  <SlowComponent />
</Suspense>
\`\`\``,
    license: 'MIT',
    author: 'SummonIQ',
    version: '1.0.0',
    tags: ['react', 'server-components', 'performance', 'ssr'],
    isOfficial: true,
  },
  {
    name: 'typescript-strict-mode',
    displayName: 'TypeScript Strict Mode',
    description:
      'Write type-safe TypeScript with strict mode enabled. Use when defining types, interfaces, handling nullability, or fixing type errors.',
    category: 'FRONTEND',
    content: `# TypeScript Strict Mode Best Practices

## Essential tsconfig.json
\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
\`\`\`

## Type-Safe Patterns

### Discriminated Unions
\`\`\`typescript
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

function handleResult<T>(result: Result<T>) {
  if (result.success) {
    console.log(result.data); // T
  } else {
    console.error(result.error); // string
  }
}
\`\`\`

### Exhaustive Checks
\`\`\`typescript
type Status = 'pending' | 'approved' | 'rejected';

function getLabel(status: Status): string {
  switch (status) {
    case 'pending': return 'Pending';
    case 'approved': return 'Approved';
    case 'rejected': return 'Rejected';
    default:
      const _exhaustive: never = status;
      return _exhaustive;
  }
}
\`\`\`

### Type Guards
\`\`\`typescript
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value
  );
}
\`\`\`

### Branded Types
\`\`\`typescript
type UserId = string & { readonly brand: unique symbol };
type OrderId = string & { readonly brand: unique symbol };

function createUserId(id: string): UserId {
  return id as UserId;
}
\`\`\``,
    license: 'MIT',
    author: 'SummonIQ',
    version: '1.0.0',
    tags: ['typescript', 'types', 'strict-mode', 'type-safety'],
    isOfficial: true,
  },
  {
    name: 'tailwind-css-patterns',
    displayName: 'Tailwind CSS Patterns',
    description:
      'Style components with Tailwind CSS v4 using utility classes and design tokens. Use when styling UI, creating responsive layouts, or implementing dark mode.',
    category: 'STYLING',
    content: `# Tailwind CSS v4 Patterns

## Class Merging with cn()
\`\`\`tsx
import { cn } from '@/lib/utils';

function Button({ className, variant, ...props }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md font-medium',
        variant === 'primary' && 'bg-primary text-white',
        variant === 'secondary' && 'bg-secondary text-foreground',
        className
      )}
      {...props}
    />
  );
}
\`\`\`

## Responsive Design
\`\`\`tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>
\`\`\`

## Dark Mode
\`\`\`tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content adapts to theme
</div>
\`\`\`

## Custom Theme Tokens (globals.css)
\`\`\`css
@theme {
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --radius-default: 0.5rem;
}
\`\`\`

## Animation Classes
\`\`\`tsx
<div className="animate-fade-in transition-all duration-300 hover:scale-105">
  Animated element
</div>
\`\`\`

## Group and Peer Modifiers
\`\`\`tsx
<div className="group">
  <button>Hover me</button>
  <div className="opacity-0 group-hover:opacity-100">
    Appears on hover
  </div>
</div>
\`\`\``,
    license: 'MIT',
    author: 'SummonIQ',
    version: '1.0.0',
    tags: ['tailwind', 'css', 'styling', 'responsive', 'dark-mode'],
    isOfficial: true,
  },
  {
    name: 'react-hooks-patterns',
    displayName: 'React Hooks Patterns',
    description:
      'Use React hooks effectively including useState, useEffect, useMemo, useCallback, and custom hooks. Use when adding state or effects to components.',
    category: 'FRONTEND',
    content: `# React Hooks Best Practices

## useState with Complex State
\`\`\`tsx
const [form, setForm] = useState({ name: '', email: '' });
const updateField = (field: string, value: string) => {
  setForm(prev => ({ ...prev, [field]: value }));
};
\`\`\`

## useEffect Cleanup
\`\`\`tsx
useEffect(() => {
  const controller = new AbortController();
  
  fetch('/api/data', { signal: controller.signal })
    .then(res => res.json())
    .then(setData);
  
  return () => controller.abort();
}, []);
\`\`\`

## useMemo for Expensive Computations
\`\`\`tsx
const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}, [items]);
\`\`\`

## useCallback for Stable References
\`\`\`tsx
const handleSubmit = useCallback(async (data: FormData) => {
  await submitForm(data);
  router.push('/success');
}, [router]);
\`\`\`

## Custom Hook Pattern
\`\`\`tsx
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue] as const;
}
\`\`\``,
    license: 'MIT',
    author: 'SummonIQ',
    version: '1.0.0',
    tags: ['react', 'hooks', 'state', 'effects', 'custom-hooks'],
    isOfficial: true,
  },
];

async function main() {
  console.log('🚀 Seeding skills...');

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {
        displayName: skill.displayName,
        description: skill.description,
        category: skill.category,
        content: skill.content,
        license: skill.license,
        compatibility: skill.compatibility,
        author: skill.author,
        version: skill.version,
        allowedTools: skill.allowedTools ?? [],
        tags: skill.tags,
        isOfficial: skill.isOfficial ?? false,
      },
      create: {
        name: skill.name,
        displayName: skill.displayName,
        description: skill.description,
        category: skill.category,
        content: skill.content,
        license: skill.license,
        compatibility: skill.compatibility,
        author: skill.author,
        version: skill.version,
        allowedTools: skill.allowedTools ?? [],
        tags: skill.tags,
        isOfficial: skill.isOfficial ?? false,
      },
    });
    console.log(`  ✓ ${skill.displayName}`);
  }

  console.log(`\n✅ Seeded ${skills.length} skills`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
