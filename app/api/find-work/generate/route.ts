import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getOpenAIClient,
  getOpenAIKey,
  OPENAI_API_KEY_ERROR,
} from '@/lib/openai/client';
import { OPENAI_CHAT_MODEL_DEFAULT } from '@/lib/openai/config';

const schema = z.object({
  kind: z.enum(['linkedin_post', 'cold_email', 'linkedin_dm', 'upwork_proposal']),
  context: z.object({
    niche: z.string().min(1).max(160),
    outcome: z.string().min(1).max(200),
    target: z.string().min(1).max(120),
    offer: z.string().min(1).max(200),
    proof: z.string().optional().default(''),
    tone: z
      .enum(['friendly', 'direct', 'consultative', 'technical'])
      .optional()
      .default('consultative'),
  }),
});

function templateFor(
  kind: z.infer<typeof schema>['kind'],
  ctx: z.infer<typeof schema>['context'],
): string {
  const subject = `Quick idea for ${ctx.target}: ${ctx.outcome}`;
  const proofLine = ctx.proof?.trim()
    ? `\nProof: ${ctx.proof.trim()}\n`
    : '\n';

  if (kind === 'linkedin_post') {
    return [
      `I keep seeing ${ctx.target} teams struggle with:`,
      `→ ${ctx.outcome}`,
      ``,
      `If you're in ${ctx.niche}, here's a simple approach we use:`,
      `1) Audit the bottleneck (1 hour)`,
      `2) Ship a focused fix in ${ctx.offer}`,
      `3) Measure impact + iterate`,
      ``,
      proofLine.trim() ? proofLine.trim() : '',
      `If you'd like, reply “${ctx.niche}” and I’ll share a quick checklist.`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  if (kind === 'linkedin_dm') {
    return [
      `Hey {{firstName}} — quick question.`,
      ``,
      `When you think about ${ctx.target}, is ${ctx.outcome} on your roadmap right now?`,
      proofLine.trim() ? `\n${proofLine.trim()}\n` : ``,
      `If it’s helpful, I can share a 1-page plan for how we deliver ${ctx.offer} with minimal disruption.`,
      ``,
      `Worth sending?`,
      `— {{yourName}}`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  if (kind === 'upwork_proposal') {
    return [
      `Hi {{clientName}},`,
      ``,
      `I can help you with ${ctx.outcome}. Here’s how I’d approach it:`,
      `- Clarify success criteria + constraints (30–45 min)`,
      `- Ship an initial version within ${ctx.offer}`,
      `- Iterate based on feedback + metrics`,
      proofLine.trim() ? `\n${proofLine.trim()}\n` : ``,
      `Questions:`,
      `1) What does “done” look like for you?`,
      `2) Any existing stack constraints?`,
      `3) Deadline / must-have features?`,
      ``,
      `If you want, share a bit of context and I’ll propose a tight scope + timeline.`,
      `— {{yourName}}`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  // cold_email
  return [
    `Subject: ${subject}`,
    ``,
    `Hey {{firstName}},`,
    ``,
    `Not sure if you're the right person for ${ctx.target}, but I noticed many ${ctx.niche} teams hit ${ctx.outcome}.`,
    ``,
    `We help teams by ${ctx.offer}.`,
    proofLine.trim() ? `\n${proofLine.trim()}\n` : ``,
    `Would it be crazy to explore if this is a priority this quarter?`,
    ``,
    `If yes, I can send 2–3 options for a tiny starter engagement.`,
    `— {{yourName}}`,
  ]
    .filter(Boolean)
    .join('\n');
}

function buildPrompt(
  kind: z.infer<typeof schema>['kind'],
  ctx: z.infer<typeof schema>['context'],
): { system: string; user: string } {
  const system =
    'You are an expert at selling software engineering consulting services. Write concise, high-converting outreach that feels human (no hype), specific, and easy to copy/paste. Avoid buzzwords. Avoid emojis unless explicitly asked.';

  const formatHints =
    kind === 'linkedin_post'
      ? 'Write a LinkedIn post. 6–12 lines. Use short lines. Include one concrete tip, one CTA.'
      : kind === 'linkedin_dm'
        ? 'Write a LinkedIn DM. Max 650 characters. One question. Friendly and direct.'
        : kind === 'upwork_proposal'
          ? 'Write an Upwork proposal. ~150–250 words. Include approach + 3 clarifying questions.'
          : 'Write a cold email. Include a subject line. ~120–180 words. Ask one question.';

  const tone =
    ctx.tone === 'direct'
      ? 'direct'
      : ctx.tone === 'friendly'
        ? 'friendly'
        : ctx.tone === 'technical'
          ? 'technical but readable'
          : 'consultative';

  const user = [
    `${formatHints}`,
    ``,
    `Context:`,
    `- Niche: ${ctx.niche}`,
    `- Target: ${ctx.target}`,
    `- Outcome/problem: ${ctx.outcome}`,
    `- Offer: ${ctx.offer}`,
    ctx.proof?.trim() ? `- Proof: ${ctx.proof.trim()}` : null,
    `- Tone: ${tone}`,
    ``,
    `Return ONLY the final message text (no markdown, no commentary).`,
  ]
    .filter(Boolean)
    .join('\n');

  return { system, user };
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { kind, context } = parsed.data;

  // If no OpenAI key, return a high-quality template (still copy/pasteable).
  if (!getOpenAIKey()) {
    return NextResponse.json({
      mode: 'template',
      warning: OPENAI_API_KEY_ERROR,
      text: templateFor(kind, context),
    });
  }

  try {
    const openai = getOpenAIClient();
    const prompt = buildPrompt(kind, context);

    const resp = await openai.chat.completions.create({
      model: OPENAI_CHAT_MODEL_DEFAULT,
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
      temperature: 0.7,
      max_tokens: 450,
    });

    const text = resp.choices[0]?.message?.content?.trim();
    if (!text) {
      return NextResponse.json(
        { error: 'No content generated', mode: 'ai' },
        { status: 500 },
      );
    }

    return NextResponse.json({ mode: 'ai', text });
  } catch (err) {
    console.error('[find-work/generate] error', err);
    return NextResponse.json({
      mode: 'template',
      warning: 'AI generation failed. Falling back to a template.',
      text: templateFor(kind, context),
    });
  }
}

