import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/db/prisma';
import {
  getOpenAIClient,
  getOpenAIKey,
  OPENAI_API_KEY_ERROR,
} from '@/lib/openai/client';
import { OPENAI_CHAT_MODEL_DEFAULT } from '@/lib/openai/config';

const inputSchema = z.object({
  teamId: z.string().min(1),
  jobId: z.string().min(1),
});

type MatchResult = {
  score: number;
  isMatch: boolean;
  reason: string;
  mode: 'ai' | 'heuristic';
  warning?: string;
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+.#\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function heuristicMatch(jobText: string, profileSkills: string[]) {
  const tokens = new Set(tokenize(jobText));
  const skills = profileSkills
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s.toLowerCase());

  if (!skills.length) {
    return { score: 0, isMatch: false, reason: 'No skills provided.' };
  }

  let hit = 0;
  for (const skill of skills) {
    if (tokens.has(skill)) hit += 1;
  }

  const denom = Math.max(3, Math.ceil(skills.length * 0.4));
  const score = Math.min(1, hit / denom);
  const isMatch = score >= 0.35;
  return {
    score,
    isMatch,
    reason: `Matched ${hit} of ${skills.length} skill keywords.`,
  };
}

function buildPrompt(job: { title: string; description?: string; tags: string[] }, profile: { skillsText: string; offer?: string | null; proof?: string | null }) {
  const system =
    'You are a strict classifier for Upwork job fit. Return JSON only.';
  const user = [
    'Return JSON with: { "score": number (0-1), "isMatch": boolean, "reason": string }',
    '',
    'Profile skills:',
    profile.skillsText,
    profile.offer ? `Offer: ${profile.offer}` : null,
    profile.proof ? `Proof: ${profile.proof}` : null,
    '',
    'Job:',
    `Title: ${job.title}`,
    `Description: ${job.description || ''}`,
    job.tags?.length ? `Tags: ${job.tags.join(', ')}` : null,
    '',
    'Rules:',
    '- Only mark isMatch true if the job strongly fits the skills.',
    '- score should reflect match strength.',
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

  const { teamId, jobId } = parsed.data;

  try {
    const [job, profile] = await Promise.all([
      prisma.upworkJob.findFirst({ where: { id: jobId, teamId } }),
      prisma.upworkSkillProfile.findUnique({ where: { teamId } }),
    ]);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    if (!profile) {
      return NextResponse.json({ error: 'Skill profile missing' }, { status: 400 });
    }

    const jobText = `${job.title}\n${job.description || ''}\n${job.tags.join(' ')}`;
    let result: MatchResult;

    if (!getOpenAIKey()) {
      const heuristic = heuristicMatch(jobText, profile.skills.length ? profile.skills : profile.skillsText.split(','));
      result = { ...heuristic, mode: 'heuristic', warning: OPENAI_API_KEY_ERROR };
    } else {
      const openai = getOpenAIClient();
      const prompt = buildPrompt(job, profile);
      const resp = await openai.chat.completions.create({
        model: OPENAI_CHAT_MODEL_DEFAULT,
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user },
        ],
        temperature: 0.2,
        max_tokens: 200,
      });

      const raw = resp.choices[0]?.message?.content?.trim() || '{}';
      let parsedJson: any = null;
      try {
        parsedJson = JSON.parse(raw);
      } catch {
        parsedJson = null;
      }

      if (
        !parsedJson ||
        typeof parsedJson.score !== 'number' ||
        typeof parsedJson.isMatch !== 'boolean' ||
        typeof parsedJson.reason !== 'string'
      ) {
        const heuristic = heuristicMatch(jobText, profile.skills.length ? profile.skills : profile.skillsText.split(','));
        result = {
          ...heuristic,
          mode: 'heuristic',
          warning: 'AI response malformed. Used heuristic match.',
        };
      } else {
        result = {
          score: Math.max(0, Math.min(1, parsedJson.score)),
          isMatch: parsedJson.isMatch,
          reason: parsedJson.reason,
          mode: 'ai',
        };
      }
    }

    const status = result.isMatch ? 'MATCHED' : job.status;
    const updated = await prisma.upworkJob.update({
      where: { id: jobId },
      data: {
        matchScore: result.score,
        matchReason: result.reason,
        isEligible: result.isMatch,
        lastMatchedAt: new Date(),
        status,
      },
    });

    return NextResponse.json({ job: updated, match: result });
  } catch (error) {
    console.error('[upwork/match] error', error);
    return NextResponse.json({ error: 'Match failed' }, { status: 500 });
  }
}
