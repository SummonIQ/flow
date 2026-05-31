import { prisma } from '@/lib/db/prisma';
import { getNextAvailablePortForProject } from '@/lib/port-manager';
import { NextRequest, NextResponse } from 'next/server';

import type { AppType } from '@prisma/client';

function toAppType(value: string): AppType | null {
  const typeMap: Record<string, AppType> = {
    'web-app': 'WEB_APP',
    'desktop-app': 'DESKTOP_APP',
    'mobile-app': 'MOBILE_APP',
    api: 'API',
    'marketing-site': 'MARKETING_SITE',
    library: 'LIBRARY',
    monorepo: 'MONOREPO',
    cli: 'CLI',
    extension: 'EXTENSION',
    docs: 'CUSTOM',
    custom: 'CUSTOM',
  };

  return typeMap[value] ?? null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;
    const { searchParams } = new URL(request.url);
    const appType = searchParams.get('type');

    if (!appType) {
      return NextResponse.json(
        { error: 'App type is required' },
        { status: 400 },
      );
    }

    const enumType = toAppType(appType);
    if (!enumType) {
      return NextResponse.json({
        port: null,
        type: appType,
        projectName: name,
      });
    }

    try {
      const project = await prisma.project.findUnique({
        where: { name },
        select: { id: true },
      });

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 },
        );
      }

      const port = await getNextAvailablePortForProject(project.id, enumType);

      return NextResponse.json({
        port,
        type: appType,
        projectName: name,
      });
    } catch (error) {
      // If port manager returns null or fails, return a sensible default
      console.warn('Failed to get next port:', error);
      return NextResponse.json({
        port: null,
        type: appType,
        projectName: name,
        warning: 'Could not determine next available port',
      });
    }
  } catch (error) {
    console.error('Error in next-port route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
