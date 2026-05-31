import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/db/prisma';

const jobItemSchema = z.object({
  url: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().default(''),
  source: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  paymentVerified: z.boolean().optional(),
  clientSpent: z.string().optional(),
  proposals: z.string().optional(),
  posted: z.string().optional(),
  budgetLine: z.string().optional(),
  budgetType: z.string().optional(),
  experienceLevel: z.string().optional(),
  budgetEstimate: z.string().optional(),
  bids: z.string().optional(),
  avgBid: z.string().optional(),
});

const upsertSchema = z.object({
  teamId: z.string().min(1),
  items: z.array(jobItemSchema).min(1),
  replace: z.boolean().optional(),
  method: z
    .enum(['LISTING_DOM', 'LISTING_AI'])
    .optional()
    .default('LISTING_DOM'),
  sourceUrl: z.string().optional(),
  html: z.string().optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get('teamId') || '';
  if (!teamId) {
    return NextResponse.json({ error: 'teamId required' }, { status: 400 });
  }

  try {
    const jobs = await prisma.upworkJob.findMany({
      where: { teamId },
      include: {
        detail: true,
        proposalDrafts: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('[upwork/jobs] GET error', error);
    return NextResponse.json({ error: 'Failed to load jobs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const parsed = upsertSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { teamId, items, method, sourceUrl, html, replace } = parsed.data;
  const now = new Date();

  try {
    const results = await prisma.$transaction(async tx => {
      if (replace) {
        await tx.upworkJob.deleteMany({ where: { teamId } });
      }
      const jobs = [];

      for (const item of items) {
        const job = await tx.upworkJob.upsert({
          where: { teamId_url: { teamId, url: item.url } },
          create: {
            teamId,
            url: item.url,
            title: item.title,
            description: item.description,
            source: item.source,
            tags: item.tags,
            paymentVerified: item.paymentVerified,
            clientSpent: item.clientSpent,
            proposals: item.proposals,
            posted: item.posted,
            budgetLine: item.budgetLine,
            budgetType: item.budgetType,
            experienceLevel: item.experienceLevel,
            budgetEstimate: item.budgetEstimate,
            bids: item.bids,
            avgBid: item.avgBid,
            lastExtractedAt: now,
          },
          update: {
            title: item.title || undefined,
            description: item.description || undefined,
            source: item.source || undefined,
            tags: item.tags,
            paymentVerified: item.paymentVerified,
            clientSpent: item.clientSpent,
            proposals: item.proposals,
            posted: item.posted,
            budgetLine: item.budgetLine,
            budgetType: item.budgetType,
            experienceLevel: item.experienceLevel,
            budgetEstimate: item.budgetEstimate,
            bids: item.bids,
            avgBid: item.avgBid,
            lastExtractedAt: now,
          },
        });
        jobs.push(job);
      }

      await tx.upworkJobExtract.createMany({
        data: jobs.map((job, idx) => ({
          jobId: job.id,
          method,
          sourceUrl,
          html: html || null,
          extracted: items[idx],
        })),
      });

      return jobs;
    });

    return NextResponse.json({ jobs: results });
  } catch (error) {
    console.error('[upwork/jobs] POST error', error);
    return NextResponse.json(
      { error: 'Failed to upsert jobs' },
      { status: 500 },
    );
  }
}
