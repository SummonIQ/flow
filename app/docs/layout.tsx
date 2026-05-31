'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const getLinkClassName = (path: string) => {
    const baseClasses =
      'block px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors';
    const activeClasses = isActive(path)
      ? 'bg-muted text-foreground font-medium'
      : 'text-foreground';
    return `${baseClasses} ${activeClasses}`.trim();
  };

  return (
    <div className="flex h-full">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-border bg-background overflow-y-auto">
        <div className="p-6">
          <nav className="space-y-1">
            <div className="space-y-1">
              <Link
                className={getLinkClassName('/docs/getting-started')}
                href="/docs/getting-started"
              >
                Getting Started
              </Link>
              <Link
                className={getLinkClassName('/docs/architecture')}
                href="/docs/architecture"
              >
                Architecture
              </Link>
            </div>

            <div className="space-y-3 mt-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Architecture
                </h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      className={getLinkClassName('/docs/principles')}
                      href="/docs/principles"
                    >
                      Principles
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={getLinkClassName('/docs/patterns')}
                      href="/docs/patterns"
                    >
                      Patterns
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Components
                </h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      className={getLinkClassName('/docs/components')}
                      href="/docs/components"
                    >
                      Overview
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={getLinkClassName('/docs/forms')}
                      href="/docs/forms"
                    >
                      Forms
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={getLinkClassName('/docs/navigation')}
                      href="/docs/navigation"
                    >
                      Navigation
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={getLinkClassName('/docs/containers')}
                      href="/docs/containers"
                    >
                      Containers
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Design
                </h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      className={getLinkClassName('/docs/design-system')}
                      href="/docs/design-system"
                    >
                      Design System
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={getLinkClassName('/docs/theming')}
                      href="/docs/theming"
                    >
                      Theming
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={getLinkClassName('/docs/tokens')}
                      href="/docs/tokens"
                    >
                      Design Tokens
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={getLinkClassName('/docs/animations')}
                      href="/docs/animations"
                    >
                      Animations
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Layout
                </h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      className={getLinkClassName('/docs/layout')}
                      href="/docs/layout"
                    >
                      Layout System
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={getLinkClassName('/docs/layouts')}
                      href="/docs/layouts"
                    >
                      Layouts
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Best Practices
                </h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      className={getLinkClassName('/docs/best-practices')}
                      href="/docs/best-practices"
                    >
                      Overview
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={getLinkClassName('/docs/style-guide')}
                      href="/docs/style-guide"
                    >
                      Style Guide
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={getLinkClassName('/docs/workflow')}
                      href="/docs/workflow"
                    >
                      Workflow
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Resources
                </h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      className={getLinkClassName('/docs/resources')}
                      href="/docs/resources"
                    >
                      Resources
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
