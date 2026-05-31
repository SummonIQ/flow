'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ComponentsBestPracticesPage() {
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
          <h1 className="text-4xl font-bold mb-4">Component Best Practices</h1>
          <p className="text-lg text-muted-foreground">
            Guidelines for building reusable, maintainable, and performant React components
          </p>
        </div>

        {/* Table of Contents */}
        <div className="mb-12 rounded-lg border border-border bg-muted/40 p-6">
          <div className="mb-3">
            <h2 className="text-lg font-semibold">On This Page</h2>
          </div>
          <nav className="grid sm:grid-cols-2 gap-2 text-sm">
            <a href="#component-structure" className="text-muted-foreground hover:text-foreground transition-colors">
              Component Structure
            </a>
            <a href="#props-patterns" className="text-muted-foreground hover:text-foreground transition-colors">
              Props Patterns
            </a>
            <a href="#composition" className="text-muted-foreground hover:text-foreground transition-colors">
              Composition
            </a>
            <a href="#state-management" className="text-muted-foreground hover:text-foreground transition-colors">
              State Management
            </a>
            <a href="#performance" className="text-muted-foreground hover:text-foreground transition-colors">
              Performance
            </a>
            <a href="#accessibility" className="text-muted-foreground hover:text-foreground transition-colors">
              Accessibility
            </a>
          </nav>
        </div>

        {/* Component Structure */}
        <div className="space-y-12" id="component-structure">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-6 h-6" />
              Component Structure
            </h2>

            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">Single Responsibility</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Each component should do one thing well. Break down complex components into smaller, focused pieces.
                </p>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// ✅ Good: Focused component
function UserAvatar({ user, size = 'md' }) {
  return (
    <img
      src={user.avatarUrl}
      alt={user.name}
      className={cn('rounded-full', sizeClasses[size])}
    />
  );
}

// ❌ Bad: Component doing too much
function UserProfile({ user }) {
  // Handles display, editing, validation, API calls...
  return (/* complex JSX */);
}`}
                </pre>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">File Organization</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Organize component files consistently across your project.
                </p>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`components/
├── button/
│   ├── button.tsx          # Main component
│   ├── button.test.tsx     # Tests
│   ├── button.stories.tsx  # Storybook stories
│   └── index.ts            # Exports
└── card/
    ├── card.tsx
    ├── card-header.tsx     # Subcomponents
    ├── card-content.tsx
    └── index.ts`}
                </pre>
              </div>
            </div>
          </div>

          {/* Props Patterns */}
          <div id="props-patterns">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-6 h-6" />
              Props Patterns
            </h2>

            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">Type-Safe Props</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Always define TypeScript interfaces for component props.
                </p>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

function Button({ 
  variant = 'default',
  size = 'md',
  isLoading,
  children,
  ...props 
}: ButtonProps) {
  return <button {...props}>{children}</button>;
}`}
                </pre>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">Spread Native Props</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Allow passing through native HTML attributes using spread operator.
                </p>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// ✅ Good: Spreads remaining props
function Input({ className, ...props }: InputProps) {
  return <input className={cn('...', className)} {...props} />;
}

// ❌ Bad: Manually defining every HTML attribute
function Input({ 
  className, 
  onChange, 
  onBlur, 
  value, 
  placeholder 
}: InputProps) {
  return <input /* ... */ />;
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Composition */}
          <div id="composition">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-6 h-6" />
              Composition Over Configuration
            </h2>

            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Prefer composable components over highly configurable ones.
              </p>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// ✅ Good: Composable
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// ❌ Bad: Over-configured
<Card
  title="Title"
  description="Description"
  content="Content here"
  footer={<Button>Action</Button>}
  showHeader
  showFooter
/>`}
              </pre>
            </div>
          </div>

          {/* State Management */}
          <div id="state-management">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-6 h-6" />
              State Management
            </h2>

            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">Lift State When Needed</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Keep state as local as possible, but lift it when siblings need to share data.
                </p>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// ✅ Good: State lifted to parent when shared
function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  return (
    <>
      <SearchInput value={query} onChange={setQuery} />
      <SearchResults results={results} />
    </>
  );
}`}
                </pre>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">Controlled vs Uncontrolled</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Support both controlled and uncontrolled patterns for flexibility.
                </p>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`function Input({ 
  value: controlledValue, 
  defaultValue, 
  onChange 
}: InputProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (e) => {
    if (!isControlled) setInternalValue(e.target.value);
    onChange?.(e);
  };

  return <input value={value} onChange={handleChange} />;
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div id="performance">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-6 h-6" />
              Performance Optimization
            </h2>

            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">Memoization</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Use React.memo, useMemo, and useCallback appropriately.
                </p>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// ✅ Good: Memoize expensive computations
const ExpensiveList = React.memo(function ExpensiveList({ items }) {
  const sortedItems = useMemo(
    () => items.sort((a, b) => a.value - b.value),
    [items]
  );

  return <ul>{sortedItems.map(/* ... */)}</ul>;
});

// Use useCallback for event handlers passed to children
function Parent() {
  const handleClick = useCallback(() => {
    // handler logic
  }, []);

  return <Child onClick={handleClick} />;
}`}
                </pre>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">Code Splitting</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Use dynamic imports for large components.
                </p>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Accessibility */}
          <div id="accessibility">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-6 h-6" />
              Accessibility
            </h2>

            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">Semantic HTML</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Use appropriate HTML elements for their intended purpose.
                </p>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// ✅ Good: Semantic HTML
<button onClick={handleClick}>Click me</button>
<nav><a href="/home">Home</a></nav>

// ❌ Bad: Div soup
<div onClick={handleClick} role="button">Click me</div>
<div><span onClick={goHome}>Home</span></div>`}
                </pre>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">ARIA Attributes</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add ARIA attributes when semantic HTML isn't sufficient.
                </p>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`function Tabs({ items, activeTab }) {
  return (
    <div role="tablist">
      {items.map((item) => (
        <button
          key={item.id}
          role="tab"
          aria-selected={activeTab === item.id}
          aria-controls={\`panel-\${item.id}\`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}`}
                </pre>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">Keyboard Navigation</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Ensure all interactive elements are keyboard accessible.
                </p>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`function Dropdown({ items, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false);
    if (e.key === 'ArrowDown') focusNext();
    if (e.key === 'ArrowUp') focusPrevious();
    if (e.key === 'Enter') selectCurrent();
  };

  return (
    <div onKeyDown={handleKeyDown}>
      {/* ... */}
    </div>
  );
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Quick Reference */}
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold mb-6">Quick Reference</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-6">
                <h3 className="font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Do's
                </h3>
                <ul className="text-sm text-green-600 dark:text-green-300 space-y-2">
                  <li>✓ Keep components small and focused</li>
                  <li>✓ Use TypeScript for type safety</li>
                  <li>✓ Write meaningful component and prop names</li>
                  <li>✓ Compose components for flexibility</li>
                  <li>✓ Test component behavior</li>
                  <li>✓ Follow accessibility best practices</li>
                  <li>✓ Document complex components</li>
                </ul>
              </div>

              <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-6">
                <h3 className="font-semibold text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Don'ts
                </h3>
                <ul className="text-sm text-red-600 dark:text-red-300 space-y-2">
                  <li>✗ Create "god" components</li>
                  <li>✗ Use inline styles excessively</li>
                  <li>✗ Ignore TypeScript errors</li>
                  <li>✗ Over-optimize prematurely</li>
                  <li>✗ Mutate props</li>
                  <li>✗ Use too many props</li>
                  <li>✗ Skip accessibility features</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
