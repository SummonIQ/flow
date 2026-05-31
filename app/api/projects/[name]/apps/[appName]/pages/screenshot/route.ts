import { normalizeRoutePath } from '@/lib/studio/codegen';
import { chromium } from '@playwright/test';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const DEFAULT_VIEWPORT = { width: 960, height: 720 };
const SCREENSHOT_TIMEOUT_MS = 15000;

const querySchema = z.object({
  route: z.string().optional().default('/'),
  port: z.coerce.number().int().min(1).max(65535),
  width: z.coerce.number().int().min(320).max(1920).optional(),
  height: z.coerce.number().int().min(240).max(1440).optional(),
});

const hasDynamicSegments = (route: string) => /\[.+?\]|:[^/]+/.test(route);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string; appName: string }> },
): Promise<NextResponse> {
  await params;
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request parameters', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { route, port, width, height } = parsed.data;
  const normalizedRoute = normalizeRoutePath(route);

  if (hasDynamicSegments(normalizedRoute)) {
    return NextResponse.json(
      {
        error: 'Dynamic routes require parameters',
        details: `Preview not available for ${normalizedRoute}`,
      },
      { status: 400 },
    );
  }

  const targetUrl = `http://localhost:${port}${normalizedRoute}`;
  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await browser.newContext({
      viewport: {
        width: width ?? DEFAULT_VIEWPORT.width,
        height: height ?? DEFAULT_VIEWPORT.height,
      },
    });
    const page = await context.newPage();
    await page.goto(targetUrl, {
      waitUntil: 'networkidle',
      timeout: SCREENSHOT_TIMEOUT_MS,
    });
    await page.waitForTimeout(250);

    const screenshot = await page.screenshot({ type: 'png' });
    await context.close();
    await browser.close();
    browser = null;

    const body = new Uint8Array(screenshot);

    return new NextResponse(body, {
      headers: {
        'content-type': 'image/png',
        'cache-control': 'no-store',
      },
    });
  } catch (error) {
    if (browser) {
      await browser.close().catch(() => null);
    }

    return NextResponse.json(
      {
        error: 'Failed to capture screenshot',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
