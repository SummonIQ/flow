import { getPusherServer } from '@/lib/pusher/server';

import { type ScraperRunEvent, type ScraperRun } from './types';

export async function triggerScraperEvent(
  scraperId: string,
  event: ScraperRunEvent,
) {
  const pusher = getPusherServer();
  if (!pusher) return;

  await pusher.trigger(`scraper-${scraperId}`, 'scraper-event', {
    event,
  });

  await pusher.trigger(`scraper-run-${event.runId}`, 'scraper-event', {
    event,
  });
}

export async function triggerScraperRunUpdated(run: ScraperRun) {
  const pusher = getPusherServer();
  if (!pusher) return;

  await pusher.trigger(`scraper-run-${run.id}`, 'scraper-run-updated', {
    run,
  });
}
