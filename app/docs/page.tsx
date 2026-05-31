import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';

export default function DocsPage() {
  return (
    <Page className="h-full">
      <PageHeader
        title="Documentation"
        description="Comprehensive guides and resources for building applications with SummonIQ."
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Getting Started */}
            <a
              href="/docs/getting-started"
              className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-950">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold">Getting Started</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Learn the basics and get up and running quickly with SummonIQ.
              </p>
            </a>

            {/* Architecture */}
            <a
              href="/docs/architecture"
              className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-950">
                  <svg
                    className="w-6 h-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold">Architecture</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Understand the architectural patterns and principles behind
                SummonIQ.
              </p>
            </a>

            {/* Components */}
            <a
              href="/docs/components"
              className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-md bg-green-100 dark:bg-green-950">
                  <svg
                    className="w-6 h-6 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold">Components</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Explore the component library and learn how to use each
                component.
              </p>
            </a>

            {/* Design System */}
            <a
              href="/docs/design-system"
              className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-md bg-pink-100 dark:bg-pink-950">
                  <svg
                    className="w-6 h-6 text-pink-600 dark:text-pink-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold">Design System</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Dive into design tokens, theming, and visual design guidelines.
              </p>
            </a>

            {/* Layout System */}
            <a
              href="/docs/layout"
              className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-md bg-orange-100 dark:bg-orange-950">
                  <svg
                    className="w-6 h-6 text-orange-600 dark:text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold">Layout System</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Learn about responsive layouts and layout patterns.
              </p>
            </a>

            {/* Best Practices */}
            <a
              href="/docs/best-practices"
              className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-md bg-yellow-100 dark:bg-yellow-950">
                  <svg
                    className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold">Best Practices</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Follow recommended patterns and coding standards for quality
                code.
              </p>
            </a>
          </div>

          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t">
            <h2 className="text-2xl font-semibold mb-4">Quick Links</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <a
                href="/docs/api"
                className="text-sm text-primary hover:underline"
              >
                API Reference →
              </a>
              <a
                href="/docs/workflow"
                className="text-sm text-primary hover:underline"
              >
                Development Workflow →
              </a>
              <a
                href="/docs/resources"
                className="text-sm text-primary hover:underline"
              >
                External Resources →
              </a>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
