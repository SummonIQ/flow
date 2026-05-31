import { NextResponse } from 'next/server';
import { z } from 'zod';

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

const suggestionSchema = z.object({
  name: z.string().min(1),
  type: z.literal('query'),
  selector: z.string().min(1),
  attribute: z.string().optional(),
  outputKey: z.string().min(1),
});

const outputSchema = z.object({
  suggestions: z.array(suggestionSchema).default([]),
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

function heuristicSuggestions() {
  return {
    suggestions: [
      {
        name: 'Page title (H1)',
        type: 'query' as const,
        selector: 'h1',
        outputKey: 'title',
      },
      {
        name: 'OG Title',
        type: 'query' as const,
        selector: 'meta[property="og:title"]',
        attribute: 'content',
        outputKey: 'og_title',
      },
      {
        name: 'OG Description',
        type: 'query' as const,
        selector: 'meta[property="og:description"]',
        attribute: 'content',
        outputKey: 'og_description',
      },
    ],
  };
}

function buildPrompt(input: z.infer<typeof inputSchema>) {
  const system =
    'You are a precise HTML analysis assistant. Suggest practical CSS selectors to scrape useful fields from a webpage.';

  const user = [
    'Return JSON only (no markdown) in this shape:',
    '{ "suggestions": [{ "name": string, "type": "query", "selector": string, "attribute": string?, "outputKey": string }] }',
    '',
    'Rules:',
    '- Only suggest selectors that are likely to work with document.querySelector().',
    '- Prefer stable selectors (data-* attributes, semantic structure) over brittle ones.',
    '- outputKey should be a short snake_case identifier.',
    '- Suggest between 3 and 12 items.',
    '',
    input.url ? `URL: ${input.url}` : null,
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
    const heuristic = heuristicSuggestions();
    const validated = outputSchema.safeParse(heuristic);
    return NextResponse.json({
      mode: 'template',
      warning: OPENAI_API_KEY_ERROR,
      suggestions: validated.success ? validated.data.suggestions : [],
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
      max_tokens: 900,
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

    return NextResponse.json({ mode: 'ai', suggestions: validated.data.suggestions });
  } catch (error) {
    console.error('[api/scrapers/suggest] error', error);
    return NextResponse.json(
      { error: 'AI suggest failed' },
      {
        status: 500,
      },
    );
  }
}
