import { Wrench, Calendar, Type, AlertCircle, FileText } from "lucide-react";

export default function UtilitiesPage() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Wrench className="w-4 h-4" />
            Common Utilities
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Common Utilities & Helpers
          </h1>
          <p className="text-xl text-muted-foreground">
            Shared utility functions, formatters, error handling, and helper
            libraries used across all projects.
          </p>
        </div>

        {/* Overview */}
        <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-6">
          <div className="flex items-start gap-4">
            <Wrench className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                Shared Utility Libraries
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                All projects share common utility patterns for string formatting,
                date handling, CSS class management, and error handling. These
                utilities are organized in the <code className="text-xs bg-muted px-1 py-0.5 rounded">lib/</code> directory
                by domain.
              </p>
            </div>
          </div>
        </div>

        {/* CSS & Styling Utilities */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">CSS & Styling Utilities</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">cn() - Class Name Helper</h3>
            <p className="text-sm text-muted-foreground">
              Used everywhere for conditional class names. Combines{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">clsx</code> and{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">tailwind-merge</code>:
            </p>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// lib/utils.ts (or lib/css.ts)
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage:
import { cn } from "@/lib/utils";

<div
  className={cn(
    "base-class",
    isActive && "active-class",
    { "error-class": hasError },
    className // from props
  )}
/>`}
            </pre>
            <div className="rounded-lg bg-blue-500/10 p-3">
              <p className="text-sm text-blue-600 dark:text-blue-300">
                <strong>Why:</strong> <code className="text-xs bg-muted px-1 py-0.5 rounded">twMerge</code> prevents
                Tailwind class conflicts (e.g., <code className="text-xs bg-muted px-1 py-0.5 rounded">px-2 px-4</code> becomes just{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">px-4</code>).
              </p>
            </div>
          </div>
        </div>

        {/* Date & Time Utilities */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Date & Time Utilities
          </h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">date-fns Integration</h3>
            <p className="text-sm text-muted-foreground">
              All projects use <code className="text-xs bg-muted px-1 py-0.5 rounded">date-fns</code> for
              date manipulation:
            </p>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// lib/time/format.ts
import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatDate(
  date: Date | string,
  pattern = "MMM d, yyyy"
) {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, pattern);
}

export function formatRelativeTime(date: Date | string) {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function formatDateTime(date: Date | string) {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "MMM d, yyyy 'at' h:mm a");
}

// Usage:
formatDate(new Date()); // "Jan 15, 2024"
formatRelativeTime(new Date()); // "2 hours ago"
formatDateTime(new Date()); // "Jan 15, 2024 at 3:45 PM"`}
            </pre>
          </div>
        </div>

        {/* String Utilities */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Type className="w-6 h-6" />
            String Utilities
          </h2>

          <div className="grid gap-6">
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">String Formatting</h3>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// lib/strings/format.ts
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function truncate(
  str: string,
  length: number,
  suffix = "..."
): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + suffix;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Usage:
capitalize("hello world"); // "Hello world"
truncate("Long text here", 10); // "Long text..."
slugify("Hello World!"); // "hello-world"
initials("John Doe"); // "JD"`}
              </pre>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">String Parsing</h3>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// lib/strings/parse.ts
export function parseNumber(value: string): number | null {
  const parsed = parseFloat(value.replace(/[^\d.-]/g, ""));
  return isNaN(parsed) ? null : parsed;
}

export function parseBoolean(value: string): boolean {
  const normalized = value.toLowerCase().trim();
  return ["true", "1", "yes", "y"].includes(normalized);
}

export function extractEmails(text: string): string[] {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  return text.match(emailRegex) || [];
}

export function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s]+/g;
  return text.match(urlRegex) || [];
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Number & Currency Formatting */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Number & Currency Formatting</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Number Formatters</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// lib/format.ts
export function formatNumber(
  num: number,
  decimals = 0
): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatCurrency(
  amount: number,
  currency = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatPercent(
  value: number,
  decimals = 0
): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

export function formatCompact(num: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(num);
}

// Usage:
formatNumber(1234567.89, 2); // "1,234,567.89"
formatCurrency(1299.99); // "$1,299.99"
formatPercent(85.5, 1); // "85.5%"
formatCompact(1234567); // "1.2M"`}
            </pre>
          </div>
        </div>

        {/* Error Handling */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            Error Handling
          </h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Custom Error Classes</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// lib/errors/index.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(\`\${resource} not found\`, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

// Usage:
throw new NotFoundError("User");
throw new UnauthorizedError();
throw new ValidationError("Invalid input", {
  email: ["Invalid email format"],
});`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Error Handler Utility</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// lib/errors/handler.ts
import { ZodError } from "zod";

export function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return {
      success: false,
      error: "Validation failed",
      details: error.flatten().fieldErrors,
    };
  }

  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }

  // Log unexpected errors
  console.error("Unexpected error:", error);

  return {
    success: false,
    error: "An unexpected error occurred",
  };
}

// Usage in Server Actions:
export async function createPost(data: PostInput) {
  try {
    const post = await db.post.create({ data });
    return { success: true, data: post };
  } catch (error) {
    return handleError(error);
  }
}`}
            </pre>
          </div>
        </div>

        {/* Logger */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Logging
          </h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Pino Logger Setup</h3>
            <p className="text-sm text-muted-foreground">
              Most projects use <code className="text-xs bg-muted px-1 py-0.5 rounded">pino</code> for
              structured logging:
            </p>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// lib/logger/index.ts
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        }
      : undefined,
});

