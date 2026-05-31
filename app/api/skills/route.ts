import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      where: { isEnabled: true },
      orderBy: [{ category: 'asc' }, { displayName: 'asc' }],
    });
    return NextResponse.json(skills);
  } catch (error) {
    console.error('Failed to fetch skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const skill = await prisma.skill.create({
      data: {
        name: body.name,
        displayName: body.displayName,
        description: body.description,
        category: body.category,
        content: body.content,
        license: body.license,
        compatibility: body.compatibility,
        author: body.author,
        version: body.version,
        allowedTools: body.allowedTools || [],
        tags: body.tags || [],
        isOfficial: body.isOfficial || false,
      },
    });

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    console.error('Failed to create skill:', error);
    return NextResponse.json(
      { error: 'Failed to create skill' },
      { status: 500 },
    );
  }
}
