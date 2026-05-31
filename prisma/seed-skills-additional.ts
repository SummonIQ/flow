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
  // ==================== BACKEND ====================
  {
    name: 'prisma-orm',
    displayName: 'Prisma ORM',
    description:
      'Database operations with Prisma ORM including schema design, queries, relations, and migrations. Use when working with databases in TypeScript projects.',
    category: 'DATABASE',
    content: `# Prisma ORM Patterns

## Schema Definition
\`\`\`prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id       String @id @default(cuid())
  title    String
  author   User   @relation(fields: [authorId], references: [id])
  authorId String
}
\`\`\`

## CRUD Operations
\`\`\`typescript
// Create
const user = await prisma.user.create({
  data: { email: 'test@example.com', name: 'Test' }
});

// Read
const users = await prisma.user.findMany({
  where: { email: { contains: '@example.com' } },
  include: { posts: true }
});

// Update
await prisma.user.update({
  where: { id: userId },
  data: { name: 'Updated Name' }
});

// Delete
await prisma.user.delete({ where: { id: userId } });
\`\`\`

## Transactions
\`\`\`typescript
await prisma.$transaction([
  prisma.user.create({ data: userData }),
  prisma.post.create({ data: postData })
]);
\`\`\``,
    tags: ['prisma', 'database', 'orm', 'postgresql', 'typescript'],
    isOfficial: true,
  },
  {
    name: 'server-actions',
    displayName: 'Next.js Server Actions',
    description:
      'Create and use Server Actions for form submissions and mutations. Use when handling form data, updating database, or triggering server-side logic.',
    category: 'BACKEND',
    content: `# Server Actions

## Basic Server Action
\`\`\`typescript
'use server';

import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  
  await db.post.create({ data: { title } });
  revalidatePath('/posts');
}
\`\`\`

## With Validation (Zod)
\`\`\`typescript
'use server';

import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(10),
});

export async function createPost(formData: FormData) {
  const validated = schema.parse({
    title: formData.get('title'),
    content: formData.get('content'),
  });
  
  await db.post.create({ data: validated });
  revalidatePath('/posts');
  return { success: true };
}
\`\`\`

## Using in Forms
\`\`\`tsx
<form action={createPost}>
  <input name="title" required />
  <button type="submit">Create</button>
</form>
\`\`\`

## With useActionState
\`\`\`tsx
'use client';
import { useActionState } from 'react';

function Form() {
  const [state, action, pending] = useActionState(createPost, null);
  
  return (
    <form action={action}>
      <button disabled={pending}>
        {pending ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
\`\`\``,
    tags: ['nextjs', 'server-actions', 'forms', 'mutations'],
    isOfficial: true,
  },
  {
    name: 'api-route-handlers',
    displayName: 'API Route Handlers',
    description:
      'Create RESTful API endpoints with Next.js Route Handlers. Use when building APIs, handling webhooks, or creating backend endpoints.',
    category: 'API',
    content: `# API Route Handlers

## Basic GET/POST
\`\`\`typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await db.user.findMany();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await db.user.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
\`\`\`

## Dynamic Routes
\`\`\`typescript
// app/api/users/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await db.user.findUnique({ where: { id } });
  
  if (!user) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  return NextResponse.json(user);
}
\`\`\`

## Error Handling
\`\`\`typescript
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await processData(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
\`\`\``,
    tags: ['nextjs', 'api', 'rest', 'routes', 'backend'],
    isOfficial: true,
  },
  {
    name: 'zod-validation',
    displayName: 'Zod Schema Validation',
    description:
      'Validate data with Zod schemas for type-safe runtime validation. Use when validating forms, API inputs, or environment variables.',
    category: 'BACKEND',
    content: `# Zod Validation

## Basic Schemas
\`\`\`typescript
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});

type User = z.infer<typeof userSchema>;
\`\`\`

## Validation
\`\`\`typescript
// Safe parsing (returns result object)
const result = userSchema.safeParse(data);
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error.issues);
}

// Throws on error
const user = userSchema.parse(data);
\`\`\`

## Advanced Patterns
\`\`\`typescript
// Refinements
const passwordSchema = z.string()
  .min(8)
  .refine(val => /[A-Z]/.test(val), 'Must contain uppercase')
  .refine(val => /[0-9]/.test(val), 'Must contain number');

// Transforms
const dateSchema = z.string().transform(str => new Date(str));

// Discriminated unions
const eventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('click'), x: z.number(), y: z.number() }),
  z.object({ type: z.literal('scroll'), delta: z.number() }),
]);
\`\`\`

## Form Validation
\`\`\`typescript
export async function createUser(formData: FormData) {
  const validated = userSchema.parse({
    name: formData.get('name'),
    email: formData.get('email'),
  });
  
  await db.user.create({ data: validated });
}
\`\`\``,
    tags: ['zod', 'validation', 'typescript', 'schemas', 'forms'],
    isOfficial: true,
  },
  // ==================== TESTING ====================
  {
    name: 'playwright-testing',
    displayName: 'Playwright E2E Testing',
    description:
      'Write end-to-end tests with Playwright for web applications. Use when testing user flows, forms, or UI interactions.',
    category: 'TESTING',
    content: `# Playwright Testing

## Basic Test
\`\`\`typescript
import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/My App/);
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
});
\`\`\`

## Form Testing
\`\`\`typescript
test('user can submit form', async ({ page }) => {
  await page.goto('/contact');
  
  await page.getByLabel('Name').fill('John Doe');
  await page.getByLabel('Email').fill('john@example.com');
  await page.getByRole('button', { name: 'Submit' }).click();
  
  await expect(page.getByText('Thank you')).toBeVisible();
});
\`\`\`

## Navigation Testing
\`\`\`typescript
test('navigation works', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL('/about');
});
\`\`\`

## API Testing
\`\`\`typescript
test('API returns users', async ({ request }) => {
  const response = await request.get('/api/users');
  expect(response.ok()).toBeTruthy();
  
  const users = await response.json();
  expect(users).toHaveLength(5);
});
\`\`\`

## Page Object Pattern
\`\`\`typescript
class LoginPage {
  constructor(private page: Page) {}
  
  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }
}
\`\`\``,
    tags: ['playwright', 'testing', 'e2e', 'automation'],
    isOfficial: true,
  },
  // ==================== ARCHITECTURE ====================
  {
    name: 'component-architecture',
    displayName: 'Component Architecture',
    description:
      'Structure React components following best practices for reusability and maintainability. Use when designing component hierarchies or refactoring.',
    category: 'ARCHITECTURE',
    content: `# Component Architecture

## File Structure
\`\`\`
components/
├── ui/           # Primitive components (Button, Input, Card)
├── features/     # Feature-specific components
├── layouts/      # Layout components
└── shared/       # Shared utilities
\`\`\`

## Component Composition
\`\`\`tsx
// Compound component pattern
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
\`\`\`

## Props Interface
\`\`\`tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  loading,
  children,
  ...props 
}: ButtonProps) {
  return (
    <button className={cn(variants[variant], sizes[size])} {...props}>
      {loading ? <Spinner /> : children}
    </button>
  );
}
\`\`\`

## Separation of Concerns
\`\`\`tsx
// Container (logic)
function UserListContainer() {
  const { data, isLoading } = useUsers();
  return <UserList users={data} loading={isLoading} />;
}

// Presentational (UI)
function UserList({ users, loading }: Props) {
  if (loading) return <Skeleton />;
  return users.map(user => <UserCard key={user.id} user={user} />);
}
\`\`\``,
    tags: ['react', 'architecture', 'components', 'patterns'],
    isOfficial: true,
  },
  // ==================== STATE MANAGEMENT ====================
  {
    name: 'zustand-state',
    displayName: 'Zustand State Management',
    description:
      'Manage global state with Zustand for React applications. Use when you need shared state across components without prop drilling.',
    category: 'STATE_MANAGEMENT',
    content: `# Zustand State Management

## Basic Store
\`\`\`typescript
import { create } from 'zustand';

interface CounterStore {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useCounter = create<CounterStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
\`\`\`

## Using in Components
\`\`\`tsx
function Counter() {
  const { count, increment, decrement } = useCounter();
  
  return (
    <div>
      <span>{count}</span>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}
\`\`\`

## Async Actions
\`\`\`typescript
interface UserStore {
  user: User | null;
  loading: boolean;
  fetchUser: (id: string) => Promise<void>;
}

export const useUser = create<UserStore>((set) => ({
  user: null,
  loading: false,
  fetchUser: async (id) => {
    set({ loading: true });
    const user = await api.getUser(id);
    set({ user, loading: false });
  },
}));
\`\`\`

## Persist Middleware
\`\`\`typescript
import { persist } from 'zustand/middleware';

export const useSettings = create(
  persist<SettingsStore>(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'settings' }
  )
);
\`\`\``,
    tags: ['zustand', 'state-management', 'react', 'store'],
    isOfficial: true,
  },
  // ==================== PERFORMANCE ====================
  {
    name: 'react-performance',
    displayName: 'React Performance Optimization',
    description:
      'Optimize React applications for better performance. Use when debugging slow renders, reducing bundle size, or improving UX.',
    category: 'PERFORMANCE',
    content: `# React Performance

## Memoization
\`\`\`tsx
// Memoize expensive computations
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Memoize components
const MemoizedComponent = React.memo(ExpensiveComponent);
\`\`\`

## Code Splitting
\`\`\`tsx
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false,
});
\`\`\`

## Virtualization
\`\`\`tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });
  
  return (
    <div ref={parentRef} style={{ height: 400, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div key={virtualItem.key} style={{
            position: 'absolute',
            top: virtualItem.start,
            height: virtualItem.size,
          }}>
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
\`\`\`

## Image Optimization
\`\`\`tsx
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // For above-the-fold images
  placeholder="blur"
/>
\`\`\``,
    tags: ['react', 'performance', 'optimization', 'memoization'],
    isOfficial: true,
  },
  // ==================== ACCESSIBILITY ====================
  {
    name: 'accessibility-patterns',
    displayName: 'Accessibility Patterns',
    description:
      'Build accessible web applications following WCAG guidelines. Use when creating interactive components or ensuring keyboard navigation.',
    category: 'ACCESSIBILITY',
    content: `# Accessibility Patterns

## Semantic HTML
\`\`\`tsx
// Use semantic elements
<nav aria-label="Main navigation">
  <ul role="list">
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Article Title</h1>
    <p>Content...</p>
  </article>
</main>
\`\`\`

## Keyboard Navigation
\`\`\`tsx
function Button({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      {children}
    </button>
  );
}
\`\`\`

## Focus Management
\`\`\`tsx
function Modal({ isOpen, onClose }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      closeRef.current?.focus();
    }
  }, [isOpen]);
  
  return (
    <dialog open={isOpen} aria-modal="true">
      <button ref={closeRef} onClick={onClose}>
        Close
      </button>
    </dialog>
  );
}
\`\`\`

## ARIA Labels
\`\`\`tsx
<button aria-label="Close dialog" aria-describedby="dialog-description">
  <XIcon aria-hidden="true" />
</button>

<div role="alert" aria-live="polite">
  {errorMessage}
</div>
\`\`\`

## Skip Links
\`\`\`tsx
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
\`\`\``,
    tags: ['accessibility', 'a11y', 'wcag', 'aria', 'keyboard'],
    isOfficial: true,
  },
  // ==================== ERROR HANDLING ====================
  {
    name: 'error-handling',
    displayName: 'Error Handling Patterns',
    description:
      'Handle errors gracefully in React and Next.js applications. Use when implementing error boundaries, API error handling, or user feedback.',
    category: 'DEBUGGING',
    content: `# Error Handling

## Error Boundaries
\`\`\`tsx
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
\`\`\`

## API Error Handling
\`\`\`typescript
async function fetchData<T>(url: string): Promise<Result<T>> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      return { 
        success: false, 
        error: \`HTTP \${response.status}\` 
      };
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
\`\`\`

## Form Error Display
\`\`\`tsx
function Form() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  return (
    <form>
      <input 
        name="email" 
        aria-invalid={!!errors.email}
        aria-describedby={errors.email ? 'email-error' : undefined}
      />
      {errors.email && (
        <span id="email-error" role="alert">
          {errors.email}
        </span>
      )}
    </form>
  );
}
\`\`\`

## Toast Notifications
\`\`\`tsx
import { toast } from 'sonner';

async function handleSubmit() {
  try {
    await submitForm(data);
    toast.success('Saved successfully');
  } catch (error) {
    toast.error('Failed to save');
  }
}
\`\`\``,
    tags: ['error-handling', 'debugging', 'errors', 'resilience'],
    isOfficial: true,
  },
];

async function main() {
  console.log('🚀 Seeding additional skills...');

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

  console.log(`\n✅ Seeded ${skills.length} additional skills`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
