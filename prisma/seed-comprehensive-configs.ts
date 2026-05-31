import { AppType, ConfigType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to generate default content based on config type and app type
function generateDefaultContent(configType: ConfigType, appType: AppType): any {
  const baseConfigs: Record<ConfigType, any> = {
    ESLINT: {
      extends: ['eslint:recommended'],
      rules: {
        'no-console': 'warn',
        'no-unused-vars': 'error',
      },
      env: {
        node: true,
        es2022: true,
      },
    },
    PRETTIER: {
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5',
      printWidth: 100,
      arrowParens: 'always',
    },
    TYPESCRIPT: {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        isolatedModules: true,
        moduleResolution: 'bundler',
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist'],
    },
    TAILWIND: {
      content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
      theme: {
        extend: {},
      },
      plugins: [],
    },
    NEXTJS: {
      reactStrictMode: true,
      swcMinify: true,
      images: {
        domains: [],
      },
      experimental: {},
    },
    BABEL: {
      presets: ['babel-preset-expo'],
      plugins: ['react-native-reanimated/plugin'],
      env: {
        production: {
          plugins: ['react-native-paper/babel'],
        },
      },
    },
    EXPO: {
      expo: {
        name: 'My App',
        slug: 'my-app',
        version: '1.0.0',
        orientation: 'portrait',
        icon: './assets/icon.png',
        userInterfaceStyle: 'automatic',
        splash: {
          image: './assets/splash.png',
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
        updates: {
          fallbackToCacheTimeout: 0,
        },
        assetBundlePatterns: ['**/*'],
        ios: {
          supportsTablet: true,
          bundleIdentifier: 'com.myapp',
        },
        android: {
          adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#ffffff',
          },
          package: 'com.myapp',
        },
        web: {
          favicon: './assets/favicon.png',
        },
      },
    },
    POSTCSS: {
      plugins: {
        tailwindcss: {},
        autoprefixer: {},
      },
    },
    VITE: {
      plugins: [],
      resolve: {
        alias: {
          '@': '/src',
        },
      },
      build: {
        outDir: 'dist',
        sourcemap: true,
      },
    },
    JEST: {
      testEnvironment: 'node',
      roots: ['<rootDir>/src'],
      testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
      transform: {
        '^.+\\.ts$': 'ts-jest',
      },
      collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
    },
    PLAYWRIGHT: {
      testDir: './tests',
      use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
      },
      projects: [
        { name: 'chromium', use: { browserName: 'chromium' } },
        { name: 'firefox', use: { browserName: 'firefox' } },
        { name: 'webkit', use: { browserName: 'webkit' } },
      ],
    },
    VITEST: {
      test: {
        globals: true,
        environment: 'node',
        coverage: {
          provider: 'v8',
          reporter: ['text', 'json', 'html'],
        },
      },
    },
    TURBO: {
      pipeline: {
        build: {
          outputs: ['dist/**', '.next/**'],
          dependsOn: ['^build'],
        },
        dev: {
          cache: false,
        },
        lint: {},
        test: {},
      },
    },
    SENTRY: {
      dsn: 'YOUR_SENTRY_DSN',
      tracesSampleRate: 1.0,
      environment: 'development',
    },
    VERCEL: {
      buildCommand: 'bun build',
      outputDirectory: 'dist',
      installCommand: 'bun install',
      framework: null,
    },
    BIOME: {
      linter: {
        enabled: true,
        rules: {
          recommended: true,
        },
      },
      formatter: {
        enabled: true,
        indentStyle: 'space',
        indentWidth: 2,
      },
    },
    STYLELINT: {
      extends: ['stylelint-config-standard'],
      rules: {
        'selector-class-pattern': null,
      },
    },
    TSUP: {
      entry: ['src/index.ts'],
      format: ['cjs', 'esm'],
      dts: true,
      splitting: false,
      sourcemap: true,
      clean: true,
    },
    BUNFIG: {
      install: {
        production: false,
      },
      run: {
        bun: true,
      },
    },
    GITIGNORE: {
      raw: `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
*.lcov

# Build outputs
dist/
build/
.next/
out/

# Environment variables
.env
.env*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*`,
    },
    PACKAGE_JSON: {
      name: 'project-name',
      version: '0.1.0',
      scripts: {
        dev: 'echo "Add dev script"',
        build: 'echo "Add build script"',
        start: 'echo "Add start script"',
        test: 'echo "Add test script"',
      },
      dependencies: {},
      devDependencies: {},
    },
    TSCONFIG: {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        lib: ['ES2022'],
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        isolatedModules: true,
        moduleResolution: 'bundler',
      },
      include: ['src/**/*'],
      exclude: ['node_modules'],
    },
    WINDSURF_RULES: {
      raw: `# Windsurf Rules for ${appType}

## Code Quality
- Write clean, maintainable code
- Follow project conventions
- Add comments for complex logic
- Use TypeScript for type safety

## Testing
- Write unit tests for core functionality
- Maintain test coverage above 80%
- Test edge cases and error scenarios

## Performance
- Optimize for performance
- Use lazy loading where appropriate
- Monitor bundle size
- Profile performance bottlenecks

## Security
- Follow security best practices
- Validate all inputs
- Sanitize user data
- Keep dependencies updated`,
    },
    AGENTS_MD: {
      raw: `# AGENTS Configuration for ${appType}

## Role
You are a specialized developer for ${appType} applications.

## Responsibilities
- Write high-quality, maintainable code
- Follow best practices and conventions
- Implement proper error handling
- Write comprehensive tests
- Document complex functionality

## Tech Stack
- TypeScript for type safety
- Modern build tools
- Testing frameworks
- Linting and formatting tools

## Guidelines
- Use clear, descriptive variable names
- Write self-documenting code
- Keep functions small and focused
- Follow DRY (Don't Repeat Yourself)
- Implement proper logging`,
    },
    CLAUDE_MD: {
      raw: `# CLAUDE.md - Development Guide for ${appType}

## Project Context
This is a ${appType} project managed by Claude Code.

## Development Workflow
- Follow the established code patterns
- Run tests before committing
- Use the provided scripts in package.json
- Keep dependencies up to date

## Code Standards
- TypeScript strict mode enabled
- ESLint for code quality
- Prettier for formatting
- Comprehensive test coverage

## Best Practices
- Write self-documenting code
- Add JSDoc comments for public APIs
- Use semantic commit messages
- Keep PRs focused and small`,
    },
    CURSOR_RULES: {
      raw: `# Cursor Rules for ${appType}

## Code Style
- Use TypeScript for all new code
- Follow the project's ESLint configuration
- Format code with Prettier
- Use meaningful variable names

## File Organization
- Group related files together
- Use index files for clean exports
- Keep components/modules focused
- Separate concerns appropriately

## Testing
- Write tests alongside implementation
- Test edge cases and error paths
- Mock external dependencies
- Aim for high test coverage

## Documentation
- Document complex algorithms
- Add inline comments for clarity
- Maintain up-to-date README
- Document API endpoints/interfaces`,
    },
    VSCODE: {
      recommendations: [
        'dbaeumer.vscode-eslint',
        'esbenp.prettier-vscode',
        'bradlc.vscode-tailwindcss',
      ],
      settings: {
        'editor.formatOnSave': true,
        'editor.defaultFormatter': 'esbenp.prettier-vscode',
        'editor.codeActionsOnSave': {
          'source.fixAll.eslint': true,
        },
        'typescript.tsdk': 'node_modules/typescript/lib',
        'typescript.enablePromptUseWorkspaceTsdk': true,
      },
    },
    APPLAB_CONFIG: {
      project: {
        name: 'Project Name',
        type: appType,
        version: '1.0.0',
      },
      build: {
        outputDir: 'dist',
        sourceMaps: true,
      },
      development: {
        port: 3000,
        hot: true,
      },
      features: {
        analytics: false,
        errorTracking: false,
      },
    },
    COMPONENTS_JSON: {
      $schema: 'https://ui.shadcn.com/schema.json',
      style: 'default',
      rsc: true,
      tsx: true,
      tailwind: {
        config: 'tailwind.config.ts',
        css: 'app/globals.css',
        baseColor: 'slate',
        cssVariables: true,
      },
      aliases: {
        components: '@/components',
        utils: '@/lib/utils',
      },
    },
  };

  // Get base config for this config type
  let content = baseConfigs[configType] || { note: 'Default configuration' };

  // Customize based on app type
  switch (appType) {
    case AppType.WEB_APP:
      if (
        configType === ConfigType.TYPESCRIPT ||
        configType === ConfigType.TSCONFIG
      ) {
        content = {
          ...content,
          compilerOptions: {
            ...content.compilerOptions,
            lib: ['dom', 'dom.iterable', 'esnext'],
            jsx: 'react-jsx',
          },
        };
      } else if (configType === ConfigType.PACKAGE_JSON) {
        content.scripts = {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
        };
      }
      break;

    case AppType.DESKTOP_APP:
      if (configType === ConfigType.PACKAGE_JSON) {
        content.scripts = {
          dev: 'electron .',
          build: 'electron-builder',
          start: 'electron .',
        };
      }
      break;

    case AppType.MOBILE_APP:
      if (
        configType === ConfigType.TYPESCRIPT ||
        configType === ConfigType.TSCONFIG
      ) {
        content.compilerOptions = {
          ...content.compilerOptions,
          jsx: 'react-native',
        };
      } else if (configType === ConfigType.BABEL) {
        // Babel config is already optimized for React Native/Expo in base config
        content.presets = ['babel-preset-expo'];
        content.plugins = ['react-native-reanimated/plugin'];
      } else if (configType === ConfigType.EXPO) {
        // Expo config is already optimized for mobile apps in base config
        content.expo.name = 'Mobile App';
        content.expo.slug = 'mobile-app';
      } else if (configType === ConfigType.PACKAGE_JSON) {
        content.scripts = {
          start: 'expo start',
          android: 'expo start --android',
          ios: 'expo start --ios',
          web: 'expo start --web',
        };
      }
      break;

    case AppType.API:
      if (
        configType === ConfigType.TYPESCRIPT ||
        configType === ConfigType.TSCONFIG
      ) {
        content.compilerOptions = {
          ...content.compilerOptions,
          module: 'commonjs',
          outDir: 'dist',
          rootDir: 'src',
        };
      } else if (configType === ConfigType.PACKAGE_JSON) {
        content.scripts = {
          dev: 'tsx watch src/index.ts',
          build: 'tsc',
          start: 'node dist/index.js',
        };
      } else if (configType === ConfigType.JEST) {
        content.testEnvironment = 'node';
      }
      break;

    case AppType.LIBRARY:
      if (configType === ConfigType.PACKAGE_JSON) {
        content = {
          ...content,
          main: 'dist/index.js',
          module: 'dist/index.mjs',
          types: 'dist/index.d.ts',
          files: ['dist'],
          scripts: {
            dev: 'tsup --watch',
            build: 'tsup',
            test: 'vitest',
          },
        };
      } else if (configType === ConfigType.TSUP) {
        content.format = ['cjs', 'esm'];
        content.dts = true;
      }
      break;

    case AppType.MONOREPO:
      if (configType === ConfigType.PACKAGE_JSON) {
        content = {
          ...content,
          private: true,
          workspaces: ['packages/*', 'apps/*'],
          scripts: {
            dev: 'turbo dev',
            build: 'turbo build',
            test: 'turbo test',
            lint: 'turbo lint',
          },
        };
      } else if (configType === ConfigType.TURBO) {
        content.pipeline = {
          build: {
            dependsOn: ['^build'],
            outputs: ['dist/**', '.next/**'],
          },
          dev: {
            cache: false,
            persistent: true,
          },
          lint: {},
          test: {},
        };
      }
      break;

    case AppType.CLI:
      if (configType === ConfigType.PACKAGE_JSON) {
        content = {
          ...content,
          bin: {
            'cli-tool': './dist/cli.js',
          },
          scripts: {
            dev: 'tsx src/cli.ts',
            build: 'tsup src/cli.ts --format esm',
            start: 'node dist/cli.js',
          },
        };
      }
      break;

    case AppType.EXTENSION:
      if (
        configType === ConfigType.TYPESCRIPT ||
        configType === ConfigType.TSCONFIG
      ) {
        content.compilerOptions = {
          ...content.compilerOptions,
          lib: ['ES2022', 'DOM'],
        };
      } else if (configType === ConfigType.PACKAGE_JSON) {
        content.scripts = {
          dev: 'webpack --mode development --watch',
          build: 'webpack --mode production',
        };
      }
      break;
  }

  return content;
}

