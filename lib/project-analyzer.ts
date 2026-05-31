import { promises as fs } from 'fs';
import path from 'path';

export interface FrameworkInfo {
  name: string;
  version?: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface ProjectAnalysis {
  // Basic info
  name: string;
  path: string;
  type: 'monorepo' | 'single-app' | 'library' | 'unknown';

  // Package info
  packageManager: 'bun' | 'npm' | 'yarn' | 'pnpm' | 'unknown';
  packageManagerVersion?: string;

  // Frameworks detected
  frameworks: FrameworkInfo[];
  primaryFramework?: FrameworkInfo;

  // Tech stack
  languages: string[];
  hasTypeScript: boolean;
  hasJavaScript: boolean;

  // Structure
  structure: {
    hasAppsDir: boolean;
    hasPackagesDir: boolean;
    hasSrcDir: boolean;
    hasLibDir: boolean;
    rootFiles: string[];
    directories: string[];
    appCount: number;
    packageCount: number;
  };

  // Dependencies summary
  dependencies: {
    production: string[];
    development: string[];
    total: number;
  };

  // Config files found
  configFiles: {
    name: string;
    type: string;
  }[];

  // Scripts available
  scripts: Record<string, string>;

  // Database info
  database?: {
    type: string;
    orm?: string;
  };

  // Testing
  testing: {
    framework?: string;
    hasTests: boolean;
  };

  // Styling
  styling: {
    framework?: string;
    preprocessor?: string;
  };

  // Build info
  build: {
    tool?: string;
    outputDir?: string;
  };

  // Monorepo apps (if applicable)
  apps?: {
    name: string;
    path: string;
    framework?: string;
    type?: string;
    devPort?: number;
    devCommand?: string;
    description?: string;
  }[];

  // Raw data for AI context
  rawPackageJson?: Record<string, unknown>;
  rawReadme?: string;
  rawConfig?: string;
}

const FRAMEWORK_INDICATORS: Record<
  string,
  { deps: string[]; files: string[]; confidence: 'high' | 'medium' }
> = {
  'Next.js': {
    deps: ['next'],
    files: ['next.config.js', 'next.config.ts', 'next.config.mjs'],
    confidence: 'high',
  },
  React: {
    deps: ['react', 'react-dom'],
    files: [],
    confidence: 'medium',
  },
  'Vue.js': {
    deps: ['vue'],
    files: ['vue.config.js', 'nuxt.config.js', 'nuxt.config.ts'],
    confidence: 'high',
  },
  Nuxt: {
    deps: ['nuxt'],
    files: ['nuxt.config.js', 'nuxt.config.ts'],
    confidence: 'high',
  },
  Svelte: {
    deps: ['svelte'],
    files: ['svelte.config.js'],
    confidence: 'high',
  },
  SvelteKit: {
    deps: ['@sveltejs/kit'],
    files: ['svelte.config.js'],
    confidence: 'high',
  },
  Angular: {
    deps: ['@angular/core'],
    files: ['angular.json'],
    confidence: 'high',
  },
  Astro: {
    deps: ['astro'],
    files: ['astro.config.mjs', 'astro.config.ts'],
    confidence: 'high',
  },
  Remix: {
    deps: ['@remix-run/react'],
    files: ['remix.config.js'],
    confidence: 'high',
  },
  Express: {
    deps: ['express'],
    files: [],
    confidence: 'medium',
  },
  Fastify: {
    deps: ['fastify'],
    files: [],
    confidence: 'medium',
  },
  Hono: {
    deps: ['hono'],
    files: [],
    confidence: 'medium',
  },
  Electron: {
    deps: ['electron'],
    files: ['electron.vite.config.ts', 'electron-builder.yml'],
    confidence: 'high',
  },
  Tauri: {
    deps: ['@tauri-apps/api'],
    files: ['tauri.conf.json'],
    confidence: 'high',
  },
  Vite: {
    deps: ['vite'],
    files: ['vite.config.js', 'vite.config.ts'],
    confidence: 'medium',
  },
};

const CONFIG_FILE_TYPES: Record<string, string> = {
  'package.json': 'package',
  'tsconfig.json': 'typescript',
  'jsconfig.json': 'javascript',
  '.eslintrc': 'eslint',
  '.eslintrc.js': 'eslint',
  '.eslintrc.json': 'eslint',
  'eslint.config.js': 'eslint',
  'eslint.config.mjs': 'eslint',
  '.prettierrc': 'prettier',
  '.prettierrc.js': 'prettier',
  'prettier.config.js': 'prettier',
  'tailwind.config.js': 'tailwind',
  'tailwind.config.ts': 'tailwind',
  'postcss.config.js': 'postcss',
  'postcss.config.mjs': 'postcss',
  'vite.config.js': 'vite',
  'vite.config.ts': 'vite',
  'next.config.js': 'next',
  'next.config.ts': 'next',
  'next.config.mjs': 'next',
  'turbo.json': 'turborepo',
  'pnpm-workspace.yaml': 'pnpm-workspace',
  'lerna.json': 'lerna',
  '.env': 'environment',
  '.env.local': 'environment',
  '.env.example': 'environment',
  'docker-compose.yml': 'docker',
  'docker-compose.yaml': 'docker',
  Dockerfile: 'docker',
  '.dockerignore': 'docker',
  'prisma/schema.prisma': 'prisma',
  'drizzle.config.ts': 'drizzle',
  'jest.config.js': 'jest',
  'jest.config.ts': 'jest',
  'vitest.config.ts': 'vitest',
  'playwright.config.ts': 'playwright',
  'cypress.config.ts': 'cypress',
  '.github/workflows': 'github-actions',
  'vercel.json': 'vercel',
  'netlify.toml': 'netlify',
  'fly.toml': 'fly',
  'applab.config.ts': 'applab',
};

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile(
  filePath: string,
): Promise<Record<string, unknown> | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function readTextFile(
  filePath: string,
  maxLength = 10000,
): Promise<string | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content.slice(0, maxLength);
  } catch {
    return null;
  }
}

