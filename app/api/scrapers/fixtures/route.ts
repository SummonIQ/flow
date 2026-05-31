import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  createScraperFixture,
  listScraperFixtures,
} from '@/lib/scraping/store';

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

const createFixtureSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sourceScraperId: z.string().optional(),
  steps: z.array(stepSchema).min(1),
});

export async function GET() {
  try {
    const fixtures = await listScraperFixtures();
    return NextResponse.json({ fixtures });
  } catch (error) {
    console.error('[api/scrapers/fixtures] GET error', error);
    return NextResponse.json(
      { error: 'Failed to list scraper fixtures' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const parsed = createFixtureSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const fixture = await createScraperFixture(parsed.data);
    return NextResponse.json({ fixture });
  } catch (error) {
    console.error('[api/scrapers/fixtures] POST error', error);
    return NextResponse.json(
      { error: 'Failed to create scraper fixture' },
      { status: 500 },
    );
  }
}
