import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, BookOpen, CheckSquare, PlayCircle } from 'lucide-react';
import Link from 'next/link';

const modules = [
  {
    title: 'Sourcing fundamentals',
    description:
      'Where to look, how to search, and how to build a repeatable shortlist.',
    status: 'In progress',
  },
  {
    title: 'Outreach systems',
    description:
      'Message frameworks, follow-ups, and how to track response quality.',
    status: 'Next',
  },
  {
    title: 'Screening & qualification',
    description:
      'Run fast screens with consistent notes and clear pass/fail criteria.',
    status: 'Locked',
  },
  {
    title: 'Client intake & role alignment',
    description:
      'Translate hiring intent into a role spec you can recruit against.',
    status: 'Locked',
  },
];

const checklist = [
  'Define one target role and 10 target companies',
  'Create 2 saved searches (broad + narrow)',
  'Draft a 3-touch outreach sequence',
  'Set pipeline statuses + what “done” means in each stage',
];

export default function RecruitingTrainingPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-violet-500/10 p-2">
                <BookOpen className="h-5 w-5 text-violet-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Recruiting Training
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              A structured playbook to build consistent recruiting output:
              sourcing → outreach → screening.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/recruiting">
                <ArrowRight className="mr-2 h-4 w-4" />
                Recruiting Hub
              </Link>
            </Button>
            <Button asChild>
              <Link href="/recruiting/candidates/search">
                <PlayCircle className="mr-2 h-4 w-4" />
                Start sourcing
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
                <CardTitle>Curriculum</CardTitle>
                <CardDescription>
                  Progressively unlock steps — focus on building a repeatable
                  system.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {modules.map(module => (
                  <div
                    key={module.title}
                    className="rounded-lg border border-border/60 bg-muted/30 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {module.title}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {module.description}
                        </p>
                      </div>
                      <Badge
                        variant={
                          module.status === 'In progress'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {module.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Week 1 checklist</CardTitle>
                  <CardDescription>
                    Finish these before moving on — they make everything else
                    easier.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {checklist.map(item => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3"
                    >
                      <CheckSquare className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                  <CardDescription>
                    Templates and references to keep your output consistent.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link
                    className="block text-sm text-primary hover:underline"
                    href="/recruiting/candidates/search"
                  >
                    Saved search patterns
                  </Link>
                  <Link
                    className="block text-sm text-primary hover:underline"
                    href="/recruiting/network-mapping"
                  >
                    Warm intro tracker
                  </Link>
                  <Link
                    className="block text-sm text-primary hover:underline"
                    href="/business-tools"
                  >
                    Back to Business Tools
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
