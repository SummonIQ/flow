import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/db/prisma';

const detailSchema = z.object({
  connectsRequired: z.number().int().optional(),
  duration: z.string().optional(),
  projectType: z.string().optional(),
  location: z.string().optional(),
  activity: z.string().optional(),
  clientLocation: z.string().optional(),
  clientJobsPosted: z.number().int().optional(),
  clientHireRate: z.string().optional(),
  clientSpent: z.string().optional(),
  clientHourlyRange: z.string().optional(),
  clientAvgHourly: z.string().optional(),
  clientTotalHires: z.number().int().optional(),
  clientOpenJobs: z.number().int().optional(),
  experienceLevel: z.string().optional(),
  weeklyHours: z.string().optional(),
  hourlyRange: z.string().optional(),
  fixedPrice: z.string().optional(),
  skills: z.array(z.string()).optional(),
  attachments: z.any().optional(),
  rawSections: z.any().optional(),
});

const patchSchema = z.object({
  job: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
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
      status: z
        .enum([
          'NEW',
          'DETAILS_ENRICHED',
          'MATCHED',
          'PROPOSAL_GENERATED',
          'READY_TO_SUBMIT',
          'SUBMITTED',
          'FAILED',
        ])
        .optional(),
    })
    .optional(),
  detail: detailSchema.optional(),
  method: z
    .enum(['DETAIL_DOM', 'DETAIL_AI', 'DETAIL_VISION'])
    .optional()
    .default('DETAIL_DOM'),
  sourceUrl: z.string().optional(),
  html: z.string().optional(),
  screenshotBase64: z.string().optional(),
  screenshotMime: z.string().optional(),
  extracted: z.any().optional(),
  error: z.string().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  try {
    const job = await prisma.upworkJob.findUnique({
      where: { id: jobId },
      include: {
        detail: true,
        proposalDrafts: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    if (!job) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ job });
  } catch (error) {
    console.error('[upwork/jobs/:id] GET error', error);
    return NextResponse.json(
      { error: 'Failed to load job' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { job, detail, method, sourceUrl, html, screenshotBase64, screenshotMime, extracted, error } =
    parsed.data;

  try {
    const now = new Date();
    const updated = await prisma.$transaction(async tx => {
      const updatedJob = await tx.upworkJob.update({
        where: { id: jobId },
        data: {
          ...job,
          lastExtractedAt: now,
        },
      });

      if (detail) {
        await tx.upworkJobDetail.upsert({
          where: { jobId },
          create: {
            jobId,
            ...detail,
            lastExtractedAt: now,
          },
          update: {
            ...detail,
            lastExtractedAt: now,
          },
        });
      }

      await tx.upworkJobExtract.create({
        data: {
          jobId,
          method,
          sourceUrl,
          html: html || null,
          screenshotBase64: screenshotBase64 || null,
          screenshotMime: screenshotMime || null,
          extracted,
          error: error || null,
        },
      });

      return updatedJob;
    });

    return NextResponse.json({ job: updated });
  } catch (error) {
    console.error('[upwork/jobs/:id] PATCH error', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 },
    );
  }
}
