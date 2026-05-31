import { Database, GitBranch, Table, Zap } from "lucide-react";

export default function DatabasePage() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Database className="w-4 h-4" />
            Database
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Database Patterns
          </h1>
          <p className="text-xl text-muted-foreground">
            Prisma ORM patterns, schema design, migrations, and database access
            patterns used across all projects.
          </p>
        </div>

        {/* Prisma Overview */}
        <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-6">
          <div className="flex items-start gap-4">
            <Database className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                Prisma ORM + PostgreSQL
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                All projects use <strong>Prisma ORM</strong> as the database client
                with <strong>PostgreSQL</strong> as the database. Prisma provides
                type-safe database access, automatic migrations, and a powerful schema
                definition language.
              </p>
            </div>
          </div>
        </div>

        {/* Setup */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Prisma Setup</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">1. Schema Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Create <code className="text-xs bg-muted px-1 py-0.5 rounded">prisma/schema.prisma</code>:
            </p>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "darwin", "darwin-arm64"]
}`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">2. Database Client</h3>
            <p className="text-sm text-muted-foreground">
              Create <code className="text-xs bg-muted px-1 py-0.5 rounded">lib/db/index.ts</code>:
            </p>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

export * from '@prisma/client';`}
            </pre>
            <div className="rounded-lg bg-blue-500/10 p-3 mt-3">
              <p className="text-sm text-blue-600 dark:text-blue-300">
                <strong>Why:</strong> This pattern prevents creating multiple Prisma
                Client instances during development hot reloading.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">3. Common Scripts</h3>
            <div className="font-mono text-sm space-y-2">
              <div className="grid grid-cols-[1fr,2fr] gap-4 items-start">
                <code className="text-primary">bun db:generate</code>
                <span className="text-muted-foreground">Generate Prisma Client types</span>
              </div>
              <div className="grid grid-cols-[1fr,2fr] gap-4 items-start">
                <code className="text-primary">bun db:migrate</code>
                <span className="text-muted-foreground">Run migrations (dev)</span>
              </div>
              <div className="grid grid-cols-[1fr,2fr] gap-4 items-start">
                <code className="text-primary">bun db:push</code>
                <span className="text-muted-foreground">Push schema without migration</span>
              </div>
              <div className="grid grid-cols-[1fr,2fr] gap-4 items-start">
                <code className="text-primary">bun db:studio</code>
                <span className="text-muted-foreground">Open Prisma Studio GUI</span>
              </div>
            </div>
          </div>
        </div>

        {/* Schema Patterns */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Table className="w-6 h-6" />
            Schema Design Patterns
          </h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Basic Model Definition</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`model User {
  id        String   @id @default(cuid())
  email     String   @unique
  firstName String
  lastName  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  posts     Post[]
  profile   Profile?

  @@map("user")
}`}
            </pre>
            <div className="space-y-2">
              <p className="text-sm font-semibold">Key Conventions:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">@id @default(cuid())</code> -
                  Use cuid() for primary keys
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">createdAt</code> and{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">updatedAt</code> -
                  Timestamp tracking
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">@@map("table_name")</code> -
                  Lowercase table names
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  PascalCase for model names, camelCase for fields
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Relationship Patterns</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// One-to-One
model User {
  id      String   @id @default(cuid())
  profile Profile?
}

model Profile {
  id     String @id @default(cuid())
  bio    String?
  user   User   @relation(fields: [userId], references: [id])
  userId String @unique
}

// One-to-Many
model User {
  id    String @id @default(cuid())
  posts Post[]
}

model Post {
  id       String @id @default(cuid())
  title    String
  author   User   @relation(fields: [authorId], references: [id])
  authorId String
}

// Many-to-Many
model Post {
  id         String     @id @default(cuid())
  title      String
  categories Category[]
}

model Category {
  id    String @id @default(cuid())
  name  String
  posts Post[]
}

// Many-to-Many (Explicit Join Table)
model Post {
  id         String       @id @default(cuid())
  title      String
  postTags   PostTag[]
}

model Tag {
  id       String    @id @default(cuid())
  name     String    @unique
  postTags PostTag[]
}

model PostTag {
  post      Post     @relation(fields: [postId], references: [id])
  postId    String
  tag       Tag      @relation(fields: [tagId], references: [id])
  tagId     String
  createdAt DateTime @default(now())

  @@id([postId, tagId])
}`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Cascade & OnDelete Behavior</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`model User {
  id    String @id @default(cuid())
  posts Post[]
}

model Post {
  id       String @id @default(cuid())
  title    String
  author   User   @relation(
    fields: [authorId],
    references: [id],
    onDelete: Cascade  // Delete posts when user is deleted
  )
  authorId String
}

// Other onDelete options:
// - Cascade: Delete related records
// - SetNull: Set foreign key to null
// - Restrict: Prevent deletion if related records exist
// - NoAction: Database default behavior`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Enums & Advanced Types</h3>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`enum Role {
  USER
  ADMIN
  MODERATOR
}