// Generate name for the config
function generateConfigName(configType: ConfigType, appType: AppType): string {
  const configName = configType
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');

  const appName = appType
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');

  return `${configName} - ${appName}`;
}

// Generate description for the config
function generateDescription(configType: ConfigType, appType: AppType): string {
  const configName = configType.toLowerCase().replace(/_/g, ' ');
  const appName = appType.toLowerCase().replace(/_/g, ' ');

  return `Default ${configName} configuration for ${appName} projects`;
}

// Generate tags
function generateTags(configType: ConfigType, appType: AppType): string[] {
  const tags = [
    configType.toLowerCase().replace(/_/g, '-'),
    appType.toLowerCase().replace(/_/g, '-'),
    'default',
  ];

  return tags;
}

async function main() {
  console.log(
    '🌱 Seeding COMPREHENSIVE shared configurations for ALL combinations...\n',
  );

  const allConfigTypes = Object.values(ConfigType);
  const allAppTypes = Object.values(AppType);

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  // Delete all existing shared configs to start fresh
  console.log('🗑️  Clearing existing shared configs...');
  await prisma.sharedConfig.deleteMany({});
  console.log('✓ Cleared\n');

  for (const appType of allAppTypes) {
    console.log(`📦 Processing ${appType}...`);

    for (const configType of allConfigTypes) {
      try {
        const name = generateConfigName(configType, appType);
        const description = generateDescription(configType, appType);
        const content = generateDefaultContent(configType, appType);
        const tags = generateTags(configType, appType);

        // Check if this config already exists
        const existing = await prisma.sharedConfig.findFirst({
          where: {
            configType,
            appType,
          },
        });

        if (existing) {
          // Update existing
          await prisma.sharedConfig.update({
            where: { id: existing.id },
            data: {
              name,
              description,
              content,
              tags,
            },
          });
          console.log(`  ↻ Updated: ${name}`);
          updatedCount++;
        } else {
          // Create new
          await prisma.sharedConfig.create({
            data: {
              name,
              description,
              configType,
              appType,
              content,
              tags,
              isDefault: true,
            },
          });
          console.log(`  ✓ Created: ${name}`);
          createdCount++;
        }
      } catch (error) {
        console.error(`  ✗ Failed: ${configType} for ${appType}`, error);
        skippedCount++;
      }
    }
    console.log('');
  }

  console.log('═'.repeat(80));
  console.log('📊 Summary:');
  console.log(`  ✓ Created: ${createdCount}`);
  console.log(`  ↻ Updated: ${updatedCount}`);
  console.log(`  ✗ Skipped: ${skippedCount}`);

  const totalConfigs = await prisma.sharedConfig.count();
  console.log(`  📦 Total configs in database: ${totalConfigs}`);
  console.log('═'.repeat(80));

  console.log('\n✅ Comprehensive seeding complete!');
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
