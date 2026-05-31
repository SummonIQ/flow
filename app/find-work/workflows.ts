export type GenerateKind =
  | 'linkedin_post'
  | 'cold_email'
  | 'linkedin_dm'
  | 'upwork_proposal';

export type WorkflowAction =
  | {
      type: 'open_url';
      label: string;
      url: string;
      marksDone?: boolean;
    }
  | {
      type: 'copy_text';
      label: string;
      text: string;
      marksDone?: boolean;
    }
  | {
      type: 'generate';
      label: string;
      kind: GenerateKind;
      marksDone?: boolean;
    }
  | {
      type: 'mark_done';
      label: string;
    };

export type WorkflowStep = {
  id: string;
  title: string;
  why: string;
  timeboxMinutes: number;
  instructions: readonly string[];
  successCriteria: readonly string[];
  actions: readonly WorkflowAction[];
};

export type Workflow = {
  id: string;
  title: string;
  description: string;
  outcomes: readonly string[];
  cadence: readonly string[];
  steps: readonly WorkflowStep[];
};

export const findWorkWorkflows: readonly Workflow[] = [
  {
    id: 'quick-start',
    title: 'Quick Start (first 7 days)',
    description:
      'Get from “no pipeline” to your first consistent motion: profile, proof, one inbound channel, and one outbound channel.',
    outcomes: [
      'A crisp niche + offer you can repeat',
      '1 case study you can send to prospects',
      '1 post + 10 messages sent',
    ],
    cadence: [
      'Daily (Mon–Fri): 30 minutes outbound + 15 minutes follow-ups',
      'Weekly: ship 1 piece of proof (case study / teardown / benchmark)',
    ],
    steps: [
      {
        id: 'positioning',
        title: 'Define your positioning (niche → buyer → outcome → offer)',
        why:
          'If you don’t define this, every message becomes generic and you’ll compete on price.',
        timeboxMinutes: 25,
        instructions: [
          'Pick ONE niche to start (you can expand later).',
          'Pick ONE buyer persona (role) who feels the pain.',
          'Pick ONE outcome/problem you solve repeatedly.',
          'Package the offer (timeboxed) so it’s easy to say yes.',
        ],
        successCriteria: [
          'You can say it in one sentence.',
          'You can paste it into a message without editing.',
        ],
        actions: [{ type: 'mark_done', label: 'Mark step done' }],
      },
      {
        id: 'linkedin-profile',
        title: 'Update LinkedIn so buyers can self-qualify',
        why:
          'Most people who respond will check your profile. If it’s unclear, they bounce.',
        timeboxMinutes: 35,
        instructions: [
          'Open your profile.',
          'Headline: “I help {niche} teams {outcome}.”',
          'About: 3 bullets: who you help, how you help, proof.',
          'Featured: add your best case study or repo screenshot.',
        ],
        successCriteria: [
          'Headline mentions niche + outcome.',
          'At least 1 proof point exists (metric, brand, or before/after).',
        ],
        actions: [
          {
            type: 'open_url',
            label: 'Open LinkedIn profile',
            url: 'https://www.linkedin.com/in/',
            marksDone: true,
          },
        ],
      },
      {
        id: 'case-study',
        title: 'Write 1 case study (small is fine)',
        why:
          'Proof closes. Even a “small win” case study beats generic claims.',
        timeboxMinutes: 60,
        instructions: [
          'Open Notion templates (or your doc tool).',
          'Paste the outline below and fill it in.',
          'Keep it short: 1 page, 2 screenshots max.',
        ],
        successCriteria: [
          'Includes: problem → constraints → approach → result.',
          'Has at least one “result” (metric or clear qualitative outcome).',
        ],
        actions: [
          {
            type: 'open_url',
            label: 'Open Notion templates',
            url: 'https://www.notion.so/templates',
          },
          {
            type: 'copy_text',
            label: 'Copy case study outline',
            marksDone: true,
            text: [
              'Case study outline (copy/paste)',
              '',
              '1) Client / industry (anonymous is fine)',
              '2) Problem (what was broken / slow / risky)',
              '3) Constraints (timeline, stack, team, budget)',
              '4) Approach (what you changed and why)',
              '5) Result (metrics: speed, reliability, revenue, cost)',
              '6) Proof (screenshots, diagrams, links)',
              '7) CTA (who you help + your offer)',
            ].join('\n'),
          },
        ],
      },
      {
        id: 'marketplace-setup',
        title: 'Create one inbound channel (Upwork or similar)',
        why:
          'Marketplaces can fill gaps quickly if you qualify hard and focus on one niche.',
        timeboxMinutes: 45,
        instructions: [
          'Create/refresh your profile.',
          'Add your packaged offer + proof line.',
          'Create 2 proposal templates and save them.',
        ],
        successCriteria: [
          'Profile clearly states niche + outcome.',
          'You have at least one portfolio item or case study link.',
        ],
        actions: [
          {
            type: 'open_url',
            label: 'Open Upwork',
            url: 'https://www.upwork.com/',
            marksDone: true,
          },
        ],
      },
      {
        id: 'first-post',
        title: 'Generate + publish your first LinkedIn post',
        why:
          'A post is a “proof artifact” that compounds and makes outreach warmer.',
        timeboxMinutes: 20,
        instructions: [
          'Generate a LinkedIn post using the AI generator.',
          'Copy the text.',
          'Open LinkedIn feed and publish.',
        ],
        successCriteria: [
          'You posted once (even if it’s imperfect).',
          'You have a URL you can share in outreach.',
        ],
        actions: [
          { type: 'generate', label: 'Generate LinkedIn post', kind: 'linkedin_post' },
          { type: 'open_url', label: 'Open LinkedIn feed', url: 'https://www.linkedin.com/feed/', marksDone: true },
        ],
      },
      {
        id: 'ten-messages',
        title: 'Send 10 reach-outs (DM or email)',
        why:
          'You need reps. Consistency beats perfection and quickly teaches you what resonates.',
        timeboxMinutes: 35,
        instructions: [
          'Pick 10 targets (same niche).',
          'Generate a DM (or cold email).',
          'Send 10. Track replies.',
        ],
        successCriteria: ['10 sent.', '1–2 replies is normal; keep going.'],
        actions: [
          { type: 'generate', label: 'Generate LinkedIn DM', kind: 'linkedin_dm' },
          { type: 'generate', label: 'Generate cold email', kind: 'cold_email' },
          { type: 'mark_done', label: 'I sent 10 messages' },
        ],
      },
    ],
  },
  {
    id: 'outbound-engine',
    title: 'Outbound Engine (repeatable weekly pipeline)',
    description:
      'A prescriptive outbound workflow you can run weekly, then automate: target list → enrichment → sequence → follow-up → book calls.',
    outcomes: [
      '30 targets/week added',
      '10 personalized messages sent',
      '3-step follow-up sequence running',
    ],
    cadence: [
      'Mon: build list (60m)',
      'Tue/Wed: send personalized messages (30m/day)',
      'Thu/Fri: follow-ups + booking (30m/day)',
    ],
    steps: [
      {
        id: 'choose-target-list',
        title: 'Pick a tight target account definition',
        why:
          'Outbound only works when you’re specific; otherwise it feels like spam and gets ignored.',
        timeboxMinutes: 20,
        instructions: [
          'Pick company size + industry + tech stack or problem.',
          'Pick one “trigger” (recent funding, hiring, outages, product launch).',
          'Write a 1-sentence reason you can mention in outreach.',
        ],
        successCriteria: ['You can describe your target in one line.'],
        actions: [{ type: 'mark_done', label: 'Target definition done' }],
      },
      {
        id: 'tools-setup',
        title: 'Open your prospecting tool and create a list',
        why:
          'This becomes the source-of-truth list you’ll automate later.',
        timeboxMinutes: 15,
        instructions: [
          'Open Apollo (or Sales Navigator).',
          'Create a saved search for your target definition.',
          'Save 30 accounts and at least 30 contacts.',
        ],
        successCriteria: ['30 contacts saved.'],
        actions: [
          { type: 'open_url', label: 'Open Apollo', url: 'https://www.apollo.io/', marksDone: false },
          {
            type: 'open_url',
            label: 'Open Sales Navigator',
            url: 'https://business.linkedin.com/sales-solutions/sales-navigator',
          },
          { type: 'mark_done', label: 'List created (30 contacts)' },
        ],
      },
      {
        id: 'sequence-copy',
        title: 'Copy a 3-step sequence template',
        why:
          'Most people stop after 1 message. 3-touch follow-up is where replies happen.',
        timeboxMinutes: 10,
        instructions: [
          'Copy the sequence below.',
          'Use it as: Day 0 (initial), Day 2 (bump), Day 6 (final).',
        ],
        successCriteria: ['Sequence text is saved somewhere you can reuse.'],
        actions: [
          {
            type: 'copy_text',
            label: 'Copy 3-step sequence',
            marksDone: true,
            text: [
              '3-step outbound sequence (copy/paste)',
              '',
              'Day 0 — Initial',
              'Subject: Quick idea for {{company}}',
              'Hey {{firstName}} — I noticed {{trigger}}. We help {{niche}} teams with {{outcome}} via {{offer}}. Worth sharing a 1-page plan?',
              '',
              'Day 2 — Bump',
              'Quick bump — should I send the 1-page plan, or is someone else better to talk to about {{outcome}}?',
              '',
              'Day 6 — Final',
              'Last note — if {{outcome}} is a priority later, happy to share examples + a tiny starter scope. Want me to circle back next month?',
            ].join('\n'),
          },
        ],
      },
      {
        id: 'personalize',
        title: 'Personalize 10 messages (light personalization)',
        why:
          'You don’t need essay-length personalization; 1–2 relevant lines is enough.',
        timeboxMinutes: 30,
        instructions: [
          'Pick 10 contacts.',
          'For each: add one trigger line (hiring, product change, post, funding).',
          'Send the initial message.',
        ],
        successCriteria: ['10 sent with a trigger line.'],
        actions: [{ type: 'mark_done', label: 'Sent 10 personalized messages' }],
      },
      {
        id: 'follow-up',
        title: 'Run follow-ups (the money is in the follow-up)',
        why:
          'Most replies happen after a follow-up. Automate this later.',
        timeboxMinutes: 20,
        instructions: [
          'Send bump to non-responders from 2 days ago.',
          'Send final note to non-responders from last week.',
          'Track replies and book calls.',
        ],
        successCriteria: ['Follow-ups sent.', 'You have a simple “reply handling” script.'],
        actions: [{ type: 'mark_done', label: 'Follow-ups done' }],
      },
    ],
  },
  {
    id: 'marketplaces-engine',
    title: 'Marketplaces Engine (win more, waste less)',
    description:
      'A workflow designed to qualify hard, respond fast, and reuse good proposals. Ideal when you need revenue sooner.',
    outcomes: [
      'Profile optimized for one niche',
      '2 reusable proposal templates',
      'Daily “apply” habit that’s sustainable',
    ],
    cadence: [
      'Daily: 15 minutes scanning + 3 proposals max',
      'Weekly: review wins/losses and update templates',
    ],
    steps: [
      {
        id: 'profile',
        title: 'Rewrite your marketplace profile for one niche',
        why:
          'Generalist profiles get ignored; niche profiles get invited.',
        timeboxMinutes: 25,
        instructions: [
          'Pick one niche and one outcome.',
          'Put offer + proof at the top.',
          'Add 2–3 short portfolio bullets.',
        ],
        successCriteria: ['First 2 lines say niche + outcome + offer.'],
        actions: [
          { type: 'open_url', label: 'Open Upwork', url: 'https://www.upwork.com/' },
          { type: 'mark_done', label: 'Profile updated' },
        ],
      },
      {
        id: 'templates',
        title: 'Save 2 proposal templates (fast + premium)',
        why:
          'Speed matters. Templates let you respond quickly without sounding generic.',
        timeboxMinutes: 20,
        instructions: [
          'Copy the “fast” template for small jobs.',
          'Copy the “premium” template for bigger scope.',
        ],
        successCriteria: ['Both templates saved for reuse.'],
        actions: [
          {
            type: 'copy_text',
            label: 'Copy fast proposal template',
            text: [
              'Fast proposal (copy/paste)',
              '',
              'Hi {{name}} — I can help with {{outcome}}.',
              '',
              'Quick plan:',
              '1) Clarify success criteria + constraints (30–45 min)',
              '2) Ship first working version in {{offer}}',
              '3) Iterate based on feedback + metrics',
              '',
              '3 questions:',
              '1) What does “done” look like?',
              '2) Any stack constraints?',
              '3) Deadline / must-haves?',
              '',
              'If you share context, I’ll propose a tight scope + timeline.',
              '— {{yourName}}',
            ].join('\n'),
            marksDone: false,
          },
          {
            type: 'copy_text',
            label: 'Copy premium proposal template',
            text: [
              'Premium proposal (copy/paste)',
              '',
              'Hi {{name}} — if the goal is {{outcome}}, here’s what I’d do:',
              '',
              'Phase 1 (Discovery): align on requirements, risks, and success metrics.',
              'Phase 2 (Build): implement end-to-end, with weekly demos.',
              'Phase 3 (Stabilize): monitoring, fixes, docs, handoff.',
              '',
              'To scope accurately, I need:',
              '1) current stack + constraints',
              '2) what’s already built',
              '3) timeline and decision process',
              '',
              'If you want, I can send a 1-page scope with options (starter vs full build).',
              '— {{yourName}}',
            ].join('\n'),
            marksDone: true,
          },
        ],
      },
      {
        id: 'qualify',
        title: 'Qualify hard (avoid low-value traps)',
        why:
          'Your win rate and sanity depend on saying no quickly.',
        timeboxMinutes: 15,
        instructions: [
          'Avoid: vague goals, “cheap + fast”, no decision maker.',
          'Prefer: clear outcome, timebox, existing budget, responsive client.',
          'Ask 3 questions before investing time.',
        ],
        successCriteria: ['You skip bad jobs without guilt.'],
        actions: [{ type: 'mark_done', label: 'Qualification rules written' }],
      },
      {
        id: 'daily-habit',
        title: 'Daily habit: 3 proposals max',
        why:
          'Sustainable, high quality beats volume spam.',
        timeboxMinutes: 15,
        instructions: [
          'Scan for good-fit jobs.',
          'Send up to 3 proposals using templates.',
          'Track outcomes weekly.',
        ],
        successCriteria: ['You did it 3 days this week.'],
        actions: [{ type: 'mark_done', label: 'Completed 3 days this week' }],
      },
    ],
  },
  {
    id: 'partners-directories',
    title: 'Partners & Directories (warm inbound)',
    description:
      'Get discovered through directories and partner programs. Slower at first, but great long-term ROI.',
    outcomes: [
      'One strong directory profile',
      'Two partner programs applied',
      'A repeatable “proof page” to link everywhere',
    ],
    cadence: [
      'Weekly: improve profile + gather reviews',
      'Monthly: apply to 1–2 partner programs',
    ],
    steps: [
      {
        id: 'choose-directory',
        title: 'Choose your primary directory (Clutch or similar)',
        why:
          'Directories work when you commit and collect reviews.',
        timeboxMinutes: 10,
        instructions: [
          'Pick ONE directory to focus on first (Clutch is common).',
          'Commit to collecting reviews (2–5 is a big inflection point).',
        ],
        successCriteria: ['You picked one primary directory.'],
        actions: [
          { type: 'open_url', label: 'Open Clutch', url: 'https://clutch.co/', marksDone: true },
        ],
      },
      {
        id: 'profile-setup',
        title: 'Create a profile that converts',
        why:
          'Most agency profiles are fluff. Specificity wins.',
        timeboxMinutes: 35,
        instructions: [
          'Headline: niche + outcome.',
          'Add 2 case studies with results.',
          'Add 3 service bullets (product build, AI features, performance/reliability).',
        ],
        successCriteria: ['Profile has at least 2 proof artifacts.'],
        actions: [{ type: 'mark_done', label: 'Profile created' }],
      },
      {
        id: 'partner-programs',
        title: 'Apply to 2 partner programs',
        why:
          'Partner directories can send warm leads if you’re specialized.',
        timeboxMinutes: 30,
        instructions: [
          'Apply to one “platform” partner (e.g. Shopify/Webflow).',
          'Apply to one “infra” partner (e.g. AWS).',
        ],
        successCriteria: ['2 applications submitted.'],
        actions: [
          { type: 'open_url', label: 'Shopify Partners', url: 'https://www.shopify.com/partners' },
          { type: 'open_url', label: 'Webflow Experts', url: 'https://experts.webflow.com/' },
          { type: 'open_url', label: 'AWS Partner Network', url: 'https://partners.amazonaws.com/' },
          { type: 'mark_done', label: 'Submitted 2 applications' },
        ],
      },
    ],
  },
  {
    id: 'rfp-engine',
    title: 'RFP Engine (bigger deals, slower cycles)',
    description:
      'Procurement-heavy channels. Only do this if your offers are mature and you can qualify which bids are winnable.',
    outcomes: [
      'Reusable response library',
      'A “bid/no-bid” checklist',
      'One submitted response (per month)',
    ],
    cadence: [
      'Monthly: submit 1 high-probability RFP',
      'Weekly: build response blocks and references',
    ],
    steps: [
      {
        id: 'bid-no-bid',
        title: 'Create a bid/no-bid checklist',
        why:
          'RFPs waste time unless you can quickly filter out unwinnable deals.',
        timeboxMinutes: 25,
        instructions: [
          'Only bid when you match the core requirements.',
          'Prefer when you have a relationship or a unique advantage.',
          'Skip when timeline is unrealistic or requirements are vague.',
        ],
        successCriteria: ['A checklist you can reuse on every RFP.'],
        actions: [
          {
            type: 'copy_text',
            label: 'Copy bid/no-bid checklist',
            marksDone: true,
            text: [
              'Bid / No-bid checklist',
              '',
              'Bid if:',
              '- We match the core requirements (tech + domain)',
              '- Budget is realistic / posted or can be inferred',
              '- Timeline is feasible',
              '- We can be top-3 (clear differentiation)',
              '',
              'No-bid if:',
              '- Requirements are unclear / contradictory',
              '- Price is the primary selection criterion',
              '- No access to stakeholders / Q&A is limited',
              '- We cannot reasonably win',
            ].join('\n'),
          },
        ],
      },
      {
        id: 'response-library',
        title: 'Build a response library (copy blocks)',
        why:
          'Speed + consistency. A library lets you respond without reinventing everything.',
        timeboxMinutes: 45,
        instructions: [
          'Create standard blocks: About, Approach, Security, Timeline, Team, Case Studies.',
          'Keep each block 150–250 words.',
        ],
        successCriteria: ['You have 6 reusable blocks.'],
        actions: [{ type: 'mark_done', label: 'Response library created' }],
      },
      {
        id: 'find-rfp',
        title: 'Find 1 opportunity and submit',
        why:
          'You learn by shipping. Your first submission will improve your process.',
        timeboxMinutes: 60,
        instructions: [
          'Open SAM.gov or your preferred portal.',
          'Filter to your niche.',
          'Pick one realistic opportunity and submit.',
        ],
        successCriteria: ['One submission done.'],
        actions: [
          { type: 'open_url', label: 'Open SAM.gov', url: 'https://sam.gov/' },
          { type: 'open_url', label: 'Open Bonfire', url: 'https://gobonfire.com/' },
          { type: 'mark_done', label: 'Submitted 1 response' },
        ],
      },
    ],
  },
] as const;

