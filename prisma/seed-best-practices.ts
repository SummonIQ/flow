import { PrismaClient, AppType } from '@prisma/client';

const prisma = new PrismaClient();

const bestPractices = [
  // Web App - Code Style
  {
    name: 'Component Structure & Organization',
    topic: 'Code Style',
    appType: AppType.WEB_APP,
    description: 'Guidelines for organizing React components in web applications',
    tags: ['react', 'typescript', 'components'],
    priority: 10,
    content: `# Component Structure & Organization

## File Organization
- One component per file (except tiny helpers)
- Name files in kebab-case: \`user-profile.tsx\`
- Colocate components with their routes when route-specific
- Shared components go in \`@/components\`

## Component Structure
\`\`\`typescript
// 1. Imports (grouped)
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';

// 2. Types/Interfaces
interface Props {
  user: User;
  onUpdate: (user: User) => void;
}

// 3. Component (named export, never React.FC)
export function UserProfile({ user, onUpdate }: Props) {
  // 4. Hooks (at top)
  const [isEditing, setIsEditing] = useState(false);
  
  // 5. Event handlers
  const handleSave = () => {
    // ...
  };
  
  // 6. Derived values
  const fullName = \`\${user.firstName} \${user.lastName}\`;
  
  // 7. Early returns
  if (!user) return null;
  
  // 8. Main render
  return <div>{/* ... */}</div>;
}
\`\`\`

## Naming Conventions
- ✅ Use PascalCase for components
- ✅ Use camelCase for functions/variables
- ✅ Use descriptive names: \`handleUserUpdate\` not \`handle\`
- ❌ Don't use \`any\` type
- ❌ Don't create barrel exports in App Router`,
  },

  // Web App - Security
  {
    name: 'Authentication & Authorization',
    topic: 'Security',
    appType: AppType.WEB_APP,
    description: 'Security best practices for auth in web apps',
    tags: ['security', 'auth', 'nextjs'],
    priority: 10,
    content: `# Authentication & Authorization

## Server Components & Route Protection
\`\`\`typescript
// app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/sign-in');
  }
  
  // Fetch data server-side
  const data = await getData(session.user.id);
  
  return <Dashboard data={data} />;
}
\`\`\`

## API Route Protection
\`\`\`typescript
// app/api/users/route.ts
import { getServerSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getServerSession();
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Verify permissions
  if (!session.user.roles.includes('admin')) {
    return new Response('Forbidden', { status: 403 });
  }
  
  // Process request
}
\`\`\`

## Security Checklist
- ✅ Use httpOnly cookies for tokens
- ✅ Implement CSRF protection
- ✅ Validate all inputs with Zod
- ✅ Use environment variables for secrets
- ✅ Implement rate limiting
- ❌ Never expose API keys in client code
- ❌ Never trust client-side validation alone`,
  },

  // Web App - Performance
  {
    name: 'Next.js Performance Optimization',
    topic: 'Performance',
    appType: AppType.WEB_APP,
    description: 'Performance best practices for Next.js applications',
    tags: ['performance', 'nextjs', 'optimization'],
    priority: 9,
    content: `# Next.js Performance Optimization

## Server Components (Default)
\`\`\`typescript
// No 'use client' directive = Server Component
export async function ProductList() {
  const products = await getProducts(); // Server-side
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
\`\`\`

## Client Components (Only When Needed)
\`\`\`typescript
'use client'; // Only for interactivity

export function SearchFilter({ onFilter }: Props) {
  const [query, setQuery] = useState('');
  
  return (
    <input
      value={query}
      onChange={e => setQuery(e.target.value)}
    />
  );
}
\`\`\`

## Caching with \`use cache\` (Next.js 16)
\`\`\`typescript
'use cache';

export async function getProducts() {
  const products = await db.products.findMany();
  return products;
}
\`\`\`

## Image Optimization
\`\`\`typescript
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority // For above-fold images
  placeholder="blur"
/>
\`\`\`

## Performance Checklist
- ✅ Use Server Components by default
- ✅ Add Client Components only for interactivity
- ✅ Use Next.js Image component
- ✅ Implement caching strategies
- ✅ Lazy load below-fold content
- ✅ Target <2s FCP, >80 Lighthouse score`,
  },

  // API - Code Style
  {
    name: 'API Route Organization',
    topic: 'Code Style',
    appType: AppType.API,
    description: 'Best practices for organizing API routes and controllers',
    tags: ['api', 'routes', 'controllers'],
    priority: 10,
    content: `# API Route Organization

## Folder Structure
\`\`\`
src/
├── routes/
│   ├── users.ts
│   ├── posts.ts
│   └── auth.ts
├── controllers/
│   ├── userController.ts
│   ├── postController.ts
│   └── authController.ts
├── services/
│   ├── userService.ts
│   └── emailService.ts
├── middleware/
│   ├── auth.ts
│   └── validation.ts
└── types/
    └── index.ts
\`\`\`

## Controller Pattern
\`\`\`typescript
// controllers/userController.ts
export class UserController {
  async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await userService.findById(id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
\`\`\`

## Route Definition
\`\`\`typescript
// routes/users.ts
import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validateUser } from '../middleware/validation';

const router = Router();
const controller = new UserController();

router.get('/:id', authenticate, controller.getUser);
router.post('/', authenticate, validateUser, controller.createUser);
router.patch('/:id', authenticate, validateUser, controller.updateUser);
router.delete('/:id', authenticate, controller.deleteUser);

export default router;
\`\`\`

## Best Practices
- ✅ Separate routes, controllers, and services
- ✅ Use middleware for cross-cutting concerns
- ✅ Implement proper error handling
- ✅ Version your API (\`/api/v1\`)
- ✅ Use TypeScript for type safety`,
  },

  // API - Error Handling
  {
    name: 'Centralized Error Handling',
    topic: 'Error Handling',
    appType: AppType.API,
    description: 'Implementing robust error handling in APIs',
    tags: ['error-handling', 'api', 'middleware'],
    priority: 10,
    content: `# Centralized Error Handling

## Custom Error Classes
\`\`\`typescript
// errors/AppError.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, \`\${resource} not found\`);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}
\`\`\`

## Error Handling Middleware
\`\`\`typescript
// middleware/errorHandler.ts
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
}
\`\`\`

## Usage in Controllers
\`\`\`typescript
export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.findById(req.params.id);
    
    if (!user) {
      throw new NotFoundError('User');
    }
    
    return res.json(user);
  } catch (error) {
    next(error);
  }
}
\`\`\`

## Best Practices
- ✅ Use custom error classes
- ✅ Centralize error handling
- ✅ Log errors appropriately
- ✅ Don't expose internal details in production
- ✅ Return consistent error responses`,
  },

  // Mobile App - Code Style
  {
    name: 'React Native Component Patterns',
    topic: 'Code Style',
    appType: AppType.MOBILE_APP,
    description: 'Best practices for React Native components',
    tags: ['react-native', 'expo', 'components'],
    priority: 10,
    content: `# React Native Component Patterns

## Component Structure
\`\`\`typescript
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function CustomButton({ title, onPress, variant = 'primary' }: Props) {
  const [pressed, setPressed] = useState(false);
  
  return (
    <TouchableOpacity
      style={[styles.button, styles[\`button_\${variant}\`]]}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  button_primary: {
    backgroundColor: '#007AFF',
  },
  button_secondary: {
    backgroundColor: '#8E8E93',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
\`\`\`

## Performance Optimization
\`\`\`typescript
import { memo } from 'react';
import { FlatList } from 'react-native';

const ListItem = memo(({ item }: { item: Item }) => (
  <View>{/* Item content */}</View>
));

export function ItemList({ items }: Props) {
  return (
    <FlatList
      data={items}
      renderItem={({ item }) => <ListItem item={item} />}
      keyExtractor={item => item.id}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
}
\`\`\`

## Best Practices
- ✅ Use StyleSheet.create for styles
- ✅ Memoize components with React.memo
- ✅ Use FlatList for long lists
- ✅ Implement proper loading states
- ✅ Handle platform differences with Platform.OS`,
  },

  // Mobile App - Performance
  {
    name: 'Mobile Performance & Optimization',
    topic: 'Performance',
    appType: AppType.MOBILE_APP,
    description: 'Performance best practices for mobile apps',
    tags: ['performance', 'react-native', 'optimization'],
    priority: 9,
    content: `# Mobile Performance & Optimization

## Optimize Images
\`\`\`typescript
import { Image } from 'expo-image';

// Use Expo Image for better performance
<Image
  source={{ uri: imageUrl }}
  contentFit="cover"
  placeholder={blurhash}
  transition={200}
  style={{ width: 300, height: 200 }}
/>
\`\`\`

## Avoid Anonymous Functions in Render
\`\`\`typescript
// ❌ Bad - creates new function on every render
<TouchableOpacity onPress={() => handlePress(item.id)}>

// ✅ Good - memoize or use useCallback
const handleItemPress = useCallback(() => {
  handlePress(item.id);
}, [item.id]);

<TouchableOpacity onPress={handleItemPress}>
\`\`\`

## Use React.memo for Heavy Components
\`\`\`typescript
const ExpensiveComponent = memo(({ data }: Props) => {
  return (
    <View>{/* Complex rendering */}</View>
  );
}, (prev, next) => {
  // Custom comparison
  return prev.data.id === next.data.id;
});
\`\`\`

## Optimize FlatList
\`\`\`typescript
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  // Performance props
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  windowSize={5}
  initialNumToRender={10}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
\`\`\`

## Performance Checklist
- ✅ Use Expo Image for images
- ✅ Memoize expensive components
- ✅ Avoid inline functions in render
- ✅ Use FlatList for lists
- ✅ Implement pagination
- ✅ Monitor using React Native Performance
- ✅ Profile with Flipper`,
  },

  // Library - Code Style
  {
    name: 'Library API Design',
    topic: 'Code Style',
    appType: AppType.LIBRARY,
    description: 'Best practices for designing library APIs',
    tags: ['library', 'api-design', 'typescript'],
    priority: 10,
    content: `# Library API Design

## Export Structure
\`\`\`typescript
// src/index.ts
export { Button } from './components/Button';
export { Input } from './components/Input';
export type { ButtonProps, InputProps } from './types';

// Named exports for tree-shaking
export * from './utils';
\`\`\`

## Type-Safe API
\`\`\`typescript
// Provide excellent TypeScript support
export interface Config {
  apiKey: string;
  timeout?: number;
  retries?: number;
}

export function createClient(config: Config) {
  // Validate at runtime too
  if (!config.apiKey) {
    throw new Error('apiKey is required');
  }
  
  return {
    get: async <T>(url: string): Promise<T> => {
      // Implementation
    },
  };
}
\`\`\`

## Flexible Options Pattern
\`\`\`typescript
interface Options {
  theme?: 'light' | 'dark';
  locale?: string;
  onError?: (error: Error) => void;
}

export function init(options: Options = {}) {
  const config = {
    theme: options.theme ?? 'light',
    locale: options.locale ?? 'en',
    onError: options.onError ?? console.error,
  };
  
  return config;
}
\`\`\`

## Best Practices
- ✅ Use named exports for tree-shaking
- ✅ Provide TypeScript definitions
- ✅ Make APIs intuitive and consistent
- ✅ Document with JSDoc comments
- ✅ Version with semantic versioning
- ✅ Minimize dependencies
- ❌ Don't use default exports
- ❌ Don't break backward compatibility`,
  },

  // Library - Testing
  {
    name: 'Comprehensive Testing Strategy',
    topic: 'Testing',
    appType: AppType.LIBRARY,
    description: 'Testing best practices for libraries',
    tags: ['testing', 'vitest', 'library'],
    priority: 10,
    content: `# Comprehensive Testing Strategy

## Unit Tests
\`\`\`typescript
import { describe, it, expect } from 'vitest';
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('formats ISO date to readable format', () => {
    const result = formatDate('2024-01-15');
    expect(result).toBe('January 15, 2024');
  });
  
  it('handles invalid dates gracefully', () => {
    const result = formatDate('invalid');
    expect(result).toBe('Invalid date');
  });
  
  it('supports custom formats', () => {
    const result = formatDate('2024-01-15', 'MM/DD/YYYY');
    expect(result).toBe('01/15/2024');
  });
});
\`\`\`

## Integration Tests
\`\`\`typescript
describe('API Client', () => {
  it('fetches data correctly', async () => {
    const client = createClient({ apiKey: 'test' });
    const data = await client.get('/users');
    
    expect(data).toHaveLength(3);
    expect(data[0]).toHaveProperty('id');
  });
});
\`\`\`

## Test Coverage
\`\`\`json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
\`\`\`

## Testing Checklist
- ✅ Aim for >80% code coverage
- ✅ Test edge cases and errors
- ✅ Test public API surface
- ✅ Use meaningful test names
- ✅ Mock external dependencies
- ✅ Run tests in CI/CD`,
  },

  // Architecture - All App Types
  {
    name: 'Clean Architecture Principles',
    topic: 'Architecture',
    appType: AppType.WEB_APP,
    description: 'Fundamental architecture principles',
    tags: ['architecture', 'clean-code', 'patterns'],
    priority: 8,
    content: `# Clean Architecture Principles

## Separation of Concerns
\`\`\`
┌─────────────────────────────────────┐
│         Presentation Layer          │
│  (Components, Pages, UI Logic)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Application Layer           │
│   (Business Logic, Use Cases)       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Domain Layer                │
│    (Entities, Domain Logic)         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Infrastructure Layer           │
│  (Database, APIs, External Services)│
└─────────────────────────────────────┘
\`\`\`

## Dependency Rule
Dependencies point inward - inner layers don't know about outer layers.

\`\`\`typescript
// ✅ Good - Domain doesn't depend on infrastructure
interface UserRepository {
  findById(id: string): Promise<User>;
}

class UserService {
  constructor(private repo: UserRepository) {}
  
  async getUser(id: string) {
    return this.repo.findById(id);
  }
}

// Infrastructure implements interface
class PrismaUserRepository implements UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }
}
\`\`\`

## Single Responsibility Principle
Each module should have one reason to change.

\`\`\`typescript
// ❌ Bad - multiple responsibilities
class UserManager {
  validate() {}
  save() {}
  sendEmail() {}
  generateReport() {}
}

// ✅ Good - single responsibility
class UserValidator {
  validate(user: User) {}
}

class UserRepository {
  save(user: User) {}
}

class EmailService {
  sendWelcomeEmail(user: User) {}
}
\`\`\`

## Best Practices
- ✅ Keep components small and focused
- ✅ Use dependency injection
- ✅ Program to interfaces, not implementations
- ✅ Follow SOLID principles
- ✅ Keep business logic separate from UI`,
  },

  // Web App - State Management
  {
    name: 'State Management with React & TanStack Query',
    topic: 'Architecture',
    appType: AppType.WEB_APP,
    description: 'Modern state management patterns for Next.js apps',
    tags: ['state', 'tanstack-query', 'react'],
    priority: 9,
    content: `# State Management with React & TanStack Query

## Server State vs Client State

**Server State** (TanStack Query):
- Data from APIs
- Database records
- Remote resources

**Client State** (React State/Context):
- UI state (modals, forms)
- User preferences
- Local interactions

## TanStack Query for Server State

\`\`\`typescript
// hooks/useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ProjectInput) => {
      const res = await fetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
\`\`\`

## React Context for UI State

\`\`\`typescript
// contexts/ThemeContext.tsx
'use client';

import { createContext, useContext, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
\`\`\`

## Best Practices
- ✅ Use TanStack Query for server state
- ✅ Use React Context for global UI state
- ✅ Keep useState for local component state
- ✅ Implement optimistic updates for better UX
- ✅ Set appropriate staleTime and cacheTime
- ❌ Don't put server state in Context
- ❌ Don't use Redux unless absolutely necessary`,
  },

  // Web App - Form Handling
  {
    name: 'Form Handling with Server Actions',
    topic: 'Best Practices',
    appType: AppType.WEB_APP,
    description: 'Modern form handling in Next.js with Server Actions',
    tags: ['forms', 'server-actions', 'validation'],
    priority: 9,
    content: `# Form Handling with Server Actions

## Server Action Pattern

\`\`\`typescript
// actions/user.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const userSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  role: z.enum(['admin', 'user']),
});

export async function createUser(formData: FormData) {
  // Validate
  const result = userSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
  });

  if (!result.success) {
    return { 
      success: false, 
      error: result.error.errors[0].message 
    };
  }

  // Create user
  const user = await db.user.create({ data: result.data });

  // Revalidate
  revalidatePath('/users');

  return { success: true, data: user };
}
\`\`\`

## Client Component with useActionState

\`\`\`typescript
'use client';

import { useActionState } from 'react';
import { createUser } from '@/actions/user';

export function UserForm() {
  const [state, formAction, pending] = useActionState(createUser, null);

  return (
    <form action={formAction}>
      <input name="name" required />
      <input name="email" type="email" required />
      <select name="role">
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      
      <button type="submit" disabled={pending}>
        {pending ? 'Creating...' : 'Create User'}
      </button>
      
      {state?.error && (
        <div className="text-red-500">{state.error}</div>
      )}
    </form>
  );
}
\`\`\`

## With React Hook Form

\`\`\`typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const result = await signIn(data);
    if (!result.success) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">Sign In</button>
    </form>
  );
}
\`\`\`

## Best Practices
- ✅ Always validate on server with Zod
- ✅ Use Server Actions for mutations
- ✅ Implement loading states
- ✅ Show validation errors clearly
- ✅ Use revalidatePath/revalidateTag after mutations
- ✅ Implement optimistic updates when appropriate
- ❌ Don't trust client-side validation alone`,
  },

  // Web App - Data Fetching
  {
    name: 'Data Fetching Strategies in Next.js',
    topic: 'Performance',
    appType: AppType.WEB_APP,
    description: 'Optimal data fetching patterns for Next.js applications',
    tags: ['data-fetching', 'nextjs', 'performance'],
    priority: 10,
    content: `# Data Fetching Strategies in Next.js

## Server Components (Default - Fetch on Server)

\`\`\`typescript
// app/products/page.tsx
export default async function ProductsPage() {
  // Fetch directly in Server Component
  const products = await fetch('https://api.example.com/products', {
    next: { revalidate: 3600 } // Revalidate every hour
  }).then(res => res.json());

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
\`\`\`

## Parallel Data Fetching

\`\`\`typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  // Fetch in parallel
  const [user, projects, analytics] = await Promise.all([
    getUser(),
    getProjects(),
    getAnalytics(),
  ]);

  return (
    <div>
      <UserHeader user={user} />
      <ProjectsList projects={projects} />
      <AnalyticsChart data={analytics} />
    </div>
  );
}
\`\`\`

## Sequential Data Fetching (When Dependencies Exist)

\`\`\`typescript
export default async function UserProjectsPage({ params }: Props) {
  // First fetch user
  const user = await getUser(params.userId);
  
  // Then fetch user's projects (depends on user)
  const projects = await getProjects(user.id);

  return <ProjectsList user={user} projects={projects} />;
}
\`\`\`

## Streaming with Suspense

\`\`\`typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <div>
      <UserHeader /> {/* Renders immediately */}
      
      <Suspense fallback={<ProjectsSkeleton />}>
        <Projects /> {/* Streams in when ready */}
      </Suspense>
      
      <Suspense fallback={<AnalyticsSkeleton />}>
        <Analytics /> {/* Streams in when ready */}
      </Suspense>
    </div>
  );
}

async function Projects() {
  const projects = await getProjects();
  return <ProjectsList projects={projects} />;
}
\`\`\`

## Client-Side with TanStack Query

\`\`\`typescript
'use client';

import { useQuery } from '@tanstack/react-query';

export function LiveDataComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['liveData'],
    queryFn: fetchLiveData,
    refetchInterval: 5000, // Refetch every 5s
  });

  if (isLoading) return <Spinner />;
  return <div>{data}</div>;
}
\`\`\`

## Caching Strategies

\`\`\`typescript
// Static - cached indefinitely
fetch(url, { cache: 'force-cache' })

// Dynamic - fetch fresh every time
fetch(url, { cache: 'no-store' })

// Revalidate - cached with time-based revalidation
fetch(url, { next: { revalidate: 3600 } })

// Tag-based - revalidate with tags
fetch(url, { next: { tags: ['projects'] } })
\`\`\`

## Best Practices
- ✅ Use Server Components for initial data fetch
- ✅ Implement parallel fetching when possible
- ✅ Use Suspense boundaries for streaming
- ✅ Set appropriate cache/revalidation strategies
- ✅ Use TanStack Query for client-side fetching
- ✅ Handle loading and error states
- ❌ Don't fetch on client when server fetch is possible
- ❌ Don't fetch sequentially when parallel is possible`,
  },

  // Web App & Marketing Site - SEO
  {
    name: 'SEO & Metadata Best Practices',
    topic: 'Best Practices',
    appType: AppType.WEB_APP,
    description: 'SEO optimization for Next.js applications',
    tags: ['seo', 'metadata', 'nextjs'],
    priority: 8,
    content: `# SEO & Metadata Best Practices

## Static Metadata

\`\`\`typescript
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | My App',
    default: 'My App',
  },
  description: 'App description for search engines',
  keywords: ['nextjs', 'react', 'typescript'],
  authors: [{ name: 'Your Name' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://myapp.com',
    siteName: 'My App',
    images: [
      {
        url: 'https://myapp.com/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@myapp',
  },
};
\`\`\`

## Dynamic Metadata

\`\`\`typescript
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}
\`\`\`

## Structured Data (JSON-LD)

\`\`\`typescript
export default function BlogPostPage({ post }: Props) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>{/* Post content */}</article>
    </>
  );
}
\`\`\`

## Sitemap

\`\`\`typescript
// app/sitemap.ts
export default async function sitemap() {
  const posts = await getPosts();
  
  const postUrls = posts.map(post => ({
    url: \`https://myapp.com/blog/\${post.slug}\`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: 'https://myapp.com',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    ...postUrls,
  ];
}
\`\`\`

## Robots.txt

\`\`\`typescript
// app/robots.ts
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/', '/api/'],
    },
    sitemap: 'https://myapp.com/sitemap.xml',
  };
}
\`\`\`

## Best Practices
- ✅ Set unique titles and descriptions for each page
- ✅ Use Open Graph tags for social sharing
- ✅ Implement structured data (JSON-LD)
- ✅ Generate sitemap.xml dynamically
- ✅ Use semantic HTML tags
- ✅ Optimize images with next/image
- ✅ Implement proper heading hierarchy (h1, h2, h3)
- ❌ Don't duplicate content
- ❌ Don't use too many keywords (keyword stuffing)`,
  },

  // Marketing Site - SEO (duplicate with different app type)
  {
    name: 'SEO & Metadata Best Practices',
    topic: 'Best Practices',
    appType: AppType.MARKETING_SITE,
    description: 'SEO optimization for marketing sites',
    tags: ['seo', 'metadata', 'marketing'],
    priority: 10,
    content: `# SEO & Metadata Best Practices

## Static Metadata

\`\`\`typescript
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | My App',
    default: 'My App',
  },
  description: 'App description for search engines',
  keywords: ['nextjs', 'react', 'typescript'],
  authors: [{ name: 'Your Name' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://myapp.com',
    siteName: 'My App',
    images: [
      {
        url: 'https://myapp.com/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@myapp',
  },
};
\`\`\`

## Dynamic Metadata

\`\`\`typescript
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}
\`\`\`

## Best Practices
- ✅ Set unique titles and descriptions for each page
- ✅ Use Open Graph tags for social sharing
- ✅ Implement structured data (JSON-LD)
- ✅ Generate sitemap.xml dynamically
- ✅ Use semantic HTML tags
- ✅ Optimize images with next/image
- ✅ Implement proper heading hierarchy (h1, h2, h3)
- ❌ Don't duplicate content
- ❌ Don't use too many keywords (keyword stuffing)`,
  },

  // Web App - Styling
  {
    name: 'Styling with Tailwind CSS',
    topic: 'Code Style',
    appType: AppType.WEB_APP,
    description: 'Best practices for styling with Tailwind CSS',
    tags: ['tailwind', 'css', 'styling'],
    priority: 8,
    content: `# Styling with Tailwind CSS

## Component-Based Styling

\`\`\`typescript
// components/Button.tsx
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  children,
  className,
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-md font-medium',
        'transition-colors focus-visible:outline-none focus-visible:ring-2',
        // Variants
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
          'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
          'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
        },
        // Sizes
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4 text-base': size === 'md',
          'h-12 px-6 text-lg': size === 'lg',
        },
        // Custom classes
        className
      )}
    >
      {children}
    </button>
  );
}
\`\`\`

## Responsive Design

\`\`\`tsx
<div className="
  grid grid-cols-1      // Mobile: 1 column
  sm:grid-cols-2        // Small: 2 columns
  md:grid-cols-3        // Medium: 3 columns
  lg:grid-cols-4        // Large: 4 columns
  gap-4                 // Gap between items
">
  {items.map(item => <Card key={item.id} />)}
</div>
\`\`\`

## Dark Mode

\`\`\`tsx
<div className="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-gray-100
  border border-gray-200 dark:border-gray-800
">
  Content
</div>
\`\`\`

## Custom Design Tokens

\`\`\`typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          900: '#0c4a6e',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
};
\`\`\`

## Best Practices
- ✅ Use cn() utility for conditional classes
- ✅ Extract repeated patterns into components
- ✅ Use Tailwind's design tokens
- ✅ Implement responsive design mobile-first
- ✅ Use dark mode classes
- ✅ Leverage Tailwind's built-in utilities
- ❌ Don't use inline styles
- ❌ Don't create custom CSS when Tailwind has it
- ❌ Don't use arbitrary values excessively`,
  },
];

