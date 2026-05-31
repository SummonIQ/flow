import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ragEmbeddingService } from '@/lib/services/rag-embedding-service';

export async function GET(request: NextRequest) {
  try {
    const templates = await prisma.configTemplate.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { appType: 'asc' },
        { configType: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching config templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch config templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const template = await prisma.configTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        configType: data.configType,
        appType: data.appType,
        scope: data.scope,
        content: data.content,
        rawContent: data.rawContent,
        version: data.version || 1,
        isActive: data.isActive ?? true,
        createdBy: data.createdBy,
      },
    });

    // Queue embedding for the new template
    await ragEmbeddingService.onCreated('ConfigTemplate', template.id);

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error creating config template:', error);
    return NextResponse.json(
      { error: 'Failed to create config template' },
      { status: 500 }
    );
  }
}
