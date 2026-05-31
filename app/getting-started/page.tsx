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
  ArrowRight,
  CheckCircle2,
  Compass,
  Database,
  Rocket,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    title: 'Set up database + generate client',
    detail: 'Prisma schema, generate, and verify connectivity.',
    status: 'Done',
    href: '/api-setup',
  },
  {
    title: 'Seed defaults (configs, agents, workflows)',
    detail: 'Run the seed script once to populate baseline entities.',
    status: 'Next',
    href: '/business-tools',
  },
  {
    title: 'Replace stub pages with real content',
    detail: 'Make each area feel intentional with structured layouts.',
    status: 'In progress',
    href: '/business-tools',
  },
  {
    title: 'Validate key flows end-to-end',
    detail: 'Run app, spot-check pages, and confirm seed/dev data.',
    status: 'Pending',
    href: '/analytics/dashboard',
  },
];

export default function GettingStartedPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-emerald-500/10 p-2">
                <Rocket className="h-5 w-5 text-emerald-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Getting Started
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              A short checklist to get Flow usable end-to-end: data, defaults,
              and validation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/api-setup">
                <Wrench className="mr-2 h-4 w-4" />
                API setup
              </Link>
            </Button>
            <Button asChild>
              <Link href="/business-tools">
                <Compass className="mr-2 h-4 w-4" />
                Open Business Tools
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding checklist</CardTitle>
                <CardDescription>
                  Keep this short. If something takes more than 10 minutes, it
                  needs tooling.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {steps.map(step => (
                  <div
                    key={step.title}
                    className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-muted/30 p-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium text-foreground">
                          {step.title}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {step.detail}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          step.status === 'Done' ? 'secondary' : 'outline'
                        }
                      >
                        {step.status}
                      </Badge>
                      <Button asChild size="sm" variant="ghost">
                        <Link href={step.href}>
                          Open <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick links</CardTitle>
                  <CardDescription>
                    Jump into the areas that represent “working product”.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/recruiting">
                      Recruiting Hub <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/lead-generation">
                      Lead Generation <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/invoices">
                      Invoices <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data note</CardTitle>
                  <CardDescription>
                    If a page looks empty, it’s usually missing seed/dev data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Seed scripts should be safe to re-run in dev; production
                        should be explicit.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <Button asChild size="sm" variant="ghost">
                  <Link href="/clients">Back to Clients</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
