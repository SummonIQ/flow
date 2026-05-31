import { NextResponse } from 'next/server';
import { AppType } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { ragEmbeddingService } from '@/lib/services/rag-embedding-service';

// Convert DB AppType to UI format
function convertAppType(dbType: string): string {
  const map: Record<string, string> = {
    'WEB_APP': 'web-app',
    'DESKTOP_APP': 'desktop',
    'MOBILE_APP': 'mobile-app',
    'API': 'api',
    'MARKETING_SITE': 'marketing-site',
    'LIBRARY': 'library',
    'MONOREPO': 'monorepo',
    'CLI': 'cli',
    'EXTENSION': 'extension',
    'CUSTOM': 'custom',
  };
  return map[dbType] || dbType;
}

export async function GET() {
  try {
    const practices = await prisma.bestPractice.findMany({
      orderBy: [
        { priority: 'desc' },
        { topic: 'asc' },
        { name: 'asc' },
      ],
    });

    // Convert appType format
    const convertedPractices = practices.map(p => ({
      ...p,
      appType: convertAppType(p.appType),
    }));

    return NextResponse.json(convertedPractices);
  } catch (error) {
    console.error('Failed to fetch best practices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch best practices' },
      { status: 500 }
    );
  }
}

// Convert UI AppType to DB format
function convertToDbAppType(uiType: string): AppType {
  const map: Record<string, AppType> = {
    'web-app': AppType.WEB_APP,
    'desktop': AppType.DESKTOP_APP,
    'mobile-app': AppType.MOBILE_APP,
    'api': AppType.API,
    'marketing-site': AppType.MARKETING_SITE,
    'library': AppType.LIBRARY,
    'monorepo': AppType.MONOREPO,
    'cli': AppType.CLI,
    'extension': AppType.EXTENSION,
    'custom': AppType.CUSTOM,
  };
  return map[uiType] || AppType.WEB_APP;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const practice = await prisma.bestPractice.create({
      data: {
        name: body.name,
        topic: body.topic,
        appType: convertToDbAppType(body.appType),
        content: body.content || '',
        description: body.description,
        tags: body.tags || [],
        priority: body.priority || 0,
        isDefault: body.isDefault || false,
      },
    });

    // Queue embedding for the new best practice
    await ragEmbeddingService.onCreated('BestPractice', practice.id);

    return NextResponse.json({
      ...practice,
      appType: convertAppType(practice.appType),
    });
  } catch (error) {
    console.error('Failed to create best practice:', error);
    return NextResponse.json(
      { error: 'Failed to create best practice' },
      { status: 500 }
    );
  }
}
