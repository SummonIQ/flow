import { AppType, ConfigScope, ConfigType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const configs = [
  // ============================================================================
  // WEB_APP - Next.js Best Practices
  // ============================================================================
  {
    name: 'ESLint - Web App',
    configType: ConfigType.ESLINT,
    appType: AppType.WEB_APP,
    description:
      'ESLint configuration with Next.js, TypeScript, and accessibility rules',
    content: {
      root: true,
      extends: [
        'next/core-web-vitals',
        'next/typescript',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
      ],
      plugins: [
        '@typescript-eslint',
        'react',
        'react-hooks',
        'jsx-a11y',
        'unused-imports',
      ],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { prefer: 'type-imports' },
        ],
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'unused-imports/no-unused-imports': 'error',
      },
      settings: {
        react: { version: 'detect' },
      },
    },
  },
  {
    name: 'Next.js Config - Web App',
    configType: ConfigType.NEXTJS,
    appType: AppType.WEB_APP,
    description: 'Next.js 16 configuration with optimizations',
    content: {
      reactStrictMode: true,
      swcMinify: true,
      experimental: {
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
        typedRoutes: true,
      },
      images: {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [],
      },
      eslint: {
        ignoreDuringBuilds: false,
      },
      typescript: {
        ignoreBuildErrors: false,
      },
    },
  },
  {
    name: 'TypeScript - Web App',
    configType: ConfigType.TYPESCRIPT,
    appType: AppType.WEB_APP,
    description: 'TypeScript strict configuration for Next.js',
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
        },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    },
  },
  {
    name: 'Tailwind CSS - Web App',
    configType: ConfigType.TAILWIND,
    appType: AppType.WEB_APP,
    description: 'Tailwind CSS v4 with design system',
    content: {
      content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
      ],
      darkMode: 'class',
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
          },
          borderRadius: {
            lg: 'var(--radius)',
            md: 'calc(var(--radius) - 2px)',
            sm: 'calc(var(--radius) - 4px)',
          },
        },
      },
      plugins: [],
    },
  },
  {
    name: 'Prettier - Web App',
    configType: ConfigType.PRETTIER,
    appType: AppType.WEB_APP,
    description: 'Prettier code formatting with Tailwind plugin',
    content: {
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      useTabs: false,
      trailingComma: 'es5',
      printWidth: 100,
      arrowParens: 'always',
      endOfLine: 'lf',
      plugins: ['prettier-plugin-tailwindcss'],
    },
  },
  {
    name: 'package.json - Web App',
    configType: ConfigType.PACKAGE_JSON,
    appType: AppType.WEB_APP,
    description: 'NPM scripts and dependencies for Next.js',
    content: {
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
        typecheck: 'tsc --noEmit',
        'test:unit': 'vitest',
        'test:e2e': 'playwright test',
      },
      dependencies: {
        next: '^16.0.0',
        react: '^19.0.0',
        'react-dom': '^19.0.0',
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        '@types/react': '^19.0.0',
        '@types/react-dom': '^19.0.0',
        typescript: '^5.0.0',
        tailwindcss: '^4.0.0',
        eslint: '^9.0.0',
        'eslint-config-next': '^16.0.0',
        prettier: '^3.0.0',
        vitest: '^2.0.0',
        '@playwright/test': '^1.0.0',
      },
    },
  },
  {
    name: 'Windsurf Rules - Web App',
    configType: ConfigType.WINDSURF_RULES,
    appType: AppType.WEB_APP,
    description: 'IDE development guidelines for Next.js web apps',
    content: {
      rules: [
        'Always use TypeScript with strict mode enabled',
        'Prefer Server Components over Client Components',
        'Use Tailwind CSS for all styling - no inline styles',
        'Validate all user input with Zod',
        'Implement proper error boundaries',
        'Add loading states for async operations',
        'Follow accessibility best practices (WCAG 2.1 AA)',
        'Use React Suspense for data fetching',
      ],
      fileStructure: {
        app: 'Next.js App Router - server components by default',
        components: 'Reusable UI components',
        lib: 'Utilities and helpers',
        actions: 'Server Actions for mutations',
        types: 'TypeScript type definitions',
      },
    },
  },
  {
    name: 'AGENTS.md - Web App',
    configType: ConfigType.AGENTS_MD,
    appType: AppType.WEB_APP,
    description: 'AI agent development guidelines for Next.js apps',
    content: {
      metadata: {
        purpose: 'Development guidelines for Next.js web applications',
        framework: 'Next.js 16, React 19, TypeScript, Tailwind CSS v4',
        lastUpdated: new Date().toISOString().split('T')[0],
      },
      principles: [
        'Server-first architecture: Prefer Server Components',
        'Type safety: Strict TypeScript with zero any types',
        'Tailwind-only styling: No inline styles or CSS modules',
        'Accessibility: WCAG 2.1 AA compliance minimum',
        'Performance: Target <2s FCP, >80 Lighthouse score',
      ],
      workflow: {
        beforeStarting: [
          'Read existing code patterns',
          'Check for reusable components',
          'Plan server vs client boundaries',
        ],
        development: [
          'Use Server Components by default',
          'Add use client only when necessary',
          'Validate input with Zod',
          'Implement error handling',
          'Add loading states',
        ],
        testing: [
          'Unit tests for utilities',
          'E2E tests with Playwright',
          'Test accessibility',
          'Verify mobile responsiveness',
        ],
      },
    },
  },

  // ============================================================================
  // DESKTOP - Electron Best Practices
  // ============================================================================
  {
    name: 'ESLint - Desktop',
    configType: ConfigType.ESLINT,
    appType: AppType.DESKTOP_APP,
    description: 'ESLint for Electron with main/renderer processes',
    content: {
      root: true,
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
      ],
      plugins: ['@typescript-eslint', 'react'],
      env: {
        browser: true,
        node: true,
        es2021: true,
      },
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_' },
        ],
        'no-console': 'off',
      },
    },
  },
  {
    name: 'Next.js Config - Desktop',
    configType: ConfigType.NEXTJS,
    appType: AppType.DESKTOP_APP,
    description: 'Next.js for Electron renderer process',
    content: {
      reactStrictMode: true,
      output: 'export',
      distDir: 'dist/renderer',
      images: {
        unoptimized: true,
      },
    },
  },
  {
    name: 'TypeScript - Desktop',
    configType: ConfigType.TYPESCRIPT,
    appType: AppType.DESKTOP_APP,
    description: 'TypeScript for Electron with main/renderer split',
    content: {
      compilerOptions: {
        target: 'ES2020',
        lib: ['ES2020', 'DOM'],
        module: 'ESNext',
        moduleResolution: 'bundler',
        strict: true,
        skipLibCheck: true,
        esModuleInterop: true,
        jsx: 'react-jsx',
        outDir: './dist',
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*'],
        },
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist'],
    },
  },
  {
    name: 'Tailwind CSS - Desktop',
    configType: ConfigType.TAILWIND,
    appType: AppType.DESKTOP_APP,
    description: 'Tailwind for Electron renderer',
    content: {
      content: ['./src/renderer/**/*.{js,ts,jsx,tsx}'],
      darkMode: 'class',
      theme: {
        extend: {},
      },
    },
  },
  {
    name: 'Prettier - Desktop',
    configType: ConfigType.PRETTIER,
    appType: AppType.DESKTOP_APP,
    description: 'Code formatting for Electron',
    content: {
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5',
    },
  },
  {
    name: 'package.json - Desktop',
    configType: ConfigType.PACKAGE_JSON,
    appType: AppType.DESKTOP_APP,
    description: 'Electron build scripts and dependencies',
    content: {
      main: 'dist/main/index.js',
      scripts: {
        dev: 'concurrently "bun dev:renderer" "bun dev:main"',
        'dev:renderer': 'next dev',
        'dev:main': 'electronmon dist/main/index.js',
        build: 'bun build:renderer && bun build:main',
        'build:renderer': 'next build',
        'build:main': 'tsc -p tsconfig.main.json',
        start: 'electron .',
        package: 'electron-builder',
      },
      dependencies: {
        electron: '^latest',
        next: '^16.0.0',
        react: '^19.0.0',
        'react-dom': '^19.0.0',
      },
    },
  },
  {
    name: 'Windsurf Rules - Desktop',
    configType: ConfigType.WINDSURF_RULES,
    appType: AppType.DESKTOP_APP,
    description: 'Development guidelines for Electron apps',
    content: {
      rules: [
        'Separate main and renderer process logic',
        'Use contextBridge for secure IPC',
        'Handle platform differences (Windows/Mac/Linux)',
        'Implement auto-updates',
        'Add proper error handling and crash reporting',
      ],
    },
  },
  {
    name: 'AGENTS.md - Desktop',
    configType: ConfigType.AGENTS_MD,
    appType: AppType.DESKTOP_APP,
    description: 'AI guidelines for Electron development',
    content: {
      metadata: {
        purpose: 'Electron desktop application development',
        framework: 'Electron, React, TypeScript',
        lastUpdated: new Date().toISOString().split('T')[0],
      },
      principles: [
        'Separate main and renderer processes',
        'Secure IPC communication',
        'Cross-platform compatibility',
        'Auto-update support',
      ],
      workflow: {
        development: [
          'Use contextBridge for IPC',
          'Test on all platforms',
          'Handle deep linking',
          'Implement window management',
        ],
      },
    },
  },

  // ============================================================================
  // MOBILE_APP - React Native Best Practices
  // ============================================================================
  {
    name: 'ESLint - Mobile',
    configType: ConfigType.ESLINT,
    appType: AppType.MOBILE_APP,
    description: 'ESLint for React Native',
    content: {
      extends: [
        '@react-native-community',
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_' },
        ],
      },
    },
  },
  {
    name: 'Next.js Config - Mobile',
    configType: ConfigType.NEXTJS,
    appType: AppType.MOBILE_APP,
    description: 'Next.js for React Native Web',
    content: {
      reactStrictMode: true,
      transpilePackages: ['react-native', 'react-native-web'],
    },
  },
  {
    name: 'TypeScript - Mobile',
    configType: ConfigType.TYPESCRIPT,
    appType: AppType.MOBILE_APP,
    description: 'TypeScript for React Native',
    content: {
      extends: 'expo/tsconfig.base',
      compilerOptions: {
        strict: true,
        jsx: 'react-native',
        skipLibCheck: true,
      },
      include: ['**/*.ts', '**/*.tsx'],
      exclude: ['node_modules'],
    },
  },
  {
    name: 'Tailwind CSS - Mobile',
    configType: ConfigType.TAILWIND,
    appType: AppType.MOBILE_APP,
    description: 'NativeWind for React Native',
    content: {
      content: ['./src/**/*.{js,jsx,ts,tsx}'],
      theme: {
        extend: {},
      },
    },
  },
  {
    name: 'Prettier - Mobile',
    configType: ConfigType.PRETTIER,
    appType: AppType.MOBILE_APP,
    description: 'Code formatting for React Native',
    content: {
      semi: false,
      singleQuote: true,
      tabWidth: 2,
    },
  },
  {
    name: 'package.json - Mobile',
    configType: ConfigType.PACKAGE_JSON,
    appType: AppType.MOBILE_APP,
    description: 'Expo scripts and dependencies',
    content: {
      scripts: {
        start: 'expo start',
        ios: 'expo start --ios',
        android: 'expo start --android',
        web: 'expo start --web',
        build: 'eas build',
      },
      dependencies: {
        expo: '~latest',
        react: '^19.0.0',
        'react-native': '^latest',
      },
    },
  },
  {
    name: 'Windsurf Rules - Mobile',
    configType: ConfigType.WINDSURF_RULES,
    appType: AppType.MOBILE_APP,
    description: 'Development guidelines for React Native',
    content: {
      rules: [
        'Test on real devices, not just simulators',
        'Handle iOS and Android platform differences',
        'Optimize for various screen sizes',
        'Handle permissions properly',
        'Optimize images and assets',
      ],
    },
  },
  {
    name: 'AGENTS.md - Mobile',
    configType: ConfigType.AGENTS_MD,
    appType: AppType.MOBILE_APP,
    description: 'AI guidelines for React Native apps',
    content: {
      metadata: {
        purpose: 'React Native mobile development',
        framework: 'React Native, Expo, TypeScript',
        lastUpdated: new Date().toISOString().split('T')[0],
      },
      principles: [
        'Mobile-first design',
        'Platform-aware development',
        'Performance optimization',
        'Offline-first when possible',
      ],
      workflow: {
        development: [
          'Test on both iOS and Android',
          'Handle keyboard and safe areas',
          'Implement proper navigation',
          'Optimize bundle size',
        ],
      },
    },
  },

  // ============================================================================
  // API - Node.js Best Practices
  // ============================================================================
  {
    name: 'ESLint - API',
    configType: ConfigType.ESLINT,
    appType: AppType.API,
    description: 'ESLint for Node.js backend',
    content: {
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
      env: {
        node: true,
        es2021: true,
      },
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/explicit-function-return-type': 'warn',
        'no-console': 'off',
      },
    },
  },
  {
    name: 'Next.js Config - API',
    configType: ConfigType.NEXTJS,
    appType: AppType.API,
    description: 'Next.js API Routes configuration',
    content: {
      reactStrictMode: true,
      experimental: {
        serverActions: true,
      },
    },
  },
  {
    name: 'TypeScript - API',
    configType: ConfigType.TYPESCRIPT,
    appType: AppType.API,
    description: 'TypeScript for Node.js backend',
    content: {
      compilerOptions: {
        target: 'ES2020',
        module: 'CommonJS',
        lib: ['ES2020'],
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*'],
        },
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist'],
    },
  },
  {
    name: 'Tailwind CSS - API',
    configType: ConfigType.TAILWIND,
    appType: AppType.API,
    description: 'Tailwind for API documentation pages',
    content: {
      content: ['./docs/**/*.{js,ts,jsx,tsx}'],
      theme: {
        extend: {},
      },
    },
  },
  {
    name: 'Prettier - API',
    configType: ConfigType.PRETTIER,
    appType: AppType.API,
    description: 'Code formatting for backend',
    content: {
      semi: true,
      singleQuote: true,
      tabWidth: 2,
    },
  },
  {
    name: 'package.json - API',
    configType: ConfigType.PACKAGE_JSON,
    appType: AppType.API,
    description: 'Node.js backend scripts',
    content: {
      scripts: {
        dev: 'nodemon --exec ts-node src/index.ts',
        build: 'tsc',
        start: 'node dist/index.js',
        test: 'vitest',
        'test:integration': 'vitest run --config vitest.integration.config.ts',
      },
      dependencies: {
        express: '^4.0.0',
        zod: '^3.0.0',
      },
      devDependencies: {
        '@types/express': '^4.0.0',
        '@types/node': '^20.0.0',
        typescript: '^5.0.0',
        'ts-node': '^10.0.0',
        nodemon: '^3.0.0',
      },
    },
  },
  {
    name: 'Windsurf Rules - API',
    configType: ConfigType.WINDSURF_RULES,
    appType: AppType.API,
    description: 'Development guidelines for backend APIs',
    content: {
      rules: [
        'Validate all input with Zod',
        'Use proper HTTP status codes',
        'Implement rate limiting',
        'Add comprehensive logging',
        'Document with OpenAPI/Swagger',
        'Use dependency injection for testability',
      ],
    },
  },
  {
    name: 'AGENTS.md - API',
    configType: ConfigType.AGENTS_MD,
    appType: AppType.API,
    description: 'AI guidelines for backend development',
    content: {
      metadata: {
        purpose: 'Backend API development',
        framework: 'Node.js, Express, TypeScript',
        lastUpdated: new Date().toISOString().split('T')[0],
      },
      principles: [
        'Type-safe with strict TypeScript',
        'Input validation with Zod',
        'Proper error handling',
        'Comprehensive logging',
        'Well-documented APIs',
      ],
      workflow: {
        development: [
          'Define Zod schemas first',
          'Add proper middleware',
          'Use correct HTTP status codes',
          'Implement pagination',
          'Add rate limiting',
        ],
        testing: [
          'Integration tests for endpoints',
          'Test error cases',
          'Test authentication',
          'Load test critical paths',
        ],
      },
    },
  },
];

async function main() {
  console.log('🌱 Seeding best-practice configs...\n');

  // Clear existing
  await prisma.configTemplate.deleteMany({});
  console.log('🗑️  Cleared database\n');

  for (const config of configs) {
    await prisma.configTemplate.create({
      data: {
        ...config,
        scope: ConfigScope.TEMPLATE,
        version: 1,
        isActive: true,
      },
    });
    console.log(`✓ ${config.name}`);
  }

  const total = await prisma.configTemplate.count();
  console.log(`\n✅ Complete! ${total} configs created`);
  console.log(`📊 8 types × 4 apps = 32 configs`);
}

main()
  .catch(e => {
    console.error('❌ Failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
