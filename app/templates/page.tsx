import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';

import Link from 'next/link';

export default function TemplatesPage() {
  return (
    <Page className="h-full">
      <PageHeader
        title="Templates"
        description="Edit boilerplate templates for each app type"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {/* Web Apps */}
          <Link href="/templates/web-app" className="block">
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow h-full">
              <div className="flex items-center gap-3 mb-4">
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
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Web Apps</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Full-stack web applications with Next.js
              </p>
              <div className="text-sm font-medium text-primary hover:underline">
                Edit Template →
              </div>
            </div>
          </Link>

          {/* Mobile Apps */}
          <Link href="/templates/mobile-app" className="block">
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow h-full">
              <div className="flex items-center gap-3 mb-4">
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
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Mobile Apps</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Cross-platform mobile applications with Expo
              </p>
              <div className="text-sm font-medium text-primary hover:underline">
                Edit Template →
              </div>
            </div>
          </Link>

          {/* API Service */}
          <Link href="/templates/api" className="block">
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-md bg-amber-100 dark:bg-amber-950">
                  <svg
                    className="w-6 h-6 text-amber-600 dark:text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">API Service</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Backend API service with Next.js API routes
              </p>
              <div className="text-sm font-medium text-primary hover:underline">
                Edit Template →
              </div>
            </div>
          </Link>

          {/* Desktop Apps */}
          <Link href="/templates/desktop-app" className="block">
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow h-full">
              <div className="flex items-center gap-3 mb-4">
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
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Desktop Apps</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Cross-platform desktop applications with Electron
              </p>
              <div className="text-sm font-medium text-primary hover:underline">
                Edit Template →
              </div>
            </div>
          </Link>

          {/* Marketing Sites */}
          <Link href="/templates/marketing-site" className="block">
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow h-full">
              <div className="flex items-center gap-3 mb-4">
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
                      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Marketing Sites</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                High-performance marketing sites with Next.js
              </p>
              <div className="text-sm font-medium text-primary hover:underline">
                Edit Template →
              </div>
            </div>
          </Link>
        </div>
      </div>
    </Page>
  );
}