async function getDirectoryContents(
  dirPath: string,
): Promise<{ files: string[]; directories: string[] }> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const files: string[] = [];
    const directories: string[] = [];

    for (const entry of entries) {
      if (entry.name.startsWith('.') && entry.name !== '.env.example') continue;
      if (entry.name === 'node_modules') continue;
      if (entry.name === '.git') continue;

      if (entry.isDirectory()) {
        directories.push(entry.name);
      } else {
        files.push(entry.name);
      }
    }

    return { files, directories };
  } catch {
    return { files: [], directories: [] };
  }
}

function detectPackageManager(
  projectPath: string,
  rootFiles: string[],
): { manager: ProjectAnalysis['packageManager']; version?: string } {
  if (rootFiles.includes('bun.lockb') || rootFiles.includes('bun.lock')) {
    return { manager: 'bun' };
  }
  if (rootFiles.includes('pnpm-lock.yaml')) {
    return { manager: 'pnpm' };
  }
  if (rootFiles.includes('yarn.lock')) {
    return { manager: 'yarn' };
  }
  if (rootFiles.includes('package-lock.json')) {
    return { manager: 'npm' };
  }
  return { manager: 'unknown' };
}

function detectFrameworks(
  packageJson: Record<string, unknown> | null,
  rootFiles: string[],
): FrameworkInfo[] {
  const frameworks: FrameworkInfo[] = [];
  const deps = {
    ...((packageJson?.dependencies as Record<string, string>) || {}),
    ...((packageJson?.devDependencies as Record<string, string>) || {}),
  };

  for (const [framework, indicators] of Object.entries(FRAMEWORK_INDICATORS)) {
    // Check dependencies
    for (const dep of indicators.deps) {
      if (deps[dep]) {
        frameworks.push({
          name: framework,
          version: deps[dep],
          confidence: indicators.confidence,
        });
        break;
      }
    }

    // Check config files (if not already found via deps)
    if (!frameworks.find(f => f.name === framework)) {
      for (const file of indicators.files) {
        if (rootFiles.includes(file)) {
          frameworks.push({
            name: framework,
            confidence: indicators.confidence,
          });
          break;
        }
      }
    }
  }

  return frameworks;
}

