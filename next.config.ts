import type { NextConfig } from 'next';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = path.dirname(fileURLToPath(import.meta.url));
const turbopackRoot = path.join(projectDir, '..');
const flowNodeModules = './node_modules';
const fromFlowNodeModules = (pkg: string) => `${flowNodeModules}/${pkg}`;
const fromPackages = (pkgPath: string) => `../_Packages_/${pkgPath}`;

const nextConfig: NextConfig = {
  devIndicators: false,
  cacheComponents: true,
  transpilePackages: [
    '@summoniq/signalsplash-client-sdk',
    '@summoniq/config',
    '@summoniq/rag',
    '@summoniq/applab-ui',
  ],
  turbopack: {
    root: turbopackRoot,
    resolveAlias: {

      '@summoniq/config': fromPackages('config/dist/index.js'),
      '@summoniq/config/types': fromPackages('config/dist/types/index.js'),

      '@summoniq/rag': fromPackages('rag/dist/index.js'),

      '@hookform/resolvers': fromFlowNodeModules('@hookform/resolvers'),
      '@tanstack/react-table': fromFlowNodeModules(
        '@tanstack/react-table/build/lib/index.mjs',
      ),

      '@radix-ui/react-accordion': fromFlowNodeModules(
        '@radix-ui/react-accordion',
      ),
      '@radix-ui/react-alert-dialog': fromFlowNodeModules(
        '@radix-ui/react-alert-dialog',
      ),
      '@radix-ui/react-aspect-ratio': fromFlowNodeModules(
        '@radix-ui/react-aspect-ratio',
      ),
      '@radix-ui/react-avatar': fromFlowNodeModules('@radix-ui/react-avatar'),
      '@radix-ui/react-checkbox': fromFlowNodeModules(
        '@radix-ui/react-checkbox',
      ),
      '@radix-ui/react-collapsible': fromFlowNodeModules(
        '@radix-ui/react-collapsible',
      ),
      '@radix-ui/react-context-menu': fromFlowNodeModules(
        '@radix-ui/react-context-menu',
      ),
      '@radix-ui/react-dialog': fromFlowNodeModules('@radix-ui/react-dialog'),
      '@radix-ui/react-dropdown-menu': fromFlowNodeModules(
        '@radix-ui/react-dropdown-menu',
      ),
      '@radix-ui/react-form': fromFlowNodeModules('@radix-ui/react-form'),
      '@radix-ui/react-hover-card': fromFlowNodeModules(
        '@radix-ui/react-hover-card',
      ),
      '@radix-ui/react-label': fromFlowNodeModules('@radix-ui/react-label'),
      '@radix-ui/react-menubar': fromFlowNodeModules('@radix-ui/react-menubar'),
      '@radix-ui/react-navigation-menu': fromFlowNodeModules(
        '@radix-ui/react-navigation-menu',
      ),
      '@radix-ui/react-popover': fromFlowNodeModules('@radix-ui/react-popover'),
      '@radix-ui/react-progress': fromFlowNodeModules(
        '@radix-ui/react-progress',
      ),
      '@radix-ui/react-radio-group': fromFlowNodeModules(
        '@radix-ui/react-radio-group',
      ),
      '@radix-ui/react-scroll-area': fromFlowNodeModules(
        '@radix-ui/react-scroll-area',
      ),
      '@radix-ui/react-select': fromFlowNodeModules('@radix-ui/react-select'),
      '@radix-ui/react-separator': fromFlowNodeModules(
        '@radix-ui/react-separator',
      ),
      '@radix-ui/react-slider': fromFlowNodeModules('@radix-ui/react-slider'),
      '@radix-ui/react-slot': fromFlowNodeModules('@radix-ui/react-slot'),
      '@radix-ui/react-switch': fromFlowNodeModules('@radix-ui/react-switch'),
      '@radix-ui/react-tabs': fromFlowNodeModules('@radix-ui/react-tabs'),
      '@radix-ui/react-toast': fromFlowNodeModules('@radix-ui/react-toast'),
      '@radix-ui/react-toggle': fromFlowNodeModules('@radix-ui/react-toggle'),
      '@radix-ui/react-toggle-group': fromFlowNodeModules(
        '@radix-ui/react-toggle-group',
      ),
      '@radix-ui/react-tooltip': fromFlowNodeModules('@radix-ui/react-tooltip'),
      '@radix-ui/react-visually-hidden': fromFlowNodeModules(
        '@radix-ui/react-visually-hidden',
      ),

      'class-variance-authority': fromFlowNodeModules(
        'class-variance-authority',
      ),
      clsx: fromFlowNodeModules('clsx'),
      'framer-motion': fromFlowNodeModules('framer-motion'),
      'lucide-react': fromFlowNodeModules('lucide-react'),
      'next-themes': fromFlowNodeModules('next-themes'),
      'react-hook-form': fromFlowNodeModules('react-hook-form'),
      'react-markdown': fromFlowNodeModules('react-markdown'),
      'remark-gfm': fromFlowNodeModules('remark-gfm'),
      'tailwind-merge': fromFlowNodeModules('tailwind-merge'),
      'tw-animate-css': fromFlowNodeModules('tw-animate-css'),
      'web-vitals': fromFlowNodeModules('web-vitals'),
      zod: fromFlowNodeModules('zod'),
    },
  },
  webpack: (config: any) => {
    if (config.resolve) config.resolve.symlinks = false;
    return config;
  },
  experimental: {
    authInterrupts: true,
    turbopackFileSystemCacheForDev: false,
    externalDir: true,
  },
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
