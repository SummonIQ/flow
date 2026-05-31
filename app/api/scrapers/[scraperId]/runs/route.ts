import { NextResponse } from 'next/server';

import {
  appendRunEvent,
  createRun,
  getScraper,
  listRuns,
} from '@/lib/scraping/store';
import {
  triggerScraperEvent,
  triggerScraperRunUpdated,
} from '@/lib/scraping/realtime';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ scraperId: string }> },
) {
  try {
    const { scraperId } = await params;
    const runs = await listRuns(scraperId);
    return NextResponse.json({ runs });
  } catch (error) {
    console.error('[api/scrapers/[scraperId]/runs] GET error', error);
    return NextResponse.json({ error: 'Failed to list runs' }, { status: 500 });
  }
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ scraperId: string }> },
) {
  try {
    const { scraperId } = await params;
    const scraper = await getScraper(scraperId);
    if (!scraper) {
      return NextResponse.json({ error: 'Scraper not found' }, { status: 404 });
    }

    const run = await createRun(scraperId);

    const event = await appendRunEvent({
      runId: run.id,
      scraperId,
      type: 'run.started',
      payload: { scraperId },
    });

    await triggerScraperEvent(scraperId, event);
    await triggerScraperRunUpdated(run);

    return NextResponse.json({ run });
  } catch (error) {
    console.error('[api/scrapers/[scraperId]/runs] POST error', error);
    return NextResponse.json(
      { error: 'Failed to create run' },
      { status: 500 },
    );
  }
}
