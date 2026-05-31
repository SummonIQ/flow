import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Code,
  DollarSign,
  FileText,
  Github,
  Globe,
  Lightbulb,
  Linkedin,
  Mail,
  Search,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function RecruitingActionGuidePage() {
  const first24HoursActions = [
    {
      timeframe: 'Hour 1-4',
      title: 'Business Foundation',
      items: [
        {
          task: 'Set up Zoho Recruit free account',
          time: '15 minutes',
          details:
            'Go to zoho.com/recruit, select free plan (1 active job, unlimited candidates). Configure basic pipeline stages: Sourced → Qualified → Submitted → Interview → Offer → Placed',
        },
        {
          task: 'Install essential Chrome extensions',
          time: '20 minutes',
          details:
            'ContactOut (find emails/phones on LinkedIn), Hunter Email Finder (email discovery), Clearbit Connect (Gmail integration), Grammarly (error-free communication), Loom (video messages)',
        },
        {
          task: 'Create professional Gmail account',
          time: '30 minutes',
          details:
            'Format: firstname.lastname@yourbusiness.com. Set up professional signature with phone, LinkedIn, Calendly link. Configure Hunter.io free account (50 searches/month)',
        },
        {
          task: 'LinkedIn profile optimization',
          time: '45 minutes',
          details:
            'Headline: "Technical Recruiter | Placing Senior Engineers at Series B-D Startups | 20+ Years Dev Experience". Add recruiter-focused summary highlighting technical background. Connect with 50 tech professionals immediately.',
        },
      ],
    },
    {
      timeframe: 'Hour 5-8',
      title: 'Sourcing Infrastructure',
      items: [
        {
          task: 'Master GitHub search',
          time: '1 hour',
          details:
            'Practice search: location:"San Francisco" language:python followers:>10. Bookmark key searches for target skills. Create tracking spreadsheet for candidates.',
        },
        {
          task: 'Join critical communities',
          time: '30 minutes',
          details:
            'Slack: People Geeks (44,899+ members), Discord: The Coding Den (148,000+ members), LinkedIn Groups: IT Recruiters (155,780 members), Reddit: r/recruiting, r/cscareerquestions',
        },
        {
          task: 'Set up pipeline tracking',
          time: '1 hour',
          details:
            'Create Google Sheet with columns: Name, Company, LinkedIn, Email, Position, Stage, Last Contact, Notes. Build separate sheets for Candidates, Clients, Pipeline Metrics.',
        },
      ],
    },
    {
      timeframe: 'Hour 9-24',
      title: 'Initial Outreach Preparation',
      items: [
        {
          task: 'Create email templates library',
          time: '2 hours',
          details:
            'Save 5 candidate templates (initial, follow-up 1, follow-up 2, referral, rejection). Save 5 client templates (VP Eng, CTO, Talent Head, Founder, follow-up series).',
        },
        {
          task: 'Research first 10 target companies',
          time: '3 hours',
          details:
            'Focus on: Glean ($260M Series E), Writer ($200M Series C), Cyera ($300M Series D). Find VP Engineering and Talent Head contacts using LinkedIn. Document in client tracking sheet.',
        },
      ],
    },
  ];

  const week1DailyPriorities = [
    {
      day: 'Day 2',
      title: 'Candidate Sourcing Mastery',
      morning: [
        'Practice Boolean searches on LinkedIn: ("Senior Python Developer" OR "Staff Engineer") AND (Django OR FastAPI) NOT Junior',
        'Source 25 senior engineer profiles using GitHub: language:python followers:>10 location:"United States" "senior" in:bio',
      ],
      afternoon: [
        'Send 10 connection requests to senior engineers with personalized notes',
        'Create candidate database with first 25 profiles',
        'Set up weekly sourcing rhythm (2 hours daily)',
      ],
    },
    {
      day: 'Day 3',
      title: 'Client Acquisition Start',
      morning: [
        'Research 5 companies from target list (Kore.ai, Harvey, Hebbia)',
        'Find direct emails using Hunter.io for VPs of Engineering',
        'Prepare personalized outreach for each',
      ],
      afternoon: ['Send first 5 client outreach emails using proven template'],
    },
    {
      day: 'Day 4',
      title: 'Develop Your Niche Positioning',
      morning: [
        'Choose ONE primary niche (Recommended: AI/ML engineers or Cloud/DevOps engineers - highest demand)',
        'Set geographic focus: Bay Area + Remote',
        'Set seniority: Senior/Staff/Principal only',
      ],
      afternoon: [
        'Update LinkedIn headline to reflect niche',
        'Join niche-specific communities (e.g., MLOps Community for AI focus)',
        'Create content post about your niche expertise',
      ],
    },
    {
      day: 'Day 5',
      title: 'Operational Excellence',
      morning: [
        'Set up Calendly free account for interview scheduling',
        'Create standard 30-minute "Discovery Call" appointment type',
        'Build interview prep document for candidates',
      ],
      afternoon: [
        'Establish daily routine: 8:30-10am Client outreach, 10-11:30am Candidate sourcing, 1:30-4pm Candidate outreach, 4-5pm Admin and follow-ups',
      ],
    },
    {
      day: 'Day 6',
      title: 'Scale Outreach',
      morning: [
        'Send 20 candidate connection requests',
        'Send 10 client outreach emails',
        'Follow up on Day 3 client emails',
      ],
      afternoon: [
        'Post first LinkedIn article: "What 20 Years of Coding Taught Me About Hiring Engineers"',
      ],
    },
    {
      day: 'Day 7',
      title: 'Week 1 Review and Planning',
      morning: [
        'Review metrics: connections made, emails sent, responses received',
      ],
      afternoon: [
        'Plan Week 2 targets: 100 candidate profiles sourced, 50 outreach messages sent, 5 client conversations scheduled',
      ],
    },
  ];

  const monthlyMilestones = [
    {
      week: 'Week 2',
      title: 'Build Momentum',
      goals: [
        '100+ candidates in database',
        '5 client discovery calls scheduled',
        'First job requirement received',
      ],
      activities: [
        '75+ outbound activities daily (calls, emails, LinkedIn messages)',
        '2 hours sourcing, 3 hours outreach, 2 hours business development',
        'Follow up all Week 1 contacts',
      ],
      milestone: 'Sign first client by end of week',
    },
    {
      week: 'Week 3',
      title: 'First Placement Pipeline',
      goals: [
        'Submit 3-5 candidates for first role',
        'Schedule candidate interviews',
        'Build relationship with hiring manager',
      ],
      activities: [
        'Intensive sourcing for specific role (3-4 hours daily)',
        'Candidate screening calls (5-8 per day)',
        'Client check-ins every 48 hours',
        'Negotiate first fee agreement (25% of base salary)',
      ],
      milestone: 'Active placement pipeline established',
    },
    {
      week: 'Week 4',
      title: 'Scale and Systematize',
      goals: [
        '2-3 active searches',
        '200+ candidates in database',
        'First offer extended',
      ],
      activities: [
        'Implement LinkedIn Sales Navigator trial ($80/month after)',
        'Upgrade to Hunter.io Starter ($49/month for 1,000 searches)',
        'Create standard operating procedures',
        'Plan Month 2 growth strategy',
      ],
      milestone: 'First placement in final stages',
    },
  ];

  const targetCompanies = [
    {
      tier: 'Tier 1 - Highest Priority (Aggressive Hiring)',
      companies: [
        {
          name: 'Glean',
          funding: '$260M Series E',
          date: 'Sept 2024',
          focus: 'AI search',
          location: 'Palo Alto',
        },
        {
          name: 'Cyera',
          funding: '$300M Series D',
          date: 'Nov 2024',
          focus: 'Data security',
          location: 'NYC',
        },
        {
          name: 'Writer',
          funding: '$200M Series C',
          date: 'Nov 2024',
          focus: 'Enterprise AI',
          location: 'San Francisco',
        },
        {
          name: 'Kore.ai',
          funding: '$150M Series D',
          date: 'Jan 2024',
          focus: 'Conversational AI',
          location: 'Orlando',
        },
      ],
    },
    {
      tier: 'Tier 2 - Strong Growth',
      companies: [
        {
          name: 'Harvey',
          funding: '$100M Series C',
          focus: 'Legal AI',
          location: 'San Francisco',
        },
        {
          name: 'Hebbia',
          funding: '$130M Series B',
          focus: 'Document AI',
          location: 'New York',
        },
        {
          name: 'Abnormal Security',
          funding: '$250M Series D',
          focus: 'Email security',
          location: 'San Francisco',
        },
        {
          name: 'Magic',
          funding: '$320M Series C',
          focus: 'AI coding',
          location: 'San Francisco',
        },
        {
          name: 'Codeium',
          funding: '$150M Series C',
          focus: 'Dev tools',
          location: 'Mountain View',
        },
        {
          name: 'DevRev',
          funding: '$100M Series A',
          focus: 'AI support',
          location: 'Palo Alto',
        },
      ],
    },
    {
      tier: 'Tier 3 - Emerging Opportunities',
      companies: [
        {
          name: 'Tractian',
          funding: '$120M Series C',
          focus: 'Industrial AI',
          location: 'Atlanta',
        },
        {
          name: 'Abridge',
          funding: '$150M Series C',
          focus: 'Medical AI',
          location: 'Pittsburgh',
        },
        {
          name: 'Groq',
          funding: '$640M Series D',
          focus: 'AI chips',
          location: 'Mountain View',
        },
        {
          name: 'Liquid AI',
          funding: '$250M Series A',
          focus: 'Efficient AI',
          location: 'Cambridge',
        },
        {
          name: 'Axonius',
          funding: '$200M Series E',
          focus: 'Cybersecurity',
          location: 'NYC',
        },
        {
          name: 'Socket',
          funding: '$40M Series B',
          focus: 'Dev security',
          location: 'Remote',
        },
        {
          name: 'Poolside',
          funding: '$500M Series B',
          focus: 'AI coding',
          location: 'San Francisco',
        },
        {
          name: 'Wiz',
          funding: '$1B Series D',
          focus: 'Cloud security',
          location: 'NYC/Tel Aviv',
        },
        {
          name: 'One (Walmart)',
          funding: '$300M',
          focus: 'Fintech',
          location: 'Sacramento',
        },
        {
          name: 'Zest AI',
          funding: '$200M growth',
          focus: 'Credit AI',
          location: 'Burbank',
        },
      ],
    },
  ];

  const feeStructure = {
    base: [
      { type: 'Senior Engineers', fee: '25% of first-year base salary' },
      { type: 'Staff/Principal Engineers', fee: '30%' },
      { type: 'Specialized Skills (AI/ML, Security)', fee: '35%' },
    ],
    payment: ['Net 30 from candidate start date', 'Invoice upon candidate acceptance'],
    guarantee: [
      '90-day replacement guarantee',
      'Prorated refund: 75% (month 1), 50% (month 2), 25% (month 3)',
    ],
  };

  const booleanSearches = {
    linkedin: [
      {
        label: 'Senior Python developers',
        query:
          '("Senior Python" OR "Staff Python" OR "Principal Engineer") AND (Django OR Flask OR FastAPI)',
      },
      {
        label: 'DevOps/SRE engineers',
        query:
          '("Senior DevOps" OR "Site Reliability Engineer" OR "SRE") AND (Kubernetes OR Docker OR Terraform)',
      },
      {
        label: 'AI/ML engineers',
        query:
          '("Machine Learning Engineer" OR "ML Engineer" OR "AI Engineer") AND (TensorFlow OR PyTorch)',
      },
    ],
    github: [
      {
        label: 'Find senior Python contributors',
        query: 'language:python followers:>20 location:"San Francisco" created:>2020-01-01',
      },
      {
        label: 'Find React experts',
        query: 'language:javascript stars:>10 "react" in:description followers:>15',
      },
      {
        label: 'Find Go backend engineers',
        query:
          'language:go "microservices" OR "distributed systems" followers:>10 location:"New York"',
      },
    ],
    google: [
      {
        label: 'LinkedIn X-ray',
        query: 'site:linkedin.com/in/ "San Francisco" "Senior Software Engineer" Python -jobs',
      },
      {
        label: 'GitHub X-ray',
        query: 'site:github.com "machine learning" "San Francisco" "readme.md"',
      },
      {
        label: 'Stack Overflow X-ray',
        query: 'site:stackoverflow.com/users "10000 reputation" Python San Francisco',
      },
    ],
  };

  const dailySchedule = [
    { time: '8:00-8:30am', activity: 'Email review, day planning' },
    {
      time: '8:30-10:00am',
      activity: 'Business development calls/emails (best time for executives)',
    },
    {
      time: '10:00-11:30am',
      activity: 'Candidate sourcing (GitHub, LinkedIn, Stack Overflow)',
    },
    { time: '11:30am-12:00pm', activity: 'Administrative tasks, CRM updates' },
    { time: '12:00-1:00pm', activity: 'Lunch break' },
    {
      time: '1:00-3:00pm',
      activity: 'Candidate outreach (developers more responsive afternoons)',
    },
    { time: '3:00-4:00pm', activity: 'Candidate screening calls' },
    { time: '4:00-5:00pm', activity: 'Follow-ups, pipeline review, next day planning' },
  ];

  const metricsToTrack = {
    daily: [
      { metric: 'Outbound activities', target: '75+' },
      { metric: 'New candidates sourced', target: '20+' },
      { metric: 'Response rate', target: '25%+' },
    ],
    weekly: [
      { metric: 'Candidates submitted', target: '3-5 per search' },
      { metric: 'Client conversations', target: '5+' },
      { metric: 'Interview-to-submission ratio', target: '70%' },
    ],
    monthly: [
      { metric: 'Pipeline value', target: 'Sum of searches × fee' },
      { metric: 'Time-to-fill', target: 'Under 30 days' },
      { metric: 'Placement rate', target: '1 per 3 searches' },
      { metric: 'Revenue', target: '$30K+ by month 2' },
    ],
  };

  const freeResources = [
    {
      category: 'Communities',
      items: [
        { name: 'Slack: People Geeks', detail: '44,899 members' },
        { name: 'Discord: The Coding Den', detail: '148K members' },
        { name: 'LinkedIn: IT Recruiters group', detail: '155,780 members' },
        { name: 'Reddit', detail: 'r/recruiting, r/cscareerquestions' },
      ],
    },
    {
      category: 'Free Tools',
      items: [
        { name: 'LinkedIn', detail: 'Master advanced search operators' },
        { name: 'GitHub', detail: 'Learn advanced search for finding developers' },
        { name: 'Hunter.io', detail: '50 free email searches monthly' },
        { name: 'Calendly', detail: 'Free appointment scheduling' },
        { name: 'Loom', detail: 'Free video messages for personalized outreach' },
      ],
    },
    {
      category: 'Educational Resources',
      items: [
        { name: 'Podcasts', detail: 'Top Tech Recruiter, Recruiting Brainfood' },
        { name: 'YouTube', detail: 'Recruiting Brainfood channel' },
        { name: 'Free courses', detail: 'LinkedIn Learning technical recruiting course' },
        { name: 'Newsletters', detail: 'Recruiting Brainfood weekly' },
      ],
    },
  ];

  return (
    <div className="container mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">Recruiting Business Action Guide</h1>
        <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
          Complete step-by-step guide to launching your technical recruiting business -
          from first 24 hours to first placement
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/recruiting">Recruiting Hub</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/action-plan">General Action Plan</Link>
          </Button>
        </div>
      </div>

      {/* First 24 Hours */}
      <Card className="border-2 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="rounded-lg bg-blue-500 p-2 text-white">
              <Zap className="h-6 w-6" />
            </div>
            Part 1: First 24 Hours - Immediate Setup
          </CardTitle>
          <CardDescription className="text-lg">
            Complete these foundational tasks to get your recruiting business operational today
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {first24HoursActions.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="h-5 w-5 text-blue-500" />
                {section.timeframe}: {section.title}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {section.items.map((item, itemIndex) => (
                  <Card key={itemIndex} className="bg-white dark:bg-gray-900">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.task}</span>
                            <Badge variant="outline" className="text-xs">
                              {item.time}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.details}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Week 1 Daily Priorities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-950/50">
              <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            Part 2: Week 1 Daily Priorities
          </CardTitle>
          <CardDescription className="text-lg">
            Day-by-day breakdown to build momentum and establish your recruiting rhythm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {week1DailyPriorities.map((day, index) => (
              <Card key={index} className="border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Badge
                      variant={index < 2 ? 'default' : 'secondary'}
                      className="h-6 w-6 rounded-full p-0 text-center"
                    >
                      {index + 2}
                    </Badge>
                    {day.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <div className="mb-1 font-medium text-muted-foreground">
                      Morning (9am-12pm):
                    </div>
                    <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                      {day.morning.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  {day.afternoon && (
                    <div>
                      <div className="mb-1 font-medium text-muted-foreground">
                        Afternoon (1pm-5pm):
                      </div>
                      <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                        {day.afternoon.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-950/50">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            Part 3: First Month Milestones
          </CardTitle>
          <CardDescription className="text-lg">
            Week-by-week goals and activities to reach your first placement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {monthlyMilestones.map((week, index) => (
              <Card key={index} className="relative border">
                <CardHeader>
                  <CardTitle className="text-lg">{week.week}: {week.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2 font-medium">
                      <Target className="h-4 w-4 text-green-500" />
                      Goals
                    </div>
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                      {week.goals.map((goal, i) => (
                        <li key={i}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center gap-2 font-medium">
                      <Zap className="h-4 w-4 text-blue-500" />
                      Activities
                    </div>
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                      {week.activities.map((activity, i) => (
                        <li key={i}>{activity}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/20">
                    <div className="flex items-center gap-2 text-sm font-medium text-green-800 dark:text-green-200">
                      <Star className="h-4 w-4" />
                      Key Milestone
                    </div>
                    <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                      {week.milestone}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6 border-2 border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
            <CardContent className="pt-6">
              <h3 className="mb-4 text-lg font-semibold">Month 1 Success Metrics</h3>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">500+</div>
                  <div className="text-sm text-muted-foreground">Candidates sourced</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">20+</div>
                  <div className="text-sm text-muted-foreground">Client conversations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">1-2</div>
                  <div className="text-sm text-muted-foreground">Signed agreements</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">1</div>
                  <div className="text-sm text-muted-foreground">Placement in final stages</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Outreach Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-950/50">
              <Mail className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            Part 4: Outreach Message Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Candidate Template */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">Initial Candidate Outreach (LinkedIn)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-white p-4 font-mono text-sm dark:bg-gray-900">
                <p>Hi [Name],</p>
                <p className="mt-2">
                  Your work on [specific project/technology] at [Company] caught my attention -
                  particularly [specific achievement].
                </p>
                <p className="mt-2">
                  I&apos;m working with [Client Company], where they&apos;re building [exciting project].
                  They need a [role] who can [specific challenge]. Given your experience with
                  [relevant skill], you&apos;d be perfect.
                </p>
                <p className="mt-2">The role offers:</p>
                <ul className="ml-4 list-disc">
                  <li>[Technical challenge]</li>
                  <li>[Compensation range]</li>
                  <li>[Growth opportunity]</li>
                </ul>
                <p className="mt-2">Open to a quick chat this week?</p>
                <p className="mt-2">[Your name]</p>
              </div>
            </CardContent>
          </Card>

          {/* Company Template */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">Company Outreach (Email to VP Engineering)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-white p-4 font-mono text-sm dark:bg-gray-900">
                <p className="font-semibold">
                  Subject: [Company] - Scaling engineering after Series [X]?
                </p>
                <p className="mt-3">Hi [Name],</p>
                <p className="mt-2">
                  Saw [Company] just raised $[amount] - exciting times ahead!
                </p>
                <p className="mt-2">
                  With 20+ years writing code myself, I understand the bar you need to maintain
                  while scaling from [current] to [target] engineers.
                </p>
                <p className="mt-2">
                  I specialize in placing senior engineers at companies like yours. My approach:
                </p>
                <ul className="ml-4 list-disc">
                  <li>Target passive candidates at [competitor companies]</li>
                  <li>Technical assessment I can actually evaluate</li>
                  <li>28-day average time-to-hire</li>
                </ul>
                <p className="mt-2">
                  Recent win: Helped [similar company] hire 3 staff engineers in 6 weeks.
                </p>
                <p className="mt-2">Worth 15 minutes to discuss your hiring priorities?</p>
                <p className="mt-2">
                  Best,
                  <br />
                  [Your name]
                  <br />
                  [Phone]
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Follow-up Template */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">Follow-up Sequence (3 days later)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-white p-4 font-mono text-sm dark:bg-gray-900">
                <p className="font-semibold">Subject: Re: [Original subject]</p>
                <p className="mt-3">Hi [Name],</p>
                <p className="mt-2">
                  Following up on my note about [Company]&apos;s engineering scaling.
                </p>
                <p className="mt-2">
                  Quick data point: Companies that delay senior hires by 60 days lose an average
                  of $100K in productivity.
                </p>
                <p className="mt-2">
                  I have bandwidth for 2 new clients this month. Would Thursday or Friday work
                  for a brief call?
                </p>
                <p className="mt-2">[Your name]</p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Boolean Searches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-950/50">
              <Search className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            Part 5: Boolean Searches & GitHub Queries
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Linkedin className="h-5 w-5 text-blue-600" />
                  LinkedIn Boolean
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {booleanSearches.linkedin.map((search, index) => (
                  <div key={index}>
                    <div className="mb-1 text-sm font-medium">{search.label}:</div>
                    <code className="block rounded bg-muted p-2 text-xs">{search.query}</code>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Github className="h-5 w-5" />
                  GitHub Advanced
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {booleanSearches.github.map((search, index) => (
                  <div key={index}>
                    <div className="mb-1 text-sm font-medium">{search.label}:</div>
                    <code className="block rounded bg-muted p-2 text-xs">{search.query}</code>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="h-5 w-5 text-green-600" />
                  Google X-ray
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {booleanSearches.google.map((search, index) => (
                  <div key={index}>
                    <div className="mb-1 text-sm font-medium">{search.label}:</div>
                    <code className="block rounded bg-muted p-2 text-xs">{search.query}</code>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Target Companies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="rounded-lg bg-cyan-100 p-2 dark:bg-cyan-950/50">
              <Building2 className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            Part 6: Target Companies (Series B-D, Recently Funded)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {targetCompanies.map((tier, tierIndex) => (
            <div key={tierIndex}>
              <h3 className="mb-4 text-lg font-semibold">{tier.tier}</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {tier.companies.map((company, index) => (
                  <Card key={index} className="border">
                    <CardContent className="pt-4">
                      <div className="font-semibold">{company.name}</div>
                      <div className="text-sm text-green-600">{company.funding}</div>
                      <div className="text-xs text-muted-foreground">
                        {company.focus} • {company.location}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Fee Structure */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <DollarSign className="h-6 w-6 text-green-600" />
              Part 8: Fee Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="mb-2 font-semibold">Base Terms</h4>
              <div className="space-y-2">
                {feeStructure.base.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.type}</span>
                    <span className="font-medium text-green-600">{item.fee}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-2 font-semibold">Payment Terms</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {feeStructure.payment.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-semibold">Guarantee</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {feeStructure.guarantee.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Clock className="h-6 w-6 text-blue-600" />
              Part 9: Daily Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dailySchedule.map((slot, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg border p-2 text-sm"
                >
                  <span className="shrink-0 font-mono font-medium text-blue-600">
                    {slot.time}
                  </span>
                  <span className="text-muted-foreground">{slot.activity}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-800 dark:bg-blue-950/20">
              <strong>Time Allocation:</strong> 40% Active recruiting, 25% Business development,
              20% Sourcing, 15% Admin
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="rounded-lg bg-red-100 p-2 dark:bg-red-950/50">
              <BarChart3 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            Part 10: Metrics to Track From Day One
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daily Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metricsToTrack.daily.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{item.metric}</span>
                      <Badge variant="outline">{item.target}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weekly Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metricsToTrack.weekly.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{item.metric}</span>
                      <Badge variant="outline">{item.target}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metricsToTrack.monthly.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{item.metric}</span>
                      <Badge variant="outline">{item.target}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Free Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-950/50">
              <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            Part 11: Free Resources to Leverage Immediately
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {freeResources.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex}>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.detail}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Niche Focus */}
      <Card className="border-2 border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="rounded-lg bg-amber-500 p-2 text-white">
              <Lightbulb className="h-6 w-6" />
            </div>
            Part 12: Recommended Niche Focus
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Primary Niche: Senior Cloud/DevOps Engineers</h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <Card className="bg-white dark:bg-gray-900">
                <CardContent className="pt-4">
                  <h4 className="mb-2 font-semibold">Why This Niche:</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    <li>Highest demand (74% of businesses adopting DevOps)</li>
                    <li>Clear skill requirements (AWS, Kubernetes, Terraform)</li>
                    <li>Premium fees (25-30% standard)</li>
                    <li>Your coding background adds credibility</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-900">
                <CardContent className="pt-4">
                  <h4 className="mb-2 font-semibold">Target Candidates:</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    <li>Current: FAANG companies, unicorns</li>
                    <li>Experience: 5-10 years, proven scale experience</li>
                    <li>Skills: AWS/GCP, Kubernetes, Terraform, Python/Go</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="rounded-lg border border-amber-300 bg-white p-4 dark:border-amber-700 dark:bg-gray-900">
            <h4 className="mb-2 font-semibold">Your Positioning Statement:</h4>
            <p className="text-sm italic text-muted-foreground">
              &quot;I place senior DevOps engineers at Series B-D startups. With 20 years writing code,
              I actually understand infrastructure as code, CI/CD pipelines, and cloud
              architecture. I find engineers who&apos;ve scaled systems from 10K to 10M users.&quot;
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-semibold">Alternative High-Value Niches:</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="px-3 py-1">
                <Code className="mr-1 h-3 w-3" />
                AI/ML Engineers - Highest growth, premium fees
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <Briefcase className="mr-1 h-3 w-3" />
                Security Engineers - Urgent demand, limited supply
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <Users className="mr-1 h-3 w-3" />
                Staff+ Engineers - Higher fees, relationship-based
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Acceleration */}
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <Star className="h-5 w-5" />
            Success Acceleration Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
            <p>
              <strong>Week 1:</strong> Focus 100% on setup and learning
            </p>
            <p>
              <strong>Week 2:</strong> Aggressive outreach (200+ activities daily)
            </p>
            <p>
              <strong>Week 3:</strong> First client signed, deep sourcing
            </p>
            <p>
              <strong>Week 4:</strong> Multiple searches, building momentum
            </p>
            <p>
              <strong>Month 2:</strong> First placement closed, scaling operations
            </p>
          </div>
          <div className="mt-4 rounded-lg border border-green-300 bg-white p-3 dark:border-green-700 dark:bg-gray-900">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Remember: With your technical background, you have a massive advantage. Lead with
              your expertise, be authentic about your coding experience, and position yourself as
              the technical recruiter who actually understands the technology. This credibility
              will command premium fees and attract both candidates and clients.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="border-0 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-950 dark:to-blue-950/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="rounded-lg bg-gray-600 p-2 text-white">
              <FileText className="h-6 w-6" />
            </div>
            Quick Reference & Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-3">
              <h3 className="font-semibold">Recruiting Tools</h3>
              <div className="space-y-2 text-sm">
                <Link
                  href="/recruiting"
                  className="block text-blue-600 hover:underline dark:text-blue-400"
                >
                  Recruiting Hub
                </Link>
                <Link
                  href="/recruiting/training"
                  className="block text-blue-600 hover:underline dark:text-blue-400"
                >
                  Training Program
                </Link>
                <Link
                  href="/recruiting/candidates/search"
                  className="block text-blue-600 hover:underline dark:text-blue-400"
                >
                  Candidate Search
                </Link>
                <Link
                  href="/recruiting/network-mapping"
                  className="block text-blue-600 hover:underline dark:text-blue-400"
                >
                  Network Mapping
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold">Related Pages</h3>
              <div className="space-y-2 text-sm">
                <Link
                  href="/action-plan"
                  className="block text-blue-600 hover:underline dark:text-blue-400"
                >
                  General Action Plan
                </Link>
                <Link
                  href="/lead-generation"
                  className="block text-blue-600 hover:underline dark:text-blue-400"
                >
                  Lead Generation
                </Link>
                <Link
                  href="/email-automation"
                  className="block text-blue-600 hover:underline dark:text-blue-400"
                >
                  Email Automation
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold">Dashboards</h3>
              <div className="space-y-2 text-sm">
                <Link
                  href="/recruiting-dashboard"
                  className="block text-blue-600 hover:underline dark:text-blue-400"
                >
                  Recruiting Dashboard
                </Link>
                <Link
                  href="/revenue-analytics"
                  className="block text-blue-600 hover:underline dark:text-blue-400"
                >
                  Revenue Analytics
                </Link>
                <Link
                  href="/business-tools"
                  className="block text-blue-600 hover:underline dark:text-blue-400"
                >
                  All Business Tools
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
