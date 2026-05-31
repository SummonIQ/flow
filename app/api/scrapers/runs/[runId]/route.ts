import { NextResponse } from 'next/server';

import { getRun } from '@/lib/scraping/store';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  try {
    const { runId } = await params;
    const run = await getRun(runId);
    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }
    return NextResponse.json({ run });
  } catch (error) {
    console.error('[api/scrapers/runs/[runId]] GET error', error);
    return NextResponse.json({ error: 'Failed to get run' }, { status: 500 });
  }
}
