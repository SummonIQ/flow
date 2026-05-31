import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const featureDefinitions = [
  {
    feature: 'CACHING',
    name: 'Caching',
    description: 'Redis/KV store for sessions, rate limiting, and data caching',
    icon: 'hard-drive',
    color: 'red',
    tags: ['Redis', 'KV Store', 'Sessions'],
    providers: {
      upstash: {
        name: 'Upstash Redis',
        description: 'Serverless Redis',
        docsUrl: 'https://upstash.com/docs/redis',
      },
    },
    changes: [],
    settings: {},
    dependencies: [],
    docsUrl: 'https://upstash.com/docs/redis',
  },
  {
    feature: 'BACKGROUND_JOBS',
    name: 'Background Jobs',
    description: 'Async task processing with Inngest/BullMQ',
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
    changes: [],
    settings: {},
    dependencies: [],
    docsUrl: 'https://inngest.com/docs',
  },
  {
    feature: 'FEATURE_FLAGS',
    name: 'Feature Flags',
    description: 'Rollout control with A/B testing',
    icon: 'flag',
    color: 'green',
    tags: ['Flags', 'A/B Testing', 'Rollouts'],
    providers: {
      edge: {
        name: 'Edge Config',
        description: 'Vercel Edge Config',
        docsUrl: 'https://vercel.com/docs/storage/edge-config',
      },
    },
    changes: [],
    settings: {},
    dependencies: [],
    docsUrl: 'https://vercel.com/docs/workflow-collaboration/feature-flags',
  },
  {
    feature: 'LOGGING',
    name: 'Logging',
    description: 'Structured logging with Pino',
    icon: 'file-text',
    color: 'cyan',
    tags: ['Logs', 'Structured', 'Search'],
    providers: {
      pino: {
        name: 'Pino',
        description: 'Fast JSON logger',
        docsUrl: 'https://getpino.io',
      },
    },
    changes: [],
    settings: {},
    dependencies: [],
    docsUrl: 'https://getpino.io',
  },
  {
    feature: 'RATE_LIMITING',
    name: 'Rate Limiting',
    description: 'API protection with sliding windows',
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
    changes: [],
    settings: {},
    dependencies: ['CACHING'],
    docsUrl: 'https://upstash.com/docs/oss/sdks/ts/ratelimit',
  },
  {
    feature: 'TESTING',
    name: 'Testing',
    description: 'E2E (Playwright) + Unit (Vitest) setup',
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
    changes: [],
    settings: {},
    dependencies: [],
    docsUrl: 'https://playwright.dev',
  },
  {
    feature: 'API_DOCS',
    name: 'API Documentation',
    description: 'Auto-generated OpenAPI/Swagger docs',
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
    changes: [],
    settings: {},
    dependencies: [],
    docsUrl: 'https://swagger.io/specification/',
  },
  {
    feature: 'SEARCH',
    name: 'Search',
    description: 'Full-text search with Meilisearch',
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
    changes: [],
    settings: {},
    dependencies: [],
    docsUrl: 'https://meilisearch.com/docs',
  },
  {
    feature: 'NOTIFICATIONS',
    name: 'Notifications',
    description: 'Push + in-app notification system',
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
    changes: [],
    settings: {},
    dependencies: ['DATABASE'],
    docsUrl: 'https://web.dev/push-notifications-overview/',
  },
  {
    feature: 'I18N',
    name: 'Internationalization',
    description: 'Multi-language with next-intl',
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
    changes: [],
    settings: {},
    dependencies: [],
    docsUrl: 'https://next-intl-docs.vercel.app',
  },
  {
    feature: 'SEO',
    name: 'SEO',
    description: 'Metadata, sitemaps, structured data',
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
    changes: [],
    settings: {},
    dependencies: [],
    docsUrl:
      'https://nextjs.org/docs/app/building-your-application/optimizing/metadata',
  },
  {
    feature: 'CMS',
    name: 'CMS Integration',
    description: 'Headless CMS with Contentlayer/MDX',
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
    changes: [],
    settings: {},
    dependencies: [],
    docsUrl: 'https://contentlayer.dev',
  },
];

async function main() {
  console.log('Seeding features...');

  for (const def of featureDefinitions) {
    const existing = await prisma.featureDefinition.findFirst({
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
      console.log(`  Updated: ${def.name}`);
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
      console.log(`  Created: ${def.name}`);
    }
  }

  console.log('Done seeding features!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
