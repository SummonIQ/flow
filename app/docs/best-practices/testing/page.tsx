import { TestTube2, CheckCircle2, XCircle, List, Play } from "lucide-react";

export default function TestingBestPracticesPage() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <TestTube2 className="w-4 h-4" />
            Testing Best Practices
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Testing Strategy & Best Practices
          </h1>
          <p className="text-xl text-muted-foreground">
            Comprehensive testing patterns using Vitest, React Testing Library,
            and Playwright for reliable applications.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="rounded-lg border border-border bg-muted/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <List className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">On This Page</h2>
          </div>
          <nav className="grid sm:grid-cols-2 gap-2 text-sm">
            <a href="#testing-strategy" className="text-muted-foreground hover:text-foreground transition-colors">
              Testing Strategy
            </a>
            <a href="#unit-tests" className="text-muted-foreground hover:text-foreground transition-colors">
              Unit Tests (Vitest)
            </a>
            <a href="#component-tests" className="text-muted-foreground hover:text-foreground transition-colors">
              Component Tests (RTL)
            </a>
            <a href="#e2e-tests" className="text-muted-foreground hover:text-foreground transition-colors">
              E2E Tests (Playwright)
            </a>
            <a href="#test-organization" className="text-muted-foreground hover:text-foreground transition-colors">
              Test Organization
            </a>
            <a href="#best-practices" className="text-muted-foreground hover:text-foreground transition-colors">
              Best Practices
            </a>
          </nav>
        </div>

        {/* Testing Strategy */}
        <div className="space-y-6" id="testing-strategy">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Play className="w-6 h-6" />
            Testing Strategy
          </h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Testing Pyramid</h3>
            <p className="text-sm text-muted-foreground">
              Follow the testing pyramid approach for optimal test coverage:
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  1
                </div>
                <div>
                  <strong className="text-foreground">Unit Tests (70%)</strong>
                  <p className="text-muted-foreground mt-1">
                    Fast, isolated tests for functions, utilities, and hooks using <strong>Vitest</strong>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  2
                </div>
                <div>
                  <strong className="text-foreground">Component Tests (20%)</strong>
                  <p className="text-muted-foreground mt-1">
                    Test React components in isolation using <strong>React Testing Library</strong>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  3
                </div>
                <div>
                  <strong className="text-foreground">E2E Tests (10%)</strong>
                  <p className="text-muted-foreground mt-1">
                    Critical user flows and integration tests using <strong>Playwright</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Tech Stack</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-primary">Vitest</h4>
                <p className="text-xs text-muted-foreground">
                  Fast unit test framework with Vite integration
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-primary">React Testing Library</h4>
                <p className="text-xs text-muted-foreground">
                  Component testing focused on user behavior
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-primary">Playwright</h4>
                <p className="text-xs text-muted-foreground">
                  E2E testing across multiple browsers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Unit Tests */}
        <div className="space-y-6" id="unit-tests">
          <h2 className="text-2xl font-bold">Unit Tests with Vitest</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Basic Unit Test Structure</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// lib/utils/format.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from './format';

describe('formatCurrency', () => {
  it('formats positive numbers correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats negative numbers correctly', () => {
    expect(formatCurrency(-99.99)).toBe('-$99.99');
  });

  it('handles zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('rounds to two decimal places', () => {
    expect(formatCurrency(10.999)).toBe('$11.00');
  });
});

describe('formatDate', () => {
  it('formats dates in ISO format', () => {
    const date = new Date('2024-01-15T12:00:00Z');
    expect(formatDate(date)).toBe('2024-01-15');
  });

  it('handles invalid dates', () => {
    expect(formatDate(null)).toBe('Invalid Date');
  });
});`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Testing Async Functions</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// lib/api/users.test.ts
import { describe, it, expect, vi } from 'vitest';
import { fetchUser, createUser } from './users';

describe('fetchUser', () => {
  it('fetches user successfully', async () => {
    const user = await fetchUser('user-123');

    expect(user).toBeDefined();
    expect(user.id).toBe('user-123');
    expect(user.email).toBeTruthy();
  });

  it('throws error for invalid user ID', async () => {
    await expect(fetchUser('invalid')).rejects.toThrow('User not found');
  });
});

describe('createUser', () => {
  it('creates user with valid data', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    const user = await createUser(userData);

    expect(user.id).toBeTruthy();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
  });
});`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Mocking with Vitest</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// lib/api/posts.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPosts } from './posts';
import { db } from '@/lib/db';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    post: {
      findMany: vi.fn(),
    },
  },
}));

