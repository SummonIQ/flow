import { randomUUID } from 'node:crypto';

import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

import {
  type ScraperDefinition,
  type ScraperFixture,
  type ScraperRun,
  type ScraperRunEvent,
} from './types';

const SCRAPING_PROVIDER = 'flow';
const SCRAPING_PROJECT_ID = '__global__';
const SCRAPING_APP_ID = '__flow__';

type ScrapingFeatureConfig = {
  version: number;
  scrapers: ScraperDefinition[];
  fixtures: ScraperFixture[];
  runs: ScraperRun[];
  events: ScraperRunEvent[];
};

function nowIso(): string {
  return new Date().toISOString();
}

function emptyConfig(): ScrapingFeatureConfig {
  return {
    version: 1,
    scrapers: [],
    fixtures: [],
    runs: [],
    events: [],
  };
}

function parseConfig(raw: unknown): ScrapingFeatureConfig {
  if (!raw || typeof raw !== 'object') return emptyConfig();
  const obj = raw as Partial<ScrapingFeatureConfig>;
  return {
    version: typeof obj.version === 'number' ? obj.version : 1,
    scrapers: Array.isArray(obj.scrapers)
      ? (obj.scrapers as ScraperDefinition[])
      : [],
    fixtures: Array.isArray(obj.fixtures)
      ? (obj.fixtures as ScraperFixture[])
      : [],
    runs: Array.isArray(obj.runs) ? (obj.runs as ScraperRun[]) : [],
    events: Array.isArray(obj.events) ? (obj.events as ScraperRunEvent[]) : [],
  };
}

async function readScrapingConfig() {
  const row = await prisma.featureConfig.findFirst({
    where: {
      feature: 'SCRAPING',
      OR: [
        {
          projectId: SCRAPING_PROJECT_ID,
          appId: SCRAPING_APP_ID,
        },
        {
          projectId: null,
          appId: null,
        },
      ],
    },
  });

  return {
    row,
    config: parseConfig(row?.config ?? null),
  };
}

async function writeScrapingConfig(next: ScrapingFeatureConfig) {
  const existing = await prisma.featureConfig.findFirst({
    where: {
      feature: 'SCRAPING',
      OR: [
        {
          projectId: SCRAPING_PROJECT_ID,
          appId: SCRAPING_APP_ID,
        },
        {
          projectId: null,
          appId: null,
        },
      ],
    },
    select: {
      id: true,
    },
  });

  const config = next as unknown as Prisma.InputJsonValue;

  if (existing?.id) {
    await prisma.featureConfig.update({
      where: {
        id: existing.id,
      },
      data: {
        projectId: SCRAPING_PROJECT_ID,
        appId: SCRAPING_APP_ID,
        provider: SCRAPING_PROVIDER,
        config,
        isEnabled: true,
      },
    });
    return;
  }

  await prisma.featureConfig.create({
    data: {
      projectId: SCRAPING_PROJECT_ID,
      appId: SCRAPING_APP_ID,
      feature: 'SCRAPING',
      provider: SCRAPING_PROVIDER,
      config,
      isEnabled: true,
    },
  });
}

export async function listScrapers(): Promise<ScraperDefinition[]> {
  const { config } = await readScrapingConfig();
  return config.scrapers;
}

export async function getScraper(
  scraperId: string,
): Promise<ScraperDefinition | null> {
  const { config } = await readScrapingConfig();
  return config.scrapers.find(s => s.id === scraperId) ?? null;
}

