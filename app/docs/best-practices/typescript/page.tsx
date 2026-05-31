import { FileCode, CheckCircle2, XCircle, List, Shield } from "lucide-react";

export default function TypeScriptBestPracticesPage() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <FileCode className="w-4 h-4" />
            TypeScript Best Practices
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            TypeScript Patterns & Conventions
          </h1>
          <p className="text-xl text-muted-foreground">
            Type-safe patterns, conventions, and best practices for writing
            robust TypeScript code.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="rounded-lg border border-border bg-muted/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <List className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">On This Page</h2>
          </div>
          <nav className="grid sm:grid-cols-2 gap-2 text-sm">
            <a href="#array-syntax" className="text-muted-foreground hover:text-foreground transition-colors">
              Array Type Syntax
            </a>
            <a href="#interfaces-types" className="text-muted-foreground hover:text-foreground transition-colors">
              Interfaces vs Types
            </a>
            <a href="#type-inference" className="text-muted-foreground hover:text-foreground transition-colors">
              Type Inference
            </a>
            <a href="#generics" className="text-muted-foreground hover:text-foreground transition-colors">
              Generic Patterns
            </a>
            <a href="#utility-types" className="text-muted-foreground hover:text-foreground transition-colors">
              Utility Types
            </a>
            <a href="#zod-integration" className="text-muted-foreground hover:text-foreground transition-colors">
              Zod Integration
            </a>
          </nav>
        </div>

        {/* Array Syntax */}
        <div className="space-y-6" id="array-syntax">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Array Type Syntax
          </h2>

          <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  Core Principle: Use Array&lt;T&gt; instead of T[]
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  <strong>Always use the generic Array&lt;T&gt; syntax instead of T[].</strong>{" "}
                  This provides better consistency with other generic types and improves readability,
                  especially with complex types.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-green-700 dark:text-green-300">Do: Array&lt;T&gt;</h3>
              </div>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// ✓ Simple types
const numbers: Array<number> = [1, 2, 3];
const names: Array<string> = ["Alice", "Bob"];

// ✓ Complex types
const users: Array<User> = [];
const posts: Array<Post & { author: User }> = [];

// ✓ Nested arrays
const matrix: Array<Array<number>> = [[1, 2], [3, 4]];

// ✓ Function parameters
function processItems(items: Array<Item>): void {
  // ...
}

// ✓ Generic functions
function map<T, U>(
  array: Array<T>,
  fn: (item: T) => U
): Array<U> {
  return array.map(fn);
}`}
              </pre>
            </div>

            <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="font-semibold text-red-700 dark:text-red-300">Don't: T[]</h3>
              </div>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// ✗ Bracket syntax
const numbers: number[] = [1, 2, 3];
const names: string[] = ["Alice", "Bob"];

// ✗ Complex types (harder to read)
const posts: (Post & { author: User })[] = [];

// ✗ Nested arrays (confusing)
const matrix: number[][] = [[1, 2], [3, 4]];

// ✗ Function parameters
function processItems(items: Item[]): void {
  // ...
}

// ✗ Generic functions
function map<T, U>(
  array: T[],
  fn: (item: T) => U
): U[] {
  return array.map(fn);
}`}
              </pre>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Why Array&lt;T&gt; is Better</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>Consistency:</strong> Matches other generic types like Promise&lt;T&gt;, Set&lt;T&gt;, Map&lt;K, V&gt;</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>Readability:</strong> Easier to read with complex types and intersections</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>Clarity:</strong> Clear distinction between type and array wrapper</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>Scalability:</strong> Better for complex nested structures</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Interfaces vs Types */}
        <div className="space-y-6" id="interfaces-types">
          <h2 className="text-2xl font-bold">Interfaces vs Types</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">When to Use Each</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-primary">Use Interfaces For:</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Component Props:</strong> Better error messages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Object Shapes:</strong> Classes and objects</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Extension:</strong> When you need to extend</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Declaration Merging:</strong> Augmentation</span>
                  </li>
                </ul>
                <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
{`interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface AdminUser extends User {
  role: "admin";
  permissions: Array<string>;
}`}
                </pre>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-primary">Use Types For:</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Unions:</strong> Multiple possible types</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Intersections:</strong> Combining types</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Primitives:</strong> String literals, etc.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Utilities:</strong> Mapped types, conditionals</span>
                  </li>
                </ul>
                <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
{`type Status = "pending" | "active" | "completed";

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type WithTimestamps = {
  createdAt: Date;
  updatedAt: Date;
};

type Post = {
  id: string;
  title: string;
} & WithTimestamps;`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Type Inference */}
        <div className="space-y-6" id="type-inference">
          <h2 className="text-2xl font-bold">Type Inference</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-green-700 dark:text-green-300">Do: Leverage Inference</h3>
              </div>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// ✓ Let TypeScript infer
const name = "Alice"; // string
const age = 30; // number
const isActive = true; // boolean

// ✓ Infer from return type
function getUser() {
  return { id: "1", name: "Alice" };
} // Returns { id: string; name: string }

// ✓ Infer generic parameters
const items = [1, 2, 3]; // Array<number>
const users = [{ id: "1" }]; // Array<{ id: string }>

// ✓ Function parameter types needed
function greet(name: string) {
  return \`Hello, \${name}\`;
}`}
              </pre>
            </div>

            <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="font-semibold text-red-700 dark:text-red-300">Don't: Over-annotate</h3>
              </div>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// ✗ Unnecessary type annotations
