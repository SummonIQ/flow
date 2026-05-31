import { Code2, Database, Lock, Layers, Package, Wrench, BookOpen, Settings } from "lucide-react";
import Link from "next/link";

export default function ArchitecturePage() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Code2 className="w-4 h-4" />
            Architecture Guide
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Application Architecture
          </h1>
          <p className="text-xl text-muted-foreground">
            Comprehensive overview of the technical architecture, patterns, and
            conventions used across all projects in the ecosystem.
          </p>
        </div>

        {/* Introduction */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-lg">
            This architecture guide documents the common patterns, technologies,
            and conventions used across multiple interconnected projects. All
            projects share similar tech stacks and architectural decisions,
            making it easy to understand and contribute to any project in the
            ecosystem.
          </p>
        </div>

        {/* Architecture Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/architecture/tech-stack"
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">Tech Stack</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Next.js 16, React 19, TypeScript, Tailwind CSS, Prisma ORM,
                Better Auth, and more modern technologies used across all
                projects.
              </p>
            </div>
          </Link>

          <Link
            href="/architecture/project-structure"
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">Project Structure</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Standardized directory structure, file organization patterns,
                and component architecture used consistently across projects.
              </p>
            </div>
          </Link>

          <Link
            href="/architecture/authentication"
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">
                  Authentication Patterns
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Better Auth implementation patterns, session management,
                middleware protection, and user authentication flows.
              </p>
            </div>
          </Link>

          <Link
            href="/architecture/database"
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">Database Patterns</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Prisma ORM patterns, schema design, migrations, relationships,
                and database access patterns used across projects.
              </p>
            </div>
          </Link>

          <Link
            href="/architecture/api-patterns"
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">API Patterns</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Server Actions, API routes, data fetching strategies, caching
                patterns, and real-time features with Pusher.
              </p>
            </div>
          </Link>

          <Link
            href="/architecture/utilities"
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">Common Utilities</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Shared utility functions, formatters, error handling, logging,
                and helper libraries used across all projects.
              </p>
            </div>
          </Link>

          <Link
            href="/best-practices"
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">Best Practices</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Development best practices, coding standards, and conventions
                for Next.js, TypeScript, Tailwind CSS, and more.
              </p>
            </div>
          </Link>

          <Link
            href="/architecture/environment"
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Settings className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">Environment Variables</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Complete reference for all environment variables, configuration,
                and setup instructions for various services.
              </p>
            </div>
          </Link>
        </div>

        {/* Key Principles */}
        <div className="space-y-4 rounded-lg border border-border bg-muted/50 p-6">
          <h2 className="text-2xl font-bold">Key Architectural Principles</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                1
              </div>
              <div>
                <strong className="font-semibold">
                  Server-First Architecture
                </strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Favor React Server Components over Client Components. Use{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    &apos;use client&apos;
                  </code>{" "}
                  sparingly for interactive elements only.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                2
              </div>
              <div>
                <strong className="font-semibold">Type Safety First</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  TypeScript strict mode enabled across all projects. Prisma
                  generates type-safe database client, Zod for runtime
                  validation.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                3
              </div>
              <div>
                <strong className="font-semibold">
                  Feature-Based Organization
                </strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Code is organized by feature/domain rather than by technical
                  layer. Each feature contains its components, logic, and data
                  access.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                4
              </div>
              <div>
                <strong className="font-semibold">
                  Performance Optimized
                </strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Next.js 16 caching strategies, React Compiler, dynamic
                  imports, and optimized bundle sizes for fast load times.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Technologies at a Glance */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Technologies at a Glance</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold mb-2">Frontend</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Next.js 16 (App Router)</li>
                <li>• React 19</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS v4</li>
                <li>• Radix UI</li>
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold mb-2">Backend</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Next.js Server Actions</li>
                <li>• Better Auth</li>
                <li>• Prisma ORM</li>
                <li>• PostgreSQL</li>
                <li>• Pusher (real-time)</li>
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold mb-2">Developer Tools</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Bun (package manager)</li>
                <li>• Biome/ESLint</li>
                <li>• Vitest</li>
                <li>• Playwright</li>
                <li>• Turbopack</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
