import { Code2, Terminal, BookOpen } from "lucide-react";
import Link from "next/link";

export default function DevelopingPage() {
  return (
    <div className="container mx-auto py-12 px-6 max-w-5xl">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Code2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground">Developing</h1>
            <p className="text-muted-foreground mt-2">Development setup and best practices</p>
          </div>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Link
          href="/docs/development"
          className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold">Development Setup</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Setting up your local development environment, database setup,
              common commands, and troubleshooting guides.
            </p>
          </div>
        </Link>

        <Link
          href="/docs/best-practices"
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
              Proven patterns, conventions, and best practices for Next.js,
              TypeScript, Tailwind CSS, and testing.
            </p>
          </div>
        </Link>
      </div>

      {/* Overview Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-foreground">Overview</h2>
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground">
            This section covers everything you need to know about developing applications
            in the SummonIQ ecosystem. From initial setup to following established best
            practices, you'll find comprehensive guides to help you build high-quality
            applications efficiently.
          </p>
        </div>
      </section>

      {/* What You'll Find */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-foreground">What You'll Find</h2>
        <div className="space-y-6">
          <div className="p-6 bg-card rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-3 text-foreground">Development Setup</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Prerequisites and required software installation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Database configuration and migrations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Environment variables reference</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Common development commands</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Troubleshooting common issues</span>
              </li>
            </ul>
          </div>

          <div className="p-6 bg-card rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-3 text-foreground">Best Practices</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Next.js 16 patterns and conventions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>TypeScript strict mode and type patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Tailwind CSS utility-first approach</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Testing strategies with Vitest and Playwright</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Code organization and architecture patterns</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
