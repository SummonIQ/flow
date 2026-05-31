import { AppType, ConfigScope, ConfigType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const appTypes = [
  AppType.WEB_APP,
  AppType.DESKTOP_APP,
  AppType.MOBILE_APP,
  AppType.API,
];

const configs = [
  // ESLint for all 4 app types
  {
    app: AppType.WEB_APP,
    type: ConfigType.ESLINT,
    name: 'ESLint - Web App',
    content: { extends: ['next/core-web-vitals'], rules: {} },
  },
  {
    app: AppType.DESKTOP_APP,
    type: ConfigType.ESLINT,
    name: 'ESLint - Desktop',
    content: {
      extends: ['eslint:recommended'],
      env: { node: true, browser: true },
    },
  },
  {
    app: AppType.MOBILE_APP,
    type: ConfigType.ESLINT,
    name: 'ESLint - Mobile',
    content: { extends: ['@react-native-community'], rules: {} },
  },
  {
    app: AppType.API,
    type: ConfigType.ESLINT,
    name: 'ESLint - API',
    content: { extends: ['eslint:recommended'], env: { node: true } },
  },

  // Next.js Config
  {
    app: AppType.WEB_APP,
    type: ConfigType.NEXTJS,
    name: 'Next.js - Web App',
    content: { reactStrictMode: true, swcMinify: true },
  },
  {
    app: AppType.DESKTOP_APP,
    type: ConfigType.NEXTJS,
    name: 'Next.js - Desktop',
    content: { reactStrictMode: true, output: 'export' },
  },
  {
    app: AppType.MOBILE_APP,
    type: ConfigType.NEXTJS,
    name: 'Next.js - Mobile',
    content: { reactStrictMode: true },
  },
  {
    app: AppType.API,
    type: ConfigType.NEXTJS,
    name: 'Next.js - API',
    content: { reactStrictMode: true },
  },

  // TypeScript
  {
    app: AppType.WEB_APP,
    type: ConfigType.TSCONFIG,
    name: 'TypeScript - Web App',
    content: {
      compilerOptions: {
        target: 'ES2020',
        lib: ['dom', 'esnext'],
        strict: true,
        jsx: 'preserve',
      },
    },
  },
  {
    app: AppType.DESKTOP_APP,
    type: ConfigType.TSCONFIG,
    name: 'TypeScript - Desktop',
    content: {
      compilerOptions: {
        target: 'ES2020',
        lib: ['ES2020', 'DOM'],
        strict: true,
        jsx: 'react',
      },
    },
  },
  {
    app: AppType.MOBILE_APP,
    type: ConfigType.TSCONFIG,
    name: 'TypeScript - Mobile',
    content: {
      compilerOptions: {
        target: 'esnext',
        module: 'commonjs',
        jsx: 'react-native',
        strict: true,
      },
    },
  },
  {
    app: AppType.API,
    type: ConfigType.TSCONFIG,
    name: 'TypeScript - API',
    content: {
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        strict: true,
        esModuleInterop: true,
      },
    },
  },

  // Tailwind CSS
  {
    app: AppType.WEB_APP,
    type: ConfigType.TAILWIND,
    name: 'Tailwind - Web App',
    content: { content: ['./src/**/*.{js,ts,jsx,tsx}'], darkMode: 'class' },
  },
  {
    app: AppType.DESKTOP_APP,
    type: ConfigType.TAILWIND,
    name: 'Tailwind - Desktop',
    content: { content: ['./src/**/*.{js,ts,jsx,tsx}'], darkMode: 'class' },
  },
  {
    app: AppType.MOBILE_APP,
    type: ConfigType.TAILWIND,
    name: 'Tailwind - Mobile',
    content: { content: ['./src/**/*.{js,ts,jsx,tsx}'] },
  },
  {
    app: AppType.API,
    type: ConfigType.TAILWIND,
    name: 'Tailwind - API',
    content: { content: ['./src/**/*.{js,ts,jsx,tsx}'] },
  },

  // Prettier
  {
    app: AppType.WEB_APP,
    type: ConfigType.PRETTIER,
    name: 'Prettier - Web App',
    content: { semi: true, singleQuote: true, tabWidth: 2 },
  },
  {
    app: AppType.DESKTOP_APP,
    type: ConfigType.PRETTIER,
    name: 'Prettier - Desktop',
    content: { semi: true, singleQuote: true, tabWidth: 2 },
  },
  {
    app: AppType.MOBILE_APP,
    type: ConfigType.PRETTIER,
    name: 'Prettier - Mobile',
    content: { semi: false, singleQuote: true, tabWidth: 2 },
  },
  {
    app: AppType.API,
    type: ConfigType.PRETTIER,
    name: 'Prettier - API',
    content: { semi: true, singleQuote: true, tabWidth: 2 },
  },

  // package.json
  {
    app: AppType.WEB_APP,
    type: ConfigType.PACKAGE_JSON,
    name: 'package.json - Web App',
    content: {
      scripts: { dev: 'next dev', build: 'next build', start: 'next start' },
    },
  },
  {
    app: AppType.DESKTOP_APP,
    type: ConfigType.PACKAGE_JSON,
    name: 'package.json - Desktop',
    content: { scripts: { dev: 'electron .', build: 'electron-builder' } },
  },
  {
    app: AppType.MOBILE_APP,
    type: ConfigType.PACKAGE_JSON,
    name: 'package.json - Mobile',
    content: {
      scripts: {
        start: 'expo start',
        ios: 'expo start --ios',
        android: 'expo start --android',
      },
    },
  },
  {
    app: AppType.API,
    type: ConfigType.PACKAGE_JSON,
    name: 'package.json - API',
    content: {
      scripts: {
        dev: 'nodemon src/index.ts',
        build: 'tsc',
        start: 'node dist/index.js',
      },
    },
  },

  // Windsurf Rules
  {
    app: AppType.WEB_APP,
    type: ConfigType.WINDSURF_RULES,
    name: 'Windsurf Rules - Web App',
    content: {
      rules: ['Use Server Components by default', 'Validate with Zod'],
    },
  },
  {
    app: AppType.DESKTOP_APP,
    type: ConfigType.WINDSURF_RULES,
    name: 'Windsurf Rules - Desktop',
    content: {
      rules: ['Separate main and renderer processes', 'Use IPC securely'],
    },
  },
  {
    app: AppType.MOBILE_APP,
    type: ConfigType.WINDSURF_RULES,
    name: 'Windsurf Rules - Mobile',
    content: { rules: ['Test on real devices', 'Handle platform differences'] },
  },
  {
    app: AppType.API,
    type: ConfigType.WINDSURF_RULES,
    name: 'Windsurf Rules - API',
    content: { rules: ['Validate all input', 'Use proper HTTP status codes'] },
  },

  // AGENTS.md
  {
    app: AppType.WEB_APP,
    type: ConfigType.AGENTS_MD,
    name: 'AGENTS.md - Web App',
    content: {
      metadata: {
        purpose: 'Web app development guidelines',
        framework: 'Next.js',
      },
      principles: ['Server-first', 'Type-safe', 'Accessible'],
    },
  },
  {
    app: AppType.DESKTOP_APP,
    type: ConfigType.AGENTS_MD,
    name: 'AGENTS.md - Desktop',
    content: {
      metadata: {
        purpose: 'Desktop app development guidelines',
        framework: 'Electron',
      },
      principles: ['Secure IPC', 'Cross-platform'],
    },
  },
  {
    app: AppType.MOBILE_APP,
    type: ConfigType.AGENTS_MD,
    name: 'AGENTS.md - Mobile',
    content: {
      metadata: {
        purpose: 'Mobile app development guidelines',
        framework: 'React Native',
      },
      principles: ['Mobile-first', 'Platform-aware'],
    },
  },
  {
    app: AppType.API,
    type: ConfigType.AGENTS_MD,
    name: 'AGENTS.md - API',
    content: {
      metadata: { purpose: 'API development guidelines', framework: 'Node.js' },
      principles: ['Type-safe', 'Well-documented', 'Secure'],
    },
  },
];

async function main() {
  console.log('🌱 Seeding core configs for 4 app types...\n');

  // Delete all existing configs first
  await prisma.configTemplate.deleteMany({});
  console.log('🗑️  Cleared existing configs\n');

  for (const c of configs) {
    try {
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
      console.log(`✓ ${c.name}`);
    } catch (error) {
      console.error(`✗ Failed: ${c.name}`, error);
    }
  }

  const total = await prisma.configTemplate.count();
  console.log(`\n✅ Complete! Total configs: ${total}`);
  console.log(
    `📊 ${configs.length / 4} config types × 4 app types = ${configs.length} configs`,
  );
}

main()
  .catch(e => {
    console.error('❌ Failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
