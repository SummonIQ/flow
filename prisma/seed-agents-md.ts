import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const AGENTS_MD_CONTENT = `# AI Agent Development Guidelines

**Purpose:** Comprehensive development guidelines for AI coding agents working on the Chatterworks Web App. Follow these patterns for all new features, bug fixes, and enhancements.

**Last Updated:** October 28th, 2025
**Framework:** Next.js 16, React 19.2, TypeScript strict mode, Tailwind CSS v4, Bun
**Project:** Chatterworks Web App - Talent discovery and management platform

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Development Workflow](#development-workflow)
4. [Code Architecture Patterns](#code-architecture-patterns)
5. [Component Development](#component-development)
6. [Server Actions & Data Fetching](#server-actions--data-fetching)
7. [Styling Guidelines](#styling-guidelines)
8. [Type Safety Requirements](#type-safety-requirements)
9. [Testing Requirements](#testing-requirements)
10. [Performance & Caching](#performance--caching)
11. [Security & Validation](#security--validation)
12. [Accessibility Standards](#accessibility-standards)
13. [File Organization](#file-organization)
14. [Common Patterns Library](#common-patterns-library)
15. [Quality Checklist](#quality-checklist)

---

## Project Overview

### What We're Building

Chatterworks Web App is a modern talent discovery platform built with Next.js 16 App Router. The application enables:

- **Candidate Management:** Search, filter, and manage candidate profiles
- **Project Tracking:** Create and manage recruiting projects
- **Messaging:** Real-time communication with candidates via Pusher
- **Analytics:** Dashboard with recruitment metrics
- **Team Collaboration:** Multi-user workspace management

### Core Principles

1. **Server-First Architecture:** Prefer Server Components over Client Components
2. **Type Safety:** Strict TypeScript with zero \`any\` types
3. **Explicit Caching:** Use Next.js 16's \`'use cache'\` directive
4. **Tailwind-Only Styling:** No inline styles, all CSS via Tailwind classes
5. **Accessibility:** WCAG 2.1 AA compliance minimum
6. **Performance:** Target <2s FCP, >80 Lighthouse score

---

## Technology Stack

### Core Technologies

\`\`\`typescript
{
  "framework": "Next.js 16 (App Router)",
  "runtime": "React 19.2",
  "language": "TypeScript 5+ (strict mode)",
  "styling": "Tailwind CSS v4",
  "package-manager": "Bun",
  "testing": "Vitest + Playwright",
  "ui-components": "Shadcn UI (Radix primitives)",
  "state-management": "TanStack Query + React Context",
  "realtime": "Pusher",
  "validation": "Zod"
}
\`\`\`

---

## Development Workflow

### Before Starting Any Task

1. **Read existing code** in the area you're modifying
2. **Check for existing patterns** in similar features
3. **Review types** in \`@/types\` for relevant interfaces
4. **Identify reusable components** in \`@/components/ui\` 
5. **Plan server vs. client boundaries** before writing code

### Development Commands

\`\`\`bash
# Start development server (port 10050)
bun dev

# Run unit tests
bun test
bun test:watch

# Run E2E tests
bun test:e2e
bun test:e2e:headed

# Linting
bun lint

# Type checking
bunx tsc --noEmit

# Check for dependency updates
bun deps:check
\`\`\`

---

## Code Architecture Patterns

### Next.js 16 App Router Structure

\`\`\`
app/
├── (auth)/                    # Route group for auth pages
│   ├── sign-in/
│   │   ├── page.tsx          # Server Component (default)
│   │   └── components/
│   │       └── form.tsx      # Client Component ('use client')
│   └── layout.tsx            # Shared auth layout
├── (protected)/               # Route group for authenticated routes
│   ├── projects/
│   │   ├── page.tsx          # Server Component
│   │   ├── [id]/
│   │   │   └── page.tsx      # Dynamic route with async params
│   │   └── components/
│   └── layout.tsx
├── api/                       # API routes (if needed)
├── layout.tsx                 # Root layout with providers
└── error.tsx                  # Error boundary
\`\`\`

---

## Component Development

### Component Best Practices

- ✅ Always use TypeScript with explicit prop types
- ✅ Use named exports (not default exports for components)
- ✅ Never use \`React.FC\` (use direct props interface)
- ✅ Colocate components with their routes when route-specific
- ✅ Put shared components in \`@/components\` 
- ✅ One component per file (except tiny helpers)
- ✅ Name file same as component (kebab-case)
- ❌ Don't create barrel exports in Next.js App Router
- ❌ Don't use \`any\` type
- ❌ Don't mix server and client logic in same file

---

## Server Actions & Data Fetching

### Server Actions Structure

\`\`\`
actions/
├── projects.ts          # Project CRUD
├── candidates.ts        # Candidate operations
├── auth.ts             # Authentication
├── messaging.ts        # Real-time messaging
└── _cache-utils.ts     # Shared cache helpers
\`\`\`

---

## Styling Guidelines

### Tailwind CSS v4 Usage

**CRITICAL RULES:**

1. **NEVER use inline styles** (\`style={{ ... }}\`)
2. **ALWAYS use Tailwind classes**
3. **Use \`cn()\` helper for conditional classes**

---

## Type Safety Requirements

### Type Safety Best Practices

- ✅ Define types in \`@/types\` directory
- ✅ Use interfaces for object shapes
- ✅ Use enums for fixed sets of values
- ✅ Use type aliases for unions/intersections
- ✅ Export types from domain-specific files
- ✅ Re-export commonly used types from \`types/index.ts\` 
- ❌ Never use \`any\` (use \`unknown\` if truly unknown)
- ❌ Don't duplicate type definitions
- ❌ Don't define types inline in components
- ❌ Don't use \`@ts-ignore\` (fix the issue instead)

---

## Quality Checklist

### Before Committing Code

**Code Quality:**

- [ ] No TypeScript errors (\`bunx tsc --noEmit\`)
- [ ] No ESLint errors (\`bun lint\`)
- [ ] No console.log statements (except intentional logging)
- [ ] No \`any\` types used
- [ ] All imports resolved correctly

**Next.js 16 Compliance:**

- [ ] Async params/searchParams are awaited
- [ ] \`'use cache'\` added where appropriate
- [ ] Server actions use \`updateTag()\` for cache invalidation
- [ ] No synchronous param access

**Styling:**

- [ ] No inline styles (\`style={{ ... }}\`)
- [ ] All styling via Tailwind classes
- [ ] Responsive design implemented (sm/md/lg breakpoints)
- [ ] Dark mode support (if applicable)

**Type Safety:**

- [ ] All functions have explicit return types
- [ ] All props have explicit types
- [ ] No \`as any\` casts
- [ ] Types imported from \`@/types\` 

---

**Last Updated:** January 2025
**Version:** 1.0
**Maintainers:** Chatterworks Engineering Team
`;

