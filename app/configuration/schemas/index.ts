/**
 * Configuration Schema Definitions
 * Define the structure and fields for each configuration type
 */

export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'enum'
  | 'function'
  | 'record';

export interface SchemaField {
  key: string;
  label: string;
  type: FieldType;
  description?: string;
  default?: any;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>; // For enum types
  fields?: SchemaField[]; // For nested objects
  itemType?: FieldType; // For arrays
  itemSchema?: SchemaField[]; // For arrays of objects
}

export interface ConfigSchema {
  name: string;
  description: string;
  fields: SchemaField[];
}

// Example: Next.js Configuration Schema
export const nextJsSchema: ConfigSchema = {
  name: 'Next.js Configuration',
  description: 'Next.js framework configuration options',
  fields: [
    {
      key: 'reactStrictMode',
      label: 'React Strict Mode',
      type: 'boolean',
      description: 'Enable React Strict Mode for better error detection',
      default: true,
    },
    {
      key: 'swcMinify',
      label: 'SWC Minification',
      type: 'boolean',
      description: 'Use SWC for minification instead of Terser',
      default: true,
    },
    {
      key: 'distDir',
      label: 'Build Directory',
      type: 'string',
      description: 'Output directory for production build',
      default: '.next',
      placeholder: '.next',
    },
    {
      key: 'basePath',
      label: 'Base Path',
      type: 'string',
      description: 'Deploy under a sub-path of a domain',
      placeholder: '/docs',
    },
    {
      key: 'trailingSlash',
      label: 'Trailing Slash',
      type: 'boolean',
      description: 'Add trailing slashes to URLs',
      default: false,
    },
    {
      key: 'poweredByHeader',
      label: 'X-Powered-By Header',
      type: 'boolean',
      description: 'Show X-Powered-By header',
      default: true,
    },
    {
      key: 'compress',
      label: 'Compression',
      type: 'boolean',
      description: 'Enable gzip compression',
      default: true,
    },
    {
      key: 'generateEtags',
      label: 'Generate ETags',
      type: 'boolean',
      description: 'Generate ETags for pages',
      default: true,
    },
    {
      key: 'pageExtensions',
      label: 'Page Extensions',
      type: 'array',
      itemType: 'string',
      description: 'File extensions treated as pages',
      default: ['tsx', 'ts', 'jsx', 'js'],
    },
    {
      key: 'output',
      label: 'Output Type',
      type: 'enum',
      description: 'Type of build output',
      options: [
        { value: 'standalone', label: 'Standalone' },
        { value: 'export', label: 'Static Export' },
      ],
    },
    {
      key: 'assetPrefix',
      label: 'Asset Prefix',
      type: 'string',
      description: 'CDN prefix for static assets',
      placeholder: 'https://cdn.example.com',
    },
    {
      key: 'env',
      label: 'Environment Variables',
      type: 'record',
      description: 'Public environment variables',
    },
    {
      key: 'images',
      label: 'Image Configuration',
      type: 'object',
      description: 'Image optimization settings',
      fields: [
        {
          key: 'domains',
          label: 'Allowed Domains',
          type: 'array',
          itemType: 'string',
          description: 'External domains for image optimization',
        },
        {
          key: 'deviceSizes',
          label: 'Device Sizes',
          type: 'array',
          itemType: 'number',
          description: 'Device sizes for responsive images',
          default: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        },
        {
          key: 'imageSizes',
          label: 'Image Sizes',
          type: 'array',
          itemType: 'number',
          description: 'Image sizes for srcset',
          default: [16, 32, 48, 64, 96, 128, 256, 384],
        },
        {
          key: 'formats',
          label: 'Image Formats',
          type: 'array',
          itemType: 'string',
          description: 'Allowed image formats',
          default: ['image/webp'],
        },
        {
          key: 'minimumCacheTTL',
          label: 'Minimum Cache TTL',
          type: 'number',
          description: 'Cache duration in seconds',
          default: 60,
        },
        {
          key: 'dangerouslyAllowSVG',
          label: 'Allow SVG',
          type: 'boolean',
          description: 'Enable SVG optimization (use with caution)',
          default: false,
        },
      ],
    },
    {
      key: 'experimental',
      label: 'Experimental Features',
      type: 'object',
      description: 'Experimental Next.js features',
      fields: [
        {
          key: 'appDir',
          label: 'App Directory',
          type: 'boolean',
          description: 'Enable App Router',
          default: false,
        },
        {
          key: 'serverActions',
          label: 'Server Actions',
          type: 'boolean',
          description: 'Enable Server Actions',
          default: false,
        },
        {
          key: 'typedRoutes',
          label: 'Typed Routes',
          type: 'boolean',
          description: 'Enable statically typed links',
          default: false,
        },
      ],
    },
    {
      key: 'typescript',
      label: 'TypeScript Configuration',
      type: 'object',
      description: 'TypeScript-specific options',
      fields: [
        {
          key: 'ignoreBuildErrors',
          label: 'Ignore Build Errors',
          type: 'boolean',
          description: 'Continue build even with TypeScript errors',
          default: false,
        },
        {
          key: 'tsconfigPath',
          label: 'TSConfig Path',
          type: 'string',
          description: 'Path to tsconfig.json',
          placeholder: './tsconfig.json',
        },
      ],
    },
    {
      key: 'eslint',
      label: 'ESLint Configuration',
      type: 'object',
      description: 'ESLint-specific options',
      fields: [
        {
          key: 'ignoreDuringBuilds',
          label: 'Ignore During Builds',
          type: 'boolean',
          description: 'Skip ESLint during builds',
          default: false,
        },
        {
          key: 'dirs',
          label: 'Lint Directories',
          type: 'array',
          itemType: 'string',
          description: 'Directories to lint',
          default: ['pages', 'components', 'lib'],
        },
      ],
    },
    {
      key: 'transpilePackages',
      label: 'Transpile Packages',
      type: 'array',
      itemType: 'string',
      description: 'Packages to transpile from node_modules',
    },
    {
      key: 'productionBrowserSourceMaps',
      label: 'Production Source Maps',
      type: 'boolean',
      description: 'Enable source maps in production',
      default: false,
    },
    {
      key: 'staticPageGenerationTimeout',
      label: 'Static Page Generation Timeout',
      type: 'number',
      description: 'Timeout in seconds for generating static pages',
      default: 60,
    },
    {
      key: 'serverExternalPackages',
      label: 'Server External Packages',
      type: 'array',
      itemType: 'string',
      description: 'Packages to treat as external in server build',
    },
  ],
};

// Export schema map
export const configSchemas: Record<string, ConfigSchema> = {
  nextjs: nextJsSchema,
  // Add more schemas here as they're created
};
