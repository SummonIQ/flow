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

const jobSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    paymentVerified: z.boolean().optional(),
    clientSpent: z.string().optional(),
    proposals: z.string().optional(),
    posted: z.string().optional(),
    budgetLine: z.string().optional(),
    budgetType: z.string().optional(),
    experienceLevel: z.string().optional(),
    budgetEstimate: z.string().optional(),
    bids: z.string().optional(),
    avgBid: z.string().optional(),
  })
  .optional();

const detailSchema = z
  .object({
    connectsRequired: z.number().int().optional(),
    duration: z.string().optional(),
    projectType: z.string().optional(),
    location: z.string().optional(),
    activity: z.string().optional(),
    clientLocation: z.string().optional(),
    clientJobsPosted: z.number().int().optional(),
    clientHireRate: z.string().optional(),
    clientSpent: z.string().optional(),
    clientHourlyRange: z.string().optional(),
    clientAvgHourly: z.string().optional(),
    clientTotalHires: z.number().int().optional(),
    clientOpenJobs: z.number().int().optional(),
    experienceLevel: z.string().optional(),
    weeklyHours: z.string().optional(),
    hourlyRange: z.string().optional(),
    fixedPrice: z.string().optional(),
    skills: z.array(z.string()).optional(),
  })
  .optional();

const outputSchema = z.object({
  job: jobSchema,
  detail: detailSchema,
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

function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function hasMeaningfulValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'boolean') return true;
  return value !== null && value !== undefined;
}

function hasMeaningfulObject(value: Record<string, unknown> | undefined) {
  if (!value) return false;
  return Object.values(value).some(hasMeaningfulValue);
}

function domExtractDetail(html: string) {
  const $ = load(html);
  const title = cleanText(
    $('[data-test="job-title"]').first().text() || $('h1').first().text(),
  );
  const description = cleanText(
    $('.job-description-line-clamp').first().text() ||
      $('[data-test="job-description"]').first().text() ||
      $('[data-test="job-details"]').first().text() ||
      $('.job-description').first().text() ||
      '',
  );
  const tags = $(
    '[data-test*="skill" i], [data-test*="tag" i], .up-skill-badge, .air3-token',
  )
    .toArray()
    .map(node => cleanText($(node).text()))
    .filter(Boolean)
    .slice(0, 30);

  const text = cleanText($('body').text());
  const postedMatch = text.match(
    /\b\d+\s+(?:minute|hour|day|week|month|year)s?\s+ago\b/i,
  );
  const proposalsMatch = text.match(/\b\d+\s*(?:to\s*\d+)?\s+proposals?\b/i);
  const budgetLineMatch = text.match(/\b(?:Fixed price|Hourly)[^\n]+/i);
  const budgetEstimateMatch = budgetLineMatch?.[0].match(/\$[0-9,.]+/);
  const experienceLevelMatch = text.match(
    /\b(?:Entry level|Intermediate|Expert)\b/i,
  );
  const connectsMatch = text.match(/(\d+)\s+connects?/i);
  const durationMatch = text.match(
    /\b(?:Less than 1 month|1 to 3 months|3 to 6 months|More than 6 months)\b/i,
  );
  const projectTypeMatch = text.match(
    /\b(?:One-time project|Ongoing project)\b/i,
  );
  const weeklyHoursMatch = text.match(
    /\b(?:Less than 30 hrs\/week|More than 30 hrs\/week|No weekly hours|\d+\+? hrs\/week)\b/i,
  );
  const hourlyRangeMatch = text.match(
    /\$[0-9,.]+\s*(?:-|to)\s*\$[0-9,.]+\s*\/\s*hr/i,
  );
  const fixedPriceMatch = text.match(/Fixed price\s*[:\-]?\s*\$[0-9,.]+/i);
  const clientSpentMatch = text.match(/\$[0-9,.]+\s+spent\b/i);
  const clientJobsPostedMatch = text.match(/(\d+)\s+jobs\s+posted\b/i);
  const clientHireRateMatch = text.match(/\b(\d+%\s+hire rate)\b/i);
  const clientTotalHiresMatch = text.match(/(\d+)\s+hires\b/i);
  const clientOpenJobsMatch = text.match(/(\d+)\s+open\s+jobs?\b/i);
  const clientHourlyRangeMatch = text.match(/\$[0-9,.]+\s*\/\s*hr\b/i);

  const job = {
    title: title || undefined,
    description: description || undefined,
    tags: tags.length ? tags : undefined,
    paymentVerified: /payment verified/i.test(text) || undefined,
    clientSpent: clientSpentMatch?.[0],
    proposals: proposalsMatch
      ? proposalsMatch[0].replace(/\s+proposals?/i, '').trim()
      : undefined,
    posted: postedMatch?.[0],
    budgetLine: budgetLineMatch?.[0],
    budgetType: budgetLineMatch
      ? /fixed/i.test(budgetLineMatch[0])
        ? 'fixed'
        : /hourly/i.test(budgetLineMatch[0])
          ? 'hourly'
          : undefined
      : undefined,
    experienceLevel: experienceLevelMatch?.[0],
    budgetEstimate: budgetEstimateMatch?.[0],
  };

  const detail = {
    connectsRequired: connectsMatch
      ? Number.parseInt(connectsMatch[1] || '', 10)
      : undefined,
    duration: durationMatch?.[0],
    projectType: projectTypeMatch?.[0],
    location: undefined,
    activity: undefined,
    clientLocation: undefined,
    clientJobsPosted: clientJobsPostedMatch
      ? Number.parseInt(clientJobsPostedMatch[1] || '', 10)
      : undefined,
    clientHireRate: clientHireRateMatch?.[0],
    clientSpent: clientSpentMatch?.[0],
    clientHourlyRange: clientHourlyRangeMatch?.[0],
    clientAvgHourly: undefined,
    clientTotalHires: clientTotalHiresMatch
      ? Number.parseInt(clientTotalHiresMatch[1] || '', 10)
      : undefined,
    clientOpenJobs: clientOpenJobsMatch
      ? Number.parseInt(clientOpenJobsMatch[1] || '', 10)
      : undefined,
    experienceLevel: experienceLevelMatch?.[0],
    weeklyHours: weeklyHoursMatch?.[0],
    hourlyRange: hourlyRangeMatch?.[0],
    fixedPrice: fixedPriceMatch?.[0]?.replace(/Fixed price\s*[:\-]?\s*/i, ''),
    skills: tags.length ? tags : undefined,
  };

  return { job, detail };
}

