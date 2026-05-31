import { PrismaClient, ConfigType, AppType, ConfigScope } from '@prisma/client';

const prisma = new PrismaClient();

const configs = [
  // MARKETING_SITE - All relevant configs
  { name: 'ESLint - Marketing Site', type: ConfigType.ESLINT, app: AppType.MARKETING_SITE, content: { extends: ['next/core-web-vitals'], rules: {} } },
  { name: 'TypeScript - Marketing Site', type: ConfigType.TSCONFIG, app: AppType.MARKETING_SITE, content: { compilerOptions: { target: 'ES2020', lib: ['dom', 'esnext'], strict: true, jsx: 'preserve' } } },
  { name: 'Prettier - Marketing Site', type: ConfigType.PRETTIER, app: AppType.MARKETING_SITE, content: { semi: true, singleQuote: true, tabWidth: 2 } },
  { name: 'Tailwind - Marketing Site', type: ConfigType.TAILWIND, app: AppType.MARKETING_SITE, content: { content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'], darkMode: 'class', theme: { extend: {} } } },
  { name: 'Next.js - Marketing Site', type: ConfigType.NEXTJS, app: AppType.MARKETING_SITE, content: { reactStrictMode: true, images: { domains: [] } } },
  { name: 'PostCSS - Marketing Site', type: ConfigType.POSTCSS, app: AppType.MARKETING_SITE, content: { plugins: { tailwindcss: {}, autoprefixer: {} } } },
  { name: 'Package.json - Marketing Site', type: ConfigType.PACKAGE_JSON, app: AppType.MARKETING_SITE, content: { scripts: { dev: 'next dev', build: 'next build', start: 'next start' } } },
  { name: 'AGENTS.MD - Marketing Site', type: ConfigType.AGENTS_MD, app: AppType.MARKETING_SITE, content: { metadata: { purpose: 'Marketing site development guidelines', framework: 'Next.js, Tailwind CSS' }, principles: ['SEO-first approach', 'Fast page loads (<2s)', 'Mobile-first design', 'Accessibility WCAG 2.1 AA'] } },
  { name: 'Windsurf Rules - Marketing Site', type: ConfigType.WINDSURF_RULES, app: AppType.MARKETING_SITE, content: { rules: ['Optimize images and assets', 'Add proper meta tags', 'Implement analytics', 'Use static generation when possible'] } },
  { name: 'Cursor Rules - Marketing Site', type: ConfigType.CURSOR_RULES, app: AppType.MARKETING_SITE, content: { framework: 'Next.js', styling: 'Tailwind CSS', rules: ['Focus on conversion optimization', 'Mobile-first responsive design'] } },
  { name: 'Claude MD - Marketing Site', type: ConfigType.CLAUDE_MD, app: AppType.MARKETING_SITE, content: { role: 'Marketing site developer', expertise: ['Next.js', 'SEO', 'Performance optimization', 'Conversion rate optimization'] } },
  { name: 'Playwright - Marketing Site', type: ConfigType.PLAYWRIGHT, app: AppType.MARKETING_SITE, content: { testDir: './e2e', use: { baseURL: 'http://localhost:3000' } } },
  { name: 'Vitest - Marketing Site', type: ConfigType.VITEST, app: AppType.MARKETING_SITE, content: { test: { environment: 'jsdom', globals: true } } },

  // CUSTOM - Generic configs for custom app types
  { name: 'ESLint - Custom', type: ConfigType.ESLINT, app: AppType.CUSTOM, content: { extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'], rules: {} } },
  { name: 'TypeScript - Custom', type: ConfigType.TSCONFIG, app: AppType.CUSTOM, content: { compilerOptions: { target: 'ES2020', module: 'ESNext', strict: true, esModuleInterop: true } } },
  { name: 'Prettier - Custom', type: ConfigType.PRETTIER, app: AppType.CUSTOM, content: { semi: true, singleQuote: true, tabWidth: 2, trailingComma: 'es5' } },
  { name: 'Package.json - Custom', type: ConfigType.PACKAGE_JSON, app: AppType.CUSTOM, content: { scripts: { dev: 'echo "Setup your dev command"', build: 'echo "Setup your build command"' } } },
  { name: 'Jest - Custom', type: ConfigType.JEST, app: AppType.CUSTOM, content: { testEnvironment: 'node', coverageDirectory: 'coverage' } },
  { name: 'Vitest - Custom', type: ConfigType.VITEST, app: AppType.CUSTOM, content: { test: { globals: true, environment: 'node' } } },
  { name: 'AGENTS.MD - Custom', type: ConfigType.AGENTS_MD, app: AppType.CUSTOM, content: { metadata: { purpose: 'Custom application development guidelines', framework: 'Custom' }, principles: ['Follow best practices', 'Write maintainable code', 'Add comprehensive tests'] } },
  { name: 'Windsurf Rules - Custom', type: ConfigType.WINDSURF_RULES, app: AppType.CUSTOM, content: { rules: ['Use TypeScript for type safety', 'Follow existing code patterns', 'Document complex logic'] } },
  { name: 'Cursor Rules - Custom', type: ConfigType.CURSOR_RULES, app: AppType.CUSTOM, content: { language: 'TypeScript', rules: ['Maintain code consistency', 'Add proper error handling'] } },
  { name: 'Claude MD - Custom', type: ConfigType.CLAUDE_MD, app: AppType.CUSTOM, content: { role: 'Full-stack developer', expertise: ['TypeScript', 'JavaScript', 'Node.js'] } },
  { name: 'GitIgnore - Custom', type: ConfigType.GITIGNORE, app: AppType.CUSTOM, content: { patterns: ['node_modules/', 'dist/', 'build/', '.env', '.DS_Store'] } },
];

async function main() {
  console.log('🌱 Seeding MARKETING_SITE and CUSTOM configs...');
  let count = 0;

  for (const c of configs) {
    try {
      const existing = await prisma.configTemplate.findFirst({
        where: { configType: c.type, appType: c.app, scope: ConfigScope.TEMPLATE, version: 1 },
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

  console.log(`\n✅ Complete! Seeded ${count} configs`);
  const total = await prisma.configTemplate.count();
  console.log(`📊 Total configs in database: ${total}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
