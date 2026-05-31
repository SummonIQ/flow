'use client';

import { ArrowLeft, CheckCircle2, Gauge, Zap } from 'lucide-react';
import Link from 'next/link';

export default function PerformanceBestPracticesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link
          href="/docs/best-practices"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Best Practices
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Zap className="w-10 h-10 text-primary" />
            Performance Best Practices
          </h1>
          <p className="text-lg text-muted-foreground">
            Optimize your React applications for speed, efficiency, and user
            experience
          </p>
        </div>

        {/* Table of Contents */}
        <div className="mb-12 rounded-lg border border-border bg-muted/40 p-6">
          <div className="mb-3">
            <h2 className="text-lg font-semibold">On This Page</h2>
          </div>
          <nav className="grid sm:grid-cols-2 gap-2 text-sm">
            <a
              href="#rendering"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Rendering Optimization
            </a>
            <a
              href="#code-splitting"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Code Splitting
            </a>
            <a
              href="#images"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Image Optimization
            </a>
            <a
              href="#data-fetching"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Data Fetching
            </a>
            <a
              href="#bundle-size"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Bundle Size
            </a>
            <a
              href="#runtime"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Runtime Performance
            </a>
          </nav>
        </div>

        <div className="space-y-12">
          {/* Rendering Optimization */}
          <div id="rendering">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-6 h-6" />
              Rendering Optimization
            </h2>

            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">React.memo</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Prevent unnecessary re-renders of components that receive the
                  same props.
                </p>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                  {`const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  // This component only re-renders when data changes
  return <div>{/* Expensive rendering logic */}</div>;
});

// With custom comparison
const SmartComponent = React.memo(
  function SmartComponent({ user, config }) {
    return <div>{/* Component logic */}</div>;
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (skip render)
    return prevProps.user.id === nextProps.user.id;
  }
);`}
                </pre>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">
                  useMemo & useCallback
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Memoize expensive calculations and callbacks to prevent
                  recreation on every render.
                </p>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                  {`function DataTable({ data, filter }) {
  // Memoize expensive filtering operation
  const filteredData = useMemo(() => {
    return data.filter(item => item.category === filter);
  }, [data, filter]);

  // Memoize callback to prevent child re-renders
  const handleSort = useCallback((column) => {
    // Sorting logic
  }, [/* dependencies */]);

  return <Table data={filteredData} onSort={handleSort} />;
}`}
                </pre>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">Virtualization</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Render only visible items in long lists using virtualization
                  libraries.
                </p>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                  {`import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: \`\${virtualizer.getTotalSize()}px\` }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div key={virtualRow.index}>
            {items[virtualRow.index]}
          </div>
        ))}
      </div>
    </div>
  );
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Code Splitting */}
          <div id="code-splitting">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-6 h-6" />
              Code Splitting
            </h2>

            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">Dynamic Imports</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Load components only when they're needed using React.lazy and
                  Suspense.
                </p>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                  {`import { lazy, Suspense } from 'react';

// Lazy load heavy components
const HeavyChart = lazy(() => import('./HeavyChart'));
const VideoPlayer = lazy(() => import('./VideoPlayer'));

function Dashboard() {
  return (
    <div>
      <Suspense fallback={<LoadingSpinner />}>
        <HeavyChart data={chartData} />
      </Suspense>
      
      <Suspense fallback={<div>Loading video...</div>}>
        <VideoPlayer url={videoUrl} />
      </Suspense>
    </div>
  );
}`}
                </pre>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">
                  Route-Based Code Splitting
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Split code at route boundaries for optimal loading.
                </p>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                  {`import { lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Image Optimization */}
          <div id="images">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-6 h-6" />
              Image Optimization
            </h2>

            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">
                  Next.js Image Component
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Use Next.js Image component for automatic optimization.
                </p>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                  {`import Image from 'next/image';

// Automatic optimization, lazy loading, and responsive images
<Image
  src="/hero-image.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // Load immediately for above-the-fold images
  placeholder="blur" // Show blur placeholder while loading
/>

// For dynamic images
<Image
  src={user.avatar}
  alt={user.name}
  width={40}
  height={40}
  loading="lazy" // Lazy load below-the-fold images
/>`}
                </pre>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">
                  Responsive Images
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Serve appropriately sized images for different screen sizes.
                </p>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                  {`<Image
  src="/product.jpg"
  alt="Product"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  fill
  style={{ objectFit: 'cover' }}
/>`}
                </pre>
              </div>
            </div>
          </div>

          {/* Data Fetching */}
          <div id="data-fetching">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-6 h-6" />
              Data Fetching Optimization
            </h2>

            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">
                  Parallel Data Fetching
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Fetch data in parallel when possible to reduce total loading
                  time.
                </p>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                  {`// ✅ Good: Parallel fetching
async function loadDashboard() {
  const [user, stats, activity] = await Promise.all([
    fetchUser(),
    fetchStats(),
    fetchActivity()
  ]);
  
  return { user, stats, activity };
}

// ❌ Bad: Sequential fetching
async function loadDashboard() {
  const user = await fetchUser();
  const stats = await fetchStats();
  const activity = await fetchActivity();
  
  return { user, stats, activity };
}`}
                </pre>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">
                  Request Deduplication
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Prevent duplicate requests for the same data.
                </p>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                  {`// Using React Query for automatic deduplication
import { useQuery } from '@tanstack/react-query';

function UserProfile({ userId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
  
  if (isLoading) return <Loading />;
  return <div>{data.name}</div>;
}

// Multiple components can call this hook
// Only one network request is made
function Dashboard() {
  return (
    <>
      <UserProfile userId={1} />
      <UserProfile userId={1} /> {/* Uses cached data */}
    </>
  );
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Bundle Size */}
          <div id="bundle-size">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <Gauge className="w-6 h-6" />
              Bundle Size Optimization
            </h2>

            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">Tree Shaking</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Import only what you need to enable tree shaking.
                </p>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                  {`// ✅ Good: Named imports enable tree shaking
import { debounce, throttle } from 'lodash-es';

// ❌ Bad: Default import includes entire library
import _ from 'lodash';
_.debounce(() => {});

// ✅ Good: Import specific icons
import { ChevronDown, User, Settings } from 'lucide-react';

// ❌ Bad: Import all icons
import * as Icons from 'lucide-react';`}
                </pre>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">Analyze Bundle</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Use bundle analyzer to identify large dependencies.
                </p>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                  {`// Install bundle analyzer
bun add --dev @next/bundle-analyzer

// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // your Next.js config
});

