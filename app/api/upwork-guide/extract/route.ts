import { NextResponse } from 'next/server';
import { z } from 'zod';
import { load } from 'cheerio';

import {
  getOpenAIClient,
  getOpenAIKey,
  OPENAI_API_KEY_ERROR,
} from '@/lib/openai/client';
import { OPENAI_CHAT_MODEL_DEFAULT } from '@/lib/openai/config';

const inputSchema = z.object({
  url: z.string().optional().default(''),
  html: z.string().min(1).max(300_000),
});

const itemSchema = z.object({
  url: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().default(''),
  source: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  paymentVerified: z.boolean().optional(),
  clientSpent: z.string().optional(),
  proposals: z.string().optional(),
  posted: z.string().optional(),
  budgetLine: z.string().optional(),
  budgetType: z.string().optional(),
  experienceLevel: z.string().optional(),
  budgetEstimate: z.string().optional(),
});

const outputSchema = z.object({
  items: z.array(itemSchema).default([]),
});

function safeJsonParse(raw: string): unknown {
  const trimmed = raw.trim();
  const noFences = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(noFences);
  } catch {
    return null;
  }
}

function normalizeUrl(input: string, pageUrl: string): string {
  const raw = input.trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('//')) return `https:${raw}`;
  if (raw.startsWith('/')) return `https://www.upwork.com${raw}`;

  try {
    return new URL(raw, pageUrl || 'https://www.upwork.com').toString();
  } catch {
    return raw;
  }
}

function looksLikeJobUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const path = u.pathname || '';
    if (!/\.upwork\.com$/i.test(u.hostname)) return false;
    if (path.startsWith('/nx/jobs/search')) return false;
    if (path.startsWith('/jobs/search')) return false;
    if (!path.includes('/jobs/')) return false;
    if (path.includes('~')) return true;
    if (/\d{6,}/.test(path)) return true;
    return false;
  } catch {
    return false;
  }
}

function cleanTitle(title: string): string {
  return title.replace(/\s+/g, ' ').trim();
}

function domExtract(html: string, pageUrl: string) {
  const $ = load(html);
  const items: Array<{
    url: string;
    title: string;
    description: string;
    source: string;
    tags?: string[];
    paymentVerified?: boolean;
    clientSpent?: string;
    proposals?: string;
    posted?: string;
    budgetLine?: string;
    budgetType?: string;
    experienceLevel?: string;
    budgetEstimate?: string;
  }> = [];
  const seen = new Set<string>();
  const cardSelectors = [
    '[data-test="job-tile"]',
    '[data-test*="job-tile" i]',
    '[data-test*="job-card" i]',
    '.job-tile',
  ];

  $(cardSelectors.join(',')).each((_idx, card) => {
    if (items.length >= 30) return;
    const $card = $(card);
    const link = $card.find('a[href*="/jobs/"]').first();
    const href = normalizeUrl(link.attr('href') || '', pageUrl);
    if (!href || !looksLikeJobUrl(href)) return;
    if (seen.has(href)) return;

    const title = cleanTitle(
      link.text() ||
        $card.find('[data-test="job-title"]').text() ||
        $card.find('h3').first().text(),
    );
    if (!title) return;

    const description = cleanTitle(
      $card.find('.job-description-line-clamp').text() ||
        $card.find('[data-test="job-description"]').text() ||
        '',
    );

    const tags = $card
      .find(
        '[data-test*="skill" i], [data-test*="tag" i], .up-skill-badge, .air3-token',
      )
      .toArray()
      .map(node => cleanTitle($(node).text()))
      .filter(Boolean)
      .slice(0, 30);

    const text = cleanTitle($card.text());
    const postedMatch = text.match(
      /\b\d+\s+(?:minute|hour|day|week|month|year)s?\s+ago\b/i,
    );
    const budgetMatch = text.match(/\b(?:Fixed price|Hourly)[^\n]+/i);
    const budgetEstimateMatch = text.match(/\$[0-9,.]+/);
    const proposalsMatch = text.match(/\b\d+\s*(?:to\s*\d+)?\s+proposals?\b/i);

    items.push({
      url: href,
      title,
      description,
      source: 'dom',
      tags,
      paymentVerified: /payment verified/i.test(text) || undefined,
      clientSpent: text.match(/\$[0-9,.]+\s+spent\b/i)?.[0] || undefined,
      proposals: proposalsMatch
        ? proposalsMatch[0].replace(/\s+proposals?/i, '').trim()
        : undefined,
      posted: postedMatch ? postedMatch[0] : undefined,
      budgetLine: budgetMatch ? budgetMatch[0] : undefined,
      budgetType: budgetMatch
        ? /fixed/i.test(budgetMatch[0])
          ? 'fixed'
          : /hourly/i.test(budgetMatch[0])
            ? 'hourly'
            : undefined
        : undefined,
      experienceLevel: text.match(
        /\b(?:Entry level|Intermediate|Expert)\b/i,
      )?.[0],
      budgetEstimate: budgetEstimateMatch ? budgetEstimateMatch[0] : undefined,
    });
    seen.add(href);
  });

  return { items };
}

