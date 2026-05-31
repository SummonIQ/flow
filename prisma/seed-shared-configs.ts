import { AppType, ConfigType } from '@prisma/client';
import prisma from '../lib/db/prisma';

const sharedConfigs = [
  // ========== WEB_APP CONFIGS ==========
  // ESLint
  {
    name: 'Next.js ESLint Config',
    configType: ConfigType.ESLINT,
    appType: AppType.WEB_APP,
    description:
      'ESLint configuration optimized for Next.js applications with TypeScript',
    content: {
      extends: [
        'next/core-web-vitals',
        'next/typescript',
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-explicit-any': 'warn',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'no-console': ['warn', { allow: ['warn', 'error'] }],
      },
    },
    tags: ['nextjs', 'typescript', 'eslint', 'react'],
    isDefault: true,
  },
  // TypeScript
  {
    name: 'Next.js TypeScript Config',
    configType: ConfigType.TSCONFIG,
    appType: AppType.WEB_APP,
    description:
      'TypeScript configuration for Next.js with strict mode and path mapping',
    content: {
      compilerOptions: {
        target: 'ES2020',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [{ name: 'next' }],
        paths: {
          '@/*': ['./src/*'],
          '@/components/*': ['./src/components/*'],
          '@/lib/*': ['./src/lib/*'],
          '@/styles/*': ['./src/styles/*'],
        },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    },
    tags: ['nextjs', 'typescript', 'strict'],
    isDefault: true,
  },
  // Tailwind
  {
    name: 'Next.js Tailwind Config',
    configType: ConfigType.TAILWIND,
    appType: AppType.WEB_APP,
    description:
      'Tailwind CSS configuration for Next.js with design tokens and plugins',
    content: {
      content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
      ],
      theme: {
        extend: {
          colors: {
            border: 'hsl(var(--border))',
            input: 'hsl(var(--input))',
            ring: 'hsl(var(--ring))',
            background: 'hsl(var(--background))',
            foreground: 'hsl(var(--foreground))',
            primary: {
              DEFAULT: 'hsl(var(--primary))',
              foreground: 'hsl(var(--primary-foreground))',
            },
            secondary: {
              DEFAULT: 'hsl(var(--secondary))',
              foreground: 'hsl(var(--secondary-foreground))',
            },
            destructive: {
              DEFAULT: 'hsl(var(--destructive))',
              foreground: 'hsl(var(--destructive-foreground))',
            },
            muted: {
              DEFAULT: 'hsl(var(--muted))',
              foreground: 'hsl(var(--muted-foreground))',
            },
            accent: {
              DEFAULT: 'hsl(var(--accent))',
              foreground: 'hsl(var(--accent-foreground))',
            },
            popover: {
              DEFAULT: 'hsl(var(--popover))',
              foreground: 'hsl(var(--popover-foreground))',
            },
            card: {
              DEFAULT: 'hsl(var(--card))',
              foreground: 'hsl(var(--card-foreground))',
            },
          },
          borderRadius: {
            lg: 'var(--radius)',
            md: 'calc(var(--radius) - 2px)',
            sm: 'calc(var(--radius) - 4px)',
          },
        },
      },
      plugins: ['tailwindcss-animate'],
    },
    tags: ['nextjs', 'tailwind', 'css', 'design-system'],
    isDefault: true,
  },
  // Windsurf Rules
  {
    name: 'Next.js Windsurf Rules',
    configType: ConfigType.WINDSURF_RULES,
    appType: AppType.WEB_APP,
    description:
      'Comprehensive Windsurf IDE rules for Next.js development with best practices',
    content: {
      raw: `# Windsurf Rules for Next.js

## Framework & Architecture
- Use Next.js App Router with Server Components by default
- Client Components only when needed (interactivity, hooks, browser APIs)
- Implement Server Actions for mutations and form handling
- Use dynamic imports for code splitting heavy components
- Leverage Next.js Image component for optimized images
- Use next/font for optimized font loading

## File Structure
- Group related components in feature folders
- Keep components small and focused (< 200 lines)
- Use barrel exports (index.ts) for clean imports
- Place shared utilities in /lib directory
- API routes in /app/api directory

## Styling
- Use Tailwind CSS with design system tokens
- Follow mobile-first responsive patterns
- Avoid inline styles, prefer Tailwind classes
- Use cn() utility for conditional classes
- Implement dark mode with next-themes

## Code Quality
- TypeScript strict mode always enabled
- ESLint with Next.js recommended rules
- Prettier for consistent formatting
- Use kebab-case for file/folder names
- Use PascalCase for component names
- Proper error boundaries for error handling

## Performance
- Minimize client-side JavaScript
- Use React.memo() for expensive renders
- Implement proper loading states
- Optimize images and assets
- Use Next.js built-in optimizations

## Testing
- Unit tests with Jest
- Integration tests with Testing Library
- E2E tests with Playwright
- Aim for 80%+ code coverage`,
    },
    tags: ['nextjs', 'windsurf', 'best-practices', 'typescript'],
    isDefault: true,
  },
  // Package.json
  {
    name: 'Next.js Package.json',
    configType: ConfigType.PACKAGE_JSON,
    appType: AppType.WEB_APP,
    description: 'Essential scripts and dependencies for Next.js projects',
    content: {
      scripts: {
        dev: 'next dev --turbopack',
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
        'lint:fix': 'next lint --fix',
        typecheck: 'tsc --noEmit',
        format: 'prettier --write "**/*.{ts,tsx,md,json}"',
        test: 'jest',
        'test:watch': 'jest --watch',
        'test:coverage': 'jest --coverage',
      },
      dependencies: {
        next: '^15.0.0',
        react: '^19.0.0',
        'react-dom': '^19.0.0',
      },
      devDependencies: {
        '@types/node': '^22.0.0',
        '@types/react': '^19.0.0',
        '@types/react-dom': '^19.0.0',
        typescript: '^5.6.0',
        tailwindcss: '^4.0.0',
        eslint: '^9.0.0',
        'eslint-config-next': '^15.0.0',
        prettier: '^3.0.0',
      },
    },
    tags: ['nextjs', 'scripts', 'dependencies'],
    isDefault: true,
  },

  // ========== DESKTOP CONFIGS ==========
  // ESLint
  {
    name: 'Electron ESLint Config',
    configType: ConfigType.ESLINT,
    appType: AppType.DESKTOP_APP,
    description: 'ESLint configuration for Electron applications',
    content: {
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
      env: {
        node: true,
        electron: true,
        browser: true,
      },
      rules: {
        '@typescript-eslint/no-unused-vars': 'error',
        'no-console': 'off',
        '@typescript-eslint/no-require-imports': 'off',
      },
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    tags: ['electron', 'typescript', 'eslint'],
    isDefault: true,
  },
  // TypeScript
  {
    name: 'Electron TypeScript Config',
    configType: ConfigType.TSCONFIG,
    appType: AppType.DESKTOP_APP,
    description:
      'TypeScript configuration for Electron main and renderer processes',
    content: {
      compilerOptions: {
        target: 'ES2022',
        lib: ['ES2022', 'DOM'],
        module: 'ESNext',
        moduleResolution: 'bundler',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        strict: true,
        skipLibCheck: true,
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'react-jsx',
        paths: {
          '@/*': ['./src/*'],
          '@main/*': ['./electron/main/*'],
          '@renderer/*': ['./src/renderer/*'],
        },
      },
      include: ['src/**/*', 'electron/**/*'],
      exclude: ['node_modules', 'out', 'dist'],
    },
    tags: ['electron', 'typescript'],
    isDefault: true,
  },
  // Windsurf Rules
  {
    name: 'Electron Windsurf Rules',
    configType: ConfigType.WINDSURF_RULES,
    appType: AppType.DESKTOP_APP,
    description: 'Development rules for Electron desktop applications',
    content: {
      raw: `# Windsurf Rules for Electron

## Project Structure
- Separate main and renderer processes clearly
- Main process: /electron/main
- Renderer process: /src/renderer
- Shared code: /src/shared
- Preload scripts: /electron/preload

## IPC Communication
- Use contextBridge for secure IPC
- Define typed IPC channels
- Never expose Node.js APIs directly to renderer
- Validate all IPC messages
- Use invoke/handle pattern for async operations

## Security
- Enable contextIsolation
- Disable nodeIntegration in renderer
- Use Content Security Policy
- Sanitize all user inputs
- Validate all file paths
- Use app.getPath() for user directories

## Build & Package
- Use electron-builder or electron-forge
- Implement auto-updater
- Code signing for production builds
- Proper app icons and metadata
- Handle different OS requirements

## Performance
- Lazy load heavy modules
- Use web workers for CPU-intensive tasks
- Implement proper window management
- Optimize renderer bundle size
- Use native modules when necessary

## Development
- Hot reload for renderer process
- Proper logging in both processes
- Error handling and crash reporting
- Use electron-devtools-installer`,
    },
    tags: ['electron', 'windsurf', 'desktop', 'security'],
    isDefault: true,
  },

  // ========== MOBILE_APP CONFIGS ==========
  // ESLint
  {
    name: 'React Native ESLint Config',
    configType: ConfigType.ESLINT,
    appType: AppType.MOBILE_APP,
    description: 'ESLint configuration for React Native applications',
    content: {
      extends: [
        '@react-native',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
      ],
      rules: {
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-explicit-any': 'warn',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'react-native/no-inline-styles': 'warn',
        'react-native/no-unused-styles': 'error',
      },
    },
    tags: ['react-native', 'mobile', 'eslint'],
    isDefault: true,
  },
  // TypeScript
  {
    name: 'React Native TypeScript Config',
    configType: ConfigType.TSCONFIG,
    appType: AppType.MOBILE_APP,
    description: 'TypeScript configuration for React Native projects',
    content: {
      extends: '@react-native/typescript-config/tsconfig.json',
      compilerOptions: {
        target: 'esnext',
        lib: ['esnext'],
        jsx: 'react-jsx',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        strict: true,
        skipLibCheck: true,
        paths: {
          '@/*': ['./src/*'],
          '@components/*': ['./src/components/*'],
          '@screens/*': ['./src/screens/*'],
          '@utils/*': ['./src/utils/*'],
        },
      },
      include: ['src/**/*', 'index.js'],
      exclude: ['node_modules', 'android', 'ios'],
    },
    tags: ['react-native', 'typescript', 'mobile'],
    isDefault: true,
  },
  // Windsurf Rules
  {
    name: 'React Native Windsurf Rules',
    configType: ConfigType.WINDSURF_RULES,
    appType: AppType.MOBILE_APP,
    description: 'Best practices for React Native development',
    content: {
      raw: `# Windsurf Rules for React Native

## Project Structure
- Feature-based folder organization
- /src/screens - Screen components
- /src/components - Reusable components
- /src/navigation - Navigation setup
- /src/services - API and services
- /src/store - State management
- /src/utils - Helper functions

## Component Patterns
- Use functional components with hooks
- Implement proper prop types with TypeScript
- Separate presentational and container components
- Use React.memo() for performance
- Avoid inline styles, use StyleSheet.create()

## Navigation
- Use React Navigation v6+
- Type-safe navigation with TypeScript
- Implement deep linking
- Handle back button on Android
- Proper stack and tab navigation

## State Management
- Use React Context for simple state
- Redux/Zustand for complex state
- React Query for server state
- Persist state with AsyncStorage

## Performance
- Use FlatList for long lists
- Implement proper list keys
- Optimize images with FastImage
- Use InteractionManager for animations
- Profile with React DevTools

## Platform Specific
- Use Platform.select() for platform code
- Implement platform-specific components
- Handle safe area on iOS
- Manage Android back button
- Test on both platforms

## Build & Deploy
- Use EAS Build for managed workflow
- Implement OTA updates
- Proper app icons and splash screens
- Handle permissions properly
- Configure app.json/app.config.js`,
    },
    tags: ['react-native', 'mobile', 'best-practices'],
    isDefault: true,
  },

  // ========== API CONFIGS ==========
  // ESLint
  {
    name: 'Node.js API ESLint Config',
    configType: ConfigType.ESLINT,
    appType: AppType.API,
    description: 'ESLint configuration for Node.js API projects',
    content: {
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
      env: {
        node: true,
        es2022: true,
      },
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
        'no-process-exit': 'error',
      },
    },
    tags: ['api', 'nodejs', 'eslint'],
    isDefault: true,
  },
  // TypeScript
  {
    name: 'Node.js API TypeScript Config',
    configType: ConfigType.TSCONFIG,
    appType: AppType.API,
    description:
      'TypeScript configuration for Node.js API with strict settings',
    content: {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        lib: ['ES2022'],
        outDir: './dist',
        rootDir: './src',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        strict: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        paths: {
          '@/*': ['./src/*'],
          '@routes/*': ['./src/routes/*'],
          '@controllers/*': ['./src/controllers/*'],
          '@services/*': ['./src/services/*'],
          '@models/*': ['./src/models/*'],
          '@middleware/*': ['./src/middleware/*'],
        },
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', '**/*.test.ts'],
    },
    tags: ['api', 'typescript', 'nodejs'],
    isDefault: true,
  },
  // Windsurf Rules
  {
    name: 'Node.js API Windsurf Rules',
    configType: ConfigType.WINDSURF_RULES,
    appType: AppType.API,
    description: 'Development guidelines for Node.js REST APIs',
    content: {
      raw: `# Windsurf Rules for Node.js API

## Architecture
- Use MVC or layered architecture
- Controllers handle requests/responses
- Services contain business logic
- Models define data structures
- Middleware for cross-cutting concerns
- Repositories for data access

## API Design
- RESTful endpoints with proper HTTP methods
- Consistent URL naming (kebab-case)
- Version your API (/api/v1/)
- Proper status codes
- Pagination for list endpoints
- Filter, sort, and search capabilities

## Security
- Implement authentication (JWT, OAuth)
- Use helmet for security headers
- Rate limiting with express-rate-limit
- Input validation with Zod or Joi
- SQL injection prevention
- XSS protection
- CORS configuration

## Error Handling
- Centralized error handling middleware
- Proper error status codes
- Consistent error response format
- Log errors with context
- Never expose stack traces in production

## Database
- Use Prisma or TypeORM
- Implement connection pooling
- Use transactions for related operations
- Proper indexing strategy
- Database migrations
- Seed data for development

## Testing
- Unit tests for services
- Integration tests for routes
- Use Jest or Vitest
- Mock external dependencies
- Test error scenarios
- Aim for 80%+ coverage

## Logging & Monitoring
- Use winston or pino for logging
- Log levels: error, warn, info, debug
- Include request IDs
- Monitor performance metrics
- Implement health check endpoint

## Documentation
- OpenAPI/Swagger documentation
- Document all endpoints
- Include request/response examples
- Authentication requirements
- Error response formats`,
    },
    tags: ['api', 'nodejs', 'rest', 'best-practices'],
    isDefault: true,
  },
  // Package.json
  {
    name: 'Node.js API Package.json',
    configType: ConfigType.PACKAGE_JSON,
    appType: AppType.API,
    description: 'Scripts and dependencies for Node.js API projects',
    content: {
      scripts: {
        dev: 'tsx watch src/index.ts',
        build: 'tsc',
        start: 'node dist/index.js',
        'start:prod': 'NODE_ENV=production node dist/index.js',
        lint: 'eslint src --ext .ts',
        'lint:fix': 'eslint src --ext .ts --fix',
        format: 'prettier --write "src/**/*.ts"',
        test: 'jest',
        'test:watch': 'jest --watch',
        'test:coverage': 'jest --coverage',
        'db:generate': 'prisma generate',
        'db:push': 'prisma db push',
        'db:migrate': 'prisma migrate dev',
      },
      dependencies: {
        express: '^4.19.0',
        '@prisma/client': '^6.0.0',
        zod: '^3.23.0',
        helmet: '^8.0.0',
        cors: '^2.8.5',
        'express-rate-limit': '^7.0.0',
      },
      devDependencies: {
        '@types/express': '^5.0.0',
        '@types/node': '^22.0.0',
        typescript: '^5.6.0',
        tsx: '^4.0.0',
        prisma: '^6.0.0',
        eslint: '^9.0.0',
        prettier: '^3.0.0',
        jest: '^29.0.0',
      },
    },
    tags: ['api', 'nodejs', 'dependencies'],
    isDefault: true,
  },
];

async function main() {
  console.log('Seeding shared configurations...');

  // Clear existing configs
  await prisma.sharedConfig.deleteMany({});

  // Create all configs
  for (const config of sharedConfigs) {
    await prisma.sharedConfig.create({
      data: config,
    });
    console.log(`✓ Created: ${config.name}`);
  }

  console.log(
    `\n✅ Successfully seeded ${sharedConfigs.length} shared configurations`,
  );
}

main()
  .catch(e => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
