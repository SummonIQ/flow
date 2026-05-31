import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  appendRunEvent,
  getRun,
  listRunEvents,
  updateRun,
  updateRunStep,
} from '@/lib/scraping/store';
import {
  triggerScraperEvent,
  triggerScraperRunUpdated,
} from '@/lib/scraping/realtime';

const eventSchema = z.object({
  scraperId: z.string().min(1),
  type: z.enum([
    'run.started',
    'run.completed',
    'run.failed',
    'step.started',
    'step.completed',
    'step.failed',
    'log',
  ]),
  payload: z.unknown().optional(),
});

function nowIso(): string {
  return new Date().toISOString();
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  try {
    const { runId } = await params;
    const events = await listRunEvents(runId);
    return NextResponse.json({ events });
  } catch (error) {
    console.error('[api/scrapers/runs/[runId]/events] GET error', error);
    return NextResponse.json(
      { error: 'Failed to list events' },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const parsed = eventSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const { runId } = await params;
    const run = await getRun(runId);
    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    const { scraperId, type, payload } = parsed.data;

    if (type === 'run.completed') {
      const results = (payload as any)?.results;
      await updateRun(runId, {
        status: 'completed',
        completedAt: nowIso(),
        error: undefined,
        results:
          results && typeof results === 'object'
            ? (results as Record<string, unknown>)
            : undefined,
      });
    }

    if (type === 'run.failed') {
      const errorValue =
        typeof (payload as any)?.error === 'string'
          ? ((payload as any)?.error as string)
          : undefined;
      await updateRun(runId, {
        status: 'failed',
        completedAt: nowIso(),
        error:
          errorValue ?? (typeof payload === 'string' ? payload : undefined),
      });
    }

    if (type === 'step.started') {
      const stepId = (payload as any)?.stepId as string | undefined;
      if (stepId) {
        await updateRunStep(runId, stepId, {
          status: 'running',
          startedAt: nowIso(),
          error: undefined,
        });
      }
    }

    if (type === 'step.completed') {
      const stepId = (payload as any)?.stepId as string | undefined;
      const output = (payload as any)?.output;
      if (stepId) {
        await updateRunStep(runId, stepId, {
          status: 'completed',
          completedAt: nowIso(),
          output,
        });
      }
    }

    if (type === 'step.failed') {
      const stepId = (payload as any)?.stepId as string | undefined;
      const errorMsg = (payload as any)?.error;
      if (stepId) {
        await updateRunStep(runId, stepId, {
          status: 'failed',
          completedAt: nowIso(),
          error: typeof errorMsg === 'string' ? errorMsg : 'Step failed',
        });
      }
    }

    const event = await appendRunEvent({
      runId,
      scraperId,
      type,
      payload,
    });

    const nextRun = await getRun(runId);

    await triggerScraperEvent(scraperId, event);
    if (nextRun) {
      await triggerScraperRunUpdated(nextRun);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[api/scrapers/runs/[runId]/events] POST error', error);
    return NextResponse.json(
      { error: 'Failed to append event' },
      { status: 500 },
    );
  }
}
