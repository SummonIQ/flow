'use server';

/**
 * Analytics Server Actions
 * Fetch analytics data from the analytics backend
 */

const ANALYTICS_API_URL = process.env.ANALYTICS_API_URL;

const DEFAULT_DEV_ANALYTICS_API_URL = 'http://localhost:20000';

function joinUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function getAnalyticsApiUrl():
  | { success: true; url: string }
  | { success: false; error: string } {
  if (ANALYTICS_API_URL) {
    return { success: true, url: ANALYTICS_API_URL };
  }

  if (process.env.NODE_ENV !== 'production') {
    return { success: true, url: DEFAULT_DEV_ANALYTICS_API_URL };
  }

  return {
    success: false,
    error:
      'Analytics is not configured. Set ANALYTICS_API_URL (server-side) to your analytics service origin.',
  };
}

export interface AnalyticsSummary {
  totalPageViews: number;
  uniqueVisitors: number;
  totalSessions: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: Array<{ path: string; views: number; uniqueViews: number }>;
  topReferrers: Array<{ referrer: string; visits: number }>;
  topCountries: Array<{ country: string; visits: number }>;
  deviceBreakdown: { mobile: number; tablet: number; desktop: number };
  browserBreakdown: Record<string, number>;
  eventsOverTime: Array<{ date: string; pageViews: number; visitors: number }>;
}

export interface AnalyticsEvent {
  id: string;
  name: string;
  type: string;
  timestamp: number;
  context: {
    page: {
      path: string;
      title: string;
    };
  };
  properties?: Record<string, unknown>;
}

export interface FetchAnalyticsResult {
  success: boolean;
  data?: AnalyticsSummary;
  error?: string;
}

export interface FetchEventsResult {
  success: boolean;
  data?: {
    events: AnalyticsEvent[];
    total: number;
  };
  error?: string;
}

/**
 * Fetch analytics summary for a given app
 */
export async function fetchAnalyticsSummary(
  appId: string,
  from?: number,
  to?: number,
): Promise<FetchAnalyticsResult> {
  let resolvedAnalyticsUrl: ReturnType<typeof getAnalyticsApiUrl> | null = null;
  try {
    resolvedAnalyticsUrl = getAnalyticsApiUrl();
    if (!resolvedAnalyticsUrl.success) {
      return { success: false, error: resolvedAnalyticsUrl.error };
    }

    const now = Date.now();
    const defaultFrom = now - 30 * 24 * 60 * 60 * 1000; // 30 days ago

    const params = new URLSearchParams({
      appId,
      from: String(from ?? defaultFrom),
      to: String(to ?? now),
    });

    const requestUrl = `${joinUrl(resolvedAnalyticsUrl.url, '/api/summary')}?${params}`;
    const response = await fetch(requestUrl, {
      headers: {
        // Skip auth for internal server-to-server calls in dev
        'x-api-key': process.env.ANALYTICS_API_KEY || 'internal-key',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error:
          errorData.error || `Failed to fetch analytics: ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : 'Failed to fetch analytics';

    const isFetchFailed =
      error instanceof TypeError && /fetch failed/i.test(error.message);

    if (isFetchFailed && resolvedAnalyticsUrl?.success) {
      const isDefaultDevUrl =
        resolvedAnalyticsUrl.url === DEFAULT_DEV_ANALYTICS_API_URL &&
        !ANALYTICS_API_URL;

      return {
        success: false,
        error: isDefaultDevUrl
          ? `Analytics backend is not running at ${resolvedAnalyticsUrl.url}. Set ANALYTICS_API_URL or start the analytics service.`
          : `Failed to reach analytics service at ${resolvedAnalyticsUrl.url}: ${message}`,
      };
    }

    console.error('[Analytics] Failed to fetch summary:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to fetch analytics',
    };
  }
}

/**
 * Fetch recent events for a given app
 */
export async function fetchRecentEvents(
  appId: string,
  limit = 10,
): Promise<FetchEventsResult> {
  let resolvedAnalyticsUrl: ReturnType<typeof getAnalyticsApiUrl> | null = null;
  try {
    resolvedAnalyticsUrl = getAnalyticsApiUrl();
    if (!resolvedAnalyticsUrl.success) {
      return { success: false, error: resolvedAnalyticsUrl.error };
    }

    const params = new URLSearchParams({
      appId,
      limit: String(limit),
    });

    const requestUrl = `${joinUrl(resolvedAnalyticsUrl.url, '/api/events')}?${params}`;
    const response = await fetch(requestUrl, {
      headers: {
        'x-api-key': process.env.ANALYTICS_API_KEY || 'internal-key',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `Failed to fetch events: ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : 'Failed to fetch events';

    const isFetchFailed =
      error instanceof TypeError && /fetch failed/i.test(error.message);

    if (isFetchFailed && resolvedAnalyticsUrl?.success) {
      const isDefaultDevUrl =
        resolvedAnalyticsUrl.url === DEFAULT_DEV_ANALYTICS_API_URL &&
        !ANALYTICS_API_URL;

      return {
        success: false,
        error: isDefaultDevUrl
          ? `Analytics backend is not running at ${resolvedAnalyticsUrl.url}. Set ANALYTICS_API_URL or start the analytics service.`
          : `Failed to reach analytics service at ${resolvedAnalyticsUrl.url}: ${message}`,
      };
    }

    console.error('[Analytics] Failed to fetch events:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch events',
    };
  }
}