export async function upsertScraper(
  input: Pick<
    ScraperDefinition,
    'id' | 'name' | 'startUrl' | 'steps' | 'settings'
  >,
): Promise<ScraperDefinition> {
  const { config } = await readScrapingConfig();

  const existingIdx = config.scrapers.findIndex(s => s.id === input.id);
  const timestamp = nowIso();

  if (existingIdx >= 0) {
    const next: ScraperDefinition = {
      ...config.scrapers[existingIdx],
      name: input.name,
      startUrl: input.startUrl,
      steps: input.steps,
      settings: input.settings,
      updatedAt: timestamp,
    };

    const scrapers = [...config.scrapers];
    scrapers[existingIdx] = next;

    await writeScrapingConfig({
      ...config,
      scrapers,
    });

    return next;
  }

  const created: ScraperDefinition = {
    id: input.id,
    name: input.name,
    startUrl: input.startUrl,
    steps: input.steps,
    settings: input.settings,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await writeScrapingConfig({
    ...config,
    scrapers: [created, ...config.scrapers],
  });

  return created;
}

export async function createScraper(
  input: Pick<ScraperDefinition, 'name' | 'startUrl' | 'steps' | 'settings'>,
): Promise<ScraperDefinition> {
  const id = randomUUID();
  return upsertScraper({ id, ...input });
}

export async function listScraperFixtures(): Promise<ScraperFixture[]> {
  const { config } = await readScrapingConfig();
  return config.fixtures;
}

export async function createScraperFixture(
  input: Pick<ScraperFixture, 'name' | 'steps' | 'description' | 'sourceScraperId'>,
): Promise<ScraperFixture> {
  const { config } = await readScrapingConfig();
  const timestamp = nowIso();
  const fixture: ScraperFixture = {
    id: randomUUID(),
    name: input.name,
    steps: input.steps,
    description: input.description,
    sourceScraperId: input.sourceScraperId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await writeScrapingConfig({
    ...config,
    fixtures: [fixture, ...config.fixtures],
  });

  return fixture;
}

export async function deleteScraperFixture(
  fixtureId: string,
): Promise<boolean> {
  const { config } = await readScrapingConfig();
  const before = config.fixtures.length;
  const fixtures = config.fixtures.filter(f => f.id !== fixtureId);
  if (fixtures.length === before) {
    return false;
  }

  await writeScrapingConfig({
    ...config,
    fixtures,
  });
  return true;
}

export async function createRun(scraperId: string): Promise<ScraperRun> {
  const { config } = await readScrapingConfig();
  const scraper = config.scrapers.find(s => s.id === scraperId);
  if (!scraper) {
    throw new Error('Scraper not found');
  }

  const runId = randomUUID();
  const run: ScraperRun = {
    id: runId,
    scraperId,
    status: 'running',
    startedAt: nowIso(),
    steps: scraper.steps.map(step => ({
      stepId: step.id,
      status: 'pending',
    })),
    results: {},
  };

  await writeScrapingConfig({
    ...config,
    runs: [run, ...config.runs],
  });

  return run;
}

export async function getRun(runId: string): Promise<ScraperRun | null> {
  const { config } = await readScrapingConfig();
  return config.runs.find(r => r.id === runId) ?? null;
}

export async function listRuns(scraperId?: string): Promise<ScraperRun[]> {
  const { config } = await readScrapingConfig();
  return scraperId
    ? config.runs.filter(r => r.scraperId === scraperId)
    : config.runs;
}

export async function appendRunEvent(
  event: Omit<ScraperRunEvent, 'id' | 'createdAt'> & {
    id?: string;
    createdAt?: string;
  },
) {
  const { config } = await readScrapingConfig();
  const nextEvent: ScraperRunEvent = {
    id: event.id ?? randomUUID(),
    createdAt: event.createdAt ?? nowIso(),
    runId: event.runId,
    scraperId: event.scraperId,
    type: event.type,
    payload: event.payload,
  };

  await writeScrapingConfig({
    ...config,
    events: [nextEvent, ...config.events].slice(0, 2000),
  });

  return nextEvent;
}

export async function listRunEvents(runId: string): Promise<ScraperRunEvent[]> {
  const { config } = await readScrapingConfig();
  return config.events.filter(e => e.runId === runId);
}

export async function updateRun(
  runId: string,
  patch: Partial<ScraperRun>,
): Promise<ScraperRun> {
  const { config } = await readScrapingConfig();
  const idx = config.runs.findIndex(r => r.id === runId);
  if (idx < 0) throw new Error('Run not found');

  const next: ScraperRun = {
    ...config.runs[idx],
    ...patch,
  };

  const runs = [...config.runs];
  runs[idx] = next;

  await writeScrapingConfig({
    ...config,
    runs,
  });

  return next;
}

export async function updateRunStep(
  runId: string,
  stepId: string,
  patch: Partial<ScraperRun['steps'][number]>,
): Promise<ScraperRun> {
  const run = await getRun(runId);
  if (!run) throw new Error('Run not found');

  const steps = run.steps.map(s =>
    s.stepId === stepId ? { ...s, ...patch } : s,
  );
  return updateRun(runId, { steps });
}
