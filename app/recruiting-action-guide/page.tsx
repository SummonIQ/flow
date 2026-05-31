/* eslint-disable no-magic-numbers */
'use client';

import { Report, type ReportColumnDefinition } from '@summoniq/applab-ui';
import React, { useEffect, useMemo, useState } from 'react';

type ChecklistItem = { id: string; text: string; detail?: string };
type Template = { id: string; title: string; subject?: string; body: string };
type MetricRow = {
  metric: string;
  week1: number;
  week2: number;
  week3: number;
  week4: number;
};

const STORAGE_KEY = 'recruiting_action_guide_v1';

function uid(prefix: string, n: number) {
  return `${prefix}_${n}`;
}

function copy(text: string) {
  return navigator.clipboard.writeText(text);
}

function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <button
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div className="font-semibold text-lg text-foreground">{title}</div>
        <div className="text-sm text-muted-foreground">{open ? 'Hide' : 'Show'}</div>
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

function Checklist({
  title,
  items,
  checked,
  onToggle,
}: {
  title: string;
  items: ChecklistItem[];
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  const done = items.filter(i => checked[i.id]).length;
  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <div className="text-sm text-muted-foreground">
          {done}/{items.length} complete
        </div>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map(item => (
          <li key={item.id} className="flex gap-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={!!checked[item.id]}
              onChange={() => onToggle(item.id)}
            />
            <div>
              <div className="font-medium text-foreground">{item.text}</div>
              {item.detail && <div className="text-sm text-muted-foreground">{item.detail}</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TemplateCard({ t }: { t: Template }) {
  const full = useMemo(() => {
    const subjectLine = t.subject ? `Subject: ${t.subject}\n\n` : '';
    return `${subjectLine}${t.body}`.trim();
  }, [t]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold text-foreground">{t.title}</div>
          {t.subject && <div className="text-sm text-muted-foreground mt-1">{t.subject}</div>}
        </div>
        <button
          className="rounded-xl border px-3 py-1.5 text-sm hover:bg-muted/50"
          onClick={() => copy(full)}
        >
          Copy
        </button>
      </div>
      <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground bg-muted/30 rounded-xl p-3 border border-border">
        {full}
      </pre>
    </div>
  );
}

function CodeBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold text-foreground">{label}</div>
        <button
          className="rounded-xl border px-3 py-1.5 text-sm hover:bg-muted/50"
          onClick={() => copy(text)}
        >
          Copy
        </button>
      </div>
      <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 bg-muted/30 rounded-xl p-3 border border-border">
        {text}
      </pre>
    </div>
  );
}

export default function RecruitingActionGuidePage() {
  const data = useMemo(() => buildData(), []);

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [metrics, setMetrics] = useState<MetricRow[]>(data.metricsSeed);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.checked) setChecked(parsed.checked);
      if (parsed?.metrics) setMetrics(parsed.metrics);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          checked,
          metrics,
        }),
      );
    } catch {
      // ignore
    }
  }, [checked, metrics]);

  function toggle(id: string) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function resetAll() {
    if (!confirm('Reset all checklist + metrics?')) return;
    setChecked({});
    setMetrics(data.metricsSeed);
  }

  function updateMetric(i: number, key: keyof MetricRow, value: string) {
    const n = Number(value);
    setMetrics(prev => {
      const next = [...prev];
      const row = { ...next[i], [key]: Number.isFinite(n) ? n : 0 };
      next[i] = row;
      return next;
    });
  }

  const completion = useMemo(() => {
    const allIds = data.allChecklistIds;
    const done = allIds.filter(id => checked[id]).length;
    return { done, total: allIds.length };
  }, [checked, data.allChecklistIds]);

  const renderWeekInput = (row: MetricRow, key: keyof MetricRow) => {
    const index = metrics.findIndex(metric => metric.metric === row.metric);
    if (index < 0) return null;
    return (
      <input
        className="w-24 rounded-lg border border-border px-2 py-1 bg-background"
        type="number"
        value={row[key]}
        onChange={e => updateMetric(index, key, e.target.value)}
      />
    );
  };

  const metricColumns: ReportColumnDefinition<MetricRow>[] = [
    {
      header: 'Metric',
      key: 'metric',
      cellFn: row => (
        <span className="font-medium text-foreground">{row.metric}</span>
      ),
    },
    {
      header: 'Week 1',
      key: 'week1',
      cellFn: row => renderWeekInput(row, 'week1'),
    },
    {
      header: 'Week 2',
      key: 'week2',
      cellFn: row => renderWeekInput(row, 'week2'),
    },
    {
      header: 'Week 3',
      key: 'week3',
      cellFn: row => renderWeekInput(row, 'week3'),
    },
    {
      header: 'Week 4',
      key: 'week4',
      cellFn: row => renderWeekInput(row, 'week4'),
    },
  ];

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-foreground">Recruiting Action Guide</h1>
          <p className="text-muted-foreground">
            A structured, interactive version of the PDF guide (Parts 1-12) with saved progress,
            copyable templates, and an editable metrics tracker.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-card border border-border px-3 py-2 text-sm">
              Progress: <span className="font-semibold">{completion.done}</span> /{' '}
              {completion.total}
            </div>
            <button
              className="rounded-xl border px-3 py-2 text-sm bg-card hover:bg-muted/50"
              onClick={resetAll}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-5">
          <Section title="Part 1: First 24 hours immediate setup actions" defaultOpen>
            <div className="grid gap-4">
              <Checklist
                title="Hour 1-4: Business foundation"
                items={data.p1.foundation}
                checked={checked}
                onToggle={toggle}
              />
              <Checklist
                title="Hour 5-8: Sourcing infrastructure"
                items={data.p1.sourcing}
                checked={checked}
                onToggle={toggle}
              />
              <Checklist
                title="Hour 9-24: Initial outreach preparation"
                items={data.p1.outreachPrep}
                checked={checked}
                onToggle={toggle}
              />
            </div>
          </Section>

          <Section title="Part 2: Week 1 daily priorities">
            <div className="grid gap-4">
              <Checklist
                title="Day 2: Candidate sourcing mastery"
                items={data.p2.day2}
                checked={checked}
                onToggle={toggle}
              />
              <Checklist
                title="Day 3: Client acquisition start"
                items={data.p2.day3}
                checked={checked}
                onToggle={toggle}
              />
              <Checklist
                title="Day 4: Develop your niche positioning"
                items={data.p2.day4}
                checked={checked}
                onToggle={toggle}
              />
              <Checklist
                title="Day 5: Operational excellence"
                items={data.p2.day5}
                checked={checked}
                onToggle={toggle}
              />
              <Checklist
                title="Day 6: Scale outreach"
                items={data.p2.day6}
                checked={checked}
                onToggle={toggle}
              />
              <Checklist
                title="Day 7: Week 1 review and planning"
                items={data.p2.day7}
                checked={checked}
                onToggle={toggle}
              />
            </div>
          </Section>

          <Section title="Part 3: First month milestones by week">
            <div className="grid gap-4">
              <Checklist
                title="Week 2: Build momentum"
                items={data.p3.week2}
                checked={checked}
                onToggle={toggle}
              />
              <Checklist
                title="Week 3: First placement pipeline"
                items={data.p3.week3}
                checked={checked}
                onToggle={toggle}
              />
              <Checklist
                title="Week 4: Scale and systematize"
                items={data.p3.week4}
                checked={checked}
                onToggle={toggle}
              />
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="font-semibold text-foreground">Month 1 success metrics</div>
                <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5">
                  <li>500+ candidates sourced</li>
                  <li>20+ client conversations</li>
                  <li>1-2 signed agreements</li>
                  <li>First placement in final stages</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="Part 4: Outreach message templates">
            <div className="grid gap-4">
              {data.templates.map(t => (
                <TemplateCard key={t.id} t={t} />
              ))}
            </div>
          </Section>

          <Section title="Part 5: Exact Boolean searches and GitHub queries">
            <div className="grid gap-4">
              {data.searchSnippets.map(s => (
                <CodeBlock key={s.label} label={s.label} text={s.text} />
              ))}
            </div>
          </Section>

          <Section title="Part 6: 20 target companies (Series B-D, recently funded)">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="font-semibold text-foreground">Target list</div>
              <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm text-foreground">
                {data.targetCompanies.map(c => (
                  <div key={c} className="rounded-xl border border-border bg-muted/30 p-3">
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section title="Part 7: Client acquisition process">
            <Checklist
              title="Process steps"
              items={data.p7.steps}
              checked={checked}
              onToggle={toggle}
            />
            <div className="mt-4 rounded-2xl border border-border bg-card p-4">
              <div className="font-semibold text-foreground">
                Discovery call agenda (30 minutes)
              </div>
              <ol className="mt-2 text-sm text-muted-foreground list-decimal pl-5">
                <li>Current team structure and growth plans (5 min)</li>
                <li>Immediate hiring needs and priorities (10 min)</li>
                <li>Past hiring challenges and pain points (5 min)</li>
                <li>Success criteria and timeline (5 min)</li>
                <li>Next steps and proposal (5 min)</li>
              </ol>
            </div>
          </Section>

          <Section title="Part 8: First recruiting agreement structure">
            <div className="grid gap-4">
              <Checklist
                title="Base terms & essentials"
                items={data.p8.terms}
                checked={checked}
                onToggle={toggle}
              />
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="font-semibold text-foreground">Contract essentials (copy)</div>
                <button
                  className="mt-2 rounded-xl border px-3 py-2 text-sm hover:bg-muted/50"
                  onClick={() => copy(data.p8.contractText)}
                >
                  Copy agreement skeleton
                </button>
                <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 bg-muted/30 rounded-xl p-3 border border-border">
                  {data.p8.contractText}
                </pre>
              </div>
            </div>
          </Section>

          <Section title="Part 9: Daily/weekly schedule">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="font-semibold text-foreground">Daily schedule</div>
                <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5">
                  {data.p9.daily.map(x => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="font-semibold text-foreground">Weekly allocation</div>
                <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5">
                  {data.p9.weekly.map(x => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                <div className="mt-4 font-semibold text-foreground">Time allocation targets</div>
                <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5">
                  {data.p9.timeAlloc.map(x => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          <Section title="Part 10: Metrics to track from day one">
            <div className="rounded-2xl border border-border bg-card p-4 overflow-auto">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-foreground">Weekly metrics tracker</div>
                <button
                  className="rounded-xl border px-3 py-2 text-sm hover:bg-muted/50"
                  onClick={() => copy(JSON.stringify(metrics, null, 2))}
                >
                  Copy JSON
                </button>
              </div>

              <div className="mt-3">
                <Report<MetricRow>
                  className="h-auto border-0 bg-transparent shadow-none"
                  data={metrics}
                  definition={{
                    columns: metricColumns,
                    data: metrics,
                    view: 'table' as any,
                    sortBy: 'metric',
                    activeFilters: [],
                    filters: [],
                  }}
                  search={false}
                />
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                Daily targets mentioned in the guide include things like{' '}
                <span className="font-medium text-foreground">75+ outbound activities</span>,{' '}
                <span className="font-medium text-foreground">20+ new candidates sourced</span>,
                and tracking response rates.
              </div>
            </div>
          </Section>

          <Section title="Part 11: Free resources to leverage immediately">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="font-semibold text-foreground">Must-join communities</div>
                <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5">
                  {data.p11.communities.map(x => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="font-semibold text-foreground">Free tools to maximize</div>
                <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5">
                  {data.p11.tools.map(x => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                <div className="mt-4 font-semibold text-foreground">Educational resources</div>
                <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5">
                  {data.p11.education.map(x => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          <Section title="Part 12: Exact niche focus for fastest success">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="font-semibold text-foreground">
                Recommended initial niche: Senior cloud/DevOps engineers
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Why: high demand, clear skill requirements (AWS, Kubernetes, Terraform), premium
                fees, and your technical background adds credibility.
              </div>

              <div className="mt-4 font-semibold text-foreground">Positioning statement (copy)</div>
              <button
                className="mt-2 rounded-xl border px-3 py-2 text-sm hover:bg-muted/50"
                onClick={() => copy(data.p12.positioning)}
              >
                Copy
              </button>
              <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 bg-muted/30 rounded-xl p-3 border border-border">
                {data.p12.positioning}
              </pre>

              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <div className="font-semibold text-foreground">Target candidates</div>
                  <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5">
                    {data.p12.candidates.map(x => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <div className="font-semibold text-foreground">
                    Alternative high-value niches
                  </div>
                  <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5">
                    {data.p12.alternatives.map(x => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-border bg-muted/30 p-4">
                <div className="font-semibold text-foreground">Success acceleration tips</div>
                <ol className="mt-2 text-sm text-muted-foreground list-decimal pl-5">
                  {data.p12.tips.map(x => (
                    <li key={x}>{x}</li>
                  ))}
                </ol>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function buildData() {
  const p1_foundation: ChecklistItem[] = [
    {
      id: uid('p1_f', 1),
      text: 'Set up Zoho Recruit free account',
      detail:
        'Free plan: 1 active job, unlimited candidates. Configure stages: Sourced -> Qualified -> Submitted -> Interview -> Offer -> Placed.',
    },
    {
      id: uid('p1_f', 2),
      text: 'Install essential Chrome extensions',
      detail: 'ContactOut, Hunter Email Finder, Clearbit Connect, Grammarly, Loom.',
    },
    {
      id: uid('p1_f', 3),
      text: 'Create professional Gmail account',
      detail:
        'Use a professional address + signature + Calendly link. Configure Hunter.io free (50 searches/month).',
    },
    {
      id: uid('p1_f', 4),
      text: 'Optimize LinkedIn profile',
      detail: 'Recruiter-focused headline + summary. Connect with 50 tech professionals.',
    },
  ];

  const p1_sourcing: ChecklistItem[] = [
    {
      id: uid('p1_s', 1),
      text: 'Master GitHub search',
      detail:
        'Example: location:"San Francisco" language:python followers:>10. Bookmark key searches. Track candidates.',
    },
    {
      id: uid('p1_s', 2),
      text: 'Join critical communities',
      detail:
        'Slack: People Geeks. Discord: The Coding Den. LinkedIn Groups: IT Recruiters. Reddit: r/recruiting, r/cscareerquestions.',
    },
    {
      id: uid('p1_s', 3),
      text: 'Set up pipeline tracking',
      detail:
        'Google Sheet: Name, Company, LinkedIn, Email, Position, Stage, Last Contact, Notes. Separate sheets: Candidates, Clients, Pipeline Metrics.',
    },
  ];

  const p1_outreachPrep: ChecklistItem[] = [
    {
      id: uid('p1_o', 1),
      text: 'Create email templates library',
      detail:
        '5 candidate templates + 5 client templates (VP Eng/CTO/Talent Head/Founder + follow-up series).',
    },
    {
      id: uid('p1_o', 2),
      text: 'Research first 10 target companies',
      detail:
        'Document VP Engineering and Talent Head contacts and track in client sheet.',
    },
  ];

  const p2_day2: ChecklistItem[] = [
    {
      id: uid('p2_d2', 1),
      text: 'Practice Boolean searches on LinkedIn (morning)',
      detail: '("Senior Python Developer" OR "Staff Engineer") AND (Django OR FastAPI) NOT Junior',
    },
    {
      id: uid('p2_d2', 2),
      text: 'Source 25 senior engineer profiles using GitHub',
      detail: 'language:python followers:>10 location:"United States" "senior" in:bio',
    },
    { id: uid('p2_d2', 3), text: 'Send 10 connection requests with personalized notes', detail: 'Target senior engineers.' },
    { id: uid('p2_d2', 4), text: 'Create candidate database with first 25 profiles' },
    { id: uid('p2_d2', 5), text: 'Set up weekly sourcing rhythm', detail: '2 hours daily.' },
  ];

  const p2_day3: ChecklistItem[] = [
    {
      id: uid('p2_d3', 1),
      text: 'Research 5 companies from target list',
      detail: 'Find VPs of Engineering + direct emails (Hunter.io).',
    },
    { id: uid('p2_d3', 2), text: 'Prepare personalized outreach for each company' },
    { id: uid('p2_d3', 3), text: 'Send first 5 client outreach emails' },
  ];

  const p2_day4: ChecklistItem[] = [
    {
      id: uid('p2_d4', 1),
      text: 'Choose ONE primary niche',
      detail: 'Recommended examples: AI/ML or Cloud/DevOps (highest demand).',
    },
    { id: uid('p2_d4', 2), text: 'Set geographic focus', detail: 'Example: Bay Area + Remote.' },
    { id: uid('p2_d4', 3), text: 'Set seniority focus', detail: 'Senior / Staff / Principal only.' },
    { id: uid('p2_d4', 4), text: 'Update LinkedIn headline to reflect niche' },
    { id: uid('p2_d4', 5), text: 'Join niche-specific communities', detail: 'e.g., MLOps Community (if AI focus).' },
    { id: uid('p2_d4', 6), text: 'Create a content post about your niche expertise' },
  ];

  const p2_day5: ChecklistItem[] = [
    {
      id: uid('p2_d5', 1),
      text: 'Set up Calendly free account',
      detail: 'Create a standard 30-min Discovery Call appointment.',
    },
    { id: uid('p2_d5', 2), text: 'Build interview prep document for candidates' },
    {
      id: uid('p2_d5', 3),
      text: 'Establish daily routine',
      detail:
        '8:30-10 client outreach; 10-11:30 sourcing; 1:30-4 candidate outreach; 4-5 admin/follow-ups.',
    },
  ];

  const p2_day6: ChecklistItem[] = [
    { id: uid('p2_d6', 1), text: 'Send 20 candidate connection requests' },
    { id: uid('p2_d6', 2), text: 'Send 10 client outreach emails' },
    { id: uid('p2_d6', 3), text: 'Follow up on Day 3 client emails' },
    {
      id: uid('p2_d6', 4),
      text: 'Post first LinkedIn article',
      detail: 'Example: "What 20 Years of Coding Taught Me About Hiring Engineers".',
    },
  ];

  const p2_day7: ChecklistItem[] = [
    { id: uid('p2_d7', 1), text: 'Review Week 1 metrics', detail: 'Connections made, emails sent, responses received.' },
    {
      id: uid('p2_d7', 2),
      text: 'Plan Week 2 targets',
      detail: '100 candidate profiles sourced; 50 outreach messages; 5 client conversations scheduled.',
    },
  ];

  const p3_week2: ChecklistItem[] = [
    { id: uid('p3_w2', 1), text: 'Reach 100+ candidates in database' },
    { id: uid('p3_w2', 2), text: 'Schedule 5 client discovery calls' },
    { id: uid('p3_w2', 3), text: 'Receive first job requirement' },
    {
      id: uid('p3_w2', 4),
      text: 'Maintain ~75+ outbound activities daily',
      detail: 'Calls, emails, LinkedIn messages; plus 2h sourcing, 3h outreach, 2h biz dev.',
    },
    { id: uid('p3_w2', 5), text: 'Sign first client by end of week' },
  ];

  const p3_week3: ChecklistItem[] = [
    { id: uid('p3_w3', 1), text: 'Submit 3-5 candidates for first role' },
    { id: uid('p3_w3', 2), text: 'Schedule candidate interviews' },
    { id: uid('p3_w3', 3), text: 'Build relationship with hiring manager', detail: 'Client check-ins every 48 hours.' },
    {
      id: uid('p3_w3', 4),
      text: 'Negotiate first fee agreement',
      detail: 'Example: 25% of base salary.',
    },
  ];

  const p3_week4: ChecklistItem[] = [
    { id: uid('p3_w4', 1), text: 'Run 2-3 active searches' },
    { id: uid('p3_w4', 2), text: 'Reach 200+ candidates in database' },
    { id: uid('p3_w4', 3), text: 'Get first offer extended' },
    { id: uid('p3_w4', 4), text: 'Implement Sales Navigator trial', detail: 'Upgrade/try as needed.' },
    { id: uid('p3_w4', 5), text: 'Create standard operating procedures' },
    { id: uid('p3_w4', 6), text: 'Plan Month 2 growth strategy' },
  ];

  const templates: Template[] = [
    {
      id: 'tpl_candidate_initial',
      title: 'Initial candidate outreach (LinkedIn)',
      body:
        `Hi [Name],\n` +
        `\n` +
        `Your work on [specific project/technology] at [Company] caught my attention — particularly [specific achievement].\n` +
        `\n` +
        `I’m working with [Client Company], where they’re building [exciting project]. They need a [role] who can [specific challenge]. Given your experience with [relevant skill], you’d be perfect.\n` +
        `\n` +
        `The role offers:\n` +
        `• [Technical challenge]\n` +
        `• [Compensation range]\n` +
        `• [Growth opportunity]\n` +
        `\n` +
        `Open to a quick chat this week?\n` +
        `\n` +
        `[Your name]`,
    },
    {
      id: 'tpl_company_outreach',
      title: 'Company outreach (Email to VP Engineering)',
      subject: '[Company] - Scaling engineering after Series [X]?',
      body:
        `Hi [Name],\n` +
        `\n` +
        `Saw [Company] just raised $[amount] — exciting times ahead!\n` +
        `\n` +
        `With 20+ years writing code myself, I understand the bar you need to maintain while scaling from [current] to [target] engineers.\n` +
        `\n` +
        `I specialize in placing senior engineers at companies like yours. My approach:\n` +
        `• Target passive candidates at [competitor companies]\n` +
        `• Technical assessment I can actually evaluate\n` +
        `• 28-day average time-to-hire\n` +
        `\n` +
        `Recent win: Helped [similar company] hire 3 staff engineers in 6 weeks.\n` +
        `\n` +
        `Worth 15 minutes to discuss your hiring priorities?\n` +
        `\n` +
        `Best,\n` +
        `[Your name]\n` +
        `[Phone]`,
    },
    {
      id: 'tpl_followup_3days',
      title: 'Follow-up (3 days later)',
      subject: 'Re: [Original subject]',
      body:
        `Hi [Name],\n` +
        `\n` +
        `Following up on my note about [Company]’s engineering scaling.\n` +
        `\n` +
        `Quick data point: Companies that delay senior hires by 60 days lose an average of $100K in productivity.\n` +
        `\n` +
        `I have bandwidth for 2 new clients this month. Would Thursday or Friday work for a brief call?\n` +
        `\n` +
        `[Your name]`,
    },
  ];

  const searchSnippets = [
    {
      label: 'LinkedIn Boolean: Senior Python developers',
      text: `("Senior Python" OR "Staff Python" OR "Principal Engineer") AND (Django OR Flask OR FastAPI) NOT Junior`,
    },
    {
      label: 'LinkedIn Boolean: DevOps/SRE',
      text: `("Senior DevOps" OR "Site Reliability Engineer" OR "SRE") AND (Kubernetes OR Docker OR Terraform)`,
    },
    {
      label: 'LinkedIn Boolean: AI/ML engineers',
      text: `("Machine Learning Engineer" OR "ML Engineer" OR "AI Engineer") AND (TensorFlow OR PyTorch)`,
    },
    {
      label: 'GitHub advanced: Senior Python contributors',
      text: `language:python followers:>20 location:"San Francisco" created:>2020-01-01`,
    },
    {
      label: 'GitHub advanced: React experts',
      text: `language:javascript stars:>10 "react" in:description followers:>15`,
    },
    {
      label: 'GitHub advanced: Go backend engineers',
      text: `language:go ("microservices" OR "distributed systems") followers:>10 location:"New York"`,
    },
    {
      label: 'Google X-ray: LinkedIn Python seniors (SF)',
      text: `site:linkedin.com/in/ "San Francisco" "Senior Software Engineer" Python -jobs -dir`,
    },
    {
      label: 'Google X-ray: GitHub ML readmes (SF)',
      text: `site:github.com "machine learning" "San Francisco" "readme.md"`,
    },
    {
      label: 'Google X-ray: StackOverflow high-rep Python (SF)',
      text: `site:stackoverflow.com/users "10000 reputation" Python San Francisco`,
    },
  ];

  const targetCompanies = [
    'Tier 1: Glean — $260M Series E (Sept 2024), AI search, Palo Alto',
    'Tier 1: Cyera — $300M Series D (Nov 2024), Data security, NYC',
    'Tier 1: Writer — $200M Series C (Nov 2024), Enterprise AI, San Francisco',
    'Tier 1: Kore.ai — $150M Series D (Jan 2024), Conversational AI, Orlando',
    'Tier 2: Harvey — $100M Series C, Legal AI, San Francisco',
    'Tier 2: Hebbia — $130M Series B, Document AI, New York',
    'Tier 2: Abnormal Security — $250M Series D, Email security, San Francisco',
    'Tier 2: Magic — $320M Series C, AI coding, San Francisco',
    'Tier 2: Codeium — $150M Series C, Dev tools, Mountain View',
    'Tier 2: DevRev — $100M Series A, AI support, Palo Alto',
    'Tier 3: Tractian — $120M Series C, Industrial AI, Atlanta',
    'Tier 3: Abridge — $150M Series C, Medical AI, Pittsburgh',
    'Tier 3: Groq — $640M Series D, AI chips, Mountain View',
    'Tier 3: Liquid AI — $250M Series A, Efficient AI, Cambridge',
    'Tier 3: Axonius — $200M Series E, Cybersecurity, NYC',
    'Tier 3: Socket — $40M Series B, Dev security, Remote',
    'Tier 3: Poolside — $500M Series B, AI coding, San Francisco',
    'Tier 3: Wiz — $1B Series D, Cloud security, NYC/Tel Aviv',
    'Tier 3: One (Walmart) — $300M, Fintech, Sacramento',
    'Tier 3: Zest AI — $200M growth, Credit AI, Burbank',
  ];

  const p7_steps: ChecklistItem[] = [
    {
      id: uid('p7', 1),
      text: 'Research (30 minutes per company)',
      detail: 'Check recent funding, find VP Eng/CTO, read tech posts, note open roles.',
    },
    {
      id: uid('p7', 2),
      text: 'Find contact information',
      detail: 'Hunter.io patterns, team page, Clearbit, try firstname.lastname@company.com.',
    },
    {
      id: uid('p7', 3),
      text: 'Send initial outreach',
      detail:
        'Reference recent news + your technical credibility + outcomes (time-to-hire, pass rate, retention).',
    },
    {
      id: uid('p7', 4),
      text: 'Follow-up cadence',
      detail: 'Day 0 initial; Day 3 follow-up 1; Day 7 follow-up 2; Day 14 final follow-up.',
    },
  ];

  const p8_terms: ChecklistItem[] = [
    { id: uid('p8', 1), text: 'Fee structure', detail: '25% senior; 30% staff/principal; 35% specialized (AI/ML, security).' },
    { id: uid('p8', 2), text: 'Payment terms', detail: 'Net 30 from start date; invoice upon acceptance.' },
    { id: uid('p8', 3), text: 'Guarantee period', detail: '90-day replacement guarantee; prorated refund 75/50/25% over months 1-3.' },
    { id: uid('p8', 4), text: 'Candidate ownership', detail: 'Presented candidates "owned" for 6 months from introduction.' },
    { id: uid('p8', 5), text: 'Termination clause', detail: 'Either party may terminate with 5 days written notice.' },
  ];

  const contractText =
    `RECRUITING SERVICES AGREEMENT\n` +
    `\n` +
    `1. Services: Recruiter will source and present qualified candidates for [Position]\n` +
    `2. Fee: 25% of hired candidate's first-year base salary\n` +
    `3. Payment: Due within 30 days of candidate start date\n` +
    `4. Guarantee: 90-day replacement guarantee with prorated refund\n` +
    `5. Ownership: Presented candidates remain "owned" for 6 months from introduction\n` +
    `6. Confidentiality: Mutual NDA covering candidate and company information\n` +
    `7. Termination: Either party may terminate with 5 days written notice`;

  const p9_daily = [
    '8:00-8:30am — Email review, day planning',
    '8:30-10:00am — Business development calls/emails (best for executives)',
    '10:00-11:30am — Candidate sourcing (GitHub, LinkedIn, Stack Overflow)',
    '11:30am-12:00pm — Admin tasks, CRM updates',
    '12:00-1:00pm — Lunch break',
    '1:00-3:00pm — Candidate outreach (developers more responsive afternoons)',
    '3:00-4:00pm — Candidate screening calls',
    '4:00-5:00pm — Follow-ups, pipeline review, next day planning',
  ];

  const p9_weekly = [
    'Monday — Week planning, client check-ins',
    'Tuesday-Thursday — Heavy outreach and sourcing',
    'Friday — Pipeline review, content creation, relationship building',
  ];

  const p9_timeAlloc = [
    '40% — Active recruiting (outreach, screening)',
    '25% — Business development (client acquisition)',
    '20% — Sourcing and research',
    '15% — Administration and operations',
  ];

  const metricsSeed: MetricRow[] = [
    { metric: 'Candidates Sourced', week1: 100, week2: 150, week3: 200, week4: 250 },
    { metric: 'Outreach Sent', week1: 50, week2: 100, week3: 150, week4: 200 },
    { metric: 'Responses', week1: 10, week2: 25, week3: 40, week4: 60 },
    { metric: 'Clients Contacted', week1: 20, week2: 30, week3: 20, week4: 20 },
    { metric: 'Interviews Scheduled', week1: 2, week2: 5, week3: 8, week4: 12 },
  ];

  const p11_communities = [
    'Slack: People Geeks',
    'Discord: The Coding Den',
    'LinkedIn: IT Recruiters group',
    'Reddit: r/recruiting, r/cscareerquestions',
  ];

  const p11_tools = [
    'LinkedIn (free): master advanced search operators',
    'GitHub: advanced search for finding developers',
    'Hunter.io: 50 free email searches monthly',
    'Calendly: free appointment scheduling',
    'Loom: free video messages',
  ];

  const p11_education = [
    'Podcasts: Top Tech Recruiter; Recruiting Brainfood',
    'YouTube: Recruiting Brainfood channel',
    'Free courses: LinkedIn Learning technical recruiting course',
    'Newsletters: Recruiting Brainfood weekly',
  ];

  const p12_positioning =
    `I place senior DevOps engineers at Series B-D startups. With 20 years writing code, I actually\n` +
    `understand infrastructure as code, CI/CD pipelines, and cloud architecture. I find engineers who’ve\n` +
    `scaled systems from 10K to 10M users.`;

  const p12_candidates = [
    'Current: FAANG companies, unicorns',
    'Experience: 5-10 years, proven scale experience',
    'Skills: AWS/GCP, Kubernetes, Terraform, Python/Go',
    'Target companies: Series B-D with recent funding; 50-200 employees; building for scale',
  ];

  const p12_alternatives = [
    'AI/ML Engineers — highest growth, premium fees',
    'Security Engineers — urgent demand, limited supply',
    'Staff+ Engineers — higher fees, relationship-based',
  ];

  const p12_tips = [
    'Week 1: Focus 100% on setup and learning',
    'Week 2: Aggressive outreach (high activity volume)',
    'Week 3: First client signed, deep sourcing',
    'Week 4: Multiple searches, building momentum',
    'Month 2: First placement closed, scaling operations',
  ];

  const allChecklistIds = [
    ...p1_foundation,
    ...p1_sourcing,
    ...p1_outreachPrep,
    ...p2_day2,
    ...p2_day3,
    ...p2_day4,
    ...p2_day5,
    ...p2_day6,
    ...p2_day7,
    ...p3_week2,
    ...p3_week3,
    ...p3_week4,
    ...p7_steps,
    ...p8_terms,
  ].map(x => x.id);

  return {
    p1: { foundation: p1_foundation, sourcing: p1_sourcing, outreachPrep: p1_outreachPrep },
    p2: { day2: p2_day2, day3: p2_day3, day4: p2_day4, day5: p2_day5, day6: p2_day6, day7: p2_day7 },
    p3: { week2: p3_week2, week3: p3_week3, week4: p3_week4 },
    templates,
    searchSnippets,
    targetCompanies,
    p7: { steps: p7_steps },
    p8: { terms: p8_terms, contractText },
    p9: { daily: p9_daily, weekly: p9_weekly, timeAlloc: p9_timeAlloc },
    metricsSeed,
    p11: { communities: p11_communities, tools: p11_tools, education: p11_education },
    p12: { positioning: p12_positioning, candidates: p12_candidates, alternatives: p12_alternatives, tips: p12_tips },
    allChecklistIds,
  };
}
