import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  getOpenAIClient,
  getOpenAIKey,
  OPENAI_API_KEY_ERROR,
} from '@/lib/openai/client';
import { OPENAI_CHAT_MODEL_DEFAULT } from '@/lib/openai/config';
import { prisma } from '@/lib/db/prisma';

const inputSchema = z.object({
  teamId: z.string().min(1),
  jobId: z.string().optional(),
  jobUrl: z.string().optional().default(''),
  jobTitle: z.string().min(1).max(160),
  jobDescription: z.string().min(1).max(8000),
  skills: z.string().optional().default(''),
  budgetType: z.enum(['hourly', 'fixed']).default('fixed'),
  budget: z.string().optional().default(''),
  targetRate: z.string().optional().default(''),
  estimatedHours: z.string().optional().default(''),
  timeline: z.string().optional().default(''),
  offer: z.string().optional().default(''),
  proof: z.string().optional().default(''),
  feedback: z.string().optional().default(''),
  tone: z
    .enum(['consultative', 'direct', 'friendly', 'technical'])
    .default('consultative'),
});

const outputSchema = z.object({
  proposal: z.string().min(1),
  bid: z.string().min(1),
  questions: z.array(z.string()).default([]),
  milestones: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
});

function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function parseNumber(value: string): number | null {
  const normalized = value.replace(/[^0-9.]/g, '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildTemplateBid(input: z.infer<typeof inputSchema>): string {
  const rate = parseNumber(input.targetRate);
  const hours = parseNumber(input.estimatedHours);

  if (input.budgetType === 'hourly') {
    return rate
      ? `$${rate}/hr (aligned to scope)`
      : 'Hourly rate based on scope';
  }
  if (rate && hours) {
    const subtotal = Math.round(rate * hours);
    return `$${subtotal.toLocaleString()} fixed (est. ${hours}h @ $${rate}/hr)`;
  }
  if (input.budget) {
    return `${input.budget} (aligning to scope)`;
  }
  return 'Fixed price based on scope';
}

function buildTemplate(input: z.infer<typeof inputSchema>) {
  const proofLine = input.proof?.trim()
    ? `\nProof: ${input.proof.trim()}\n`
    : '\n';
  const proposal = [
    `Hi there—thanks for sharing the details for "${input.jobTitle}".`,
    ``,
    `I can help you deliver this with a clear scope and fast feedback loops.`,
    `Here’s how I’d approach it:`,
    `- Clarify success criteria + constraints (short kickoff)`,
    `- Ship a first pass quickly, then iterate`,
    `- Add basic quality checks + documentation`,
    proofLine.trim() ? proofLine.trim() : '',
    input.offer?.trim() ? `Offer: ${input.offer.trim()}` : '',
    input.timeline?.trim() ? `Timeline: ${input.timeline.trim()}` : '',
    ``,
    `Questions:`,
    `1) What does “done” look like for you?`,
    `2) Any stack constraints or integrations?`,
    `3) Are there example links or references you like?`,
    ``,
    `If helpful, I can propose a tight scope + timeline after a quick call.`,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    proposal,
    bid: buildTemplateBid(input),
    questions: [
      'What does success look like for this project?',
      'Any stack preferences or constraints I should follow?',
      'Is there a target deadline or launch window?',
    ],
    milestones: [
      'Discovery + scope confirmation',
      'First implementation + review',
      'Final refinements + handoff',
    ],
    highlights: input.proof?.trim()
      ? [input.proof.trim()]
      : ['Relevant experience delivering similar projects'],
  };
}

function buildPrompt(input: z.infer<typeof inputSchema>) {
  const system =
    'You are an expert Upwork proposal writer for software consulting. Write concise, human, specific proposals. No fluff. No emojis unless asked. Respect the client budget if provided.';

  const user = [
    'Return JSON only (no markdown) with this shape:',
    '{ "proposal": string, "bid": string, "questions": string[], "milestones": string[], "highlights": string[] }',
    '',
    'Guidance:',
    '- Proposal length: 150-250 words.',
    '- Bid should be a short string with a range or specific number.',
    '- Questions: 3 concise items.',
    '- Milestones: 3 concise items.',
    '- Highlights: 2-4 proof bullets.',
    '',
    input.feedback?.trim()
      ? `User feedback for regeneration (follow this): ${input.feedback.trim()}`
      : null,
    '',
    'Context:',
    `- Job title: ${input.jobTitle}`,
    `- Job description: ${input.jobDescription}`,
    input.skills?.trim() ? `- Skills/stack: ${input.skills.trim()}` : null,
    input.budget?.trim()
      ? `- Client budget/range: ${input.budget.trim()}`
      : null,
    input.timeline?.trim() ? `- Timeline: ${input.timeline.trim()}` : null,
    input.offer?.trim() ? `- Offer: ${input.offer.trim()}` : null,
    input.proof?.trim() ? `- Proof: ${input.proof.trim()}` : null,
    `- Bid type: ${input.budgetType}`,
    input.targetRate?.trim()
      ? `- Target rate: ${input.targetRate.trim()}`
      : null,
    input.estimatedHours?.trim()
      ? `- Estimated hours: ${input.estimatedHours.trim()}`
      : null,
    `- Tone: ${input.tone}`,
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

  const persistDraft = async (
    data: z.infer<typeof outputSchema>,
    mode: 'ai' | 'template',
    warning?: string,
  ) => {
    try {
      const status = data.proposal && data.bid ? 'READY' : 'DRAFT';
      if (!input.jobId) {
        return NextResponse.json({
          mode,
          warning,
          ...data,
        });
      }

      const draft = await prisma.$transaction(async tx => {
        const created = await tx.upworkProposalDraft.create({
          data: {
            teamId: input.teamId,
            jobId: input.jobId,
            proposal: data.proposal,
            bid: data.bid,
            questions: data.questions,
            milestones: data.milestones,
            highlights: data.highlights,
            status,
          },
        });

        if (input.jobId) {
          await tx.upworkJob.update({
            where: { id: input.jobId },
            data: { status: 'PROPOSAL_GENERATED' },
          });
        }
        return created;
      });

      return NextResponse.json({
        mode,
        warning,
        ...data,
        draftId: draft.id,
      });
    } catch (error) {
      console.error('[upwork-guide/generate] persist error', error);
      return NextResponse.json({
        mode,
        warning: warning || 'Saved draft failed.',
        ...data,
      });
    }
  };

  if (!getOpenAIKey()) {
    const template = buildTemplate(input);
    return persistDraft(template, 'template', OPENAI_API_KEY_ERROR);
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
      temperature: 0.6,
      max_tokens: 700,
    });

    const raw = resp.choices[0]?.message?.content?.trim() ?? '';
    const parsedJson = safeJsonParse<unknown>(raw);
    const parsedOutput = outputSchema.safeParse(parsedJson);

    if (!parsedOutput.success) {
      const template = buildTemplate(input);
      return persistDraft(
        template,
        'template',
        'AI response malformed. Using template output.',
      );
    }

    return persistDraft(parsedOutput.data, 'ai');
  } catch (error) {
    console.error('[upwork-guide/generate] error', error);
    const template = buildTemplate(input);
    return persistDraft(
      template,
      'template',
      'AI generation failed. Using a template.',
    );
  }
}