// Run analysis
ANALYZE=true bun build`}
                </pre>
              </div>
            </div>
          </div>

          {/* Runtime Performance */}
          <div id="runtime">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-6 h-6" />
              Runtime Performance
            </h2>

            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">
                  Debounce & Throttle
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Limit the rate of expensive operations like API calls or DOM
                  updates.
                </p>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                  {`import { useMemo } from 'react';
import { debounce } from 'lodash-es';

function SearchInput({ onSearch }) {
  // Debounce search to avoid excessive API calls
  const debouncedSearch = useMemo(
    () => debounce((query) => onSearch(query), 300),
    [onSearch]
  );

  return (
    <input
      onChange={(e) => debouncedSearch(e.target.value)}
      placeholder="Search..."
    />
  );
}`}
                </pre>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">
                  Avoid Layout Thrashing
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Batch DOM reads and writes to prevent forced reflows.
                </p>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                  {`// ❌ Bad: Causes layout thrashing
elements.forEach(el => {
  const height = el.offsetHeight; // Read
  el.style.height = height + 10 + 'px'; // Write
});

// ✅ Good: Batch reads and writes
const heights = elements.map(el => el.offsetHeight); // Read all
elements.forEach((el, i) => {
  el.style.height = heights[i] + 10 + 'px'; // Write all
});`}
                </pre>
              </div>
            </div>
          </div>

          {/* Performance Checklist */}
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold mb-6">Performance Checklist</h2>
            <div className="rounded-lg border border-border bg-card p-6">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>
                    Use React.memo for expensive components that don't change
                    often
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>
                    Implement code splitting at route and component levels
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>
                    Optimize images with Next.js Image component or similar
                    tools
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Use virtualization for long lists (1000+ items)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Fetch data in parallel when dependencies allow</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Import only what you need to enable tree shaking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>
                    Debounce search inputs and throttle scroll handlers
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>
                    Monitor bundle size and use analysis tools regularly
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Test performance on slower devices and networks</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