const name: string = "Alice";
const age: number = 30;
const isActive: boolean = true;

// ✗ Redundant return type
function getUser(): {
  id: string;
  name: string;
} {
  return { id: "1", name: "Alice" };
}

// ✗ Redundant generic
const items: Array<number> = [1, 2, 3];

// ✗ But missing parameter types
function greet(name) { // Error!
  return \`Hello, \${name}\`;
}`}
              </pre>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">When to Add Explicit Types</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>Function parameters:</strong> Always type function parameters</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>Public APIs:</strong> Export interfaces for public functions/components</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>Complex return types:</strong> When inference isn't obvious</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>Empty arrays/objects:</strong> When type can't be inferred</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Generic Patterns */}
        <div className="space-y-6" id="generics">
          <h2 className="text-2xl font-bold">Generic Patterns</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Common Generic Patterns</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// Generic function
function identity<T>(value: T): T {
  return value;
}

// Generic with constraints
function getProperty<T, K extends keyof T>(
  obj: T,
  key: K
): T[K] {
  return obj[key];
}

// Generic component props
interface ListProps<T> {
  items: Array<T>;
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <div>
      {items.map((item, index) => (
        <div key={index}>{renderItem(item)}</div>
      ))}
    </div>
  );
}

// Generic API response
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Failed to fetch" };
  }
}`}
            </pre>
          </div>
        </div>

        {/* Utility Types */}
        <div className="space-y-6" id="utility-types">
          <h2 className="text-2xl font-bold">Utility Types</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Commonly Used Utility Types</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// Pick - Select specific properties
type UserPublic = Pick<User, "id" | "name" | "email">;
// { id: string; name: string; email: string }

// Omit - Exclude specific properties
type UserWithoutPassword = Omit<User, "password">;
// { id: string; name: string; email: string; createdAt: Date }

// Partial - Make all properties optional
type UserUpdate = Partial<User>;
// { id?: string; name?: string; ... }

// Required - Make all properties required
type UserRequired = Required<Partial<User>>;

// Readonly - Make all properties readonly
type ImmutableUser = Readonly<User>;

// Record - Create object type with keys
type UserMap = Record<string, User>;
// { [key: string]: User }

// ReturnType - Get function return type
function getUser() {
  return { id: "1", name: "Alice" };
}
type UserData = ReturnType<typeof getUser>;
// { id: string; name: string }

// Parameters - Get function parameter types
function createUser(name: string, email: string) {}
type CreateUserParams = Parameters<typeof createUser>;
// [string, string]

// Awaited - Get Promise resolved type
type UserPromise = Promise<User>;
type ResolvedUser = Awaited<UserPromise>;
// User`}
            </pre>
          </div>
        </div>

        {/* Zod Integration */}
        <div className="space-y-6" id="zod-integration">
          <h2 className="text-2xl font-bold">Zod Integration</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Schema-First Type Definition</h3>
            <p className="text-sm text-muted-foreground">
              Use Zod schemas to define runtime validation and infer TypeScript types:
            </p>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`import { z } from "zod";

// Define schema
export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(0).max(120).optional(),
  role: z.enum(["user", "admin", "moderator"]),
  createdAt: z.date(),
});

// Infer TypeScript type from schema
export type User = z.infer<typeof userSchema>;
// {
//   id: string;
//   name: string;
//   email: string;
//   age?: number;
//   role: "user" | "admin" | "moderator";
//   createdAt: Date;
// }

// Use in validation
function validateUser(data: unknown): User {
  return userSchema.parse(data);
}

// Create variations
export const userCreateSchema = userSchema.omit({
  id: true,
  createdAt: true
});

export type UserCreate = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = userSchema
  .partial()
  .required({ id: true });

export type UserUpdate = z.infer<typeof userUpdateSchema>;`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Server Action with Zod</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// lib/users/schema.ts
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be 8+ characters"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// lib/users/server-actions.ts
"use server";

import { createUserSchema } from "./schema";

export async function createUser(input: unknown) {
  // Validate input
  const result = createUserSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false as const,
      error: result.error.flatten().fieldErrors,
    };
  }

  // Type-safe data access
  const { name, email, password } = result.data;

  // Create user...
  return {
    success: true as const,
    data: user,
  };
}`}
            </pre>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-6">
          <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-4">
            Quick Reference: TypeScript Best Practices
          </h3>
          <ul className="text-sm text-amber-600 dark:text-amber-300 space-y-2">
            <li>✓ Use Array&lt;T&gt; instead of T[] for consistency</li>
            <li>✓ Use interfaces for component props and object shapes</li>
            <li>✓ Use types for unions, intersections, and utilities</li>
            <li>✓ Leverage type inference for variables and return types</li>
            <li>✓ Always type function parameters explicitly</li>
            <li>✓ Use Zod for runtime validation and type inference</li>
            <li>✓ Avoid <code className="text-xs bg-muted px-1 py-0.5 rounded">any</code> - use <code className="text-xs bg-muted px-1 py-0.5 rounded">unknown</code> instead</li>
            <li>✓ Use utility types (Pick, Omit, Partial) to derive types</li>
            <li>✓ Prefer const assertions for literal types</li>
            <li>✓ Use generics for reusable, type-safe code</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
