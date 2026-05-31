import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@summoniq/applab-ui';
import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';
import { Briefcase, ExternalLink, Sparkles } from 'lucide-react';
import { FindWorkClient } from './find-work-client';

type Resource = {
  name: string;
  href: string;
  note?: string;
  tags?: readonly string[];
};

type ResourceSection = {
  title: string;
  description: string;
  items: readonly Resource[];
};

function ResourceLink({ item }: { item: Resource }) {
  return (
    <li className="flex flex-col gap-0.5 py-2">
      <a
        className="group inline-flex w-fit items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
        href={item.href}
        target="_blank"
        rel="noreferrer"
      >
        {item.name}
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
      </a>
      {item.note ? (
        <p className="text-xs text-muted-foreground">{item.note}</p>
      ) : null}
      {item.tags?.length ? (
        <p className="text-[11px] text-muted-foreground/80">
          {item.tags.join(' • ')}
        </p>
      ) : null}
    </li>
  );
}

const sections: readonly ResourceSection[] = [
  {
    title: 'Marketplaces (quickest inbound)',
    description:
      'Bid-based marketplaces and curated networks. Good for filling gaps; qualify hard to avoid low-value work.',
    items: [
      {
        name: 'Toptal',
        href: 'https://www.toptal.com/',
        note: 'Curated talent network; higher rates, strong screening.',
        tags: ['marketplace', 'screened'],
      },
      {
        name: 'Upwork',
        href: 'https://www.upwork.com/',
        note: 'Huge volume; build a focused profile + case studies + tight proposal templates.',
        tags: ['marketplace', 'volume'],
      },
      {
        name: 'Contra',
        href: 'https://contra.com/',
        note: 'Portfolio-forward; can work well for design/dev hybrid studios.',
        tags: ['marketplace', 'portfolio'],
      },
      {
        name: 'Braintrust',
        href: 'https://www.usebraintrust.com/',
        note: 'Talent network; often better client quality than pure bid marketplaces.',
        tags: ['network'],
      },
      {
        name: 'Gun.io',
        href: 'https://www.gun.io/',
        note: 'Engineering staffing network.',
        tags: ['network'],
      },
      {
        name: 'A.Team',
        href: 'https://www.a.team/',
        note: 'Teams + product builds; some good project-based work.',
        tags: ['teams'],
      },
      {
        name: 'Catalant',
        href: 'https://gocatalant.com/',
        note: 'Consulting-style projects; enterprise leaning.',
        tags: ['consulting'],
      },
    ],
  },
  {
    title: 'Product/dev agencies & partner directories (warm leads)',
    description:
      'Get discovered via vendor directories and ecosystem partner lists. Strong if you specialize (e.g. “Next.js + Postgres + AI”).',
    items: [
      {
        name: 'Clutch',
        href: 'https://clutch.co/',
        note: 'Agency directory; reviews + niche pages can drive consistent inbound.',
        tags: ['directory'],
      },
      {
        name: 'GoodFirms',
        href: 'https://www.goodfirms.co/',
        note: 'Directory; similar playbook to Clutch.',
        tags: ['directory'],
      },
      {
        name: 'G2 Services',
        href: 'https://www.g2.com/services',
        note: 'Service providers + software adjacency.',
        tags: ['directory'],
      },
      {
        name: 'PartnerStack (partner directory discovery)',
        href: 'https://partnerstack.com/',
        note: 'Good for finding SaaS ecosystems and partner programs.',
        tags: ['partners', 'ecosystems'],
      },
      {
        name: 'Webflow Experts',
        href: 'https://experts.webflow.com/',
        note: 'If you do Webflow + custom integrations.',
        tags: ['partners', 'web'],
      },
      {
        name: 'Shopify Partners',
        href: 'https://www.shopify.com/partners',
        note: 'Ecom builds + retainers; strong recurring potential.',
        tags: ['partners', 'ecommerce'],
      },
      {
        name: 'AWS Partner Network',
        href: 'https://partners.amazonaws.com/',
        note: 'Cloud modernization + implementation projects.',
        tags: ['partners', 'cloud'],
      },
    ],
  },
  {
    title: 'Job boards that frequently list contract / project work',
    description:
      'Search for “contract”, “consulting”, “agency”, “fractional”, “implementation”. Build a repeatable outreach + follow-up workflow.',
    items: [
      {
        name: 'LinkedIn Jobs',
        href: 'https://www.linkedin.com/jobs/',
        tags: ['jobs'],
      },
      {
        name: 'Wellfound (AngelList Talent)',
        href: 'https://wellfound.com/jobs',
        tags: ['startups'],
      },
      {
        name: 'YC Work at a Startup',
        href: 'https://www.ycombinator.com/jobs',
        tags: ['startups'],
      },
      {
        name: 'Hacker News “Who is hiring?”',
        href: 'https://news.ycombinator.com/submitted?id=whoishiring',
        tags: ['community'],
      },
      { name: 'Remote OK', href: 'https://remoteok.com/', tags: ['remote'] },
      {
        name: 'We Work Remotely',
        href: 'https://weworkremotely.com/',
        tags: ['remote'],
      },
    ],
  },
  {
    title: 'RFP portals (larger deals, slower cycles)',
    description:
      'Not fun, but effective. Pick 1–2 verticals, build reusable response blocks, and only bid when you can win.',
    items: [
      {
        name: 'SAM.gov',
        href: 'https://sam.gov/',
        note: 'US federal opportunities.',
        tags: ['government'],
      },
      {
        name: 'Bonfire',
        href: 'https://gobonfire.com/',
        note: 'Many public sector procurements use this.',
        tags: ['government'],
      },
      {
        name: 'BidNet',
        href: 'https://www.bidnet.com/',
        note: 'Aggregated public opportunities.',
        tags: ['government'],
      },
      {
        name: 'FindRFP',
        href: 'https://www.findrfp.com/',
        tags: ['aggregator'],
      },
    ],
  },
  {
    title: 'Communities where buyers hang out (best ROI over time)',
    description:
      'Pick 2–3 places, contribute weekly, and build “micro proof” (small wins + screenshots + benchmarks).',
    items: [
      {
        name: 'Indie Hackers',
        href: 'https://www.indiehackers.com/',
        tags: ['founders'],
      },
      {
        name: 'r/startups',
        href: 'https://www.reddit.com/r/startups/',
        tags: ['founders'],
      },
      {
        name: 'r/Entrepreneur',
        href: 'https://www.reddit.com/r/Entrepreneur/',
        tags: ['founders'],
      },
      { name: 'Lobsters', href: 'https://lobste.rs/', tags: ['engineering'] },
      { name: 'DEV Community', href: 'https://dev.to/', tags: ['engineering'] },
    ],
  },
  {
    title:
      'Outbound & research tooling (turn “I can build anything” into pipeline)',
    description:
      'A simple system: identify target accounts → find buyer → send 3-step sequence → book call → deliver a tight scope.',
    items: [
      {
        name: 'Apollo',
        href: 'https://www.apollo.io/',
        note: 'Prospecting database + sequences.',
        tags: ['prospecting'],
      },
      {
        name: 'Clay',
        href: 'https://clay.com/',
        note: 'Enrichment + workflow automation for outbound.',
        tags: ['enrichment'],
      },
      {
        name: 'LinkedIn Sales Navigator',
        href: 'https://business.linkedin.com/sales-solutions/sales-navigator',
        tags: ['prospecting'],
      },
      {
        name: 'Lemlist',
        href: 'https://lemlist.com/',
        note: 'Email sequences; solid deliverability tooling.',
        tags: ['outreach'],
      },
      {
        name: 'Instantly',
        href: 'https://instantly.ai/',
        note: 'High-volume email outreach (use carefully).',
        tags: ['outreach'],
      },
      {
        name: 'Mailreach',
        href: 'https://mailreach.co/',
        note: 'Email warmup/deliverability support.',
        tags: ['deliverability'],
      },
    ],
  },
  {
    title: 'Sales ops: CRM, proposals, contracts, invoicing, time tracking',
    description:
      'If you want consistent clients, treat your pipeline like a product: stages, SLAs, templates, and a weekly review.',
    items: [
      {
        name: 'HubSpot CRM',
        href: 'https://www.hubspot.com/products/crm',
        tags: ['crm'],
      },
      { name: 'Pipedrive', href: 'https://www.pipedrive.com/', tags: ['crm'] },
      { name: 'Attio', href: 'https://attio.com/', tags: ['crm'] },
      {
        name: 'PandaDoc',
        href: 'https://www.pandadoc.com/',
        note: 'Proposals + e-sign.',
        tags: ['proposals'],
      },
      {
        name: 'DocuSign',
        href: 'https://www.docusign.com/',
        tags: ['contracts'],
      },
      {
        name: 'Stripe Invoicing',
        href: 'https://stripe.com/invoicing',
        tags: ['billing'],
      },
      {
        name: 'Harvest',
        href: 'https://www.getharvest.com/',
        tags: ['time-tracking'],
      },
      {
        name: 'Toggl Track',
        href: 'https://toggl.com/track/',
        tags: ['time-tracking'],
      },
    ],
  },
  {
    title: 'Delivery accelerators (close faster, deliver cleaner)',
    description:
      'These aren’t “lead sources”, but they drastically increase close rate and referrals.',
    items: [
      {
        name: 'Project scoping checklist (Notion)',
        href: 'https://www.notion.so/templates',
        note: 'Search templates for “project scope”, “SOW”, “client onboarding”.',
        tags: ['templates'],
      },
      {
        name: 'Airtable templates',
        href: 'https://www.airtable.com/templates',
        note: 'Great for CRM-lite and project intake.',
        tags: ['templates'],
      },
      {
        name: 'Linear',
        href: 'https://linear.app/',
        note: 'Crisp execution + client confidence.',
        tags: ['delivery'],
      },
      {
        name: 'Sentry',
        href: 'https://sentry.io/',
        note: 'Installs fast; improves reliability and trust.',
        tags: ['quality'],
      },
      {
        name: 'PostHog',
        href: 'https://posthog.com/',
        note: 'Product analytics; easy add-on for “we’ll measure impact”.',
        tags: ['analytics'],
      },
    ],
  },
] as const;