describe('getPosts', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('returns posts from database', async () => {
    const mockPosts = [
      { id: '1', title: 'Post 1' },
      { id: '2', title: 'Post 2' },
    ];

    vi.mocked(db.post.findMany).mockResolvedValue(mockPosts);

    const posts = await getPosts();

    expect(posts).toEqual(mockPosts);
    expect(db.post.findMany).toHaveBeenCalledTimes(1);
  });

  it('handles database errors', async () => {
    vi.mocked(db.post.findMany).mockRejectedValue(
      new Error('Database error')
    );

    await expect(getPosts()).rejects.toThrow('Database error');
  });
});`}
            </pre>
          </div>
        </div>

        {/* Component Tests */}
        <div className="space-y-6" id="component-tests">
          <h2 className="text-2xl font-bold">Component Tests with React Testing Library</h2>

          <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  Test User Behavior, Not Implementation
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  Focus on testing components from the user's perspective. Query by
                  accessible roles and labels, not internal implementation details.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Basic Component Test</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// components/button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies correct variant class', () => {
    render(<Button variant="destructive">Delete</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive');
  });
});`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Testing Forms</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// components/login-form.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from './login-form';

describe('LoginForm', () => {
  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<LoginForm onSubmit={handleSubmit} />);

    // Fill in the form
    await user.type(
      screen.getByLabelText(/email/i),
      'user@example.com'
    );
    await user.type(
      screen.getByLabelText(/password/i),
      'password123'
    );

    // Submit
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });
  });

  it('displays validation errors', async () => {
    const user = userEvent.setup();

    render(<LoginForm onSubmit={vi.fn()} />);

    // Submit without filling form
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<LoginForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });
});`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Testing Async Data Loading</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// components/user-profile.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserProfile } from './user-profile';
import { getUserById } from '@/lib/api/users';

vi.mock('@/lib/api/users');

describe('UserProfile', () => {
  it('displays loading state initially', () => {
    vi.mocked(getUserById).mockReturnValue(
      new Promise(() => {}) // Never resolves
    );

    render(<UserProfile userId="123" />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays user data when loaded', async () => {
    vi.mocked(getUserById).mockResolvedValue({
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
    });

    render(<UserProfile userId="123" />);

    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('displays error message on failure', async () => {
    vi.mocked(getUserById).mockRejectedValue(
      new Error('Failed to fetch user')
    );

    render(<UserProfile userId="123" />);

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });
});`}
            </pre>
          </div>
        </div>

        {/* E2E Tests */}
        <div className="space-y-6" id="e2e-tests">
          <h2 className="text-2xl font-bold">E2E Tests with Playwright</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Basic E2E Test</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can sign in', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill in the form
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL('/dashboard');

    // Verify we're on the dashboard
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    // Error message should appear
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();

    // Should still be on login page
    expect(page.url()).toContain('/login');
  });

  test('user can sign out', async ({ page }) => {
    // Assume user is already authenticated
    await page.goto('/dashboard');

    // Click user menu
    await page.click('[data-testid="user-menu"]');

    // Click sign out
    await page.click('text=Sign Out');

    // Should redirect to home or login
    await page.waitForURL('/');
  });
});`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Testing Critical User Flows</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// tests/e2e/create-post.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Create Post Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Log in before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('creates and publishes a post', async ({ page }) => {
    // Go to create post page
    await page.click('text=New Post');
    await page.waitForURL('/posts/new');

    // Fill in post details
    await page.fill('input[name="title"]', 'My Test Post');
    await page.fill('textarea[name="content"]', 'This is test content');

    // Select category
    await page.click('select[name="category"]');
    await page.click('option:has-text("Technology")');

    // Upload image
    await page.setInputFiles(
      'input[type="file"]',
      'tests/fixtures/test-image.jpg'
    );

    // Publish
    await page.click('button:has-text("Publish")');

    // Should redirect to post page
    await page.waitForURL(/\\/posts\\/[^/]+$/);

    // Verify post content
    await expect(page.getByRole('heading', { name: 'My Test Post' })).toBeVisible();
    await expect(page.getByText('This is test content')).toBeVisible();

    // Verify in posts list
    await page.goto('/posts');
    await expect(page.getByText('My Test Post')).toBeVisible();
  });

  test('saves draft when not published', async ({ page }) => {
    await page.goto('/posts/new');

    await page.fill('input[name="title"]', 'Draft Post');
    await page.fill('textarea[name="content"]', 'Draft content');

    // Save as draft
    await page.click('button:has-text("Save Draft")');

    // Should show success message
    await expect(page.getByText(/saved as draft/i)).toBeVisible();

    // Go to drafts page
    await page.goto('/posts/drafts');
    await expect(page.getByText('Draft Post')).toBeVisible();
  });
});`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Playwright Configuration</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'bun dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});`}
            </pre>
          </div>
        </div>

        {/* Test Organization */}
        <div className="space-y-6" id="test-organization">
          <h2 className="text-2xl font-bold">Test Organization</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">File Structure</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`project-root/
