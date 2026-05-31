import { NextResponse } from 'next/server';

import { deleteScraperFixture } from '@/lib/scraping/store';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ fixtureId: string }> },
) {
  try {
    const { fixtureId } = await params;
    const deleted = await deleteScraperFixture(fixtureId);
    if (!deleted) {
      return NextResponse.json({ error: 'Fixture not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/scrapers/fixtures/[fixtureId]] DELETE error', error);
    return NextResponse.json(
      { error: 'Failed to delete scraper fixture' },
      { status: 500 },
    );
  }
}