async function seedAgentsMd() {
  console.log('🌱 Seeding default AGENTS.md configuration...');

  try {
    // Check if AGENTS.md config already exists
    const existing = await prisma.sharedConfig.findFirst({
      where: {
        configType: 'AGENTS_MD',
        name: 'Default AI Agent Guidelines',
      },
    });

    if (existing) {
      console.log('✅ AGENTS.md configuration already exists');
      return;
    }

    // Create default AGENTS.md configuration
    await prisma.sharedConfig.create({
      data: {
        name: 'Default AI Agent Guidelines',
        description: 'Comprehensive development guidelines for AI coding agents',
        configType: 'AGENTS_MD',
        appType: null, // Applies to all app types
        content: { raw: AGENTS_MD_CONTENT },
        tags: ['guidelines', 'ai-agent', 'development', 'best-practices'],
        isDefault: true,
        usageCount: 0,
        locked: false, // Can be edited
      },
    });

    console.log('✅ Created default AGENTS.md configuration');

    // Create a locked version as template
    await prisma.sharedConfig.create({
      data: {
        name: 'AI Agent Guidelines (Locked Template)',
        description: 'Official template - locked from AI agent modifications',
        configType: 'AGENTS_MD',
        appType: null,
        content: { raw: AGENTS_MD_CONTENT },
        tags: ['guidelines', 'ai-agent', 'template', 'locked'],
        isDefault: false,
        usageCount: 0,
        locked: true, // Cannot be edited by AI agents
      },
    });

    console.log('✅ Created locked AGENTS.md template');
  } catch (error) {
    console.error('❌ Error seeding AGENTS.md:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAgentsMd()
  .then(() => {
    console.log('🎉 AGENTS.md seed complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });
