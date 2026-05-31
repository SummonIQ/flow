import { Package, Check, ExternalLink, List } from "lucide-react";

export default function TechStackPage() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Package className="w-4 h-4" />
            Tech Stack
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Technology Stack
          </h1>
          <p className="text-xl text-muted-foreground">
            Modern, type-safe, and performant technologies used consistently
            across all projects in the ecosystem.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="rounded-lg border border-border bg-muted/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <List className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">On This Page</h2>
          </div>
          <nav className="space-y-2 text-sm">
            <a href="#core-framework" className="block text-muted-foreground hover:text-foreground transition-colors">
              Core Framework & Runtime
            </a>
            <a href="#styling-ui" className="block text-muted-foreground hover:text-foreground transition-colors">
              Styling & UI Components
            </a>
            <a href="#database-backend" className="block text-muted-foreground hover:text-foreground transition-colors">
              Database & Backend
            </a>
            <a href="#developer-tools" className="block text-muted-foreground hover:text-foreground transition-colors">
              Developer Tools
            </a>
            <a href="#common-dependencies" className="block text-muted-foreground hover:text-foreground transition-colors">
              Common Dependencies
            </a>
            <a href="#version-requirements" className="block text-muted-foreground hover:text-foreground transition-colors">
              Version Requirements
            </a>
          </nav>
        </div>

        {/* Core Technologies */}
        <div className="space-y-6" id="core-framework">
          <h2 className="text-2xl font-bold">Core Framework & Runtime</h2>

          {/* Next.js */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  Next.js 16
                  <a
                    href="https://nextjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  React framework with App Router
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                v16.0+
              </span>
            </div>
            <p className="text-muted-foreground">
              The foundation of all projects. Uses the App Router (not Pages
              Router) with React Server Components as the default rendering
              strategy.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-semibold">Key Features Used:</p>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  App Router
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Server Components
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Server Actions
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Turbopack (dev)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Image Optimization
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Middleware
                </li>
              </ul>
            </div>
          </div>

          {/* React */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  React 19
                  <a
                    href="https://react.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Latest version with React Compiler
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                v19.1+
              </span>
            </div>
            <p className="text-muted-foreground">
              All projects use React 19 with the experimental React Compiler
              enabled for automatic memoization and performance optimizations.
            </p>
          </div>

          {/* TypeScript */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  TypeScript
                  <a
                    href="https://www.typescriptlang.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Strict mode enabled
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                v5+
              </span>
            </div>
            <p className="text-muted-foreground">
              All projects use TypeScript with strict mode enabled. Type safety
              is enforced at compile time and runtime (with Zod validation).
            </p>
          </div>
        </div>

        {/* Styling & UI */}
        <div className="space-y-6" id="styling-ui">
          <h2 className="text-2xl font-bold">Styling & UI Components</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Tailwind CSS */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    Tailwind CSS v4
                    <a
                      href="https://tailwindcss.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Utility-first CSS framework
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                The newest version with PostCSS plugin, custom design tokens,
                and theme configuration.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-primary" />
                  Custom color system
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-primary" />
                  Dark mode support
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-primary" />
                  CSS variables
                </li>
              </ul>
            </div>

            {/* Radix UI */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    Radix UI
                    <a
                      href="https://www.radix-ui.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Unstyled, accessible components
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Provides the foundation for all UI components with full
                accessibility support.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-primary" />
                  WCAG compliant
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-primary" />
                  Keyboard navigation
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-primary" />
                  Screen reader tested
                </li>
              </ul>
            </div>

            {/* Class Variance Authority */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">CVA</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Type-safe variant management
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Used for creating component variants with type safety and
                IntelliSense support.
              </p>
            </div>

            {/* Lucide Icons */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Lucide React</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Icon library
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Consistent, tree-shakeable icon set used across all projects.
              </p>
            </div>
          </div>
        </div>

        {/* Database & Backend */}
        <div className="space-y-6" id="database-backend">
          <h2 className="text-2xl font-bold">Database & Backend</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Prisma */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    Prisma ORM
                    <a
                      href="https://www.prisma.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Type-safe database client
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                All database interactions use Prisma with PostgreSQL. Provides
                type-safe queries and migrations.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-primary" />
                  Auto-generated types
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-primary" />
                  Migration system
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-primary" />
                  Prisma Studio
                </li>
              </ul>
            </div>

            {/* PostgreSQL */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">PostgreSQL</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Relational database
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Primary database for all projects. Hosted on various platforms
                (Vercel Postgres, Supabase, etc.).
              </p>
            </div>

            {/* Better Auth */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  Better Auth
                  <a
                    href="https://www.better-auth.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Authentication library
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Session-based authentication with bcrypt password hashing. NOT
                NextAuth - Better Auth is the standard.
              </p>
            </div>

            {/* Pusher */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Pusher</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Real-time events
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Used for real-time features like notifications, live updates,
                and collaborative features.
              </p>
            </div>
          </div>
        </div>

        {/* Developer Tools */}
        <div className="space-y-6" id="developer-tools">
          <h2 className="text-2xl font-bold">Developer Tools</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Bun */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Bun</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Package manager & runtime
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                All projects use Bun instead of npm/yarn/pnpm. Significantly
                faster installation and execution times.
              </p>
            </div>

            {/* Biome/ESLint */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Biome / ESLint</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Code linting & formatting
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Biome for faster linting where available, ESLint for
                comprehensive rules. Prettier integration for formatting.
              </p>
            </div>

            {/* Vitest */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Vitest</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Unit testing framework
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Fast, Vite-powered unit testing with Jest-compatible API and
                React Testing Library integration.
              </p>
            </div>

            {/* Playwright */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Playwright</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  E2E testing
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                End-to-end testing for critical user flows and integration
                testing across browsers.
              </p>
            </div>
          </div>
        </div>

        {/* Common Dependencies */}
        <div className="space-y-4" id="common-dependencies">
          <h2 className="text-2xl font-bold">Common Dependencies</h2>
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Forms & Validation</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• React Hook Form</li>
                  <li>• Zod</li>
                  <li>• @hookform/resolvers</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Data Management</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• TanStack Query</li>
                  <li>• TanStack Table</li>
                  <li>• date-fns</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Animation</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Framer Motion</li>
                  <li>• tailwindcss-animate</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Utilities</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• clsx / tailwind-merge</li>
                  <li>• lodash</li>
                  <li>• usehooks-ts</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Monitoring</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Sentry</li>
                  <li>• Vercel Analytics</li>
                  <li>• Speed Insights</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Document Handling</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• React Markdown</li>
                  <li>• Mammoth (Word docs)</li>
                  <li>• Turndown (HTML to MD)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Version Requirements */}
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-6" id="version-requirements">
          <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">
            Important Version Notes
          </h3>
          <ul className="text-sm text-amber-600 dark:text-amber-300 space-y-1">
            <li>
              • All projects require <strong>Node.js 18+</strong> (or Bun)
            </li>
            <li>
              • <strong>Next.js 16+</strong> is required for App Router features
            </li>
            <li>
              • <strong>React 19</strong> is used across all projects
            </li>
            <li>
              • <strong>Tailwind CSS v4</strong> uses PostCSS plugin (not JIT)
            </li>
            <li>
              • Prefer <strong>Bun</strong> over npm/yarn/pnpm for all operations
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