export default function FindWorkPage() {
  return (
    <Page className="flex h-full min-h-0 flex-col">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <span className="rounded-lg bg-amber-500/10 p-2">
              <Briefcase className="h-5 w-5 text-amber-500" />
            </span>
            Find Clients & Projects
          </span>
        }
        description="A curated list of places to find client work, plus the tooling to turn it into a repeatable pipeline."
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="secondary">
              <a href="/clients">Track clients</a>
            </Button>
            <Button asChild variant="secondary">
              <a href="/projects">Track projects</a>
            </Button>
            <Button asChild>
              <a
                href="https://www.linkedin.com/sales/"
                target="_blank"
                rel="noreferrer"
              >
                <Sparkles className="h-4 w-4" />
                Start outbound
              </a>
            </Button>
          </div>
        }
      />

      <div className="min-h-0 flex-1 overflow-auto overflow-x-hidden">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          <FindWorkClient />

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Fast path</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Pick 1 marketplace + 1 directory + 1 community. Publish 2–3
                tight case studies, then run a weekly cadence: 30 targeted
                leads, 10 personalized reach-outs, 3 follow-ups.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Positioning that wins</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                “We build anything” loses. “We ship Next.js + Postgres products
                with AI features in 4–8 weeks” wins. Specialize by outcome,
                audience, or tech stack—and prove it with screenshots + metrics.
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {sections.map(section => (
              <Card key={section.title} className="h-fit">
                <CardHeader>
                  <CardTitle className="text-base">{section.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-border/60">
                    {section.items.map(item => (
                      <ResourceLink key={item.href} item={item} />
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                A simple client acquisition stack (copy/paste)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-border/60 p-4">
                  <p className="font-medium text-foreground">Lead sources</p>
                  <p>
                    One directory + one ecosystem partner program + one
                    community, then add 1 marketplace for gap-filling.
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 p-4">
                  <p className="font-medium text-foreground">Workflow</p>
                  <p>
                    CRM pipeline stages, proposal template, SOW template, and a
                    weekly review (pipeline + delivery health).
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 p-4">
                  <p className="font-medium text-foreground">Proof</p>
                  <p>
                    2 case studies with “before/after” + numbers, plus 1
                    teardown post per week in your niche.
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 p-4">
                  <p className="font-medium text-foreground">Offer</p>
                  <p>
                    Fixed-scope “starter” (1–2 weeks) → build phase (4–8 weeks)
                    → retainer for iteration + analytics + reliability.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Page>
  );
}