function heuristicExtract(html: string, pageUrl: string) {
  const anchors = Array.from(
    html.matchAll(
      /<a\s+[^>]*href\s*=\s*"([^"]+)"[^>]*>([\s\S]{0,400}?)<\/a>/gi,
    ),
  );

  const banned = [
    'saved jobs',
    'go to page',
    'current page',
    'advanced search',
    'sign in',
    'log in',
  ];

  const items: Array<{
    url: string;
    title: string;
    description: string;
    source: string;
  }> = [];
  const seen = new Set<string>();

  for (const match of anchors) {
    const href = normalizeUrl(match[1] ?? '', pageUrl);
    if (!href || !looksLikeJobUrl(href)) continue;

    const text = (match[2] ?? '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();

    const title = cleanTitle(text);
    if (title.length < 16) continue;

    const lower = title.toLowerCase();
    if (banned.some(b => lower.includes(b))) continue;

    if (seen.has(href)) continue;
    seen.add(href);

    items.push({ url: href, title, description: '', source: 'heuristic' });
    if (items.length >= 30) break;
  }

  return { items };
}

function buildPrompt(input: z.infer<typeof inputSchema>) {
  const system =
    'You are a precise HTML extraction engine. Your job is to extract real Upwork job posting cards from raw HTML.';

  const user = [
    'Return JSON only (no markdown) in this shape:',
    '{ "items": [{ "url": string, "title": string, "description": string, "tags": string[], "paymentVerified": boolean, "clientSpent": string, "proposals": string, "posted": string, "budgetLine": string, "budgetType": string, "experienceLevel": string, "budgetEstimate": string }] }',
    '',
    'Rules:',
    '- ONLY include real job postings from Upwork job search/listing pages.',
    '- EXCLUDE navigation, pagination, saved-jobs headers, filters, category links, and any non-job links.',
    '- Each url MUST point to a specific job posting (NOT /nx/jobs/search).',
    '- Each url MUST contain "/jobs/" and must not contain "/jobs/search".',
    '- Prefer job urls that include a stable job token (often contains "~" in the path).',
    '- Title should be the job title as shown on the card (not truncated pagination labels).',
    '- Description should be the short summary from the card if present; otherwise empty string.',
    '- tags should be the visible skill/category chips on the card (if present).',
    '- paymentVerified should be true if the card shows "Payment verified".',
    '- clientSpent should capture the exact "$X spent" string if present, else empty string.',
    '- proposals should capture the proposals range like "5 to 10" if present (no extra words).',
    '- posted should capture the relative time like "2 months ago" if present (no extra words).',
    '- budgetLine should capture the full budget snippet like "Fixed price - Intermediate - Est. budget: $200" if present.',
    '- budgetType should be "fixed" or "hourly" if present.',
    '- experienceLevel should be "Entry level" / "Intermediate" / "Expert" if present.',
    '- budgetEstimate should capture the currency amount (e.g. "$200.00") if present.',
    '- Return up to 30 items.',
    '',
    input.url ? `Page URL: ${input.url}` : null,
    'HTML:',
    input.html,
  ]
    .filter(Boolean)
    .join('\n');

  return { system, user };
}

export async function POST(req: Request) {
  const parsed = inputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;

  if (!getOpenAIKey()) {
    const dom = domExtract(input.html, input.url);
    const fallback = dom.items.length
      ? dom
      : heuristicExtract(input.html, input.url);
    const validated = outputSchema.safeParse(fallback);
    return NextResponse.json({
      mode: 'template',
      warning: OPENAI_API_KEY_ERROR,
      items: validated.success ? validated.data.items : [],
    });
  }

  try {
    const openai = getOpenAIClient();
    const prompt = buildPrompt(input);

    const resp = await openai.chat.completions.create({
      model: OPENAI_CHAT_MODEL_DEFAULT,
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
      temperature: 0.2,
      max_tokens: 1400,
    });

    const raw = resp.choices[0]?.message?.content?.trim() ?? '';
    const json = safeJsonParse(raw);
    const validated = outputSchema.safeParse(json);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: 'AI response malformed',
          details: validated.error.flatten(),
        },
        { status: 500 },
      );
    }

    const items = validated.data.items
      .map(item => ({
        ...item,
        url: normalizeUrl(item.url, input.url),
        title: cleanTitle(item.title),
        description: (item.description ?? '').toString(),
        tags: Array.isArray(item.tags)
          ? item.tags
              .map(t => (typeof t === 'string' ? t.trim() : ''))
              .filter(Boolean)
              .slice(0, 30)
          : [],
        clientSpent: (item.clientSpent ?? '').toString(),
        proposals: (item.proposals ?? '').toString(),
        posted: (item.posted ?? '').toString(),
        budgetLine: (item.budgetLine ?? '').toString(),
        budgetType: (item.budgetType ?? '').toString(),
        experienceLevel: (item.experienceLevel ?? '').toString(),
        budgetEstimate: (item.budgetEstimate ?? '').toString(),
        source: 'ai',
      }))
      .filter(item => item.url && item.title)
      .filter(item => looksLikeJobUrl(item.url));

    if (!items.length) {
      const dom = domExtract(input.html, input.url);
      const validatedDom = outputSchema.safeParse(dom);
      return NextResponse.json({
        mode: 'template',
        items: validatedDom.success ? validatedDom.data.items : [],
      });
    }

    return NextResponse.json({ mode: 'ai', items });
  } catch (error) {
    console.error('[upwork-guide/extract] error', error);
    return NextResponse.json(
      { error: 'AI extraction failed' },
      {
        status: 500,
      },
    );
  }
}