enum Status {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model Post {
  id          String   @id @default(cuid())
  title       String
  status      Status   @default(DRAFT)
  tags        String[] // Array of strings
  metadata    Json?    // JSON field (optional)
  content     String   @db.Text // Large text
  views       Int      @default(0)
  publishedAt DateTime?
}`}
            </pre>
          </div>
        </div>

        {/* Migration Workflow */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GitBranch className="w-6 h-6" />
            Migration Workflow
          </h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Development Workflow</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Update Schema</p>
                  <p className="text-sm text-muted-foreground">
                    Modify <code className="text-xs bg-muted px-1 py-0.5 rounded">schema.prisma</code>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Create Migration</p>
                  <pre className="text-xs bg-muted p-2 rounded mt-1">
                    bun db:migrate dev --name add_user_profile
                  </pre>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Generate Client</p>
                  <pre className="text-xs bg-muted p-2 rounded mt-1">
                    bun db:generate
                  </pre>
                  <p className="text-xs text-muted-foreground mt-1">
                    (Usually automatic with migrate)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  4
                </div>
                <div>
                  <p className="font-medium">Commit Migration</p>
                  <p className="text-sm text-muted-foreground">
                    Commit both schema and migration files to version control
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-600 dark:text-amber-300">
              <strong>Production Migrations:</strong> Run{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">prisma migrate deploy</code> in
              production environments. Never use{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">prisma migrate dev</code> in production.
            </p>
          </div>
        </div>

        {/* Query Patterns */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Common Query Patterns
          </h2>

          <div className="grid gap-6">
            {/* CRUD Operations */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">CRUD Operations</h3>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`import { db } from "@/lib/db";

// Create
const user = await db.user.create({
  data: {
    email: "user@example.com",
    firstName: "John",
    lastName: "Doe",
  },
});

// Read (single)
const user = await db.user.findUnique({
  where: { id: userId },
});

// Read (multiple)
const users = await db.user.findMany({
  where: { role: "ADMIN" },
  orderBy: { createdAt: "desc" },
  take: 10,
});

// Update
const user = await db.user.update({
  where: { id: userId },
  data: { firstName: "Jane" },
});

// Delete
await db.user.delete({
  where: { id: userId },
});`}
              </pre>
            </div>

            {/* Relations */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Including Relations</h3>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// Include related data
const user = await db.user.findUnique({
  where: { id: userId },
  include: {
    posts: true,
    profile: true,
  },
});

// Select specific fields
const user = await db.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    posts: {
      select: {
        id: true,
        title: true,
      },
    },
  },
});

// Nested relations
const user = await db.user.findUnique({
  where: { id: userId },
  include: {
    posts: {
      include: {
        comments: true,
      },
    },
  },
});`}
              </pre>
            </div>

            {/* Filtering */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Advanced Filtering</h3>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// Complex where conditions
const posts = await db.post.findMany({
  where: {
    AND: [
      { status: "PUBLISHED" },
      { authorId: userId },
      {
        OR: [
          { views: { gte: 100 } },
          { featured: true },
        ],
      },
    ],
    title: {
      contains: "TypeScript",
      mode: "insensitive",
    },
    publishedAt: {
      gte: new Date("2024-01-01"),
    },
  },
  orderBy: [
    { featured: "desc" },
    { views: "desc" },
    { publishedAt: "desc" },
  ],
});`}
              </pre>
            </div>

            {/* Transactions */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Transactions</h3>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// Transaction with multiple operations
const result = await db.$transaction(async (tx) => {
  // Create user
  const user = await tx.user.create({
    data: {
      email: "user@example.com",
      firstName: "John",
      lastName: "Doe",
    },
  });

  // Create profile
  const profile = await tx.profile.create({
    data: {
      userId: user.id,
      bio: "Hello world",
    },
  });

  return { user, profile };
});

// Alternative array syntax
const [user, profile] = await db.$transaction([
  db.user.create({ data: { ... } }),
  db.profile.create({ data: { ... } }),
]);`}
              </pre>
            </div>

            {/* Aggregations */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Aggregations</h3>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// Count
const count = await db.post.count({
  where: { status: "PUBLISHED" },
});

// Aggregate
const stats = await db.post.aggregate({
  where: { authorId: userId },
  _count: true,
  _avg: { views: true },
  _sum: { views: true },
  _max: { views: true },
});

// Group by
const postsByStatus = await db.post.groupBy({
  by: ["status"],
  _count: true,
  _avg: { views: true },
});`}
              </pre>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Best Practices</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="font-semibold">Use Select for Performance</h3>
              <p className="text-sm text-muted-foreground">
                Only fetch the fields you need. Use{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">select</code> instead of
                fetching entire models.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="font-semibold">Leverage Type Safety</h3>
              <p className="text-sm text-muted-foreground">
                Prisma generates TypeScript types. Use them everywhere for
                compile-time safety.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="font-semibold">Index Strategic Fields</h3>
              <p className="text-sm text-muted-foreground">
                Add <code className="text-xs bg-muted px-1 py-0.5 rounded">@@index</code> on
                frequently queried fields to improve performance.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="font-semibold">Use Transactions</h3>
              <p className="text-sm text-muted-foreground">
                Wrap related operations in transactions to ensure data consistency.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="font-semibold">Separate Query Logic</h3>
              <p className="text-sm text-muted-foreground">
                Keep database queries in{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">lib/[feature]/query.ts</code> files,
                separate from UI components.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h3 className="font-semibold">Server-Only Imports</h3>
              <p className="text-sm text-muted-foreground">
                Use <code className="text-xs bg-muted px-1 py-0.5 rounded">server-only</code> package
                to prevent database queries from running on the client.
              </p>
            </div>
          </div>
        </div>

        {/* Common Patterns */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Organization Patterns</h2>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Feature-Based Query Organization</h3>
            <div className="font-mono text-sm text-muted-foreground">
              <pre>
{`lib/
└── [feature]/
    ├── query.ts          # Read operations
    ├── create.ts         # Create operations
    ├── update.ts         # Update operations
    ├── delete.ts         # Delete operations
    ├── schema.ts         # Zod validation schemas
    └── server-actions.ts # Server Actions`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
