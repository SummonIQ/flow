import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getScraper, upsertScraper } from '@/lib/scraping/store';

const stepSchema = z.discriminatedUnion('type', [
  z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    type: z.literal('navigate'),
    url: z.string().min(1),
    delayMs: z.number().int().nonnegative().optional(),
  }),
  z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    type: z.literal('extractHtml'),
    delayMs: z.number().int().nonnegative().optional(),
  }),
  z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    type: z.literal('query'),
    selector: z.string().min(1),
    attribute: z.string().optional(),
    outputKey: z.string().min(1),
    delayMs: z.number().int().nonnegative().optional(),
  }),
  z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    type: z.literal('click'),
    selector: z.string().min(1),
    tagName: z.string().optional(),
    idAttr: z.string().optional(),
    classes: z.array(z.string()).optional(),
    text: z.string().optional(),
    href: z.string().optional(),
    delayMs: z.number().int().nonnegative().optional(),
  }),
  z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    type: z.literal('type'),
    selector: z.string().min(1),
    value: z.string(),
    pressEnter: z.boolean().optional(),
    delayMs: z.number().int().nonnegative().optional(),
  }),
  z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    type: z.literal('condition'),
    sourceKey: z.string().min(1),
    operator: z.enum([
      'exists',
      'notExists',
      'equals',
      'notEquals',
      'contains',
      'notContains',
    ]),
    value: z.string().optional(),
    onFalse: z.enum(['continue', 'skipNext', 'branch', 'fail']).optional(),
    delayMs: z.number().int().nonnegative().optional(),
  }),
]);

const updateSchema = z.object({
  name: z.string().min(1),
  startUrl: z.string().min(1),
  steps: z.array(stepSchema).default([]),
  settings: z
    .object({
      stepDelayMs: z.number().int().nonnegative().optional(),
      cursorJitter: z.boolean().optional(),
      cursorMove: z.boolean().optional(),
      scrollNudge: z.boolean().optional(),
      viewportWidth: z.number().int().positive().optional(),
      viewportHeight: z.number().int().positive().optional(),
    })
    .optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ scraperId: string }> },
) {
  try {
    const { scraperId } = await params;
    const scraper = await getScraper(scraperId);
    if (!scraper) {
      return NextResponse.json({ error: 'Scraper not found' }, { status: 404 });
    }
    return NextResponse.json({ scraper });
  } catch (error) {
    console.error('[api/scrapers/[scraperId]] GET error', error);
    return NextResponse.json(
      { error: 'Failed to get scraper' },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ scraperId: string }> },
) {
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const { scraperId } = await params;
    const scraper = await upsertScraper({ id: scraperId, ...parsed.data });
    return NextResponse.json({ scraper });
  } catch (error) {
    console.error('[api/scrapers/[scraperId]] PUT error', error);
    return NextResponse.json(
      { error: 'Failed to update scraper' },
      { status: 500 },
    );
  }
}
