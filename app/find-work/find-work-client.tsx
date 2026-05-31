'use client';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
} from '@summoniq/applab-ui';
import { Check, Copy, ExternalLink, RefreshCw, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type GenerateKind =
  | 'linkedin_post'
  | 'cold_email'
  | 'linkedin_dm'
  | 'upwork_proposal';

type GenerateContext = {
  niche: string;
  outcome: string;
  target: string;
  offer: string;
  proof?: string;
  tone?: 'friendly' | 'direct' | 'consultative' | 'technical';
};

type GenerateResponse =
  | { mode: 'ai' | 'template'; text: string; warning?: string }
  | { error: string; details?: unknown };

type StepId =
  | 'pick-niche'
  | 'open-linkedin-profile'
  | 'write-case-study'
  | 'register-marketplace'
  | 'generate-linkedin-post'
  | 'post-on-linkedin'
  | 'send-10-reachouts';

const STORAGE_KEY = 'flow.find-work.progress.v1';

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  throw new Error('Clipboard API not available');
}

function StepRow({
  title,
  description,
  done,
  actions,
}: {
  title: string;
  description: string;
  done: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/60 p-4">
      <div className="flex items-start gap-2">
        <span
          className={
            done
              ? 'inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400'
              : 'inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground'
          }
          aria-label={done ? 'Completed' : 'Not completed'}
        >
          {done ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <span className="text-xs">•</span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {title}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          {actions ? (
            <div className="mt-3 flex w-full flex-wrap items-center gap-2">
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function FindWorkClient() {
  const [completed, setCompleted] = useState<Record<StepId, boolean>>({
    'pick-niche': false,
    'open-linkedin-profile': false,
    'write-case-study': false,
    'register-marketplace': false,
    'generate-linkedin-post': false,
    'post-on-linkedin': false,
    'send-10-reachouts': false,
  });

  const [ctx, setCtx] = useState<GenerateContext>({
    niche: 'B2B SaaS',
    target: 'product + engineering leadership',
    outcome: 'shipping reliable features faster without breaking production',
    offer: 'a 2-week diagnostic + a 4–6 week build sprint',
    proof: '',
    tone: 'consultative',
  });

  const [kind, setKind] = useState<GenerateKind>('linkedin_post');
  const [generated, setGenerated] = useState<{
    mode: 'ai' | 'template';
    text: string;
    warning?: string;
  } | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const stored = safeJsonParse<Record<StepId, boolean>>(
      typeof window === 'undefined'
        ? null
        : window.localStorage.getItem(STORAGE_KEY),
    );
    if (stored) {
      setCompleted(prev => ({ ...prev, ...stored }));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  }, [completed]);

  const total = Object.keys(completed).length;
  const doneCount = Object.values(completed).filter(Boolean).length;
  const progressPct = Math.round((doneCount / total) * 100);

  const canMarkPickNicheDone = useMemo(() => {
    return (
      ctx.niche.trim().length > 0 &&
      ctx.target.trim().length > 0 &&
      ctx.outcome.trim().length > 0 &&
      ctx.offer.trim().length > 0
    );
  }, [ctx.niche, ctx.offer, ctx.outcome, ctx.target]);

  useEffect(() => {
    if (canMarkPickNicheDone && !completed['pick-niche']) {
      setCompleted(prev => ({ ...prev, 'pick-niche': true }));
      toast.success('Step completed: your positioning is filled in.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canMarkPickNicheDone]);

  const generatedDefaults = useMemo(() => {
    const emailSubject = `Quick idea for ${ctx.target}: ${ctx.outcome}`;
    const coldEmail = [
      `Subject: ${emailSubject}`,
      ``,
      `Hey {{firstName}},`,
      ``,
      `Not sure if you're the right person for ${ctx.target}, but I work with ${ctx.niche} teams on ${ctx.outcome}.`,
      ``,
      `We usually start with ${ctx.offer}.`,
      ctx.proof?.trim() ? `\nProof: ${ctx.proof.trim()}\n` : ``,
      `Would it be crazy to see if this is a priority this quarter?`,
      ``,
      `— {{yourName}}`,
    ]
      .filter(Boolean)
      .join('\n');

    const linkedInPost = [
      `If you're in ${ctx.niche} and you're dealing with:`,
      `→ ${ctx.outcome}`,
      ``,
      `Here’s a simple play that works:`,
      `1) Identify the one bottleneck that causes 80% of the pain`,
      `2) Fix it end-to-end (not just a patch)`,
      `3) Add a metric + alert so it stays fixed`,
      ``,
      `If you want, reply “checklist” and I’ll share how we run ${ctx.offer}.`,
    ].join('\n');

    return {
      linkedin_post: linkedInPost,
      cold_email: coldEmail,
      linkedin_dm: `Hey {{firstName}} — quick question.\n\nIs ${ctx.outcome} a priority for ${ctx.target} right now?\n\nIf helpful, I can share a 1-page plan for how we deliver ${ctx.offer}.\n\nWorth sending?`,
      upwork_proposal: `Hi {{clientName}},\n\nI can help you with ${ctx.outcome}. Here’s how I’d approach it:\n- Clarify success criteria + constraints (30–45 min)\n- Ship an initial version within ${ctx.offer}\n- Iterate based on feedback + metrics\n\nQuestions:\n1) What does “done” look like for you?\n2) Any stack constraints?\n3) Deadline / must-have features?\n\n— {{yourName}}`,
    } as const;
  }, [ctx.niche, ctx.offer, ctx.outcome, ctx.proof, ctx.target]);

  async function handleGenerate() {
    setGenerating(true);
    setGenerated(null);
    try {
      const res = await fetch('/api/find-work/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, context: ctx }),
      });
      const data = (await res
        .json()
        .catch(() => null)) as GenerateResponse | null;
      if (!res.ok || !data || 'error' in data) {
        throw new Error(
          (data && 'error' in data && data.error) ||
            `Generate failed: ${res.status}`,
        );
      }

      setGenerated(data);
      setCompleted(prev => ({ ...prev, 'generate-linkedin-post': true }));
      toast.success(
        data.mode === 'ai'
          ? 'Generated with AI. Ready to copy.'
          : 'Generated a template (no OpenAI key). Ready to copy.',
      );
      if (data.warning) {
        toast.message(data.warning);
      }
    } catch (err) {
      console.error(err);
      // Fallback: local template
      const fallback =
        kind === 'linkedin_post'
          ? generatedDefaults.linkedin_post
          : kind === 'linkedin_dm'
            ? generatedDefaults.linkedin_dm
            : kind === 'upwork_proposal'
              ? generatedDefaults.upwork_proposal
              : generatedDefaults.cold_email;

      setGenerated({
        mode: 'template',
        text: fallback,
        warning: 'Using a built-in template.',
      });
      toast.error('AI generation failed. Using a built-in template.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy(text: string, stepToMark?: StepId) {
    try {
      await copyToClipboard(text);
      toast.success('Copied to clipboard.');
      if (stepToMark) {
        setCompleted(prev => ({ ...prev, [stepToMark]: true }));
        toast.success('Step completed.');
      }
    } catch (err) {
      console.error(err);
      toast.error(
        'Could not copy. Try selecting the text and copying manually.',
      );
    }
  }

  function handleOpen(url: string, stepToMark?: StepId) {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noreferrer');
    }
    if (stepToMark) {
      setCompleted(prev => ({ ...prev, [stepToMark]: true }));
      toast.success('Step completed.');
    }
  }

  const stepActions = {
    linkedinProfile: (
      <Button
        variant="secondary"
        className="w-full max-w-full whitespace-normal sm:w-auto"
        onClick={() =>
          handleOpen('https://www.linkedin.com/in/', 'open-linkedin-profile')
        }
      >
        <ExternalLink className="h-4 w-4" />
        Open LinkedIn profile
      </Button>
    ),
    caseStudy: (
      <div className="flex w-full flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          className="w-full max-w-full whitespace-normal sm:w-auto"
          onClick={() =>
            handleOpen('https://www.notion.so/templates', 'write-case-study')
          }
        >
          <ExternalLink className="h-4 w-4" />
          Open Notion templates
        </Button>
        <Button
          variant="outline"
          className="w-full max-w-full whitespace-normal sm:w-auto"
          onClick={() =>
            handleCopy(
              [
                'Case study outline (copy/paste)',
                '',
                '1) Client / industry (keep anonymous if needed)',
                '2) Problem (what was broken / slow / risky)',
                '3) Constraints (timeline, stack, team, budget)',
                '4) Approach (what you changed and why)',
                '5) Result (metrics, reliability, speed, revenue)',
                '6) Screenshots / diagrams',
                '7) CTA (what you help with)',
              ].join('\n'),
            )
          }
        >
          <Copy className="h-4 w-4" />
          Copy outline
        </Button>
      </div>
    ),
    marketplace: (
      <Button
        variant="secondary"
        className="w-full max-w-full whitespace-normal sm:w-auto"
        onClick={() =>
          handleOpen('https://www.upwork.com/', 'register-marketplace')
        }
      >
        <ExternalLink className="h-4 w-4" />
        Open Upwork
      </Button>
    ),
    linkedInComposer: (
      <Button
        variant="secondary"
        className="w-full max-w-full whitespace-normal sm:w-auto"
        onClick={() =>
          handleOpen('https://www.linkedin.com/feed/', 'post-on-linkedin')
        }
      >
        <ExternalLink className="h-4 w-4" />
        Open LinkedIn feed
      </Button>
    ),
  } as const;

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="text-base">
              Guided start (step-by-step)
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Click the buttons. Copy/paste the generated text. The app tracks
              what you’ve completed.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCompleted({
                  'pick-niche': false,
                  'open-linkedin-profile': false,
                  'write-case-study': false,
                  'register-marketplace': false,
                  'generate-linkedin-post': false,
                  'post-on-linkedin': false,
                  'send-10-reachouts': false,
                });
                toast.message('Progress reset.');
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="rounded-lg border border-border/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-foreground">
                Progress: {doneCount}/{total} steps
              </p>
              <p className="text-xs text-muted-foreground">{progressPct}%</p>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-lg border border-border/60 p-4">
              <p className="text-sm font-semibold text-foreground">
                Your positioning (fill this in)
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                This drives the AI generator and all copy templates.
              </p>
              <div className="mt-3 grid gap-3">
                <div className="grid gap-1.5">
                  <p className="text-xs text-muted-foreground">
                    Niche (who you serve)
                  </p>
                  <Input
                    value={ctx.niche}
                    onChange={e =>
                      setCtx(prev => ({ ...prev, niche: e.target.value }))
                    }
                    placeholder="e.g. B2B SaaS, Fintech, Health, Ecommerce…"
                  />
                </div>
                <div className="grid gap-1.5">
                  <p className="text-xs text-muted-foreground">
                    Target (buyer / role)
                  </p>
                  <Input
                    value={ctx.target}
                    onChange={e =>
                      setCtx(prev => ({ ...prev, target: e.target.value }))
                    }
                    placeholder="e.g. Head of Engineering, CTO, VP Product…"
                  />
                </div>
                <div className="grid gap-1.5">
                  <p className="text-xs text-muted-foreground">
                    Outcome (problem you solve)
                  </p>
                  <Input
                    value={ctx.outcome}
                    onChange={e =>
                      setCtx(prev => ({ ...prev, outcome: e.target.value }))
                    }
                    placeholder="e.g. reduce incidents, speed up releases, improve conversion…"
                  />
                </div>
                <div className="grid gap-1.5">
                  <p className="text-xs text-muted-foreground">
                    Offer (your packaged engagement)
                  </p>
                  <Input
                    value={ctx.offer}
                    onChange={e =>
                      setCtx(prev => ({ ...prev, offer: e.target.value }))
                    }
                    placeholder="e.g. 2-week diagnostic + 4–6 week build sprint"
                  />
                </div>
                <div className="grid gap-1.5">
                  <p className="text-xs text-muted-foreground">
                    Proof (optional)
                  </p>
                  <Textarea
                    value={ctx.proof ?? ''}
                    onChange={e =>
                      setCtx(prev => ({ ...prev, proof: e.target.value }))
                    }
                    placeholder="One line: metrics, brand names, before/after, years of exp…"
                    className="min-h-20"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <StepRow
                title="Step 1 — Decide your niche + offer"
                description="Fill the fields on the left. The app auto-completes this step when all are filled."
                done={completed['pick-niche']}
              />
              <StepRow
                title="Step 2 — Make your LinkedIn profile buyer-ready"
                description="Click the link, then update: headline → “I help {niche} teams with {outcome}”. Add 2 proof bullets."
                done={completed['open-linkedin-profile']}
                actions={stepActions.linkedinProfile}
              />
              <StepRow
                title="Step 3 — Write one case study (even if small)"
                description="Click Notion templates, choose a case study template, then paste the outline (button)."
                done={completed['write-case-study']}
                actions={stepActions.caseStudy}
              />
              <StepRow
                title="Step 4 — Create one inbound channel (Upwork)"
                description="Click Upwork and create a focused profile. Add your offer + proof line + one portfolio item."
                done={completed['register-marketplace']}
                actions={stepActions.marketplace}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Generate your first post / message (AI + copy/paste)
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a format, click Generate, then click Copy. We’ll mark the
            steps complete for you.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={kind === 'linkedin_post' ? 'default' : 'secondary'}
              onClick={() => setKind('linkedin_post')}
            >
              LinkedIn post
            </Button>
            <Button
              variant={kind === 'linkedin_dm' ? 'default' : 'secondary'}
              onClick={() => setKind('linkedin_dm')}
            >
              LinkedIn DM
            </Button>
            <Button
              variant={kind === 'cold_email' ? 'default' : 'secondary'}
              onClick={() => setKind('cold_email')}
            >
              Cold email
            </Button>
            <Button
              variant={kind === 'upwork_proposal' ? 'default' : 'secondary'}
              onClick={() => setKind('upwork_proposal')}
            >
              Upwork proposal
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => void handleGenerate()} disabled={generating}>
              <Sparkles className="h-4 w-4" />
              {generating ? 'Generating…' : 'Generate with AI'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const fallback =
                  kind === 'linkedin_post'
                    ? generatedDefaults.linkedin_post
                    : kind === 'linkedin_dm'
                      ? generatedDefaults.linkedin_dm
                      : kind === 'upwork_proposal'
                        ? generatedDefaults.upwork_proposal
                        : generatedDefaults.cold_email;
                setGenerated({ mode: 'template', text: fallback });
                toast.message('Loaded a built-in template.');
              }}
            >
              Use template
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                handleOpen('https://www.linkedin.com/feed/', 'post-on-linkedin')
              }
            >
              <ExternalLink className="h-4 w-4" />
              Open LinkedIn
            </Button>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">
              {generated?.mode === 'ai'
                ? 'Generated with AI.'
                : generated?.mode === 'template'
                  ? 'Template (fallback).'
                  : 'Generate to see content here.'}
              {generated?.warning ? `  ${generated.warning}` : ''}
            </p>

            <Textarea
              value={generated?.text ?? ''}
              readOnly
              placeholder="Your generated post/message will appear here…"
              className="mt-2 min-h-48"
            />

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                disabled={!generated?.text}
                onClick={() =>
                  void handleCopy(
                    generated?.text ?? '',
                    kind === 'linkedin_post' ? 'send-10-reachouts' : undefined,
                  )
                }
              >
                <Copy className="h-4 w-4" />
                Copy text
              </Button>
              <Button
                variant="outline"
                disabled={!generated?.text}
                onClick={() => {
                  setCompleted(prev => ({
                    ...prev,
                    'generate-linkedin-post': true,
                  }));
                  toast.success('Step completed: generated content.');
                }}
              >
                Mark generated as done
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  handleOpen(
                    'https://www.linkedin.com/feed/',
                    'post-on-linkedin',
                  )
                }
              >
                <ExternalLink className="h-4 w-4" />
                Go post on LinkedIn
              </Button>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <StepRow
              title="Step 5 — Generate a LinkedIn post (AI)"
              description="Click “Generate with AI”. If OpenAI isn’t configured, the app uses a template."
              done={completed['generate-linkedin-post']}
            />
            <StepRow
              title="Step 6 — Post it"
              description="Click “Open LinkedIn”, click ‘Start a post’, paste your text, and publish."
              done={completed['post-on-linkedin']}
              actions={stepActions.linkedInComposer}
            />
            <StepRow
              title="Step 7 — Send 10 reach-outs"
              description="Repeat: generate DM/email → copy → send. Consistency beats perfection."
              done={completed['send-10-reachouts']}
              actions={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setCompleted(prev => ({
                      ...prev,
                      'send-10-reachouts': true,
                    }));
                    toast.success('Step completed.');
                  }}
                >
                  Mark done
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
