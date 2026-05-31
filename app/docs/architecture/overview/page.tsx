'use client';

import Link from 'next/link';
import { ArrowLeft, Layers, Package, Server, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@summoniq/applab-ui';

export default function ArchitectureOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/docs"
          className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Docs
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Architecture Overview
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl">
            High-level overview of SummonIQ's system architecture, design patterns, and organizational principles.
          </p>
        </div>
      </div>

      {/* Introduction */}
      <Card className="bg-black border-white/10">
        <CardHeader>
          <CardTitle className="text-white">System Architecture</CardTitle>
          <CardDescription className="text-gray-400">
            SummonIQ follows a modern, modular architecture designed for scalability and maintainability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300">
              The SummonIQ platform is built as a monorepo containing multiple applications
              and shared packages. This architecture enables:
            </p>
            <ul className="text-gray-300 space-y-2">
              <li><strong>Code Reusability:</strong> Shared UI components, utilities, and types across apps</li>
              <li><strong>Consistent Development:</strong> Unified tooling and development practices</li>
              <li><strong>Scalable Growth:</strong> Easy addition of new apps and packages</li>
              <li><strong>Type Safety:</strong> End-to-end TypeScript coverage with strict mode</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Core Concepts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-black border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Package className="w-5 h-5 text-blue-400" />
              </div>
              <CardTitle className="text-white">Monorepo Structure</CardTitle>
            </div>
            <CardDescription className="text-gray-400">
              Organized workspace with apps/ and packages/ directories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-300">
              Applications live in <code className="bg-white/10 px-1 rounded">apps/</code> while
              shared code resides in <code className="bg-white/10 px-1 rounded">packages/</code>.
              This separation promotes clear boundaries and reusability.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Layers className="w-5 h-5 text-purple-400" />
              </div>
              <CardTitle className="text-white">Application Layer</CardTitle>
            </div>
            <CardDescription className="text-gray-400">
              Next.js applications with Electron integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-300">
              Each app is a Next.js application that can run as a web app or
              be wrapped with Electron for desktop deployment.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Server className="w-5 h-5 text-green-400" />
              </div>
              <CardTitle className="text-white">API & Backend</CardTitle>
            </div>
            <CardDescription className="text-gray-400">
              Server-side logic and data handling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-300">
              API routes, server actions, and backend services handle data processing,
              authentication, and business logic.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Database className="w-5 h-5 text-orange-400" />
              </div>
              <CardTitle className="text-white">Data Layer</CardTitle>
            </div>
            <CardDescription className="text-gray-400">
              Type-safe database access and state management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-300">
              Prisma ORM provides type-safe database queries with automatic
              schema generation and migrations.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Features */}
      <Card className="bg-black border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Architectural Principles</CardTitle>
          <CardDescription className="text-gray-400">
            Core principles that guide our architectural decisions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <span className="text-blue-400 font-semibold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Modularity</h3>
                <p className="text-sm text-gray-400">
                  Break down functionality into independent, reusable modules
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <span className="text-purple-400 font-semibold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Type Safety</h3>
                <p className="text-sm text-gray-400">
                  Leverage TypeScript for compile-time error checking and better DX
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <span className="text-green-400 font-semibold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Performance</h3>
                <p className="text-sm text-gray-400">
                  Optimize for fast load times and smooth user experiences
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <span className="text-orange-400 font-semibold">4</span>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Developer Experience</h3>
                <p className="text-sm text-gray-400">
                  Provide excellent tooling, documentation, and debugging capabilities
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
