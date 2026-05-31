import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';

import Link from 'next/link';

const growthTools = [
  {
    href: '/action-plan',
    name: 'Action Plan',
    description: 'Weekly execution roadmap',
  },
  {
    href: '/upwork-guide',
    name: 'Upwork Automation',
    description: 'Embedded Upwork browser + AI proposal and bid suggestions',
  },
  {
    href: '/lead-generation/search',
    name: 'Prospect Discovery',
    description: 'Find prospects and build outreach lists',
  },
  {
    href: '/lead-generation',
    name: 'Lead Generation',
    description: 'Templates and outreach workflows',
  },
  {
    href: '/recruiting',
    name: 'Recruiting Hub',
    description: 'Run recruiting pipeline and client acquisition',
  },
  {
    href: '/recruiting/training',
    name: 'Recruiting Training',
    description: 'Curriculum and onboarding for recruiting',
  },
  {
    href: '/recruiting/candidates/search',
    name: 'Candidate Search',
    description: 'Source and track candidates',
  },
  {
    href: '/email-automation',
    name: 'Email Automation',
    description: 'Automated sequences and follow-ups',
  },
  {
    href: '/linkedin-integration',
    name: 'LinkedIn Tools',
    description: 'LinkedIn automation and sourcing',
  },
  {
    href: '/execution-calendar',
    name: 'Execution Calendar',
    description: 'Timeline and task execution planning',
  },
  {
    href: '/business-intelligence',
    name: 'Business Intelligence',
    description: 'Insights and forecasting',
  },
  {
    href: '/business-documentation',
    name: 'Business Documentation',
    description: 'Reference docs for systems and processes',
  },
  {
    href: '/api-validation',
    name: 'API Validation',
    description: 'Integration health and monitoring',
  },
  {
    href: '/api-setup',
    name: 'API Setup',
    description: 'Configure keys and integrations',
  },
  {
    href: '/automation-sequences',
    name: 'Automation Sequences',
    description: 'Multi-channel automation workflows',
  },
  {
    href: '/email-marketing',
    name: 'Email Marketing',
    description: 'Campaigns, subscribers, analytics',
  },
  {
    href: '/recruiting-dashboard',
    name: 'Recruiting Dashboard',
    description: 'Candidates, applications, talent pools',
  },
  {
    href: '/revenue-analytics',
    name: 'Revenue Analytics',
    description: 'Track pipeline metrics and revenue',
  },
  {
    href: '/agency-leads',
    name: 'Agency Leads',
    description: 'Lead management and pipeline',
  },
  {
    href: '/lead-data-integration',
    name: 'Lead Data Integration',
    description: 'Import/enrich lead data',
  },
  {
    href: '/recruiting/network-mapping',
    name: 'Network Mapping',
    description: 'Map your network and outreach targets',
  },
];

export default function BusinessToolsPage() {
  return (
    <Page className="h-full">
      <PageHeader
        title="Business Growth Tools"
        description="All growth tools and utilities (ported from agency-base)"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {growthTools.map(tool => (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-lg border bg-card p-4 hover:bg-muted/40 transition-colors"
            >
              <div className="text-sm font-medium text-foreground">
                {tool.name}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {tool.description}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {tool.href}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Page>
  );
}