├── lib/
│   ├── utils/
│   │   ├── format.ts
│   │   └── format.test.ts       # Unit tests next to source
│   └── api/
│       ├── users.ts
│       └── users.test.ts
│
├── components/
│   ├── button.tsx
│   ├── button.test.tsx          # Component tests next to component
│   └── forms/
│       ├── login-form.tsx
│       └── login-form.test.tsx
│
├── tests/
│   ├── e2e/                     # E2E tests separate
│   │   ├── auth.spec.ts
│   │   ├── posts.spec.ts
│   │   └── checkout.spec.ts
│   ├── fixtures/                # Test data
│   │   ├── test-image.jpg
│   │   └── mock-data.json
│   └── helpers/                 # Test utilities
│       ├── setup.ts
│       └── test-utils.tsx
│
├── vitest.config.ts
└── playwright.config.ts`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Test Utilities</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// tests/helpers/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { ThemeProvider } from '@/components/theme-provider';

interface AllTheProvidersProps {
  children: React.ReactNode;
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };`}
            </pre>
          </div>
        </div>

        {/* Best Practices */}
        <div className="space-y-6" id="best-practices">
          <h2 className="text-2xl font-bold">Testing Best Practices</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-green-700 dark:text-green-300">Do</h3>
              </div>
              <ul className="text-xs text-green-600 dark:text-green-300 space-y-1">
                <li>✓ Test user behavior, not implementation</li>
                <li>✓ Use accessible queries (getByRole, getByLabelText)</li>
                <li>✓ Write descriptive test names</li>
                <li>✓ Keep tests simple and focused</li>
                <li>✓ Test error states and edge cases</li>
                <li>✓ Use waitFor for async updates</li>
                <li>✓ Mock external dependencies</li>
                <li>✓ Use data-testid sparingly</li>
              </ul>
            </div>

            <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="font-semibold text-red-700 dark:text-red-300">Don't</h3>
              </div>
              <ul className="text-xs text-red-600 dark:text-red-300 space-y-1">
                <li>✗ Test implementation details</li>
                <li>✗ Use querySelector or getByClassName</li>
                <li>✗ Write tests that depend on each other</li>
                <li>✗ Test third-party library internals</li>
                <li>✗ Skip accessibility in tests</li>
                <li>✗ Use arbitrary wait times (setTimeout)</li>
                <li>✗ Mock everything</li>
                <li>✗ Write brittle selectors</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Running Tests</h3>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-[1fr,2fr] gap-4 items-start font-mono">
                <code className="text-primary">bun test</code>
                <span className="text-muted-foreground">Run all unit/component tests</span>
              </div>
              <div className="grid grid-cols-[1fr,2fr] gap-4 items-start font-mono">
                <code className="text-primary">bun test:watch</code>
                <span className="text-muted-foreground">Run tests in watch mode</span>
              </div>
              <div className="grid grid-cols-[1fr,2fr] gap-4 items-start font-mono">
                <code className="text-primary">bun test:coverage</code>
                <span className="text-muted-foreground">Generate coverage report</span>
              </div>
              <div className="grid grid-cols-[1fr,2fr] gap-4 items-start font-mono">
                <code className="text-primary">bun test:e2e</code>
                <span className="text-muted-foreground">Run Playwright E2E tests</span>
              </div>
              <div className="grid grid-cols-[1fr,2fr] gap-4 items-start font-mono">
                <code className="text-primary">bun test:e2e:ui</code>
                <span className="text-muted-foreground">Open Playwright UI</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-6">
          <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-4">
            Quick Reference: Testing Best Practices
          </h3>
          <ul className="text-sm text-amber-600 dark:text-amber-300 space-y-2">
            <li>✓ Follow the testing pyramid (70% unit, 20% component, 10% E2E)</li>
            <li>✓ Use Vitest for fast unit tests</li>
            <li>✓ Use React Testing Library for component tests</li>
            <li>✓ Use Playwright for E2E tests of critical flows</li>
            <li>✓ Test user behavior, not implementation details</li>
            <li>✓ Use accessible queries (getByRole, getByLabelText)</li>
            <li>✓ Mock external dependencies and APIs</li>
            <li>✓ Write descriptive test names that explain behavior</li>
            <li>✓ Keep tests isolated and independent</li>
            <li>✓ Test error states and edge cases</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
