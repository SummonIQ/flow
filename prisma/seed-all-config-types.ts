import { AppType, ConfigScope, ConfigType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const configs = [
  // DESKTOP APP - All Configs
  {
    name: 'Prettier - Desktop',
    type: ConfigType.PRETTIER,
    app: AppType.DESKTOP_APP,
    content: { semi: true, singleQuote: true, tabWidth: 2 },
  },
  {
    name: 'Tailwind - Desktop',
    type: ConfigType.TAILWIND,
    app: AppType.DESKTOP_APP,
    content: { content: ['./src/**/*.{js,ts,jsx,tsx}'], darkMode: 'class' },
  },
  {
    name: 'PostCSS - Desktop',
    type: ConfigType.POSTCSS,
    app: AppType.DESKTOP_APP,
    content: { plugins: { tailwindcss: {}, autoprefixer: {} } },
  },
  {
    name: 'Jest - Desktop',
    type: ConfigType.JEST,
    app: AppType.DESKTOP_APP,
    content: {
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
  },
  {
    name: 'Vitest - Desktop',
    type: ConfigType.VITEST,
    app: AppType.DESKTOP_APP,
    content: { test: { environment: 'jsdom', globals: true } },
  },
  {
    name: 'Package.json - Desktop',
    type: ConfigType.PACKAGE_JSON,
    app: AppType.DESKTOP_APP,
    content: {
      scripts: { dev: 'electron .' },
      devDependencies: { electron: '^latest' },
    },
  },

  // MOBILE_APP - All Configs
  {
    name: 'ESLint - Mobile',
    type: ConfigType.ESLINT,
    app: AppType.MOBILE_APP,
    content: { extends: ['@react-native-community'], rules: {} },
  },
  {
    name: 'TypeScript - Mobile',
    type: ConfigType.TYPESCRIPT,
    app: AppType.MOBILE_APP,
    content: {
      compilerOptions: {
        target: 'esnext',
        module: 'commonjs',
        jsx: 'react-native',
      },
    },
  },
  {
    name: 'Prettier - Mobile',
    type: ConfigType.PRETTIER,
    app: AppType.MOBILE_APP,
    content: { semi: false, singleQuote: true },
  },
  {
    name: 'Jest - Mobile',
    type: ConfigType.JEST,
    app: AppType.MOBILE_APP,
    content: { preset: 'react-native', transformIgnorePatterns: [] },
  },
  {
    name: 'Package.json - Mobile',
    type: ConfigType.PACKAGE_JSON,
    app: AppType.MOBILE_APP,
    content: {
      scripts: {
        start: 'expo start',
        ios: 'expo start --ios',
        android: 'expo start --android',
      },
    },
  },
  {
    name: 'AGENTS.MD - Mobile',
    type: ConfigType.AGENTS_MD,
    app: AppType.MOBILE_APP,
    content: {
      metadata: {
        purpose: 'Mobile development guidelines',
        framework: 'React Native',
      },
    },
  },
  {
    name: 'Windsurf Rules - Mobile',
    type: ConfigType.WINDSURF_RULES,
    app: AppType.MOBILE_APP,
    content: { rules: ['Test on real devices', 'Handle platform differences'] },
  },

  // API - All Configs
  {
    name: 'Prettier - API',
    type: ConfigType.PRETTIER,
    app: AppType.API,
    content: { semi: true, singleQuote: true },
  },
  {
    name: 'Jest - API',
    type: ConfigType.JEST,
    app: AppType.API,
    content: { testEnvironment: 'node', coverageDirectory: 'coverage' },
  },
  {
    name: 'Vitest - API',
    type: ConfigType.VITEST,
    app: AppType.API,
    content: { test: { environment: 'node', globals: true } },
  },
  {
    name: 'Package.json - API',
    type: ConfigType.PACKAGE_JSON,
    app: AppType.API,
    content: { scripts: { dev: 'nodemon src/index.ts', build: 'tsc' } },
  },

  // LIBRARY - All Configs
  {
    name: 'ESLint - Library',
    type: ConfigType.ESLINT,
    app: AppType.LIBRARY,
    content: {
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    },
  },
  {
    name: 'Prettier - Library',
    type: ConfigType.PRETTIER,
    app: AppType.LIBRARY,
    content: { semi: true, singleQuote: true },
  },
  {
    name: 'Jest - Library',
    type: ConfigType.JEST,
    app: AppType.LIBRARY,
    content: { testEnvironment: 'node' },
  },
  {
    name: 'Vitest - Library',
    type: ConfigType.VITEST,
    app: AppType.LIBRARY,
    content: { test: { globals: true } },
  },
  {
    name: 'Package.json - Library',
    type: ConfigType.PACKAGE_JSON,
    app: AppType.LIBRARY,
    content: {
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      files: ['dist'],
    },
  },
  {
    name: 'Windsurf Rules - Library',
    type: ConfigType.WINDSURF_RULES,
    app: AppType.LIBRARY,
    content: {
      rules: ['Zero dependencies when possible', 'Tree-shakeable exports'],
    },
  },

  // CLI - All Configs
  {
    name: 'ESLint - CLI',
    type: ConfigType.ESLINT,
    app: AppType.CLI,
    content: { extends: ['eslint:recommended'], env: { node: true } },
  },
  {
    name: 'TypeScript - CLI',
    type: ConfigType.TYPESCRIPT,
    app: AppType.CLI,
    content: {
      compilerOptions: { target: 'ES2020', module: 'commonjs', outDir: 'dist' },
    },
  },
  {
    name: 'Prettier - CLI',
    type: ConfigType.PRETTIER,
    app: AppType.CLI,
    content: { semi: true },
  },
  {
    name: 'Jest - CLI',
    type: ConfigType.JEST,
    app: AppType.CLI,
    content: { testEnvironment: 'node' },
  },
  {
    name: 'Package.json - CLI',
    type: ConfigType.PACKAGE_JSON,
    app: AppType.CLI,
    content: { bin: { 'my-cli': './dist/cli.js' }, scripts: { build: 'tsc' } },
  },
  {
    name: 'Windsurf Rules - CLI',
    type: ConfigType.WINDSURF_RULES,
    app: AppType.CLI,
    content: {
      rules: ['Follow Unix philosophy', 'Provide helpful error messages'],
    },
  },

  // MONOREPO - All Configs
  {
    name: 'ESLint - Monorepo',
    type: ConfigType.ESLINT,
    app: AppType.MONOREPO,
    content: { extends: ['eslint:recommended'], root: true },
  },
  {
    name: 'TypeScript - Monorepo',
    type: ConfigType.TYPESCRIPT,
    app: AppType.MONOREPO,
    content: { compilerOptions: { composite: true }, references: [] },
  },
  {
    name: 'Prettier - Monorepo',
    type: ConfigType.PRETTIER,
    app: AppType.MONOREPO,
    content: { semi: true },
  },
  {
    name: 'Package.json - Monorepo',
    type: ConfigType.PACKAGE_JSON,
    app: AppType.MONOREPO,
    content: { private: true, workspaces: ['packages/*', 'apps/*'] },
  },
  {
    name: 'Windsurf Rules - Monorepo',
    type: ConfigType.WINDSURF_RULES,
    app: AppType.MONOREPO,
    content: {
      rules: ['Use workspace dependencies', 'Leverage Turborepo caching'],
    },
  },

  // EXTENSION - All Configs
  {
    name: 'ESLint - Extension',
    type: ConfigType.ESLINT,
    app: AppType.EXTENSION,
    content: {
      extends: ['eslint:recommended'],
      env: { browser: true, webextensions: true },
    },
  },
  {
    name: 'TypeScript - Extension',
    type: ConfigType.TYPESCRIPT,
    app: AppType.EXTENSION,
    content: { compilerOptions: { target: 'ES2020', lib: ['ES2020', 'DOM'] } },
  },
  {
    name: 'Prettier - Extension',
    type: ConfigType.PRETTIER,
    app: AppType.EXTENSION,
    content: { semi: true },
  },
  {
    name: 'Package.json - Extension',
    type: ConfigType.PACKAGE_JSON,
    app: AppType.EXTENSION,
    content: { scripts: { build: 'webpack --mode production' } },
  },
  {
    name: 'AGENTS.MD - Extension',
    type: ConfigType.AGENTS_MD,
    app: AppType.EXTENSION,
    content: {
      metadata: {
        purpose: 'Browser extension development',
        framework: 'WebExtensions API',
      },
    },
  },
  {
    name: 'Windsurf Rules - Extension',
    type: ConfigType.WINDSURF_RULES,
    app: AppType.EXTENSION,
    content: {
      rules: [
        'Follow WebExtensions API standards',
        'Handle permissions properly',
      ],
    },
  },
];

async function main() {
  console.log('🌱 Seeding ALL config types for ALL app types...');
  let count = 0;

  for (const c of configs) {
    try {
      const existing = await prisma.configTemplate.findFirst({
        where: {
          configType: c.type,
          appType: c.app,
          scope: ConfigScope.TEMPLATE,
          version: 1,
        },
      });

      if (existing) {
        await prisma.configTemplate.update({
          where: { id: existing.id },
          data: { name: c.name, content: c.content },
        });
      } else {
        await prisma.configTemplate.create({
          data: {
            name: c.name,
            configType: c.type,
            appType: c.app,
            scope: ConfigScope.TEMPLATE,
            content: c.content,
            version: 1,
            isActive: true,
          },
        });
      }
      console.log(`✓ ${c.name}`);
      count++;
    } catch (error) {
      console.error(`✗ Failed: ${c.name}`, error);
    }
  }

  console.log(`\n✅ Complete! Seeded ${count} additional configs`);
  const total = await prisma.configTemplate.count();
  console.log(`📊 Total configs in database: ${total}`);
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
