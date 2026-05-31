"use client";

import { Layers, Folder, FileCode, List } from "lucide-react";

export default function ProjectStructurePage() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Layers className="w-4 h-4" />
            Project Structure
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Project Structure & Organization
          </h1>
          <p className="text-xl text-muted-foreground">
            Standardized directory structure and file organization patterns used
            across all projects.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="rounded-lg border border-border bg-muted/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <List className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">On This Page</h2>
          </div>
          <nav className="grid sm:grid-cols-2 gap-2 text-sm">
            <a href="#root-structure" className="block text-muted-foreground hover:text-foreground transition-colors">
              Root Directory Structure
            </a>
            <a href="#app-directory" className="block text-muted-foreground hover:text-foreground transition-colors">
              /app Directory
            </a>
            <a href="#components-directory" className="block text-muted-foreground hover:text-foreground transition-colors">
              /components Directory
            </a>
            <a href="#lib-directory" className="block text-muted-foreground hover:text-foreground transition-colors">
              /lib Directory
            </a>
            <a href="#prisma-directory" className="block text-muted-foreground hover:text-foreground transition-colors">
              /prisma Directory
            </a>
            <a href="#types-directory" className="block text-muted-foreground hover:text-foreground transition-colors">
              /types Directory
            </a>
            <a href="#naming-conventions" className="block text-muted-foreground hover:text-foreground transition-colors">
              Naming Conventions
            </a>
            <a href="#component-architecture" className="block text-muted-foreground hover:text-foreground transition-colors">
              Component Architecture
            </a>
            <a href="#import-patterns" className="block text-muted-foreground hover:text-foreground transition-colors">
              Import Patterns
            </a>
            <a href="#common-scripts" className="block text-muted-foreground hover:text-foreground transition-colors">
              Common npm Scripts
            </a>
          </nav>
        </div>

        {/* Root Structure */}
        <div className="space-y-6" id="root-structure">
          <h2 className="text-2xl font-bold">Root Directory Structure</h2>
          <div className="rounded-lg border border-border bg-card p-6 font-mono text-sm">
            <pre className="text-muted-foreground whitespace-pre">
{`project-root/
├── app/                    # Next.js App Router
├── components/             # React components
├── lib/                    # Business logic & utilities
├── prisma/                 # Database schema & migrations
├── public/                 # Static assets
├── types/                  # TypeScript type definitions
├── constants/              # App-wide constants
├── hooks/                  # Custom React hooks
├── providers/              # Context providers
├── scripts/                # Build & utility scripts
├── .env                    # Environment variables
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies & scripts`}
            </pre>
          </div>
        </div>

        {/* App Directory */}
        <div className="space-y-6" id="app-directory">
          <h2 className="text-2xl font-bold">
            <code className="text-lg">/app</code> Directory (App Router)
          </h2>
          <p className="text-muted-foreground">
            All projects use Next.js 16 App Router. The <code className="text-sm bg-muted px-1 py-0.5 rounded">app/</code> directory
            contains routes, layouts, and page components.
          </p>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold">App Router Structure</h3>
            <div className="font-mono text-sm">
              <pre className="text-muted-foreground whitespace-pre">
{`app/
├── layout.tsx              # Root layout
├── page.tsx                # Home page (/)
├── globals.css             # Global styles
├── not-found.tsx           # 404 page
├── error.tsx               # Error boundary
│
├── (auth)/                 # Route group (auth)
│   ├── login/
│   │   ├── page.tsx
│   │   └── _components/   # Components specific to login page
│   │       ├── login-form.tsx
│   │       └── social-login-buttons.tsx
│   └── register/
│       ├── page.tsx
│       └── _components/   # Components specific to register page
│           └── registration-steps.tsx
│
├── dashboard/              # /dashboard route
│   ├── layout.tsx
│   ├── page.tsx
│   ├── _components/       # Components shared across dashboard routes
│   │   ├── dashboard-nav.tsx
│   │   ├── stats-card.tsx
│   │   └── quick-actions.tsx
│   ├── settings/
│   │   ├── page.tsx
│   │   └── _components/   # Components specific to settings
│   │       └── settings-form.tsx
│   └── [id]/              # Dynamic route
│       ├── page.tsx
│       └── _components/
│           └── detail-view.tsx
│
└── api/                    # API routes
    └── [...]/
        └── route.ts`}
              </pre>
            </div>
          </div>

          <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-4 mt-4">
            <p className="text-sm text-blue-600 dark:text-blue-300">
              <strong>Convention:</strong> Use <code className="text-xs bg-muted px-1 py-0.5 rounded">_components/</code> directories
              (with underscore prefix) within app routes to store page-specific components. The underscore prevents
              Next.js from treating it as a route segment.
            </p>
          </div>

          <div className="space-y-3 mt-6">
            <h3 className="font-semibold">Component Organization Strategy</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                <h4 className="text-sm font-semibold text-primary">Page-Specific Components</h4>
                <p className="text-xs text-muted-foreground">
                  Place in <code className="text-xs bg-muted px-1 py-0.5 rounded">_components/</code> within
                  the route directory
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                  <li>• Only used by that specific page</li>
                  <li>• Contains page-specific logic</li>
                  <li>• Won't be reused elsewhere</li>
                </ul>
              </div>

              <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                <h4 className="text-sm font-semibold text-primary">Shared Components</h4>
                <p className="text-xs text-muted-foreground">
                  Place in <code className="text-xs bg-muted px-1 py-0.5 rounded">/components</code> directory
                  at project root
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                  <li>• Reused across multiple pages</li>
                  <li>• Generic, not route-specific</li>
                  <li>• UI components, layouts, forms</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-6">
            <h3 className="font-semibold">Key App Router Conventions</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <div className="mt-0.5">
                  <FileCode className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">page.tsx</code> - Route entry point (required for public routes)
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5">
                  <FileCode className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">layout.tsx</code> - Shared layout wrapper
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5">
                  <FileCode className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">loading.tsx</code> - Loading UI
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5">
                  <FileCode className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">error.tsx</code> - Error boundary
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Folder className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">_components/</code> - Page-specific components (underscore prefix prevents routing)
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Folder className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">(group)/</code> - Route group (doesn't affect URL)
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Folder className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">[param]/</code> - Dynamic route segment
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Components Directory */}
        <div className="space-y-6" id="components-directory">
          <h2 className="text-2xl font-bold">
            <code className="text-lg">/components</code> Directory
          </h2>
          <p className="text-muted-foreground">
            Reusable React components organized by category or feature.
          </p>

          <div className="rounded-lg border border-border bg-card p-6 font-mono text-sm">
            <pre className="text-muted-foreground whitespace-pre">
{`components/
├── ui/                     # Base UI components (Radix)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   └── ...
│
├── forms/                  # Form components
│   ├── login-form.tsx
│   └── ...
│
├── layouts/                # Layout components
│   ├── sidebar-layout.tsx
│   └── page.tsx
│
├── features/               # Feature-specific components
│   ├── dashboard/
│   └── profile/
│
└── shared/                 # Shared components
    ├── navigation.tsx
    └── footer.tsx`}
            </pre>
          </div>

          <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-600 dark:text-amber-300">
              <strong>Convention:</strong> All components in <code className="text-xs bg-muted px-1 py-0.5 rounded">components/ui/</code> are
              based on Radix UI primitives, styled with Tailwind CSS, and use CVA for variants.
            </p>
          </div>
        </div>

        {/* Lib Directory */}
        <div className="space-y-6" id="lib-directory">
          <h2 className="text-2xl font-bold">
            <code className="text-lg">/lib</code> Directory
          </h2>
          <p className="text-muted-foreground">
            Business logic, data access, utilities, and helper functions
            organized by domain.
          </p>

          <div className="rounded-lg border border-border bg-card p-6 font-mono text-sm">
            <pre className="text-muted-foreground whitespace-pre">
{`lib/
├── auth/                   # Authentication logic
│   ├── index.ts
│   ├── session.ts
│   └── middleware.ts
│
├── db/                     # Database utilities
│   ├── index.ts
│   └── client.ts
│
├── cache/                  # Caching utilities
│   ├── index.ts
│   ├── tag.ts
│   └── revalidate.ts
│
├── events/                 # Real-time events (Pusher)
│   └── index.ts
│
├── strings/                # String utilities
│   ├── format.ts
│   └── parse.ts
│
├── time/                   # Date/time utilities
│   └── format.ts
│
├── [feature]/              # Feature-specific logic
│   ├── query.ts           # Data fetching
│   ├── create.ts          # Create operations
│   ├── update.ts          # Update operations
│   ├── delete.ts          # Delete operations
│   ├── schema.ts          # Zod schemas
│   └── server-actions.ts  # Server Actions
│
└── utils.ts                # General utilities`}
            </pre>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Lib Organization Principles</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  1
                </div>
                <div>
                  <strong className="text-foreground">Feature-based:</strong> Group related logic by domain/feature
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  2
                </div>
                <div>
                  <strong className="text-foreground">Server-only:</strong> Use <code className="text-xs bg-muted px-1 py-0.5 rounded">server-only</code> package for server-side code
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  3
                </div>
                <div>
                  <strong className="text-foreground">Named exports:</strong> Always use named exports, not default
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  4
                </div>
                <div>
                  <strong className="text-foreground">Index files:</strong> Use index.ts to re-export public API
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Prisma Directory */}
        <div className="space-y-6" id="prisma-directory">
          <h2 className="text-2xl font-bold">
            <code className="text-lg">/prisma</code> Directory
          </h2>
          <p className="text-muted-foreground">
            Database schema, migrations, and seed scripts.
          </p>

          <div className="rounded-lg border border-border bg-card p-6 font-mono text-sm">
            <pre className="text-muted-foreground whitespace-pre">
{`prisma/
├── schema.prisma           # Database schema
├── migrations/             # Migration history
│   ├── 20240101_init/
│   └── 20240102_add_users/
└── seed.ts                 # Seed data (optional)`}
            </pre>
          </div>
        </div>

        {/* Types Directory */}
        <div className="space-y-6" id="types-directory">
          <h2 className="text-2xl font-bold">
            <code className="text-lg">/types</code> Directory
          </h2>
          <p className="text-muted-foreground">
            Shared TypeScript type definitions and interfaces.
          </p>

          <div className="rounded-lg border border-border bg-card p-6 font-mono text-sm">
            <pre className="text-muted-foreground whitespace-pre">
{`types/
├── index.ts                # Re-export all types
├── user.ts                 # User-related types
├── api.ts                  # API response types
└── [feature].ts            # Feature-specific types`}
            </pre>
          </div>

          <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-4 mt-4">
            <p className="text-sm text-blue-600 dark:text-blue-300">
              <strong>Tip:</strong> Prefer using Prisma-generated types and Zod schemas for validation over
              manually defined types whenever possible.
            </p>
          </div>
        </div>

        {/* Naming Conventions */}
        <div className="space-y-6" id="naming-conventions">
          <h2 className="text-2xl font-bold">Naming Conventions</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold mb-3">Files & Folders</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>
                  <strong className="text-foreground">kebab-case:</strong> file-name.tsx
                </li>
                <li>
                  <strong className="text-foreground">PascalCase:</strong> ComponentName.tsx
                </li>
                <li>
                  <strong className="text-foreground">Route segments:</strong> lowercase, hyphenated
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold mb-3">Code</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>
                  <strong className="text-foreground">Components:</strong> PascalCase
                </li>
                <li>
                  <strong className="text-foreground">Functions:</strong> camelCase
                </li>
                <li>
                  <strong className="text-foreground">Constants:</strong> UPPER_SNAKE_CASE
                </li>
                <li>
                  <strong className="text-foreground">Types:</strong> PascalCase
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Component Patterns */}
        <div className="space-y-6" id="component-architecture">
          <h2 className="text-2xl font-bold">Component Architecture</h2>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold mb-3">Server Components (Default)</h3>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// app/dashboard/page.tsx