async function main() {
  console.log('🌱 Seeding best practices...\n');

  // Clear existing practices
  await prisma.bestPractice.deleteMany({});
  console.log('✓ Cleared existing practices\n');

  let created = 0;

  for (const practice of bestPractices) {
    try {
      await prisma.bestPractice.create({
        data: {
          ...practice,
          isDefault: true,
        },
      });
      console.log(`  ✓ Created: ${practice.name} (${practice.appType})`);
      created++;
    } catch (error) {
      console.error(`  ✗ Failed to create: ${practice.name}`, error);
    }
  }

  // Duplicate some practices for other app types
  const universalPractices = [
    bestPractices.find(p => p.name === 'Clean Architecture Principles'),
  ].filter(Boolean);

  const otherAppTypes = [
    AppType.DESKTOP_APP,
    AppType.API,
    AppType.MOBILE_APP,
    AppType.MARKETING_SITE,
    AppType.MONOREPO,
    AppType.CLI,
    AppType.EXTENSION,
  ];

  for (const practice of universalPractices) {
    if (!practice) continue;
    
    for (const appType of otherAppTypes) {
      if (appType === practice.appType) continue;
      
      try {
        await prisma.bestPractice.create({
          data: {
            ...practice,
            appType,
            isDefault: true,
          },
        });
        created++;
      } catch (error) {
        // Silently skip duplicates
      }
    }
  }

  console.log(`\n✅ Seed complete! Created ${created} best practices.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
