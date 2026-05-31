import { Palette, CheckCircle2, XCircle, List, Sparkles } from "lucide-react";

export default function TailwindBestPracticesPage() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Palette className="w-4 h-4" />
            Tailwind CSS Best Practices
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Tailwind CSS Conventions & Patterns
          </h1>
          <p className="text-xl text-muted-foreground">
            Utility-first CSS patterns, responsive design, and styling
            conventions for consistent, maintainable UIs.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="rounded-lg border border-border bg-muted/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <List className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">On This Page</h2>
          </div>
          <nav className="grid sm:grid-cols-2 gap-2 text-sm">
            <a href="#utility-first" className="text-muted-foreground hover:text-foreground transition-colors">
              Utility-First Approach
            </a>
            <a href="#class-organization" className="text-muted-foreground hover:text-foreground transition-colors">
              Class Organization
            </a>
            <a href="#responsive-design" className="text-muted-foreground hover:text-foreground transition-colors">
              Responsive Design
            </a>
            <a href="#dark-mode" className="text-muted-foreground hover:text-foreground transition-colors">
              Dark Mode
            </a>
            <a href="#custom-utilities" className="text-muted-foreground hover:text-foreground transition-colors">
              Custom Utilities
            </a>
            <a href="#component-patterns" className="text-muted-foreground hover:text-foreground transition-colors">
              Component Styling
            </a>
          </nav>
        </div>

        {/* Utility-First */}
        <div className="space-y-6" id="utility-first">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Utility-First Approach
          </h2>

          <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  Core Principle: Favor Tailwind Utilities Over Inline Styles
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  <strong>Do NOT use style attributes when you can achieve the same with Tailwind CSS className's.</strong>{" "}
                  Only use style attributes as a last resort (which should almost be never). Always use Tailwind CSS utilities
                  for consistent, maintainable styling.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-green-700 dark:text-green-300">Do: Tailwind Utilities</h3>
              </div>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// ✓ Use Tailwind utilities
<div className="flex items-center gap-4 p-6 rounded-lg bg-white shadow-md">
  <div className="w-12 h-12 rounded-full bg-blue-500" />
  <div className="flex-1">
    <h3 className="text-lg font-semibold text-gray-900">
      Title
    </h3>
    <p className="text-sm text-gray-600">
      Description text
    </p>
  </div>
</div>

// ✓ Responsive utilities
<div className="w-full md:w-1/2 lg:w-1/3">
  <img
    src="/image.jpg"
    alt="Description"
    className="w-full h-auto object-cover rounded-lg"
  />
</div>

// ✓ State variants
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50">
  Click me
</button>`}
              </pre>
            </div>

            <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="font-semibold text-red-700 dark:text-red-300">Don't: Inline Styles</h3>
              </div>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// ✗ Don't use inline styles
<div style={{
  display: "flex",
  alignItems: "center",
  gap: "16px",
  padding: "24px",
  borderRadius: "8px",
  backgroundColor: "white",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
}}>
  <div style={{
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "#3b82f6"
  }} />
  <div style={{ flex: 1 }}>
    <h3 style={{
      fontSize: "18px",
      fontWeight: 600,
      color: "#111827"
    }}>
      Title
    </h3>
  </div>
</div>

// ✗ Inline styles for responsive
<div style={{
  width: window.innerWidth > 768 ? "50%" : "100%"
}}>
  ...
</div>`}
              </pre>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">When Inline Styles Are Acceptable (Rare)</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Dynamic values from props/state:</strong> Colors, positions from API/database</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Animation transforms:</strong> Complex animations requiring JS calculations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>CSS variables:</strong> Passing dynamic values to CSS custom properties</span>
              </li>
            </ul>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// Acceptable: Dynamic color from database
<div
  className="w-full h-24 rounded-lg"
  style={{ backgroundColor: post.brandColor }}
/>

// Acceptable: CSS variables for theming
<div
  className="p-4 rounded-lg"
  style={{
    "--theme-color": themeColor,
    "--theme-radius": borderRadius
  } as React.CSSProperties}
/>`}
            </pre>
          </div>
        </div>

        {/* Class Organization */}
        <div className="space-y-6" id="class-organization">
          <h2 className="text-2xl font-bold">Class Organization</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Recommended Class Order</h3>
            <p className="text-sm text-muted-foreground">
              Organize classes in a consistent order for better readability:
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="font-mono text-primary">1.</span>
                <div>
                  <strong>Layout:</strong> <code className="text-xs bg-muted px-1 py-0.5 rounded">flex</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">grid</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">container</code>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono text-primary">2.</span>
                <div>
                  <strong>Positioning:</strong> <code className="text-xs bg-muted px-1 py-0.5 rounded">relative</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">absolute</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">top-0</code>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono text-primary">3.</span>
                <div>
                  <strong>Box Model:</strong> <code className="text-xs bg-muted px-1 py-0.5 rounded">w-full</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">h-24</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">p-4</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">m-2</code>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono text-primary">4.</span>
                <div>
                  <strong>Typography:</strong> <code className="text-xs bg-muted px-1 py-0.5 rounded">text-lg</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">font-bold</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">leading-tight</code>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono text-primary">5.</span>
                <div>
                  <strong>Visual:</strong> <code className="text-xs bg-muted px-1 py-0.5 rounded">bg-white</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">border</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">rounded-lg</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">shadow-md</code>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono text-primary">6.</span>
                <div>
                  <strong>States:</strong> <code className="text-xs bg-muted px-1 py-0.5 rounded">hover:bg-gray-100</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">focus:ring-2</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">disabled:opacity-50</code>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono text-primary">7.</span>
                <div>
                  <strong>Responsive:</strong> <code className="text-xs bg-muted px-1 py-0.5 rounded">md:w-1/2</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">lg:text-xl</code>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono text-primary">8.</span>
                <div>
                  <strong>Dark mode:</strong> <code className="text-xs bg-muted px-1 py-0.5 rounded">dark:bg-gray-800</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">dark:text-white</code>
                </div>
              </div>
            </div>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// Example with organized classes
<button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 md:px-6 md:py-3 md:text-base dark:bg-blue-600 dark:hover:bg-blue-700">
  Click me
</button>`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Use clsx or cn for Conditional Classes</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`import { cn } from "@/lib/utils";

// ✓ Good: Using cn utility
<button
  className={cn(
    "px-4 py-2 rounded-lg font-medium transition-colors",
    "bg-blue-500 text-white hover:bg-blue-600",
    isLoading && "opacity-50 cursor-not-allowed",
    variant === "outline" && "bg-transparent border-2 border-blue-500 text-blue-500",
    className // Allow prop overrides
  )}
>
  {children}
</button>

// ✗ Bad: String concatenation
<button
  className={\`px-4 py-2 \${isLoading ? "opacity-50" : ""} \${variant === "outline" ? "border" : ""}\`}
>
  {children}
</button>`}
            </pre>
          </div>
        </div>

        {/* Responsive Design */}
        <div className="space-y-6" id="responsive-design">
          <h2 className="text-2xl font-bold">Responsive Design</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Mobile-First Approach</h3>
            <p className="text-sm text-muted-foreground">
              Tailwind uses mobile-first breakpoints. Design for mobile, then add larger breakpoints:
            </p>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// Breakpoints
