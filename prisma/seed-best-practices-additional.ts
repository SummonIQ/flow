import { PrismaClient, AppType } from '@prisma/client';

const prisma = new PrismaClient();

const additionalPractices = [
  // Web App - Error Handling
  {
    name: 'Error Handling & Logging',
    topic: 'Error Handling',
    appType: AppType.WEB_APP,
    description: 'Comprehensive error handling strategies',
    tags: ['errors', 'logging', 'monitoring'],
    priority: 9,
    content: `# Error Handling & Logging

## Error Boundaries
Use Error Boundaries to catch React errors and display fallback UI.

## Global Error Handler
Implement app/error.tsx for global error pages.

## API Error Handling
Create custom ApiError class with status codes.

## Structured Logging
Log errors with context (userId, path, timestamp).

## Best Practices
- ✅ Use Error Boundaries for React errors
- ✅ Log errors to monitoring service (Sentry, LogRocket)
- ✅ Include context in error logs
- ✅ Show user-friendly error messages
- ❌ Don't expose sensitive info in errors`,
  },

  // Web App - Testing
  {
    name: 'Testing Strategy for Next.js Apps',
    topic: 'Testing',
    appType: AppType.WEB_APP,
    description: 'Comprehensive testing approach',
    tags: ['testing', 'vitest', 'playwright'],
    priority: 8,
    content: `# Testing Strategy

## Unit Tests (Vitest)
Test utilities, helpers, and pure functions.

## Component Tests
Test components with @testing-library/react.

## Integration Tests
Test Server Actions with real database.

## E2E Tests (Playwright)
Test critical user flows end-to-end.

## Coverage Goals
Aim for 80%+ code coverage on critical paths.

## Best Practices
- ✅ Write tests before major features
- ✅ Test user behavior, not implementation
- ✅ Mock external services
- ✅ Run tests in CI/CD
- ❌ Don't skip tests for "simple" code`,
  },

  // API - RESTful Design
  {
    name: 'RESTful API Design Principles',
    topic: 'Best Practices',
    appType: AppType.API,
    description: 'Best practices for designing REST APIs',
    tags: ['rest', 'api-design', 'http'],
    priority: 10,
    content: `# RESTful API Design

## Resource Naming
- Use plural nouns: /users, /posts
- Nested resources: /users/:id/posts
- Avoid verbs in URLs

## HTTP Status Codes
- 200 OK - Successful GET
- 201 Created - Successful POST
- 400 Bad Request - Invalid input
- 401 Unauthorized - Auth required
- 404 Not Found - Resource missing
- 500 Internal Server Error

## Response Format
Consistent JSON structure with data/error/meta.

## Versioning
Use URL versioning: /api/v1/users

## Pagination & Filtering
Support page, limit, sortBy, order params.

## Best Practices
- ✅ Use proper HTTP methods
- ✅ Version from day one
- ✅ Implement pagination
- ✅ Document with OpenAPI
- ❌ Don't use verbs in URLs`,
  },

  // API - Authentication & Security
  {
    name: 'API Authentication & Security',
    topic: 'Security',
    appType: AppType.API,
    description: 'Securing APIs',
    tags: ['security', 'auth', 'jwt'],
    priority: 10,
    content: `# API Security

## JWT Authentication
Use signed JWT tokens with expiration.

## API Key Authentication
Support API keys for service-to-service auth.

## Input Validation
Validate all inputs with Zod schemas.

## SQL Injection Prevention
Use ORM (Prisma) or parameterized queries.

## Rate Limiting
Implement rate limits per user/IP.

## Security Headers
Set CORS, CSP, HSTS headers.

## Best Practices
- ✅ Use HTTPS only
- ✅ Validate all inputs
- ✅ Hash passwords (bcrypt)
- ✅ Implement rate limiting
- ✅ Log security events
- ❌ Don't store secrets in code`,
  },

  // Mobile App - Navigation
  {
    name: 'Navigation Patterns in React Native',
    topic: 'Architecture',
    appType: AppType.MOBILE_APP,
    description: 'Navigation structure and patterns',
    tags: ['navigation', 'routing', 'expo-router'],
    priority: 9,
    content: `# React Native Navigation

## Expo Router File-Based Routing
Use file-based routing with app directory.

## Stack Navigation
Default navigation pattern for linear flows.

## Tab Navigation
Bottom tabs for primary app sections.

## Drawer Navigation
Side menu for additional options.

## Deep Linking
Support universal links for app navigation.

## Best Practices
- ✅ Use Expo Router for Next.js-like routing
- ✅ Implement type-safe navigation
- ✅ Handle back button on Android
- ✅ Support deep linking
- ❌ Don't nest navigators unnecessarily`,
  },

  // Mobile App - Offline Support
  {
    name: 'Offline-First Mobile Apps',
    topic: 'Architecture',
    appType: AppType.MOBILE_APP,
    description: 'Building offline-capable apps',
    tags: ['offline', 'sync', 'storage'],
    priority: 8,
    content: `# Offline-First Architecture

## Local Storage
Use AsyncStorage for key-value data.

## SQLite Database
Use Expo SQLite for complex data.

## Sync Strategy
Queue mutations when offline, sync when online.

## Network Detection
Monitor connectivity with NetInfo.

## Optimistic Updates
Update UI immediately, sync in background.

## Best Practices
- ✅ Cache critical data locally
- ✅ Queue mutations when offline
- ✅ Show connectivity status
- ✅ Handle conflicts on sync
- ❌ Don't assume always online`,
  },

  // Desktop - Distribution
  {
    name: 'Electron App Distribution',
    topic: 'Deployment',
    appType: AppType.DESKTOP_APP,
    description: 'Building and distributing Electron apps',
    tags: ['distribution', 'signing', 'updates'],
    priority: 9,
    content: `# Electron Distribution

## Code Signing
Sign apps for macOS, Windows with certificates.

## Auto Updates
Use electron-updater for automatic updates.

## Build Process
Use electron-builder for multi-platform builds.

## DMG/MSI Installers
Create native installers for each platform.

## Notarization (macOS)
Notarize macOS apps with Apple.

## Best Practices
- ✅ Sign all releases
- ✅ Implement auto-updates
- ✅ Test on all target platforms
- ✅ Include crash reporting
- ❌ Don't skip notarization on macOS`,
  },

  // Marketing Site - Performance
  {
    name: 'Marketing Site Performance',
    topic: 'Performance',
    appType: AppType.MARKETING_SITE,
    description: 'Optimizing marketing site speed',
    tags: ['performance', 'lighthouse', 'core-web-vitals'],
    priority: 10,
    content: `# Marketing Site Performance

## Core Web Vitals
- LCP < 2.5s (Largest Contentful Paint)
- FID < 100ms (First Input Delay)
- CLS < 0.1 (Cumulative Layout Shift)

## Image Optimization
Use next/image with priority loading.

## Font Optimization
Self-host fonts, use font-display: swap.

## Static Generation
Pre-render all pages with generateStaticParams.

## Code Splitting
Lazy load non-critical components.

## Best Practices
- ✅ Achieve 90+ Lighthouse score
- ✅ Optimize images and fonts
- ✅ Minimize JavaScript bundle
- ✅ Use CDN for assets
- ❌ Don't load heavy libraries for simple tasks`,
  },

  // Marketing Site - Analytics
  {
    name: 'Analytics & Conversion Tracking',
    topic: 'Analytics',
    appType: AppType.MARKETING_SITE,
    description: 'Tracking user behavior and conversions',
    tags: ['analytics', 'tracking', 'conversion'],
    priority: 9,
    content: `# Analytics & Tracking

## Google Analytics 4
Track page views and custom events.

## Conversion Tracking
Track button clicks, form submissions, signups.

## A/B Testing
Test headlines, CTAs, layouts with Next.js middleware.

## Heatmaps
Use Hotjar or Microsoft Clarity for behavior analysis.

## Privacy Compliance
Respect GDPR, show cookie consent.

## Best Practices
- ✅ Track key conversion events
- ✅ Set up conversion funnels
- ✅ Implement A/B testing
- ✅ Respect user privacy
- ❌ Don't track PII without consent`,
  },
];

async function main() {
  console.log('🌱 Adding additional best practices...\n');

  let created = 0;

  for (const practice of additionalPractices) {
    try {
      await prisma.bestPractice.create({
        data: {
          ...practice,
          isDefault: true,
        },
      });
      console.log(`  ✓ Created: ${practice.name} (${practice.appType})`);
      created++;
    } catch (error) {
      console.error(`  ✗ Failed to create: ${practice.name}`, error);
    }
  }

  console.log(`\n✅ Added ${created} additional best practices.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