function detectDatabase(
  packageJson: Record<string, unknown> | null,
  configFiles: { name: string; type: string }[],
): ProjectAnalysis['database'] | undefined {
  const deps = {
    ...((packageJson?.dependencies as Record<string, string>) || {}),
    ...((packageJson?.devDependencies as Record<string, string>) || {}),
  };

  // Check for ORMs
  if (deps['prisma'] || configFiles.some(c => c.type === 'prisma')) {
    return { type: 'SQL', orm: 'Prisma' };
  }
  if (deps['drizzle-orm'] || configFiles.some(c => c.type === 'drizzle')) {
    return { type: 'SQL', orm: 'Drizzle' };
  }
  if (deps['typeorm']) {
    return { type: 'SQL', orm: 'TypeORM' };
  }
  if (deps['sequelize']) {
    return { type: 'SQL', orm: 'Sequelize' };
  }
  if (deps['mongoose']) {
    return { type: 'MongoDB', orm: 'Mongoose' };
  }

  // Check for database drivers
  if (deps['pg'] || deps['postgres']) {
    return { type: 'PostgreSQL' };
  }
  if (deps['mysql2'] || deps['mysql']) {
    return { type: 'MySQL' };
  }
  if (deps['better-sqlite3'] || deps['sqlite3']) {
    return { type: 'SQLite' };
  }
  if (deps['mongodb']) {
    return { type: 'MongoDB' };
  }
  if (deps['redis'] || deps['ioredis']) {
    return { type: 'Redis' };
  }

  return undefined;
}

function detectTesting(
  packageJson: Record<string, unknown> | null,
  configFiles: { name: string; type: string }[],
): ProjectAnalysis['testing'] {
  const deps = {
    ...((packageJson?.dependencies as Record<string, string>) || {}),
    ...((packageJson?.devDependencies as Record<string, string>) || {}),
  };

  if (deps['vitest'] || configFiles.some(c => c.type === 'vitest')) {
    return { framework: 'Vitest', hasTests: true };
  }
  if (deps['jest'] || configFiles.some(c => c.type === 'jest')) {
    return { framework: 'Jest', hasTests: true };
  }
  if (
    deps['playwright'] ||
    deps['@playwright/test'] ||
    configFiles.some(c => c.type === 'playwright')
  ) {
    return { framework: 'Playwright', hasTests: true };
  }
  if (deps['cypress'] || configFiles.some(c => c.type === 'cypress')) {
    return { framework: 'Cypress', hasTests: true };
  }

  return { hasTests: false };
}

function detectStyling(
  packageJson: Record<string, unknown> | null,
): ProjectAnalysis['styling'] {
  const deps = {
    ...((packageJson?.dependencies as Record<string, string>) || {}),
    ...((packageJson?.devDependencies as Record<string, string>) || {}),
  };

  const result: ProjectAnalysis['styling'] = {};

  if (deps['tailwindcss']) {
    result.framework = 'Tailwind CSS';
  } else if (deps['styled-components']) {
    result.framework = 'Styled Components';
  } else if (deps['@emotion/react']) {
    result.framework = 'Emotion';
  } else if (deps['@chakra-ui/react']) {
    result.framework = 'Chakra UI';
  } else if (deps['@mui/material']) {
    result.framework = 'Material UI';
  }

  if (deps['sass'] || deps['node-sass']) {
    result.preprocessor = 'Sass';
  } else if (deps['less']) {
    result.preprocessor = 'Less';
  }

  return result;
}

function detectBuildTool(
  packageJson: Record<string, unknown> | null,
  configFiles: { name: string; type: string }[],
): ProjectAnalysis['build'] {
  const deps = {
    ...((packageJson?.dependencies as Record<string, string>) || {}),
    ...((packageJson?.devDependencies as Record<string, string>) || {}),
  };

  if (deps['vite'] || configFiles.some(c => c.type === 'vite')) {
    return { tool: 'Vite' };
  }
  if (deps['webpack']) {
    return { tool: 'Webpack' };
  }
  if (deps['esbuild']) {
    return { tool: 'esbuild' };
  }
  if (deps['rollup']) {
    return { tool: 'Rollup' };
  }
  if (deps['turbopack'] || configFiles.some(c => c.type === 'turborepo')) {
    return { tool: 'Turbopack' };
  }

  return {};
}

