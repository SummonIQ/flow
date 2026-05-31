'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, Folder, GitBranch, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CodeBlock } from '@summoniq/applab-ui';

export default function CodeConventionsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/docs/architecture"
          className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Architecture
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Code Conventions
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl">
            Coding standards, naming conventions, and style guidelines for SummonIQ projects.
          </p>
        </div>
      </div>

      {/* Introduction */}
      <Card className="bg-black border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Why Conventions Matter</CardTitle>
          <CardDescription className="text-gray-400">
            Consistent code is easier to read, maintain, and collaborate on
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300">
            Following consistent conventions reduces cognitive load and makes it easier for
            team members to work across different parts of the codebase.
          </p>
        </CardContent>
      </Card>

      {/* File Naming */}
      <Card className="bg-black border-white/10">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <CardTitle className="text-white">File Naming Conventions</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Consistent file naming makes navigation easier
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-white font-medium mb-2">Components</p>
              <p className="text-gray-400 mb-2">Use PascalCase for component files:</p>
              <CodeBlock
                language="bash"
                code={`components/
  Button.tsx
  Modal.tsx
  UserAvatar.tsx
  LayoutWithSidebar.tsx`}
              />
            </div>

            <div>
              <p className="text-white font-medium mb-2">Utilities & Hooks</p>
              <p className="text-gray-400 mb-2">Use kebab-case for utility files:</p>
              <CodeBlock
                language="bash"
                code={`lib/
  format-date.ts
  api-client.ts
  
hooks/
  use-user.ts
  use-modal.ts`}
              />
            </div>

            <div>
              <p className="text-white font-medium mb-2">Types</p>
              <p className="text-gray-400 mb-2">Co-locate types or use a types directory:</p>
              <CodeBlock
                language="bash"
                code={`types/
  user.ts
  project.ts
  
components/
  Button.tsx
  Button.types.ts  // Co-located types`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Folder Structure */}
      <Card className="bg-black border-white/10">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Folder className="w-5 h-5 text-purple-400" />
            </div>
            <CardTitle className="text-white">Folder Organization</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Organize code by feature, not by type
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-300">
            Group related files together rather than separating by file type:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-red-400 mb-2">❌ Don't: Organize by type</p>
              <CodeBlock
                language="bash"
                code={`components/
  ProjectCard.tsx
  ProjectList.tsx
  UserCard.tsx
  UserList.tsx
hooks/
  useProject.ts
  useUser.ts`}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-green-400 mb-2">✓ Do: Organize by feature</p>
              <CodeBlock
                language="bash"
                code={`features/
  projects/
    ProjectCard.tsx
    ProjectList.tsx
    useProject.ts
  users/
    UserCard.tsx
    UserList.tsx
    useUser.ts`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Naming Conventions */}
      <Card className="bg-black border-white/10">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <CardTitle className="text-white">Variable & Function Naming</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Use descriptive names that convey intent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CodeBlock
            language="tsx"
            code={`// Boolean variables - use "is", "has", "should" prefixes
const isLoading = true;
const hasPermission = false;
const shouldRedirect = true;

// Arrays - use plural nouns
const users = [];
const projects = [];

// Functions - use verbs
function fetchUser(id: string) { }
function createProject(data: ProjectData) { }
function validateEmail(email: string) { }

// Event handlers - use "handle" prefix
function handleClick() { }
function handleSubmit() { }

// React components - use PascalCase
function UserProfile() { }
function ProjectCard() { }

// Custom hooks - use "use" prefix
function useAuth() { }
function useProjects() { }

// Constants - use UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const API_BASE_URL = 'https://api.example.com';`}
          />
        </CardContent>
      </Card>

      {/* TypeScript */}
      <Card className="bg-black border-white/10">
        <CardHeader>
          <CardTitle className="text-white">TypeScript Conventions</CardTitle>
          <CardDescription className="text-gray-400">
            Leverage TypeScript for better code quality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CodeBlock
            language="tsx"
            code={`// Use interfaces for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// Use types for unions, primitives, and utilities
type Status = 'pending' | 'active' | 'inactive';
type UserId = string;

// Use generics for reusable types
interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Prefer type inference when obvious
const user = { id: '1', name: 'John' }; // Type inferred

// But be explicit for function returns
function getUser(id: string): Promise<User> {
  return fetch(\`/api/users/\${id}\`).then(r => r.json());
}

// Avoid 'any' - use 'unknown' when type is truly unknown
function process(data: unknown) {
  if (typeof data === 'string') {
    // TypeScript knows data is string here
    console.log(data.toUpperCase());
  }
}`}
          />
        </CardContent>
      </Card>

      {/* Import Order */}
      <Card className="bg-black border-white/10">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <GitBranch className="w-5 h-5 text-orange-400" />
            </div>
            <CardTitle className="text-white">Import Order</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Organize imports in a consistent order
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CodeBlock
            language="tsx"
            code={`// 1. React & Next.js imports
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

// 3. Internal packages (from @summoniq/*)
import { Button, Card } from '@summoniq/applab-ui';
import { formatDate } from '@summoniq/utils';

// 4. Relative imports
import { UserCard } from './UserCard';
import { useUser } from '../hooks/useUser';
import type { User } from '../types';`}
          />
        </CardContent>
      </Card>

      {/* Best Practices Summary */}
      <Card className="bg-black border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Quick Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h3 className="font-semibold text-white">Files</h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Components: PascalCase</li>
                <li>• Utilities: kebab-case</li>
                <li>• Pages: lowercase with Next.js conventions</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-white">Variables</h3>
              <ul className="space-y-1 text-gray-400">
                <li>• camelCase for variables & functions</li>
                <li>• PascalCase for components & classes</li>
                <li>• UPPER_SNAKE_CASE for constants</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-white">Functions</h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Prefix handlers with "handle"</li>
                <li>• Prefix hooks with "use"</li>
                <li>• Use verbs for actions</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-white">TypeScript</h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Avoid 'any', use 'unknown'</li>
                <li>• Prefer interfaces for objects</li>
                <li>• Explicit function returns</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
