"use client";

import { Lock, Shield, Key, UserCheck } from "lucide-react";

export default function AuthenticationPage() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Lock className="w-4 h-4" />
            Authentication
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Authentication Patterns
          </h1>
          <p className="text-xl text-muted-foreground">
            Better Auth implementation, session management, and authentication
            flows used across all projects.
          </p>
        </div>

        {/* Better Auth Overview */}
        <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-6">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                Better Auth (NOT NextAuth)
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                All projects use <strong>Better Auth</strong>, not NextAuth/Auth.js.
                Better Auth provides session-based authentication with bcrypt password
                hashing, Prisma adapter integration, and flexible configuration.
              </p>
            </div>
          </div>
        </div>

        {/* Setup & Configuration */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Setup & Configuration</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">
              1. Better Auth Server Configuration
            </h3>
            <p className="text-sm text-muted-foreground">
              Create <code className="text-xs bg-muted px-1 py-0.5 rounded">lib/auth/server.ts</code>:
            </p>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { db } from '@/lib/db';

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 20,
    autoSignIn: true,
  },
  session: {
    expiresIn: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60,     // Update every day
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60,
    },
  },
  user: {
    additionalFields: {
      firstName: {
        type: 'string',
        required: true,
      },
      lastName: {
        type: 'string',
        required: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Create related records (profile, preferences, etc.)
          await db.userProfile.create({
            data: { userId: user.id },
          });
        },
      },
    },
  },
});`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">2. Client Setup</h3>
            <p className="text-sm text-muted-foreground">
              Create <code className="text-xs bg-muted px-1 py-0.5 rounded">lib/auth/client.ts</code>:
            </p>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`

import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient();

// Export hooks
export const {
  useSession,
  signIn,
  signUp,
  signOut,
} = authClient;`}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">3. API Route Handler</h3>
            <p className="text-sm text-muted-foreground">
              Create <code className="text-xs bg-muted px-1 py-0.5 rounded">app/api/auth/[...all]/route.ts</code>:
            </p>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`import { auth } from '@/lib/auth/server';

export const { GET, POST } = auth.handler;`}
            </pre>
          </div>
        </div>

        {/* Middleware Protection */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Key className="w-6 h-6" />
            Middleware Protection
          </h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Route Protection Pattern</h3>
            <p className="text-sm text-muted-foreground">
              Create <code className="text-xs bg-muted px-1 py-0.5 rounded">middleware.ts</code> in the project root:
            </p>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Skip public routes
  if (
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/login')
  ) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  // Redirect to login if no session
  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set(
      'redirect_to',
      request.nextUrl.pathname
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/profile/:path*',
    // Add all protected routes
  ],
};`}
            </pre>
          </div>

          <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-600 dark:text-amber-300">
              <strong>Best Practice:</strong> Use middleware for route protection and redirect
              to login with a <code className="text-xs bg-muted px-1 py-0.5 rounded">redirect_to</code> parameter
              to return users to their intended destination after authentication.
            </p>
          </div>
        </div>

        {/* Authentication Flow */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Authentication Flows</h2>

          <div className="grid gap-6">
            {/* Sign Up */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                Sign Up Flow
              </h3>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth/client";

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const result = await signUp.email({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
    });

    if (result.error) {
      setError(result.error.message);
      return;
    }

    // Auto sign-in is enabled, redirect to dashboard
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="firstName" required />
      <input name="lastName" required />
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit">Sign Up</button>
    </form>
  );
}`}
              </pre>
            </div>

            {/* Sign In */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Sign In Flow</h3>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth/client";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const result = await signIn.email({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    if (result.error) {
      setError(result.error.message);
      return;
    }

    // Redirect to intended destination or dashboard
    const redirectTo = searchParams.get("redirect_to") || "/dashboard";
    router.push(redirectTo);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit">Sign In</button>
    </form>
  );
}`}
              </pre>
            </div>

            {/* Sign Out */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Sign Out Flow</h3>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <button onClick={handleSignOut}>
      Sign Out
    </button>
  );
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Session Access */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Session Access Patterns</h2>

          <div className="grid gap-6">
            {/* Client Component */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Client Components</h3>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`"use client";

import { useSession } from "@/lib/auth/client";

export function UserProfile() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <p>Welcome, {session.user.firstName}!</p>
      <p>Email: {session.user.email}</p>
    </div>
  );
}`}
              </pre>
            </div>

            {/* Server Component */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Server Components</h3>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user.firstName}!</p>
    </div>
  );
}`}
              </pre>
            </div>

            {/* Server Actions */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Server Actions</h3>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`"use server";

import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";

export async function updateProfile(data: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Perform update with session.user.id
  await db.user.update({
    where: { id: session.user.id },
    data: {
      firstName: data.get("firstName") as string,
      lastName: data.get("lastName") as string,
    },
  });

  return { success: true };
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Password Hashing */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Password Security</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">bcrypt Password Hashing</h3>
            <p className="text-sm text-muted-foreground">
              Better Auth automatically uses bcrypt for password hashing. No manual
              implementation required.
            </p>
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="text-sm font-semibold">Security Features:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Automatic password hashing with bcrypt
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Configurable min/max password length
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Session-based authentication (not JWT)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Secure cookie settings (httpOnly, sameSite, secure)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Cookie cache for performance
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Database Schema */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Required Database Schema</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Better Auth requires specific tables in your Prisma schema:
            </p>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`// prisma/schema.prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified Boolean   @default(false)
  name          String?
  firstName     String?
  lastName      String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sessions      Session[]
  accounts      Account[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  expiresAt DateTime
  token     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  accountId         String
  providerId        String
  accessToken       String?
  refreshToken      String?
  expiresAt         DateTime?
  password          String?

  user              User    @relation(fields: [userId], references: [id])

  @@unique([providerId, accountId])
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())

  @@unique([identifier, value])
}`}
            </pre>
          </div>
        </div>

        {/* Common Patterns */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Common Patterns</h2>

          <div className="grid gap-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold mb-2">Protected Pages</h3>
              <p className="text-sm text-muted-foreground">
                Use middleware for route-level protection. Check session in Server
                Components for data access control.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold mb-2">User Context</h3>
              <p className="text-sm text-muted-foreground">
                Access session via <code className="text-xs bg-muted px-1 py-0.5 rounded">useSession()</code> hook
                in Client Components or <code className="text-xs bg-muted px-1 py-0.5 rounded">auth.api.getSession()</code> in
                Server Components/Actions.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold mb-2">Database Hooks</h3>
              <p className="text-sm text-muted-foreground">
                Use <code className="text-xs bg-muted px-1 py-0.5 rounded">databaseHooks</code> to create
                related records (profiles, preferences) when users sign up.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold mb-2">Session Persistence</h3>
              <p className="text-sm text-muted-foreground">
                Sessions last 7 days with automatic updates every 24 hours. Cookie
                cache enabled for performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