function extractDevConfig(packageJson: Record<string, unknown> | null): {
  port?: number;
  command?: string;
} {
  if (!packageJson) return {};

  const scripts = (packageJson.scripts as Record<string, string>) || {};
  const devScript = scripts.dev || scripts.start || '';

  // Extract port from common patterns
  let port: number | undefined;
  const portPatterns = [
    /--port[=\s]+(\d+)/,
    /-p[=\s]+(\d+)/,
    /PORT[=:](\d+)/,
    /:(\d{4,5})(?:\s|$|")/,
  ];

  for (const pattern of portPatterns) {
    const match = devScript.match(pattern);
    if (match) {
      port = parseInt(match[1], 10);
      break;
    }
  }

  // Determine dev command
  let command: string | undefined;
  if (scripts.dev) {
    command = 'bun dev';
  } else if (scripts.start) {
    command = 'bun start';
  }

  return { port, command };
}

async function analyzeProjectApps(
  projectPath: string,
  directories: string[],
  rootFiles: string[],
  packageJson: Record<string, unknown> | null,
): Promise<ProjectAnalysis['apps']> {
  const apps: ProjectAnalysis['apps'] = [];

  console.log('[Analyzer] Analyzing apps in:', projectPath);
  console.log('[Analyzer] Directories found:', directories);
  console.log('[Analyzer] Has package.json:', !!packageJson);

  // Check apps directory (monorepo pattern)
  if (directories.includes('apps')) {
    const appsPath = path.join(projectPath, 'apps');
    const { directories: appDirs } = await getDirectoryContents(appsPath);

    for (const appDir of appDirs) {
      const appPath = path.join(appsPath, appDir);
      const appPkg = await readJsonFile(path.join(appPath, 'package.json'));
      const { files: appFiles } = await getDirectoryContents(appPath);

      const appFrameworks = detectFrameworks(appPkg, appFiles);
      const primaryFramework =
        appFrameworks.find(f => f.confidence === 'high') || appFrameworks[0];
      const devConfig = extractDevConfig(appPkg);

      apps.push({
        name: appDir,
        path: `apps/${appDir}`,
        framework: primaryFramework?.name,
        type: determineAppType(primaryFramework?.name, appPkg),
        devPort: devConfig.port,
        devCommand: devConfig.command,
        description: (appPkg?.description as string) || undefined,
      });
    }
  }

  // Check for single-app at root (has app/ or src/ directory with package.json at root)
  // This detects Next.js, Remix, or other framework apps at the project root
  if (apps.length === 0 && packageJson) {
    const hasAppDir = directories.includes('app');
    const hasSrcDir = directories.includes('src');
    const hasPagesDir = directories.includes('pages');

    console.log(
      '[Analyzer] Single-app check - hasAppDir:',
      hasAppDir,
      'hasSrcDir:',
      hasSrcDir,
      'hasPagesDir:',
      hasPagesDir,
    );

    // Detect if this looks like a single app project
    // Also check if package.json has framework dependencies as a fallback
    const frameworks = detectFrameworks(packageJson, rootFiles);
    const primaryFramework =
      frameworks.find(f => f.confidence === 'high') || frameworks[0];

    console.log(
      '[Analyzer] Detected frameworks:',
      frameworks.map(f => f.name),
    );

    if (hasAppDir || hasSrcDir || hasPagesDir || primaryFramework) {
      const devConfig = extractDevConfig(packageJson);
      const projectName =
        (packageJson.name as string) || path.basename(projectPath);

      console.log(
        '[Analyzer] Detected single app:',
        projectName,
        'framework:',
        primaryFramework?.name,
        'port:',
        devConfig.port,
      );

      apps.push({
        name: projectName,
        path: '.', // Root of project
        framework: primaryFramework?.name,
        type: determineAppType(primaryFramework?.name, packageJson),
        devPort: devConfig.port,
        devCommand: devConfig.command,
        description: (packageJson.description as string) || undefined,
      });
    }
  }

  console.log(
    '[Analyzer] Final apps detected:',
    apps.length,
    apps.map(a => a.name),
  );

  // Check packages directory for publishable packages
  if (directories.includes('packages')) {
    const packagesPath = path.join(projectPath, 'packages');
    const { directories: packageDirs } =
      await getDirectoryContents(packagesPath);

    for (const pkgDir of packageDirs) {
      const pkgPath = path.join(packagesPath, pkgDir);
      const pkg = await readJsonFile(path.join(pkgPath, 'package.json'));

      if (pkg) {
        apps.push({
          name: pkgDir,
          path: `packages/${pkgDir}`,
          type: 'library',
        });
      }
    }
  }

  return apps;
}

function determineAppType(
  framework?: string,
  packageJson?: Record<string, unknown> | null,
): string {
  if (!framework) return 'unknown';

  const name = framework.toLowerCase();
  if (name.includes('electron') || name.includes('tauri')) return 'desktop-app';
  if (
    name.includes('next') ||
    name.includes('nuxt') ||
    name.includes('remix') ||
    name.includes('astro')
  )
    return 'web-app';
  if (
    name.includes('express') ||
    name.includes('fastify') ||
    name.includes('hono')
  )
    return 'api';
  if (
    name.includes('react') ||
    name.includes('vue') ||
    name.includes('svelte') ||
    name.includes('angular')
  )
    return 'web-app';

  return 'unknown';
}

export async function analyzeProject(
  projectPath: string,
): Promise<ProjectAnalysis> {
  const { files: rootFiles, directories } =
    await getDirectoryContents(projectPath);

  // Read package.json
  const packageJson = await readJsonFile(
    path.join(projectPath, 'package.json'),
  );

  // Read README
  const readme = await readTextFile(path.join(projectPath, 'README.md'));

  // Read applab config
  const applabConfig = await readTextFile(
    path.join(projectPath, 'applab.config.ts'),
  );

  // Detect package manager
  const { manager: packageManager } = detectPackageManager(
    projectPath,
    rootFiles,
  );

  // Find config files
  const configFiles: { name: string; type: string }[] = [];
  for (const file of rootFiles) {
    if (CONFIG_FILE_TYPES[file]) {
      configFiles.push({ name: file, type: CONFIG_FILE_TYPES[file] });
    }
  }

  // Check for prisma
  if (directories.includes('prisma')) {
    const prismaFiles = await getDirectoryContents(
      path.join(projectPath, 'prisma'),
    );
    if (prismaFiles.files.includes('schema.prisma')) {
      configFiles.push({ name: 'prisma/schema.prisma', type: 'prisma' });
    }
  }

  // Detect frameworks
  const frameworks = detectFrameworks(packageJson, rootFiles);
  const primaryFramework =
    frameworks.find(f => f.confidence === 'high') || frameworks[0];

  // Determine project type
  let projectType: ProjectAnalysis['type'] = 'unknown';
  if (
    directories.includes('apps') ||
    directories.includes('packages') ||
    configFiles.some(
      c =>
        c.type === 'turborepo' ||
        c.type === 'lerna' ||
        c.type === 'pnpm-workspace',
    )
  ) {
    projectType = 'monorepo';
  } else if (packageJson) {
    projectType = 'single-app';
  }

  // Get dependencies
  const prodDeps = Object.keys(
    (packageJson?.dependencies as Record<string, string>) || {},
  );
  const devDeps = Object.keys(
    (packageJson?.devDependencies as Record<string, string>) || {},
  );

  // Detect languages
  const languages: string[] = [];
  const hasTypeScript =
    rootFiles.includes('tsconfig.json') || devDeps.includes('typescript');
  const hasJavaScript = rootFiles.some(
    f => f.endsWith('.js') || f.endsWith('.mjs'),
  );
  if (hasTypeScript) languages.push('TypeScript');
  if (hasJavaScript) languages.push('JavaScript');

  // Analyze project apps (monorepo or single-app)
  const apps = await analyzeProjectApps(
    projectPath,
    directories,
    rootFiles,
    packageJson,
  );

  // Get scripts
  const scripts = (packageJson?.scripts as Record<string, string>) || {};

  return {
    name: (packageJson?.name as string) || path.basename(projectPath),
    path: projectPath,
    type: projectType,
    packageManager,
    frameworks,
    primaryFramework,
    languages,
    hasTypeScript,
    hasJavaScript,
    structure: {
      hasAppsDir: directories.includes('apps'),
      hasPackagesDir: directories.includes('packages'),
      hasSrcDir: directories.includes('src'),
      hasLibDir: directories.includes('lib'),
      rootFiles,
      directories,
      appCount: (apps ?? []).filter(a => a.type !== 'library').length,
      packageCount: (apps ?? []).filter(a => a.type === 'library').length,
    },
    dependencies: {
      production: prodDeps,
      development: devDeps,
      total: prodDeps.length + devDeps.length,
    },
    configFiles,
    scripts,
    database: detectDatabase(packageJson, configFiles),
    testing: detectTesting(packageJson, configFiles),
    styling: detectStyling(packageJson),
    build: detectBuildTool(packageJson, configFiles),
    apps,
    rawPackageJson: packageJson || undefined,
    rawReadme: readme || undefined,
    rawConfig: applabConfig || undefined,
  };
}

/**
 * Generate a structured context string for AI from the analysis
 */
export function generateAIContext(analysis: ProjectAnalysis): string {
  const lines: string[] = [];

  lines.push(`# Project Analysis: ${analysis.name}`);
  lines.push('');

  // Basic info
  lines.push('## Overview');
  lines.push(`- **Type**: ${analysis.type}`);
  lines.push(`- **Package Manager**: ${analysis.packageManager}`);
  lines.push(`- **Languages**: ${analysis.languages.join(', ') || 'Unknown'}`);
  lines.push('');

  // Frameworks
  if (analysis.frameworks.length > 0) {
    lines.push('## Frameworks & Libraries');
    if (analysis.primaryFramework) {
      lines.push(
        `- **Primary Framework**: ${analysis.primaryFramework.name}${analysis.primaryFramework.version ? ` (${analysis.primaryFramework.version})` : ''}`,
      );
    }
    for (const fw of analysis.frameworks) {
      if (fw !== analysis.primaryFramework) {
        lines.push(`- ${fw.name}${fw.version ? ` (${fw.version})` : ''}`);
      }
    }
    lines.push('');
  }

  // Tech stack details
  lines.push('## Tech Stack');
  if (analysis.database) {
    lines.push(
      `- **Database**: ${analysis.database.type}${analysis.database.orm ? ` with ${analysis.database.orm}` : ''}`,
    );
  }
  if (analysis.styling.framework) {
    lines.push(
      `- **Styling**: ${analysis.styling.framework}${analysis.styling.preprocessor ? ` + ${analysis.styling.preprocessor}` : ''}`,
    );
  }
  if (analysis.testing.framework) {
    lines.push(`- **Testing**: ${analysis.testing.framework}`);
  }
  if (analysis.build.tool) {
    lines.push(`- **Build Tool**: ${analysis.build.tool}`);
  }
  lines.push('');

  // Structure
  lines.push('## Project Structure');
  lines.push(
    `- **Root directories**: ${analysis.structure.directories.join(', ')}`,
  );
  if (analysis.type === 'monorepo') {
    lines.push(`- **Apps**: ${analysis.structure.appCount}`);
    lines.push(`- **Packages**: ${analysis.structure.packageCount}`);
  }
  lines.push('');

  // Apps (for monorepos)
  if (analysis.apps && analysis.apps.length > 0) {
    lines.push('## Applications');
    for (const app of analysis.apps) {
      lines.push(
        `- **${app.name}** (${app.path}): ${app.framework || app.type || 'Unknown'}`,
      );
    }
    lines.push('');
  }

  // Config files
  if (analysis.configFiles.length > 0) {
    lines.push('## Configuration');
    const configTypes = [...new Set(analysis.configFiles.map(c => c.type))];
    lines.push(`- **Config types**: ${configTypes.join(', ')}`);
    lines.push('');
  }

  // Dependencies summary
  lines.push('## Dependencies');
  lines.push(`- **Total**: ${analysis.dependencies.total} packages`);
  lines.push(`- **Production**: ${analysis.dependencies.production.length}`);
  lines.push(`- **Development**: ${analysis.dependencies.development.length}`);

  // Key dependencies (first 20)
  const keyDeps = analysis.dependencies.production.slice(0, 20);
  if (keyDeps.length > 0) {
    lines.push(`- **Key packages**: ${keyDeps.join(', ')}`);
  }
  lines.push('');

  // Scripts
  if (Object.keys(analysis.scripts).length > 0) {
    lines.push('## Available Scripts');
    for (const [name, command] of Object.entries(analysis.scripts).slice(
      0,
      10,
    )) {
      lines.push(`- \`${name}\`: ${command}`);
    }
    lines.push('');
  }

  // README excerpt
  if (analysis.rawReadme) {
    lines.push('## README Excerpt');
    lines.push('```');
    lines.push(analysis.rawReadme.slice(0, 2000));
    lines.push('```');
    lines.push('');
  }

  return lines.join('\n');
}