import { getUser } from "@/lib/auth/session";
import { getUserData } from "@/lib/user/query";

export default async function DashboardPage() {
  const user = await getUser();
  const data = await getUserData(user.id);

  return (
    <div>
      <h1>{data.name}</h1>
      {/* Server-rendered content */}
    </div>
  );
}`}
              </pre>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold mb-3">Client Components (Interactive)</h3>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// components/interactive-button.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function InteractiveButton() {
  const [count, setCount] = useState(0);

  return (
    <Button onClick={() => setCount(c => c + 1)}>
      Clicked {count} times
    </Button>
  );
}`}
              </pre>
            </div>
          </div>

          <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-600 dark:text-amber-300">
              <strong>Best Practice:</strong> Use Server Components by default. Only add{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">&apos;use client&apos;</code> when you need:
              browser APIs, event handlers, state, or effects.
            </p>
          </div>
        </div>

        {/* Import Patterns */}
        <div className="space-y-6" id="import-patterns">
          <h2 className="text-2xl font-bold">Import Patterns</h2>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold mb-3">Path Aliases</h3>
            <p className="text-sm text-muted-foreground mb-4">
              All projects use <code className="text-xs bg-muted px-1 py-0.5 rounded">@/</code> alias for absolute imports:
            </p>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}

// Usage
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/auth/session";
import type { User } from "@/types/user";`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 mt-4">
            <h3 className="font-semibold mb-3">Import Order (ESLint)</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// 1. React & Next.js
import { useState } from "react";
import Link from "next/link";

// 2. External dependencies
import { z } from "zod";
import { format } from "date-fns";

// 3. Internal absolute imports
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/auth";

// 4. Types
import type { User } from "@/types/user";`}
            </pre>
          </div>
        </div>

        {/* Common Scripts */}
        <div className="space-y-6" id="common-scripts">
          <h2 className="text-2xl font-bold">Common npm Scripts</h2>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="font-mono text-sm space-y-2">
              <div className="grid grid-cols-[1fr,2fr] gap-4 items-start">
                <code className="text-primary">bun dev</code>
                <span className="text-muted-foreground">Start development server</span>
              </div>
              <div className="grid grid-cols-[1fr,2fr] gap-4 items-start">
                <code className="text-primary">bun build</code>
                <span className="text-muted-foreground">Build for production</span>
              </div>
              <div className="grid grid-cols-[1fr,2fr] gap-4 items-start">
                <code className="text-primary">bun start</code>
                <span className="text-muted-foreground">Start production server</span>
              </div>
              <div className="grid grid-cols-[1fr,2fr] gap-4 items-start">
                <code className="text-primary">bun db:generate</code>
                <span className="text-muted-foreground">Generate Prisma client</span>
              </div>
              <div className="grid grid-cols-[1fr,2fr] gap-4 items-start">
                <code className="text-primary">bun db:migrate</code>
                <span className="text-muted-foreground">Run database migrations</span>
              </div>
              <div className="grid grid-cols-[1fr,2fr] gap-4 items-start">
                <code className="text-primary">bun db:studio</code>
                <span className="text-muted-foreground">Open Prisma Studio</span>
              </div>
              <div className="grid grid-cols-[1fr,2fr] gap-4 items-start">
                <code className="text-primary">bun lint</code>
                <span className="text-muted-foreground">Run linting</span>
              </div>
              <div className="grid grid-cols-[1fr,2fr] gap-4 items-start">
                <code className="text-primary">bun test</code>
                <span className="text-muted-foreground">Run tests</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
