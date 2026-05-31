import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

// GET - Fetch all feature definitions
export async function GET() {
  try {
    const features = await prisma.featureDefinition.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(features);
  } catch (error) {
    console.error('[API] Error fetching features:', error);
    return NextResponse.json(
      { error: 'Failed to fetch features' },
      { status: 500 },
    );
  }
}

// POST - Sync/seed feature definitions
export async function POST() {
  try {
    const featureDefinitions = [
      {
        feature: 'USER_AUTH',
        name: 'Authentication',
        description:
          'Add secure authentication using Better Auth with multiple providers and session management',
        icon: 'lock',
        color: 'indigo',
        tags: ['Better Auth', 'OAuth', 'Sessions'],
        providers: {
          'better-auth': {
            name: 'Better Auth',
            description: 'Modern authentication library for Next.js',
            docsUrl: 'https://better-auth.com',
          },
        },
        changes: [
          {
            file: 'lib/auth.ts',
            action: 'create',
            description: 'Auth configuration file',
            content: `import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});`,
          },
          {
            file: 'app/api/auth/[...all]/route.ts',
            action: 'create',
            description: 'Auth API route handler',
            content: `import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);`,
          },
          {
            file: '.env',
            action: 'append',
            description: 'Environment variables',
            content: `
# Authentication
BETTER_AUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=`,
          },
        ],
        settings: {
          providers: {
            type: 'multiselect',
            label: 'Auth Providers',
            options: ['email', 'google', 'github', 'discord'],
            default: ['email'],
          },
          sessionDuration: {
            type: 'number',
            label: 'Session Duration (days)',
            default: 30,
          },
        },
        dependencies: ['DATABASE'],
        docsUrl: 'https://better-auth.com/docs',
      },
      {
        feature: 'SSO',
        name: 'Single Sign-On',
        description:
          'Enable enterprise SSO with SAML/OIDC providers for company-managed access',
        icon: 'shield',
        color: 'blue',
        tags: ['SAML', 'OIDC', 'Enterprise'],
        providers: {
          auth0: {
            name: 'Auth0',
            description: 'Universal login and SSO',
            docsUrl: 'https://auth0.com/docs',
          },
          okta: {
            name: 'Okta',
            description: 'Workforce identity and SSO',
            docsUrl: 'https://developer.okta.com/docs/',
          },
          workos: {
            name: 'WorkOS',
            description: 'Enterprise SSO and directory sync',
            docsUrl: 'https://workos.com/docs',
          },
        },
        changes: [
          {
            file: 'lib/sso.ts',
            action: 'create',
            description: 'SSO provider configuration',
            content: `export const ssoProviders = {
  auth0: {
    issuer: process.env.AUTH0_ISSUER!,
    clientId: process.env.AUTH0_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  },
  okta: {
    issuer: process.env.OKTA_ISSUER!,
    clientId: process.env.OKTA_CLIENT_ID!,
    clientSecret: process.env.OKTA_CLIENT_SECRET!,
  },
  workos: {
    clientId: process.env.WORKOS_CLIENT_ID!,
    apiKey: process.env.WORKOS_API_KEY!,
  },
};`,
          },
          {
            file: 'app/api/auth/sso/route.ts',
            action: 'create',
            description: 'SSO callback handler (wire to auth provider)',
            content: `import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Exchange the callback code with your SSO provider and create a session.
  return NextResponse.redirect(new URL('/login', req.url));
}`,
          },
          {
            file: '.env',
            action: 'append',
            description: 'SSO credentials',
            content: `
# SSO
AUTH0_ISSUER=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
OKTA_ISSUER=
OKTA_CLIENT_ID=
OKTA_CLIENT_SECRET=
WORKOS_CLIENT_ID=
WORKOS_API_KEY=`,
          },
        ],
        settings: {
          provider: {
            type: 'select',
            label: 'SSO Provider',
            options: ['auth0', 'okta', 'workos'],
            default: 'auth0',
          },
          enforceSso: {
            type: 'boolean',
            label: 'Require SSO for all users',
            default: false,
          },
          allowedDomains: {
            type: 'text',
            label: 'Allowed email domains (comma-separated)',
            default: '',
          },
        },
        dependencies: ['USER_AUTH'],
        docsUrl: 'https://auth0.com/docs',
      },
      {
        feature: 'DATABASE',
        name: 'Database',
        description:
          'Set up Prisma ORM with your preferred database for type-safe database access',
        icon: 'database',
        color: 'blue',
        tags: ['Prisma', 'PostgreSQL', 'MySQL'],
        providers: {
          prisma: {
            name: 'Prisma',
            description: 'Next-generation ORM for Node.js and TypeScript',
            docsUrl: 'https://prisma.io/docs',
          },
        },
        changes: [
          {
            file: 'prisma/schema.prisma',
            action: 'create',
            description: 'Prisma schema file',
            content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`,
          },
          {
            file: 'lib/db/prisma.ts',
            action: 'create',
            description: 'Prisma client singleton',
            content: `import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}`,
          },
          {
            file: '.env',
            action: 'append',
            description: 'Database connection string',
            content: `
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb?schema=public"`,
          },
        ],
        settings: {
          provider: {
            type: 'select',
            label: 'Database Provider',
            options: ['postgresql', 'mysql', 'sqlite', 'mongodb'],
            default: 'postgresql',
          },
        },
        dependencies: [],
        docsUrl: 'https://prisma.io/docs',
      },
      {
        feature: 'PAYMENTS',
        name: 'Payments',
        description:
          'Integrate Stripe for subscriptions, one-time payments, and billing management',
        icon: 'credit-card',
        color: 'green',
        tags: ['Stripe', 'Webhooks', 'Subscriptions'],
        providers: {
          stripe: {
            name: 'Stripe',
            description: 'Payment processing platform',
            docsUrl: 'https://stripe.com/docs',
          },
        },
        changes: [
          {
            file: 'lib/stripe.ts',
            action: 'create',
            description: 'Stripe client configuration',
            content: `import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});`,
          },
          {
            file: 'app/api/webhooks/stripe/route.ts',
            action: 'create',
            description: 'Stripe webhook handler',
            content: `import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      // Handle successful payment
      break;
    case 'customer.subscription.updated':
      // Handle subscription update
      break;
  }

  return NextResponse.json({ received: true });
}`,
          },
          {
            file: '.env',
            action: 'append',
            description: 'Stripe API keys',
            content: `
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...`,
          },
        ],
        settings: {
          mode: {
            type: 'select',
            label: 'Stripe Mode',
            options: ['test', 'live'],
            default: 'test',
          },
          enableSubscriptions: {
            type: 'boolean',
            label: 'Enable Subscriptions',
            default: true,
          },
        },
        dependencies: ['DATABASE'],
        docsUrl: 'https://stripe.com/docs',
      },
      {
        feature: 'EMAIL',
        name: 'Email',
        description:
          'Add transactional email with React Email and Resend for beautiful, responsive emails',
        icon: 'mail',
        color: 'purple',
        tags: ['React Email', 'Resend', 'Templates'],
        providers: {
          resend: {
            name: 'Resend',
            description: 'Modern email API',
            docsUrl: 'https://resend.com/docs',
          },
          sendgrid: {
            name: 'SendGrid',
            description: 'Email delivery service',
            docsUrl: 'https://sendgrid.com/docs',
          },
        },
        changes: [
          {
            file: 'lib/email.ts',
            action: 'create',
            description: 'Email client configuration',
            content: `import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject,
    html,
  });
}`,
          },
          {
            file: '.env',
            action: 'append',
            description: 'Email configuration',
            content: `
# Email
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com`,
          },
        ],
        settings: {
          provider: {
            type: 'select',
            label: 'Email Provider',
            options: ['resend', 'sendgrid', 'postmark'],
            default: 'resend',
          },
          fromEmail: {
            type: 'text',
            label: 'From Email',
            default: 'noreply@example.com',
          },
        },
        dependencies: [],
        docsUrl: 'https://resend.com/docs',
      },
      {
        feature: 'ANALYTICS',
        name: 'Analytics',
        description:
          'Track user behavior and application performance with privacy-focused analytics',
        icon: 'bar-chart',
        color: 'pink',
        tags: ['Vercel Analytics', 'PostHog', 'Privacy'],
        providers: {
          vercel: {
            name: 'Vercel Analytics',
            description: 'Web analytics from Vercel',
            docsUrl: 'https://vercel.com/docs/analytics',
          },
          posthog: {
            name: 'PostHog',
            description: 'Open source product analytics',
            docsUrl: 'https://posthog.com/docs',
          },
        },
        changes: [
          {
            file: 'app/providers.tsx',
            action: 'modify',
            description: 'Add analytics provider',
            content: `import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Analytics />
      <SpeedInsights />
    </>
  );
}`,
          },
          {
            file: 'package.json',
            action: 'modify',
            description: 'Add analytics dependencies',
            content: `{
  "dependencies": {
    "@vercel/analytics": "^1.0.0",
    "@vercel/speed-insights": "^1.0.0"
  }
}`,
          },
        ],
        settings: {
          provider: {
            type: 'select',
            label: 'Analytics Provider',
            options: ['vercel', 'posthog', 'plausible'],
            default: 'vercel',
          },
          trackPageviews: {
            type: 'boolean',
            label: 'Track Pageviews',
            default: true,
          },
        },
        dependencies: [],
        docsUrl: 'https://vercel.com/docs/analytics',
      },
      {
        feature: 'BLOB_STORAGE',
        name: 'File Storage',
        description:
          'Add cloud file storage and CDN with S3-compatible services or uploadthing',
        icon: 'cloud-upload',
        color: 'yellow',
        tags: ['Uploadthing', 'S3', 'CDN'],
        providers: {
          uploadthing: {
            name: 'UploadThing',
            description: 'File uploads for modern apps',
            docsUrl: 'https://uploadthing.com/docs',
          },
          s3: {
            name: 'AWS S3',
            description: 'Amazon Simple Storage Service',
            docsUrl: 'https://aws.amazon.com/s3/',
          },
        },
        changes: [
          {
            file: 'lib/uploadthing.ts',
            action: 'create',
            description: 'UploadThing configuration',
            content: `import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const uploadRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete:", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;`,
          },
          {
            file: 'app/api/uploadthing/core.ts',
            action: 'create',
            description: 'UploadThing API route',
            content: `import { createRouteHandler } from "uploadthing/next";
import { uploadRouter } from "@/lib/uploadthing";

export const { GET, POST } = createRouteHandler({
  router: uploadRouter,
});`,
          },
          {
            file: '.env',
            action: 'append',
            description: 'UploadThing credentials',
            content: `
# File Storage
UPLOADTHING_SECRET=sk_...
UPLOADTHING_APP_ID=...`,
          },
        ],
        settings: {
          provider: {
            type: 'select',
            label: 'Storage Provider',
            options: ['uploadthing', 's3', 'cloudflare-r2'],
            default: 'uploadthing',
          },
          maxFileSize: {
            type: 'select',
            label: 'Max File Size',
            options: ['1MB', '4MB', '16MB', '64MB'],
            default: '4MB',
          },
        },
        dependencies: [],
        docsUrl: 'https://uploadthing.com/docs',
      },
      {
        feature: 'AI',
        name: 'AI Integration',
        description:
          'Add AI capabilities with OpenAI, Anthropic, or other LLM providers',
        icon: 'sparkles',
        color: 'cyan',
        tags: ['OpenAI', 'Anthropic', 'Vercel AI SDK'],
        providers: {
          openai: {
            name: 'OpenAI',
            description: 'GPT models and more',
            docsUrl: 'https://platform.openai.com/docs',
          },
          anthropic: {
            name: 'Anthropic',
            description: 'Claude models',
            docsUrl: 'https://docs.anthropic.com',
          },
        },
        changes: [
          {
            file: 'lib/ai.ts',
            action: 'create',
            description: 'AI client configuration',
            content: `import { openai } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';

export async function chat(prompt: string) {
  const result = await generateText({
    model: openai('gpt-4-turbo'),
    prompt,
  });
  return result.text;
}

export async function streamChat(prompt: string) {
  return streamText({
    model: openai('gpt-4-turbo'),
    prompt,
  });
}`,
          },
          {
            file: '.env',
            action: 'append',
            description: 'AI API keys',
            content: `
# AI
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...`,
          },
        ],
        settings: {
          provider: {
            type: 'select',
            label: 'AI Provider',
            options: ['openai', 'anthropic', 'google'],
            default: 'openai',
          },
          model: {
            type: 'select',
            label: 'Default Model',
            options: [
              'gpt-4-turbo',
              'gpt-3.5-turbo',
              'claude-3-opus',
              'claude-3-sonnet',
            ],
            default: 'gpt-4-turbo',
          },
        },
        dependencies: [],
        docsUrl: 'https://sdk.vercel.ai/docs',
      },
      {
        feature: 'REALTIME',
        name: 'Realtime',
        description:
          'Add real-time features with WebSockets, Pusher, or Server-Sent Events',
        icon: 'zap',
        color: 'orange',
        tags: ['Pusher', 'WebSockets', 'SSE'],
        providers: {
          pusher: {
            name: 'Pusher',
            description: 'Realtime communication platform',
            docsUrl: 'https://pusher.com/docs',
          },
        },
        changes: [
          {
            file: 'lib/pusher.ts',
            action: 'create',
            description: 'Pusher client configuration',
            content: `import Pusher from 'pusher';
import PusherClient from 'pusher-js';

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  }
);`,
          },
          {
            file: '.env',
            action: 'append',
            description: 'Pusher credentials',
            content: `
# Realtime
PUSHER_APP_ID=...
PUSHER_SECRET=...
NEXT_PUBLIC_PUSHER_KEY=...
NEXT_PUBLIC_PUSHER_CLUSTER=...`,
          },
        ],
        settings: {
          provider: {
            type: 'select',
            label: 'Realtime Provider',
            options: ['pusher', 'ably', 'socket.io'],
            default: 'pusher',
          },
        },
        dependencies: [],
        docsUrl: 'https://pusher.com/docs',
      },
      {
        feature: 'ERROR_REPORTING',
        name: 'Error Reporting',
        description:
          'Track and monitor errors with Sentry for better debugging',
        icon: 'alert-triangle',
        color: 'red',
        tags: ['Sentry', 'Monitoring', 'Debugging'],
        providers: {
          sentry: {
            name: 'Sentry',
            description: 'Error tracking and monitoring',
            docsUrl: 'https://docs.sentry.io',
          },
        },
        changes: [
          {
            file: 'sentry.client.config.ts',
            action: 'create',
            description: 'Sentry client configuration',
            content: `import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});`,
          },
          {
            file: '.env',
            action: 'append',
            description: 'Sentry configuration',
            content: `
# Error Reporting
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=...`,
          },
        ],
        settings: {
          tracesSampleRate: {
            type: 'number',
            label: 'Traces Sample Rate',
            default: 1.0,
          },
        },
        dependencies: [],
        docsUrl: 'https://docs.sentry.io/platforms/javascript/guides/nextjs/',
      },
      {
        feature: 'CACHING',
        name: 'Caching',
        description:
          'Add caching layer for sessions, rate limiting, and data with Redis-compatible stores',
        icon: 'hard-drive',
        color: 'red',
        tags: ['Redis', 'KV Store', 'Sessions'],
        providers: {
          redis: {
            name: 'Redis/Upstash',
            description: 'In-memory data store',
            docsUrl: 'https://upstash.com/docs/redis',
          },
        },
        changes: [
          {
            file: 'lib/cache.ts',
            action: 'create',
            description: 'Cache client configuration',
            content: `import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getCached<T>(key: string): Promise<T | null> {
  return redis.get(key);
}

export async function setCache<T>(key: string, value: T, ttl?: number): Promise<void> {
  if (ttl) {
    await redis.setex(key, ttl, JSON.stringify(value));
  } else {
    await redis.set(key, JSON.stringify(value));
  }
}

export async function invalidate(key: string): Promise<void> {
  await redis.del(key);
}`,
          },
          {
            file: '.env',
            action: 'append',
            description: 'Redis credentials',
            content: `
# Caching
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...`,
          },
        ],
        settings: {
          provider: {
            type: 'select',
            label: 'Cache Provider',
            options: ['upstash', 'redis', 'vercel-kv'],
            default: 'upstash',
          },
          defaultTtl: {
            type: 'number',
            label: 'Default TTL (seconds)',
            default: 3600,
          },
        },
        dependencies: [],
        docsUrl: 'https://upstash.com/docs/redis',
      },
      {
        feature: 'BACKGROUND_JOBS',
        name: 'Background Jobs',
        description:
          'Process async tasks with durable execution, retries, and scheduling',
        icon: 'clock',
        color: 'purple',
        tags: ['Async', 'Queues', 'Scheduling'],
        providers: {
          inngest: {
            name: 'Inngest',
            description: 'Durable workflow engine',
            docsUrl: 'https://inngest.com/docs',
          },
        },
        changes: [
          {
            file: 'lib/inngest.ts',
            action: 'create',
            description: 'Inngest client configuration',
            content: `import { Inngest } from 'inngest';

export const inngest = new Inngest({ id: 'my-app' });

export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'test/hello.world' },
  async ({ event, step }) => {
    await step.sleep('wait-a-moment', '1s');
    return { message: \`Hello \${event.data.name}!\` };
  },
);`,
          },
          {
            file: 'app/api/inngest/route.ts',
            action: 'create',
            description: 'Inngest API route',
            content: `import { serve } from 'inngest/next';
import { inngest, helloWorld } from '@/lib/inngest';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [helloWorld],
});`,
          },
          {
            file: '.env',
            action: 'append',
            description: 'Inngest configuration',
            content: `
# Background Jobs
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...`,
          },
        ],
        settings: {
          provider: {
            type: 'select',
            label: 'Job Provider',
            options: ['inngest', 'trigger-dev', 'bullmq'],
            default: 'inngest',
          },
        },
        dependencies: [],
        docsUrl: 'https://inngest.com/docs',
      },
      {
        feature: 'FEATURE_FLAGS',
        name: 'Feature Flags',
        description:
          'Control feature rollouts with flags, A/B testing, and targeting rules',
        icon: 'flag',
        color: 'green',
        tags: ['Flags', 'A/B Testing', 'Rollouts'],
        providers: {
          edge: {
            name: 'Edge Config',
            description: 'Vercel Edge Config for feature flags',
            docsUrl: 'https://vercel.com/docs/storage/edge-config',
          },
        },
        changes: [
          {
            file: 'lib/flags.ts',
            action: 'create',
            description: 'Feature flags configuration',
            content: `import { unstable_flag as flag } from '@vercel/flags/next';

export const showNewFeature = flag({
  key: 'show-new-feature',
  decide: () => false,
  description: 'Show new experimental feature',
  options: [
    { value: true, label: 'Enabled' },
    { value: false, label: 'Disabled' },
  ],
});

export async function getFlag(key: string): Promise<boolean> {
  // Custom flag implementation with database/config
  const flags = await fetch('/api/flags').then(r => r.json());
  return flags[key] ?? false;
}`,
          },
          {
            file: 'app/api/flags/route.ts',
            action: 'create',
            description: 'Flags API route',
            content: `import { NextResponse } from 'next/server';

const FLAGS: Record<string, boolean> = {
  'new-dashboard': false,
  'beta-features': false,
};

export async function GET() {
  return NextResponse.json(FLAGS);
}`,
          },
        ],
        settings: {
          provider: {
            type: 'select',
            label: 'Flags Provider',
            options: ['edge-config', 'database', 'launchdarkly'],
            default: 'edge-config',
          },
        },
        dependencies: [],
        docsUrl: 'https://vercel.com/docs/workflow-collaboration/feature-flags',
      },
      {
        feature: 'LOGGING',
        name: 'Logging',
        description:
          'Centralized structured logging with log levels, context, and search',
        icon: 'file-text',
        color: 'cyan',
        tags: ['Logs', 'Structured', 'Search'],
        providers: {
          pino: {
            name: 'Pino',
            description: 'Fast JSON logger for Node.js',
            docsUrl: 'https://getpino.io',
          },
        },
        changes: [
          {
            file: 'lib/logger.ts',
            action: 'create',
            description: 'Logger configuration',
            content: `import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' 
    ? { target: 'pino-pretty' }
    : undefined,
});

export function createLogger(context: string) {
  return logger.child({ context });
}`,
          },
          {
            file: '.env',
            action: 'append',
            description: 'Logging configuration',
            content: `
# Logging
LOG_LEVEL=info`,
          },
        ],
        settings: {
          level: {
            type: 'select',
            label: 'Log Level',
            options: ['trace', 'debug', 'info', 'warn', 'error'],
            default: 'info',
          },
          provider: {
            type: 'select',
            label: 'Log Provider',
            options: ['console', 'axiom', 'logtail'],
            default: 'console',
          },
        },
        dependencies: [],
        docsUrl: 'https://getpino.io',
      },
      {
        feature: 'RATE_LIMITING',
        name: 'Rate Limiting',
        description:
          'Protect APIs with configurable rate limits and sliding windows',
        icon: 'shield',
        color: 'orange',
        tags: ['Security', 'API', 'Throttling'],
        providers: {
          upstash: {
            name: 'Upstash Ratelimit',
            description: 'Serverless rate limiting',
            docsUrl: 'https://upstash.com/docs/oss/sdks/ts/ratelimit',
          },
        },
        changes: [
          {
            file: 'lib/ratelimit.ts',
            action: 'create',
            description: 'Rate limiting configuration',
            content: `import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
  return { success, limit, reset, remaining };
}`,
          },
          {
            file: 'middleware.ts',
            action: 'create',
            description: 'Rate limiting middleware',
            content: `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/ratelimit';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = request.ip ?? '127.0.0.1';
    const { success, remaining } = await checkRateLimit(ip);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'X-RateLimit-Remaining': String(remaining) } }
      );
    }
  }
  return NextResponse.next();
}`,
          },
        ],
        settings: {
          requests: {
            type: 'number',
            label: 'Requests per window',
            default: 10,
          },
          window: {
            type: 'select',
            label: 'Time window',
            options: ['10s', '1m', '5m', '1h'],
            default: '10s',
          },
        },
        dependencies: ['CACHING'],
        docsUrl: 'https://upstash.com/docs/oss/sdks/ts/ratelimit',
      },
      {
        feature: 'TESTING',
        name: 'Testing',
        description: 'E2E and unit testing setup with Playwright and Vitest',
        icon: 'test-tube',
        color: 'yellow',
        tags: ['E2E', 'Unit Tests', 'CI'],
        providers: {
          playwright: {
            name: 'Playwright',
            description: 'E2E testing framework',
            docsUrl: 'https://playwright.dev',
          },
        },
        changes: [
          {
            file: 'playwright.config.ts',
            action: 'create',
            description: 'Playwright configuration',
            content: `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});`,
          },
          {
            file: 'vitest.config.ts',
            action: 'create',
            description: 'Vitest configuration',
            content: `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './') },
  },
});`,
          },
        ],
        settings: {
          e2e: {
            type: 'boolean',
            label: 'Enable E2E Tests',
            default: true,
          },
          unit: {
            type: 'boolean',
            label: 'Enable Unit Tests',
            default: true,
          },
        },
        dependencies: [],
        docsUrl: 'https://playwright.dev',
      },
      {
        feature: 'DEV_CONTAINERS',
        name: 'Dev Containers',
        description:
          'Standardize local dev environments with Dev Containers and prebuilt tooling',
        icon: 'code-2',
        color: 'green',
        tags: ['Dev Containers', 'Docker', 'VS Code'],
        providers: {
          devcontainers: {
            name: 'Dev Containers',
            description: 'Open spec for containerized dev environments',
            docsUrl: 'https://containers.dev',
          },
        },
        changes: [
          {
            file: '.devcontainer/devcontainer.json',
            action: 'create',
            description: 'Dev container configuration',
            content: `{
  "name": "SummonIQ Dev Container",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:1-20-bookworm",
  "features": {
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "esbenp.prettier-vscode",
        "dbaeumer.vscode-eslint"
      ]
    }
  },
  "postCreateCommand": "bun install"
}`,
          },
          {
            file: '.devcontainer/Dockerfile',
            action: 'create',
            description: 'Optional custom base image',
            content: `FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bookworm

RUN corepack enable`,
          },
        ],
        settings: {
          baseImage: {
            type: 'select',
            label: 'Base Image',
            options: ['node:20', 'node:22', 'ubuntu:22.04'],
            default: 'node:20',
          },
          enableDockerInDocker: {
            type: 'boolean',
            label: 'Enable Docker in Docker',
            default: false,
          },
          packageManager: {
            type: 'select',
            label: 'Package Manager',
            options: ['bun', 'pnpm', 'yarn', 'npm'],
            default: 'bun',
          },
        },
        dependencies: [],
        docsUrl: 'https://containers.dev',
      },
      {
        feature: 'API_DOCS',
        name: 'API Documentation',
        description: 'Auto-generate OpenAPI/Swagger docs from your API routes',
        icon: 'book-open',
        color: 'indigo',
        tags: ['OpenAPI', 'Swagger', 'REST'],
        providers: {
          swagger: {
            name: 'Swagger/OpenAPI',
            description: 'API documentation standard',
            docsUrl: 'https://swagger.io/docs',
          },
        },
        changes: [
          {
            file: 'lib/openapi.ts',
            action: 'create',
            description: 'OpenAPI configuration',
            content: `import { createDocument } from 'zod-openapi';
import { z } from 'zod';

export const apiSpec = createDocument({
  openapi: '3.1.0',
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'API documentation',
  },
  servers: [{ url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000' }],
});

// Example schema registration
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
});`,
          },
          {
            file: 'app/api/docs/route.ts',
            action: 'create',
            description: 'API docs endpoint',
            content: `import { NextResponse } from 'next/server';
import { apiSpec } from '@/lib/openapi';

export async function GET() {
  return NextResponse.json(apiSpec);
}`,
          },
        ],
        settings: {
          format: {
            type: 'select',
            label: 'Doc Format',
            options: ['openapi', 'swagger'],
            default: 'openapi',
          },
        },
        dependencies: [],
        docsUrl: 'https://swagger.io/specification/',
      },
      {
        feature: 'SEARCH',
        name: 'Search',
        description:
          'Full-text search with facets, filters, and typo tolerance',
        icon: 'search',
        color: 'blue',
        tags: ['Full-text', 'Facets', 'Filters'],
        providers: {
          meilisearch: {
            name: 'Meilisearch',
            description: 'Open-source search engine',
            docsUrl: 'https://meilisearch.com/docs',
          },
        },
        changes: [
          {
            file: 'lib/search.ts',
            action: 'create',
            description: 'Search client configuration',
            content: `import { MeiliSearch } from 'meilisearch';

export const searchClient = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_API_KEY,
});

export async function search(index: string, query: string, options = {}) {
  const searchIndex = searchClient.index(index);
  return searchIndex.search(query, options);
}

export async function indexDocument(index: string, document: any) {
  const searchIndex = searchClient.index(index);
  return searchIndex.addDocuments([document]);
}`,
          },
          {
            file: '.env',
            action: 'append',
            description: 'Search configuration',
            content: `
# Search
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=...`,
          },
        ],
        settings: {
          provider: {
            type: 'select',
            label: 'Search Provider',
            options: ['meilisearch', 'algolia', 'typesense'],
            default: 'meilisearch',
          },
        },
        dependencies: [],
        docsUrl: 'https://meilisearch.com/docs',
      },
      {
        feature: 'NOTIFICATIONS',
        name: 'Notifications',
        description: 'Push notifications and in-app notification system',
        icon: 'bell',
        color: 'pink',
        tags: ['Push', 'In-app', 'Alerts'],
        providers: {
          webpush: {
            name: 'Web Push',
            description: 'Browser push notifications',
            docsUrl: 'https://web.dev/push-notifications-overview/',
          },
        },
        changes: [
          {
            file: 'lib/notifications.ts',
            action: 'create',
            description: 'Notifications configuration',
            content: `import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:admin@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: { title: string; body: string; url?: string }
) {
  return webpush.sendNotification(subscription, JSON.stringify(payload));
}

// In-app notifications via database
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
}`,
          },
          {
            file: '.env',
            action: 'append',
            description: 'Push notification keys',
            content: `
# Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...`,
          },
        ],
        settings: {
          push: {
            type: 'boolean',
            label: 'Enable Push Notifications',
            default: true,
          },
          inApp: {
            type: 'boolean',
            label: 'Enable In-App Notifications',
            default: true,
          },
        },
        dependencies: ['DATABASE'],
        docsUrl: 'https://web.dev/push-notifications-overview/',
      },
      {
        feature: 'I18N',
        name: 'Internationalization',
        description:
          'Multi-language support with routing, translations, and formatting',
        icon: 'languages',
        color: 'cyan',
        tags: ['i18n', 'Locales', 'RTL'],
        providers: {
          nextIntl: {
            name: 'next-intl',
            description: 'i18n for Next.js App Router',
            docsUrl: 'https://next-intl-docs.vercel.app',
          },
        },
        changes: [
          {
            file: 'i18n.ts',
            action: 'create',
            description: 'i18n configuration',
            content: `import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(\`./messages/\${locale}.json\`)).default,
}));`,
          },
          {
            file: 'messages/en.json',
            action: 'create',
            description: 'English translations',
            content: `{
  "common": {
    "welcome": "Welcome",
    "loading": "Loading...",
    "error": "An error occurred"
  }
}`,
          },
          {
            file: 'middleware.ts',
            action: 'modify',
            description: 'Add locale routing',
            content: `import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'es', 'fr'],
  defaultLocale: 'en',
});

export const config = {
  matcher: ['/', '/(en|es|fr)/:path*'],
};`,
          },
        ],
        settings: {
          locales: {
            type: 'multiselect',
            label: 'Supported Locales',
            options: ['en', 'es', 'fr', 'de', 'ja', 'zh'],
            default: ['en'],
          },
          defaultLocale: {
            type: 'select',
            label: 'Default Locale',
            options: ['en', 'es', 'fr', 'de', 'ja', 'zh'],
            default: 'en',
          },
        },
        dependencies: [],
        docsUrl: 'https://next-intl-docs.vercel.app',
      },
      {
        feature: 'SEO',
        name: 'SEO',
        description:
          'Search engine optimization with metadata, sitemaps, and structured data',
        icon: 'globe',
        color: 'green',
        tags: ['Meta', 'Sitemap', 'Schema'],
        providers: {
          nextSeo: {
            name: 'Next.js Metadata',
            description: 'Built-in metadata API',
            docsUrl:
              'https://nextjs.org/docs/app/building-your-application/optimizing/metadata',
          },
        },
        changes: [
          {
            file: 'app/sitemap.ts',
            action: 'create',
            description: 'Dynamic sitemap generation',
            content: `import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: \`\${baseUrl}/about\`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ];
}`,
          },
          {
            file: 'app/robots.ts',
            action: 'create',
            description: 'Robots.txt configuration',
            content: `import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: \`\${baseUrl}/sitemap.xml\`,
  };
}`,
          },
          {
            file: 'lib/seo.ts',
            action: 'create',
            description: 'SEO utilities',
            content: `import type { Metadata } from 'next';

export function generateMetadata({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image?: string;
}): Metadata {
  return {
    title,
    description,
    openGraph: { title, description, images: image ? [image] : [] },
    twitter: { card: 'summary_large_image', title, description },
  };
}`,
          },
        ],
        settings: {
          generateSitemap: {
            type: 'boolean',
            label: 'Generate Sitemap',
            default: true,
          },
          generateRobots: {
            type: 'boolean',
            label: 'Generate Robots.txt',
            default: true,
          },
        },
        dependencies: [],
        docsUrl:
          'https://nextjs.org/docs/app/building-your-application/optimizing/metadata',
      },
      {
        feature: 'CMS',
        name: 'CMS Integration',
        description:
          'Headless CMS for content management with type-safe queries',
        icon: 'code-2',
        color: 'purple',
        tags: ['Content', 'Headless', 'MDX'],
        providers: {
          contentlayer: {
            name: 'Contentlayer',
            description: 'Content SDK for developers',
            docsUrl: 'https://contentlayer.dev',
          },
        },
        changes: [
          {
            file: 'contentlayer.config.ts',
            action: 'create',
            description: 'Contentlayer configuration',
            content: `import { defineDocumentType, makeSource } from 'contentlayer/source-files';

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: 'posts/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    description: { type: 'string' },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (post) => post._raw.flattenedPath.replace('posts/', ''),
    },
  },
}));

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Post],
});`,
          },
          {
            file: 'content/posts/hello-world.mdx',
            action: 'create',
            description: 'Example content',
            content: `---
title: Hello World
date: 2024-01-01
description: Welcome to our blog
---

# Hello World

This is your first blog post!`,
          },
        ],
        settings: {
          provider: {
            type: 'select',
            label: 'CMS Provider',
            options: ['contentlayer', 'sanity', 'payload'],
            default: 'contentlayer',
          },
          contentDir: {
            type: 'text',
            label: 'Content Directory',
            default: 'content',
          },
        },
        dependencies: [],
        docsUrl: 'https://contentlayer.dev',
      },
    ];

    let created = 0;
    let updated = 0;

    for (const def of featureDefinitions) {
      const existing = await prisma.featureDefinition.findUnique({
        where: { feature: def.feature as any },
      });

      if (existing) {
        await prisma.featureDefinition.update({
          where: { id: existing.id },
          data: {
            name: def.name,
            description: def.description,
            icon: def.icon,
            color: def.color,
            tags: def.tags,
            providers: def.providers,
            changes: def.changes,
            settings: def.settings,
            dependencies: def.dependencies,
            docsUrl: def.docsUrl,
          },
        });
        updated++;
      } else {
        await prisma.featureDefinition.create({
          data: {
            feature: def.feature as any,
            name: def.name,
            description: def.description,
            icon: def.icon,
            color: def.color,
            tags: def.tags,
            providers: def.providers,
            changes: def.changes,
            settings: def.settings,
            dependencies: def.dependencies,
            docsUrl: def.docsUrl,
          },
        });
        created++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Features synced successfully',
      created,
      updated,
    });
  } catch (error) {
    console.error('[API] Error syncing features:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync features',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
