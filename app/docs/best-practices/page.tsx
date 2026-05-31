import {
  BookOpen,
  Code2,
  FileCode,
  Layout,
  Palette,
  TestTube,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function BestPracticesPage() {
  return (
    <div className="container mx-auto px-0 max-w-5xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <BookOpen className="w-4 h-4" />
            Best Practices
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Development Best Practices
          </h1>
          <p className="text-xl text-muted-foreground">
            Proven patterns, conventions, and best practices for building
            high-quality applications in this ecosystem.
          </p>
        </div>

        {/* Introduction */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-lg">
            This guide documents the best practices, coding standards, and
            architectural patterns that ensure consistency, maintainability, and
            performance across all projects. Follow these guidelines to write
            clean, efficient, and scalable code.
          </p>
        </div>

        {/* Best Practices Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/best-practices/nextjs"
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">
                  Next.js 16 Best Practices
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                App Router patterns, Server Components, Server Actions, caching
                strategies, and file organization conventions.
              </p>
            </div>
          </Link>

          <Link
            href="/best-practices/typescript"
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <FileCode className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">TypeScript Patterns</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Type safety patterns, interface design, generics, utility types,
                and Zod validation integration.
              </p>
            </div>
          </Link>

          <Link
            href="/best-practices/tailwind"
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Palette className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">
                  Tailwind CSS Conventions
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Utility-first CSS patterns, responsive design, dark mode, custom
                utilities, and component styling strategies.
              </p>
            </div>
          </Link>

          <Link
            href="/best-practices/components"
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Layout className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">Component Patterns</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Component architecture, composition patterns, prop design,
                children patterns, and reusability strategies.
              </p>
            </div>
          </Link>

          <Link
            href="/best-practices/performance"
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">
                  Performance Optimization
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Bundle optimization, image optimization, lazy loading, code
                splitting, and performance monitoring.
              </p>
            </div>
          </Link>

          <Link
            href="/best-practices/testing"
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <TestTube className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">Testing</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Unit testing with Vitest, component testing with React Testing
                Library, and E2E testing with Playwright.
              </p>
            </div>
          </Link>
        </div>

        {/* Key Principles */}
        <div className="space-y-4 rounded-lg border border-border bg-muted/50 p-6">
          <h2 className="text-2xl font-bold">Core Development Principles</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                1
              </div>
              <div>
                <strong className="font-semibold">Type Safety First</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Use TypeScript strict mode and validate all inputs with Zod.
                  Leverage type inference and avoid{' '}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    any
                  </code>
                  .
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                2
              </div>
              <div>
                <strong className="font-semibold">
                  Server-First Architecture
                </strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Default to Server Components. Only use Client Components when
                  you need interactivity, browser APIs, or state.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                3
              </div>
              <div>
                <strong className="font-semibold">
                  Accessibility by Default
                </strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Use semantic HTML, ARIA attributes, keyboard navigation, and
                  test with screen readers. Radix UI provides accessible
                  primitives.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                4
              </div>
              <div>
                <strong className="font-semibold">Performance Matters</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Optimize images, minimize JavaScript, leverage caching, and
                  measure Core Web Vitals regularly.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                5
              </div>
              <div>
                <strong className="font-semibold">
                  Consistent Conventions
                </strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Follow established naming conventions, file organization, and
                  code style. Consistency reduces cognitive load.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Quick Reference */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Quick Reference</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold mb-2 text-sm">Naming Conventions</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Components: PascalCase</li>
                <li>• Functions: camelCase</li>
                <li>• Files: kebab-case</li>
                <li>• Constants: UPPER_SNAKE_CASE</li>
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold mb-2 text-sm">File Organization</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Feature-based structure</li>
                <li>• Colocate related files</li>
                <li>• Use _components/ in routes</li>
                <li>• Index files for exports</li>
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold mb-2 text-sm">Code Style</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Named exports preferred</li>
                <li>• Interface for props</li>
                <li>• Early returns</li>
                <li>• Descriptive names</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
