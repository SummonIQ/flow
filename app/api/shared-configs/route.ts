import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ConfigType, AppType } from '@prisma/client';

// Helper to convert database enum to UI format
function convertConfigType(type: ConfigType): string {
  return type.toLowerCase().replace(/_/g, '-');
}

function convertAppType(type: AppType): string {
  return type.toLowerCase().replace(/_/g, '-');
}

function convertToDbConfigType(type: string): ConfigType {
  return type.toUpperCase().replace(/-/g, '_') as ConfigType;
}

function convertToDbAppType(type: string): AppType {
  return type.toUpperCase().replace(/-/g, '_') as AppType;
}

// Legacy mock data for reference
const legacyConfigs = [
  {
    id: '1',
    name: 'Next.js Full Stack',
    type: 'windsurf-rules',
    appType: 'nextjs',
    description: 'Comprehensive rules for Next.js 14+ with App Router',
    content: `# Windsurf Rules for Next.js

## Framework & Patterns
- Use App Router with Server Components by default
- Client Components only when needed (interactivity, hooks, browser APIs)
- Implement Server Actions for mutations

## Styling
- Use Tailwind CSS with design system tokens
- Follow mobile-first responsive patterns

## Code Quality
- TypeScript strict mode
- ESLint with Next.js recommended rules
- Prettier for formatting`,
    tags: ['nextjs', 'typescript', 'tailwind'],
    isDefault: true,
    usageCount: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'React Component Library',
    type: 'windsurf-rules',
    appType: 'library',
    description: 'Rules for building reusable React components',
    content: `# Windsurf Rules for React Component Library

## Component Design
- Build composable, reusable components
- Export components with proper TypeScript types
- Include comprehensive prop documentation

## Accessibility
- Follow ARIA best practices
- Ensure keyboard navigation
- Support screen readers

## Testing
- Unit tests with Jest
- Component tests with Testing Library
- Visual regression tests with Storybook`,
    tags: ['react', 'components', 'accessibility'],
    isDefault: false,
    usageCount: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'API Development',
    type: 'agents-md',
    appType: 'api',
    description: 'Agent instructions for API development',
    content: `# AGENTS Configuration for API Development

## Role
You are an API development expert specializing in RESTful and GraphQL APIs.

## Responsibilities
- Design scalable API architectures
- Implement proper authentication and authorization
- Follow RESTful principles and best practices
- Write comprehensive API documentation
- Implement error handling and validation

## Stack
- Node.js / Express or Fastify
- TypeScript
- Prisma or TypeORM for database
- JWT for authentication
- OpenAPI/Swagger for documentation`,
    tags: ['api', 'rest', 'graphql'],
    isDefault: false,
    usageCount: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * GET /api/shared-configs - List all shared configurations
 * GET /api/shared-configs?type=windsurf-rules - Filter by type
 * GET /api/shared-configs?appType=web-app - Filter by app type
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const appType = searchParams.get('appType');

    const where: any = {};
    
    if (type) {
      where.configType = convertToDbConfigType(type);
    }
    
    if (appType) {
      where.appType = convertToDbAppType(appType);
    }

    console.log('[API] Fetching shared configs with where:', where);

    const configs = await prisma.sharedConfig.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { usageCount: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    console.log(`[API] Found ${configs.length} configs`);

    // Convert to UI format
    const formattedConfigs = configs.map((config) => ({
      id: config.id,
      name: config.name,
      type: convertConfigType(config.configType),
      appType: config.appType ? convertAppType(config.appType) : undefined,
      description: config.description || undefined,
      content: typeof config.content === 'string' ? config.content : JSON.stringify(config.content, null, 2),
      tags: config.tags,
      isDefault: config.isDefault,
      usageCount: config.usageCount,
      locked: config.locked,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedConfigs);
  } catch (error) {
    console.error('[API] Error fetching shared configs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch shared configurations', details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/shared-configs - Create a new shared configuration
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Parse content if it's a string
    let parsedContent = data.content;
    if (typeof data.content === 'string') {
      try {
        parsedContent = JSON.parse(data.content);
      } catch {
        // Keep as string if not valid JSON
        parsedContent = { raw: data.content };
      }
    }

    const config = await prisma.sharedConfig.create({
      data: {
        name: data.name,
        configType: convertToDbConfigType(data.type),
        appType: data.appType ? convertToDbAppType(data.appType) : null,
        description: data.description,
        content: parsedContent,
        tags: data.tags || [],
        isDefault: data.isDefault || false,
        usageCount: 0,
      },
    });

    return NextResponse.json({
      id: config.id,
      name: config.name,
      type: convertConfigType(config.configType),
      appType: config.appType ? convertAppType(config.appType) : undefined,
      description: config.description || undefined,
      content: typeof config.content === 'string' ? config.content : JSON.stringify(config.content, null, 2),
      tags: config.tags,
      isDefault: config.isDefault,
      usageCount: config.usageCount,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating shared config:', error);
    return NextResponse.json(
      { error: 'Failed to create shared configuration' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/shared-configs - Update an existing shared configuration
 */
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();

    // Parse content if it's a string
    let parsedContent = data.content;
    if (typeof data.content === 'string') {
      try {
        parsedContent = JSON.parse(data.content);
      } catch {
        parsedContent = { raw: data.content };
      }
    }

    const config = await prisma.sharedConfig.update({
      where: { id: data.id },
      data: {
        name: data.name,
        appType: data.appType ? convertToDbAppType(data.appType) : null,
        description: data.description,
        content: parsedContent,
        tags: data.tags || [],
        isDefault: data.isDefault || false,
      },
    });

    return NextResponse.json({
      id: config.id,
      name: config.name,
      type: convertConfigType(config.configType),
      appType: config.appType ? convertAppType(config.appType) : undefined,
      description: config.description || undefined,
      content: typeof config.content === 'string' ? config.content : JSON.stringify(config.content, null, 2),
      tags: config.tags,
      isDefault: config.isDefault,
      usageCount: config.usageCount,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating shared config:', error);
    return NextResponse.json(
      { error: 'Failed to update shared configuration' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/shared-configs?id=xxx - Delete a shared configuration
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Configuration ID is required' },
        { status: 400 }
      );
    }

    await prisma.sharedConfig.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shared config:', error);
    return NextResponse.json(
      { error: 'Failed to delete shared configuration' },
      { status: 500 }
    );
  }
}
