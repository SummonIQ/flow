'use client';

import {
  Button,
  Report,
  type ReportColumnDefinition,
} from '@summoniq/applab-ui';
import { Plus, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { NewScraperModal } from '@/app/scrapers/components/new-scraper-modal';
import {
  Page,
  PageActions,
  PageBody,
  PageDescription,
  PageHeader,
  PageTitle,
} from '@/components/ui/page-layout';

type ScraperStep = {
  id: string;
  name: string;
  type: 'navigate' | 'extractHtml' | 'query' | 'click' | 'type' | 'condition';
  delayMs?: number;
  url?: string;
  selector?: string;
  attribute?: string;
  outputKey?: string;
  tagName?: string;
  idAttr?: string;
  classes?: string[];
  text?: string;
  href?: string;
  value?: string;
  pressEnter?: boolean;
  sourceKey?: string;
  operator?:
    | 'exists'
    | 'notExists'
    | 'equals'
    | 'notEquals'
    | 'contains'
    | 'notContains';
  onFalse?: 'continue' | 'skipNext' | 'branch' | 'fail';
};

type ScraperDefinition = {
  id: string;
  name: string;
  startUrl: string;
  steps: ScraperStep[];
  settings?: {
    stepDelayMs?: number;
    cursorJitter?: boolean;
    cursorMove?: boolean;
    scrollNudge?: boolean;
    viewportWidth?: number;
    viewportHeight?: number;
  };
  createdAt: string;
  updatedAt: string;
};

export default function ScrapersPage() {
  const router = useRouter();

  const [scrapers, setScrapers] = useState<ScraperDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const columns = useMemo<ReportColumnDefinition<ScraperDefinition>[]>(
    () => [
      {
        header: 'Scraper',
        key: 'name',
        sortable: true,
        cellFn: scraper => (
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{scraper.name}</span>
            <span className="text-xs text-muted-foreground">
              {scraper.startUrl}
            </span>
          </div>
        ),
      },
      {
        header: 'Updated',
        key: 'updatedAt',
        sortable: true,
        cellFn: scraper => (
          <span className="text-sm text-muted-foreground">
            {new Date(scraper.updatedAt).toLocaleString()}
          </span>
        ),
      },
    ],
    [],
  );


  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch('/api/scrapers');
      if (!resp.ok) {
        setError('Failed to load scrapers');
        return;
      }
      const json = await resp.json();
      const next = Array.isArray(json?.scrapers)
        ? (json.scrapers as ScraperDefinition[])
        : [];
      setScrapers(next);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Page>
      <PageHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <PageTitle>Scrapers</PageTitle>
            <PageDescription>
              Create and manage scraper definitions
            </PageDescription>
          </div>
          <PageActions>
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setShowNew(true)}>
              <Plus className="h-4 w-4" />
              New
            </Button>
          </PageActions>
        </div>
      </PageHeader>

      <PageBody className="p-0">
        <div className="flex-1 overflow-auto p-6">
          {error ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <Report<ScraperDefinition>
            className="h-auto"
            data={scrapers}
            definition={{
              columns,
              data: scrapers,
              view: 'table' as any,
              sortBy: 'updatedAt',
              activeFilters: [],
              filters: [],
            }}
            search={true}
            isLoading={loading}
            onRowClick={scraper => router.push(`/scrapers/${scraper.id}`)}
            emptyState={{
              title: 'No scrapers yet',
              description: 'Create a scraper to start collecting data.',
              actions: (
                <Button size="sm" onClick={() => setShowNew(true)}>
                  <Plus className="h-4 w-4" />
                  New scraper
                </Button>
              ),
            }}
          />

        </div>
      </PageBody>

      <NewScraperModal
        open={showNew}
        onOpenChange={setShowNew}
        onCreated={scraper => {
          router.push(`/scrapers/${scraper.id}`);
        }}
      />
    </Page>
  );
}
