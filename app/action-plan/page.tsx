'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@summoniq/applab-ui';
import {
  BarChart3,
  ChevronDown,
  Clock,
  DollarSign,
  FileText,
  Mail,
  Network,
  Star,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { actionPlanTasks } from '@/lib/data/action-plan-tasks';

export default function ActionPlanPage() {
  const thisWeekTasks = actionPlanTasks;

  const technicalSetup = [
    {
      title: 'LinkedIn Recruiter Lite & Sales Navigator',
      description:
        'Advanced candidate sourcing with Boolean search, InMail credits, and company insights.',
      cost: '$220/month',
      priority: 'Critical',
      timeframe: 'This week',
      roi: '1 placement covers 12+ months',
    },
    {
      title: 'SendGrid Email Automation',
      description:
        'Professional email delivery with automation sequences and analytics.',
      cost: '$15-89/month',
      priority: 'High',
      timeframe: 'Week 2',
      roi: '40%+ better deliverability, 25% higher response rates',
    },
    {
      title: 'Apollo.io Lead Intelligence',
      description: '275M+ contacts with email finder and engagement tracking.',
      cost: '$49-149/month',
      priority: 'High',
      timeframe: 'Week 2',
      roi: '300% increase in qualified prospects',
    },
  ];

  const revenueTimeline = [
    {
      timeframe: 'Week 1-2',
      milestone: 'First Warm Responses',
      description: 'Initial interest from network outreach',
      expectedOutcome: '5-10 positive responses',
    },
    {
      timeframe: 'Week 3-4',
      milestone: 'Client Meetings Scheduled',
      description: 'Discovery calls with interested prospects',
      expectedOutcome: '3-5 qualified meetings',
    },
    {
      timeframe: 'Month 2',
      milestone: 'First Recruiting Client',
      description: 'Signed contract for recruiting services',
      expectedOutcome: '$15-30K potential revenue',
    },
    {
      timeframe: 'Month 3',
      milestone: 'First Placement',
      description: 'Successful candidate placement',
      expectedOutcome: '$15-30K actual revenue',
    },
  ];

  const templates = [
    {
      name: 'Value-First Approach',
      rate: '22%',
      type: 'Lead Gen',
    },
    {
      name: 'Former Colleague Outreach',
      rate: '70-80%',
      type: 'Warm',
    },
    {
      name: 'Cross-sell to Clients',
      rate: '60-70%',
      type: 'Client',
    },
    {
      name: 'Cold Outreach',
      rate: '10-15%',
      type: 'Cold',
    },
  ];

  const keyMetrics = [
    {
      metric: 'Email Response Rate',
      target: '18-22%',
      tool: 'Proven templates',
    },
    {
      metric: 'LinkedIn Acceptance',
      target: '35%',
      tool: 'Connection requests',
    },
    { metric: 'Network Response', target: '70-80%', tool: 'Warm outreach' },
    {
      metric: 'Recruiting Fee',
      target: '18-25%',
      tool: 'Of first year salary',
    },
    { metric: 'Time to Fill', target: '2-6 weeks', tool: 'Average placement' },
    { metric: 'Cold Outreach', target: '10-15%', tool: 'Response rate' },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="container mx-auto space-y-4 p-4">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Action Plan</h1>
            <p className="text-sm text-muted-foreground">
              Execution roadmap for lead generation and recruiting
            </p>
            <div className="flex justify-center gap-2">
              <Button asChild size="sm">
                <Link href="/business-tools">All Tools</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/lead-generation">Start Outreach</Link>
              </Button>
            </div>
          </div>

          <Card className="border border-blue-200 bg-blue-50/50 shadow-sm dark:border-blue-800 dark:bg-blue-950/20">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500 text-white dark:bg-blue-600">
                  <Zap className="h-4 w-4" />
                </div>
                This Week's Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-3">
                {thisWeekTasks.map(task => (
                  <Card key={task.id} className="border bg-card p-0">
                    <details className="group">
                      <summary className="list-none [&::-webkit-details-marker]:hidden">
                        <div className="flex items-start gap-3 p-3">
                          <div
                            className="mt-0.5"
                            onClick={event => event.stopPropagation()}
                          >
                            <Checkbox size="w-7 h-7" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <h3 className="text-sm font-semibold">
                                    {task.title}
                                  </h3>
                                  <Badge
                                    variant={
                                      task.priority === 'high'
                                        ? 'destructive'
                                        : task.priority === 'medium'
                                          ? 'default'
                                          : 'secondary'
                                    }
                                    className="h-5 text-xs"
                                  >
                                    {task.priority.toUpperCase()}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="h-5 text-xs"
                                  >
                                    <Clock className="h-3 w-3" />
                                    {task.timeEstimate}
                                  </Badge>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {task.description}
                                </p>
                              </div>

                              <div className="flex shrink-0 items-center gap-2">
                                <div
                                  className="hidden sm:block"
                                  onClick={event => event.stopPropagation()}
                                >
                                  <Button
                                    asChild
                                    size="sm"
                                    className="h-7 text-xs"
                                  >
                                    <Link href={task.link}>Start</Link>
                                  </Button>
                                </div>

                                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-muted/30 text-muted-foreground transition-transform group-open:rotate-180">
                                  <ChevronDown className="h-4 w-4" />
                                </div>
                              </div>
                            </div>

                            <div className="mt-2 sm:hidden">
                              <div onClick={event => event.stopPropagation()}>
                                <Button
                                  asChild
                                  size="sm"
                                  className="h-7 text-xs"
                                >
                                  <Link href={task.link}>Start</Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </summary>

                      <div className="border-t border-border/60 px-3 pb-3">
                        <div className="grid gap-4 pt-3 lg:grid-cols-2">
                          {task.deliverables ? (
                            <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                              <h4 className="text-xs font-semibold">
                                Deliverables
                              </h4>
                              <div className="mt-2 space-y-2">
                                {task.deliverables.map((deliverable, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start gap-2"
                                  >
                                    <Checkbox size="w-6 h-6" />
                                    <span className="text-xs text-muted-foreground">
                                      {deliverable}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {task.steps ? (
                            <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                              <h4 className="flex items-center gap-1 text-xs font-semibold">
                                <Network className="h-3 w-3" />
                                Steps
                              </h4>
                              <div className="mt-2 space-y-2">
                                {task.steps.map((step, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start gap-2 text-xs"
                                  >
                                    <Checkbox size="w-6 h-6" />
                                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                                      {index + 1}
                                    </div>
                                    <span className="text-muted-foreground">
                                      {step}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>

                        {task.successCriteria ? (
                          <div className="mt-4 space-y-1 rounded border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/20">
                            <h4 className="flex items-center gap-1 text-xs font-semibold text-green-800 dark:text-green-200">
                              <Star className="h-3 w-3" />
                              Success
                            </h4>
                            <p className="text-xs text-green-700 dark:text-green-300">
                              {task.successCriteria}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </details>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="rounded bg-orange-100 p-1.5 dark:bg-orange-950/50">
                <BarChart3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-lg font-bold">Essential Tools</h2>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {technicalSetup.map((item, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-1.5">
                      <CardTitle className="text-sm">{item.title}</CardTitle>
                      <Badge
                        variant={
                          item.priority === 'Critical'
                            ? 'destructive'
                            : item.priority === 'High'
                              ? 'default'
                              : 'secondary'
                        }
                        className="h-4 text-[10px]"
                      >
                        {item.priority}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-green-600 dark:text-green-400">
                        {item.cost}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {item.timeframe}
                      </div>
                    </div>
                    <div className="rounded border bg-muted/50 p-1.5">
                      <div className="text-[10px] font-medium">ROI</div>
                      <div className="text-xs">{item.roi}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="rounded bg-green-100 p-1.5 dark:bg-green-950/50">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-lg font-bold">Revenue Timeline</h2>
            </div>

            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
              {revenueTimeline.map((milestone, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white dark:bg-green-600">
                        {index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-xs">
                          {milestone.timeframe}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className="mt-0.5 h-4 text-[10px]"
                        >
                          {milestone.milestone}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {milestone.description}
                    </p>
                    <div className="text-xs font-semibold text-green-600 dark:text-green-400">
                      {milestone.expectedOutcome}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="rounded bg-purple-100 p-1.5 dark:bg-purple-950/50">
                <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-lg font-bold">Outreach Templates</h2>
            </div>

            <div className="grid gap-2 md:grid-cols-4">
              {templates.map((template, index) => (
                <Card key={index}>
                  <CardContent className="p-3">
                    <div className="space-y-1 text-center">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {template.rate}
                      </div>
                      <div className="text-xs font-medium">{template.name}</div>
                      <Badge variant="secondary" className="h-4 text-[10px]">
                        {template.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="rounded bg-red-100 p-1.5 dark:bg-red-950/50">
                <BarChart3 className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-lg font-bold">Performance Metrics</h2>
            </div>

            <div className="grid gap-2 md:grid-cols-3">
              {keyMetrics.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {item.target}
                      </div>
                      <div className="text-xs font-medium">{item.metric}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {item.tool}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <FileText className="h-4 w-4" />
                Quick Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 text-xs md:grid-cols-3">
                <div className="space-y-0.5">
                  <Link
                    href="/lead-generation/search"
                    className="block text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Prospect Search
                  </Link>
                  <Link
                    href="/lead-generation"
                    className="block text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Outreach Templates
                  </Link>
                  <Link
                    href="/agency-leads"
                    className="block text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Lead Management
                  </Link>
                </div>
                <div className="space-y-0.5">
                  <Link
                    href="/recruiting/training"
                    className="block text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Training
                  </Link>
                  <Link
                    href="/recruiting"
                    className="block text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Recruiting
                  </Link>
                  <Link
                    href="/recruiting/candidates/search"
                    className="block text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Candidates
                  </Link>
                </div>
                <div className="space-y-0.5">
                  <Link
                    href="/business-tools"
                    className="block text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Business Tools
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
