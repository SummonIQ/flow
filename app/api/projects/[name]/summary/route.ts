'use server';

import { prisma } from '@/lib/db/prisma';
import {
  getOpenAIClient,
  getOpenAIKey,
  OPENAI_API_KEY_ERROR,
} from '@/lib/openai/client';
import { OPENAI_SUMMARY_MODEL_DEFAULT } from '@/lib/openai/config';
import { analyzeProject, generateAIContext } from '@/lib/project-analyzer';
import { NextRequest, NextResponse } from 'next/server';

// GET - Retrieve existing summary
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;

    const project = await prisma.project.findUnique({
      where: { name },
      include: { summary: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      hasSummary: !!project.summary,
      summary: project.summary?.summary || null,
      technicalOverview: project.summary?.technicalOverview || null,
      generatedAt: project.summary?.generatedAt || null,
    });
  } catch (error) {
    console.error('[API] Error fetching summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summary' },
      { status: 500 },
    );
  }
}

// POST - Generate new summary using AI
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;

    const project = await prisma.project.findUnique({
      where: { name },
      include: { apps: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (!getOpenAIKey()) {
      return NextResponse.json(
        { error: OPENAI_API_KEY_ERROR },
        { status: 500 },
      );
    }

    const openai = getOpenAIClient();

    // Use the project analyzer to gather detailed info
    console.log('[Summary] Analyzing project:', project.path);
    const analysis = await analyzeProject(project.path);
    console.log('[Summary] Analysis complete:', {
      type: analysis.type,
      frameworks: analysis.frameworks.map(f => f.name),
      apps: analysis.apps?.length || 0,
    });

    // Generate structured context for AI
    const context = generateAIContext(analysis);

    // Generate summary with key features
    const summaryResponse = await openai.chat.completions.create({
      model: OPENAI_SUMMARY_MODEL_DEFAULT,
      messages: [
        {
          role: 'system',
          content: `You are a technical writer creating concise project summaries. Write in a professional but approachable tone.

FORMAT REQUIREMENTS:
1. Start with a 2-3 sentence description of what the project is and does
2. Then add a "Key Features" section with 3-5 bullet points

Use this exact format:
[2-3 sentence description]

Key Features
- Feature 1
- Feature 2
- Feature 3

Do NOT use markdown headers (no # symbols). Use plain text for section titles.`,
        },
        {
          role: 'user',
          content: `Based on the following project information, write a brief summary with key features:\n\n${context}`,
        },
      ],
      max_tokens: 350,
      temperature: 0.7,
    });

    const summary =
      summaryResponse.choices[0]?.message?.content ||
      'Unable to generate summary.';

    // Generate technical overview
    const techResponse = await openai.chat.completions.create({
      model: OPENAI_SUMMARY_MODEL_DEFAULT,
      messages: [
        {
          role: 'system',
          content: `You are a senior software architect creating technical overviews.

FORMAT REQUIREMENTS:
- Use section headings as plain text followed by a newline (NOT markdown # headers)
- Under each heading, use bullet points starting with "-"
- Keep each bullet point concise (one line)

Use this exact format:

Tech Stack
- Frontend: [technologies]
- Backend: [technologies]
- Database: [technologies]

Architecture
- [Key architectural pattern or decision]
- [Another architectural aspect]

Key Technical Decisions
- [Decision 1]
- [Decision 2]

Do NOT use markdown headers (no # symbols). Do NOT use bold (**) in headings.`,
        },
        {
          role: 'user',
          content: `Based on the following project information, write a technical overview:\n\n${context}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const technicalOverview =
      techResponse.choices[0]?.message?.content ||
      'Unable to generate technical overview.';

    // Save to database
    const savedSummary = await prisma.projectSummary.upsert({
      where: { projectId: project.id },
      create: {
        projectId: project.id,
        summary,
        technicalOverview,
      },
      update: {
        summary,
        technicalOverview,
        generatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      summary: savedSummary.summary,
      technicalOverview: savedSummary.technicalOverview,
      generatedAt: savedSummary.generatedAt,
    });
  } catch (error) {
    console.error('[API] Error generating summary:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate summary',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