// sm: 640px   - Phones (landscape)
// md: 768px   - Tablets
// lg: 1024px  - Laptops
// xl: 1280px  - Desktops
// 2xl: 1536px - Large screens

// ✓ Mobile-first responsive design
<div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
  {/* Full width on mobile, half on tablet, etc. */}
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>

<h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold">
  {/* Responsive text sizing */}
</h1>

<div className="p-4 md:p-6 lg:p-8">
  {/* Responsive padding */}
</div>`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Common Responsive Patterns</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// Responsive navigation
<nav className="flex flex-col md:flex-row gap-4 md:gap-6">
  <a href="/">Home</a>
  <a href="/about">About</a>
</nav>

// Responsive images
<img
  src="/image.jpg"
  alt="Description"
  className="w-full h-auto md:w-1/2 lg:w-1/3 object-cover rounded-lg"
/>

// Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// Responsive sidebar
<div className="flex flex-col lg:flex-row gap-6">
  <aside className="w-full lg:w-64">Sidebar</aside>
  <main className="flex-1">Content</main>
</div>

// Hide/show at breakpoints
<div className="hidden md:block">
  Visible on tablet and up
</div>
<div className="block md:hidden">
  Visible on mobile only
</div>`}
            </pre>
          </div>
        </div>

        {/* Dark Mode */}
        <div className="space-y-6" id="dark-mode">
          <h2 className="text-2xl font-bold">Dark Mode</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Dark Mode Utilities</h3>
            <p className="text-sm text-muted-foreground">
              Use the <code className="text-xs bg-muted px-1 py-0.5 rounded">dark:</code> prefix for dark mode variants:
            </p>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// Basic dark mode
<div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
  Content
</div>

// Dark mode with borders and shadows
<div className="bg-white border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-900/20">
  Card content
</div>

// Dark mode hover states
<button className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
  Click me
</button>

// Semantic color tokens (recommended)
<div className="bg-background text-foreground border border-border">
  {/* Uses CSS variables that adapt to theme */}
</div>

<div className="bg-card text-card-foreground">
  Card content
</div>

<div className="bg-primary text-primary-foreground">
  Primary button
</div>`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Recommended: CSS Variables Approach</h3>
            <p className="text-sm text-muted-foreground">
              Use semantic tokens that automatically adapt to theme:
            </p>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// globals.css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  /* ... */
}

// Components use semantic names
<div className="bg-background text-foreground">
  <div className="bg-card text-card-foreground border border-border rounded-lg p-6">
    <button className="bg-gradient-to-br from-purple-600 via-purple-700 to-blue-700 text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
      Action
    </button>
  </div>
</div>`}
            </pre>
          </div>
        </div>

        {/* Custom Utilities */}
        <div className="space-y-6" id="custom-utilities">
          <h2 className="text-2xl font-bold">Custom Utilities</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Extending Tailwind Config</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;`}
            </pre>
          </div>
        </div>

        {/* Component Styling */}
        <div className="space-y-6" id="component-patterns">
          <h2 className="text-2xl font-bold">Component Styling Patterns</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Using CVA (Class Variance Authority)</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base classes
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-sm",
        lg: "h-11 px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}`}
            </pre>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-6">
          <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-4">
            Quick Reference: Tailwind CSS Best Practices
          </h3>
          <ul className="text-sm text-amber-600 dark:text-amber-300 space-y-2">
            <li>✓ Always use Tailwind utilities instead of inline styles</li>
            <li>✓ Organize classes in consistent order (layout → visual → states)</li>
            <li>✓ Use mobile-first responsive design with breakpoint prefixes</li>
            <li>✓ Use <code className="text-xs bg-muted px-1 py-0.5 rounded">dark:</code> prefix for dark mode variants</li>
            <li>✓ Prefer semantic color tokens (bg-background, text-foreground)</li>
            <li>✓ Use cn() utility for conditional classes</li>
            <li>✓ Use CVA for component variants</li>
            <li>✓ Extend theme in tailwind.config.ts for custom values</li>
            <li>✓ Use arbitrary values only when necessary: <code className="text-xs bg-muted px-1 py-0.5 rounded">[&amp;_svg]:w-4</code></li>
            <li>✗ Avoid inline styles except for dynamic values</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