function buildPrompt(input: z.infer<typeof inputSchema>) {
  const system =
    'You are a precise HTML extraction engine for Upwork job detail pages.';

  const user = [
    'Return JSON only (no markdown) in this shape:',
    '{ "job": { "title": string, "description": string, "tags": string[], "paymentVerified": boolean, "clientSpent": string, "proposals": string, "posted": string, "budgetLine": string, "budgetType": string, "experienceLevel": string, "budgetEstimate": string, "bids": string, "avgBid": string }, "detail": { "connectsRequired": number, "duration": string, "projectType": string, "location": string, "activity": string, "clientLocation": string, "clientJobsPosted": number, "clientHireRate": string, "clientSpent": string, "clientHourlyRange": string, "clientAvgHourly": string, "clientTotalHires": number, "clientOpenJobs": number, "experienceLevel": string, "weeklyHours": string, "hourlyRange": string, "fixedPrice": string, "skills": string[] } }',
    '',
    'Rules:',
    '- Only use fields visible in the job details view.',
    '- Use empty string or omit if not present.',
    '- skills should be visible skill tags.',
    '- connectsRequired should be a number only.',
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

  const domExtracted = domExtractDetail(input.html);
  const domHasData =
    hasMeaningfulObject(domExtracted.job) ||
    hasMeaningfulObject(domExtracted.detail);

  if (!getOpenAIKey()) {
    return NextResponse.json({
      mode: domHasData ? 'dom' : 'template',
      warning: OPENAI_API_KEY_ERROR,
      job: domExtracted.job ?? {},
      detail: domExtracted.detail ?? {},
    });
  }

  if (domHasData) {
    return NextResponse.json({
      mode: 'dom',
      job: domExtracted.job ?? {},
      detail: domExtracted.detail ?? {},
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
      max_tokens: 1200,
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

    return NextResponse.json({ mode: 'ai', ...validated.data });
  } catch (error) {
    console.error('[upwork-guide/extract-details] error', error);
    return NextResponse.json(
      { error: 'AI extraction failed' },
      {
        status: 500,
      },
    );
  }
}
