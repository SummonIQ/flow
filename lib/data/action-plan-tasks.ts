export interface ActionPlanTask {
  id: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timeEstimate: string;
  link: string;
  deliverables?: string[];
  steps?: string[];
  successCriteria?: string;
}

export const actionPlanTasks: ActionPlanTask[] = [
  {
    id: 1,
    title: 'Find 20 High-Quality Prospects',
    description:
      'Use Apollo.io integration to find tech companies (React/Node.js stack) with 50-200 employees, $10M+ revenue, recent funding/growth. Target CTOs, VP Engineering, Heads of Product in SF Bay Area, Austin, NYC, Seattle.',
    priority: 'high',
    timeEstimate: '2-3 hours',
    link: '/lead-data-integration',
    deliverables: [
      '20 qualified prospect profiles saved in system',
      'Contact info enriched (email, phone, LinkedIn)',
      'Company research notes for each prospect',
      'Prioritized outreach list (1-5 rating)',
    ],
    steps: [
      'Search companies using filters: Tech industry, 50-200 employees, $10M+ revenue',
      'Identify decision makers: CTO, VP Eng, Head of Product roles',
      'Enrich contact data using Apollo.io integration',
      'Research recent company news, funding, product launches',
      'Score prospects 1-5 based on fit and timing',
      'Save all data to CRM with notes and next actions',
    ],
    successCriteria:
      '20 prospects with complete profiles, valid email addresses, and research notes ready for personalized outreach',
  },
  {
    id: 2,
    title: 'Launch Personalized Email Campaign (5 prospects)',
    description:
      "Send highly personalized emails using 'Value-First Approach' template. Offer free technical audit/consultation specific to each company's stack and challenges. Track opens/replies.",
    priority: 'high',
    timeEstimate: '2 hours',
    link: '/email-automation',
    deliverables: [
      '5 personalized emails sent with custom value props',
      'Follow-up sequence activated for each prospect',
      'Email tracking configured for opens/clicks',
      'Response handling process documented',
    ],
    steps: [
      'Select top 5 prospects from research (highest scoring)',
      'Customize email template with specific company details',
      'Reference recent company news, tech stack, or challenges',
      'Craft specific audit offer (React performance, Node.js scaling, etc.)',
      'Set up automated follow-up sequence (3-5 touchpoints)',
      'Configure tracking and response alerts',
      'Schedule sends for optimal timing (Tue-Thu, 10am-2pm)',
    ],
    successCriteria:
      '5 emails sent with 18-22% open rate, 3-5% reply rate expected, follow-up sequences active',
  },
  {
    id: 3,
    title: 'Build Professional Network Map (100+ contacts)',
    description:
      'Create comprehensive contact database of professional network including former colleagues, clients, freelancers, contractors, meetup connections, conference contacts. Categorize by relationship strength and recruiting potential.',
    priority: 'high',
    timeEstimate: '4-5 hours',
    link: '/recruiting/network-mapping',
    deliverables: [
      'Network spreadsheet with 100+ contacts organized by category',
      'Contact info updated (email, phone, LinkedIn, current company)',
      'Relationship strength scoring (A/B/C tier)',
      'Recruiting potential assessment for each contact',
      'Prioritized outreach list of top 20 warm contacts',
    ],
    steps: [
      'Export contacts from LinkedIn, email, phone, Slack workspaces',
      'Categorize: Former colleagues, clients, contractors, meetup/conference contacts',
      'Update current employment info via LinkedIn research',
      'Score relationship strength: A (close), B (professional), C (acquaintance)',
      'Assess recruiting potential: hiring manager, referrer, candidate source',
      'Create outreach priority list starting with A-tier contacts',
      'Draft personalized messages for top 20 contacts',
    ],
    successCriteria:
      'Complete network map with 100+ contacts, relationship scoring, and 20 warm outreach messages ready to send',
  },
  {
    id: 4,
    title: 'Execute Warm Recruiting Outreach (10 contacts)',
    description:
      'Send personalized messages to former colleagues and professional connections about expanding into technical recruiting. Focus on building recruiting pipeline and getting referrals for open positions.',
    priority: 'high',
    timeEstimate: '2-3 hours',
    link: '/recruiting',
    deliverables: [
      '10 warm outreach messages sent to A-tier network contacts',
      'Recruiting service one-pager created and shared',
      'Meeting requests sent to interested contacts',
      'Referral tracking system activated',
    ],
    steps: [
      'Select 10 A-tier contacts from network map (former colleagues, trusted connections)',
      'Craft personalized messages mentioning shared history/projects',
      'Explain recruiting expansion with focus on tech talent',
      'Attach recruiting services overview and fee structure',
      'Request 15-min coffee chat or video call to discuss',
      'Set up tracking for responses and follow-ups',
      'Schedule any requested meetings within 48 hours',
    ],
    successCriteria:
      '10 messages sent with 70-80% response rate expected, 3-5 meetings scheduled, referral pipeline activated',
  },
  {
    id: 5,
    title: 'Cross-sell Recruiting to Agency Clients (5 clients)',
    description:
      "Contact existing development clients to discuss their hiring challenges and introduce recruiting services. Focus on companies you've worked with who trust your technical judgment and are likely growing their teams.",
    priority: 'high',
    timeEstimate: '2 hours',
    link: '/agency-leads',
    deliverables: [
      '5 client conversations completed about hiring needs',
      'Recruiting proposal sent to interested clients',
      'Job requisitions collected for open positions',
      'Cross-sell pipeline established in CRM',
    ],
    steps: [
      'Review agency client list and identify growing companies',
      "Research each client's recent hiring activity (LinkedIn, company pages)",
      "Schedule calls framed as 'checking in on project success'",
      'Naturally transition to discussing team growth and hiring challenges',
      'Present recruiting services as extension of development partnership',
      'Offer to help with 1-2 positions as pilot engagement',
      'Follow up with formal recruiting proposal within 24 hours',
    ],
    successCriteria:
      '5 client calls completed, 2-3 recruiting opportunities identified, 1-2 formal proposals sent',
  },
  {
    id: 6,
    title: 'Set Up Revenue Analytics & Tracking',
    description:
      'Configure comprehensive performance tracking for all business activities including email campaigns, LinkedIn outreach, network responses, and pipeline progression. Essential for optimizing conversion rates.',
    priority: 'medium',
    timeEstimate: '1-2 hours',
    link: '/revenue-analytics',
    deliverables: [
      'Email tracking configured with SendGrid integration',
      'LinkedIn automation metrics activated',
      'Pipeline tracking set up for all prospects',
      'Weekly performance reporting scheduled',
    ],
    steps: [
      'Configure SendGrid API for email tracking (opens, clicks, replies)',
      'Set up LinkedIn automation tracking for connection/message stats',
      'Create pipeline stages: Lead → Qualified → Proposal → Client',
      'Configure conversion tracking between stages',
      'Set up weekly automated reports',
      'Create dashboard widgets for key metrics',
    ],
    successCriteria:
      'Complete tracking system operational, baseline metrics established, automated reporting configured',
  },
  {
    id: 7,
    title: 'Launch LinkedIn Prospecting Campaign',
    description:
      'Use LinkedIn Recruiter Lite to identify and connect with potential recruiting clients and candidates. Focus on CTOs, VPs of Engineering, and senior developers who could become clients or candidates.',
    priority: 'medium',
    timeEstimate: '2-3 hours',
    link: '/linkedin-integration',
    deliverables: [
      '50 targeted LinkedIn connections sent (25 clients, 25 candidates)',
      'Personalized connection messages crafted for each prospect',
      'LinkedIn automation sequence activated',
      'Response tracking and follow-up system configured',
    ],
    steps: [
      'Search for CTOs/VPs at tech companies (client prospects)',
      'Search for senior developers at target companies (candidates)',
      'Craft personalized connection requests mentioning mutual connections/interests',
      'Set up automated message sequence for accepted connections',
      'Configure response tracking and CRM integration',
      'Schedule daily connection requests (10-15 per day)',
    ],
    successCriteria:
      '50 LinkedIn connections sent with 35% acceptance rate expected, automated follow-up active',
  },
  {
    id: 8,
    title: 'Create Content Marketing Foundation',
    description:
      'Develop thought leadership content to establish credibility in technical recruiting. Create blog posts, LinkedIn articles, and social media content that demonstrates expertise in tech talent assessment.',
    priority: 'low',
    timeEstimate: '3-4 hours',
    link: '/business-intelligence',
    deliverables: [
      '3 blog post topics outlined with SEO keywords',
      'LinkedIn article published about tech hiring challenges',
      'Social media content calendar created (30 days)',
      'Email newsletter template designed for recruiting insights',
    ],
    steps: [
      'Research trending topics in tech hiring and recruitment',
      "Outline 3 blog posts: 'Hiring React Developers', 'Technical Interview Best Practices', 'Remote Team Building'",
      'Write and publish first LinkedIn article about common hiring mistakes',
      'Create 30-day social media calendar with daily tips/insights',
      'Design email newsletter template for monthly recruiting insights',
      'Set up content distribution schedule across platforms',
    ],
    successCriteria:
      'Content foundation established, first article published, 30-day content calendar ready for execution',
  },
];
