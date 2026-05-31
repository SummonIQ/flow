'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CodeBlock } from '@summoniq/applab-ui';
import { ArrowLeft, Code, Component, FileCode, Workflow } from 'lucide-react';
import Link from 'next/link';

export default function DesignPatternsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4 transition-colors"
          href="/docs/architecture"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Architecture
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Design Patterns
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl">
            Common design patterns and best practices used throughout SummonIQ applications.
          </p>
        </div>
      </div>

      {/* Introduction */}
      <Card className="bg-black border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Pattern-Based Development</CardTitle>
          <CardDescription className="text-gray-400">
            Consistent patterns improve code quality, maintainability, and team collaboration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300">
            We follow established design patterns to solve common problems in a consistent way.
            These patterns have been proven effective and help new team members quickly understand the codebase.
          </p>
        </CardContent>
      </Card>

      {/* Component Patterns */}
      <Card className="bg-black border-white/10">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Component className="w-5 h-5 text-blue-400" />
            </div>
            <CardTitle className="text-white">Component Composition</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Build complex UIs from simple, reusable components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-300">
            Components should be small, focused, and composable. Use the compound component pattern
            for flexible APIs:
          </p>
          <CodeBlock
            code={`// Compound component pattern
<Modal open={isOpen} onOpenChange={setIsOpen}>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Delete Item</ModalTitle>
      <ModalDescription>This action cannot be undone</ModalDescription>
    </ModalHeader>
    <ModalFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        Delete
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>`}
            language="tsx"
          />
        </CardContent>
      </Card>

      {/* Hooks Pattern */}
      <Card className="bg-black border-white/10">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Code className="w-5 h-5 text-purple-400" />
            </div>
            <CardTitle className="text-white">Custom Hooks</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Extract and share stateful logic between components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-300">
            Use custom hooks to encapsulate reusable logic and state management:
          </p>
          <CodeBlock
            code={`// Custom hook for data fetching
function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { projects, loading, error };
}

// Usage in component
function ProjectList() {
  const { projects, loading, error } = useProjects();
  
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <div>{projects.map(p => <ProjectCard key={p.id} project={p} />)}</div>;
}`}
            language="tsx"
          />
        </CardContent>
      </Card>

      {/* Render Props */}
      <Card className="bg-black border-white/10">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-500/10">
              <FileCode className="w-5 h-5 text-green-400" />
            </div>
            <CardTitle className="text-white">Server Components</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Leverage Next.js Server Components for improved performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-300">
            Use Server Components by default, and add &apos;use client&apos; only when needed:
          </p>
          <CodeBlock
            code={`// Server Component (default)
async function ProjectsPage() {
  const projects = await db.project.findMany();
  
  return (
    <div>
      <h1>Projects</h1>
      <ProjectList projects={projects} />
    </div>
  );
}

// Client Component (when interactivity is needed)
'use client';

function ProjectList({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState('');
  
  const filtered = projects.filter(p => 
    p.name.toLowerCase().includes(filter.toLowerCase())
  );
  
  return (
    <>
      <input value={filter} onChange={e => setFilter(e.target.value)} />
      {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
    </>
  );
}`}
            language="tsx"
          />
        </CardContent>
      </Card>

      {/* Provider Pattern */}
      <Card className="bg-black border-white/10">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Workflow className="w-5 h-5 text-orange-400" />
            </div>
            <CardTitle className="text-white">Context & Providers</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Share state across component trees without prop drilling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-300">
            Use Context for global state that many components need:
          </p>
          <CodeBlock
            code={`// Create context
const ThemeContext = createContext<ThemeContextType>(undefined!);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for consuming context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}`}
            language="tsx"
          />
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="bg-black border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Pattern Selection Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex gap-3">
              <span className="text-blue-400">→</span>
              <p><strong className="text-white">Prefer composition over inheritance</strong> - Build complex components from simple ones</p>
            </div>
            <div className="flex gap-3">
              <span className="text-purple-400">→</span>
              <p><strong className="text-white">Extract custom hooks early</strong> - Don&apos;t wait until you need the same logic in multiple places</p>
            </div>
            <div className="flex gap-3">
              <span className="text-green-400">→</span>
              <p><strong className="text-white">Keep components small</strong> - If a component is over 200 lines, consider splitting it</p>
            </div>
            <div className="flex gap-3">
              <span className="text-orange-400">→</span>
              <p><strong className="text-white">Use TypeScript strictly</strong> - Avoid &apos;any&apos; types and leverage inference</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