// Usage:
logger.info("User logged in", { userId: user.id });
logger.error("Failed to create post", { error, userId });
logger.warn("Rate limit approaching", { userId, count });

// Child loggers with context:
const userLogger = logger.child({ userId: user.id });
userLogger.info("Action performed");`}
            </pre>
          </div>
        </div>

        {/* Validation Helpers */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Validation Helpers</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Zod Schema Helpers</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// lib/validation/schemas.ts
import { z } from "zod";

// Reusable schemas
export const emailSchema = z
  .string()
  .email("Invalid email format")
  .min(1, "Email is required");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(20, "Password must be less than 20 characters");

export const urlSchema = z
  .string()
  .url("Invalid URL format")
  .optional();

export const phoneSchema = z
  .string()
  .regex(/^[0-9]{10}$/, "Invalid phone number")
  .optional();

// Helper for optional file uploads
export const fileSchema = z.instanceof(File).optional();

// Date range validation
export function dateRangeSchema(
  startField = "startDate",
  endField = "endDate"
) {
  return z.object({
    [startField]: z.date(),
    [endField]: z.date(),
  }).refine(
    (data) => data[startField] <= data[endField],
    {
      message: "End date must be after start date",
      path: [endField],
    }
  );
}`}
            </pre>
          </div>
        </div>

        {/* Array & Object Utilities */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Array & Object Utilities</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Common Array Helpers</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// lib/utils.ts
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

export function groupBy<T>(
  arr: T[],
  key: keyof T
): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const group = String(item[key]);
    acc[group] = acc[group] || [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

export function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from(
    { length: Math.ceil(arr.length / size) },
    (_, i) => arr.slice(i * size, i * size + size)
  );
}

// Usage:
unique([1, 2, 2, 3]); // [1, 2, 3]
groupBy(users, "role"); // { admin: [...], user: [...] }
chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Object Helpers</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}

export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  return keys.reduce((acc, key) => {
    if (key in obj) acc[key] = obj[key];
    return acc;
  }, {} as Pick<T, K>);
}

// Usage:
omit(user, ["password", "salt"]); // User without sensitive fields
pick(user, ["id", "email", "name"]); // Only specified fields`}
            </pre>
          </div>
        </div>

        {/* Common Patterns */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Organization Patterns</h2>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Utility File Structure</h3>
            <div className="font-mono text-sm text-muted-foreground">
              <pre>
{`lib/
├── utils.ts              # General utilities (cn, etc.)
├── format.ts             # Number/currency formatting
├── strings/
│   ├── format.ts        # String formatting
│   └── parse.ts         # String parsing
├── time/
│   └── format.ts        # Date formatting
├── errors/
│   ├── index.ts         # Error classes
│   └── handler.ts       # Error handler
├── logger/
│   └── index.ts         # Logger setup
├── validation/
│   └── schemas.ts       # Reusable Zod schemas
└── css/
    └── index.ts         # CSS utilities (if separate)`}
              </pre>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Best Practices</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="font-semibold">Type Everything</h3>
              <p className="text-sm text-muted-foreground">
                All utilities should have proper TypeScript types for inputs and
                outputs.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="font-semibold">Pure Functions</h3>
              <p className="text-sm text-muted-foreground">
                Utilities should be pure functions with no side effects when
                possible.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="font-semibold">Test Coverage</h3>
              <p className="text-sm text-muted-foreground">
                Critical utilities (parsing, formatting, validation) should have
                unit tests.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="font-semibold">Document Complex Logic</h3>
              <p className="text-sm text-muted-foreground">
                Add JSDoc comments for complex utilities explaining parameters and
                return values.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="font-semibold">Named Exports</h3>
              <p className="text-sm text-muted-foreground">
                Use named exports, not default exports, for better tree-shaking and
                refactoring.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="font-semibold">Organize by Domain</h3>
              <p className="text-sm text-muted-foreground">
                Group related utilities together in subdirectories (strings, time,
                errors, etc.).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
