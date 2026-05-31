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
  Rocket,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';

const activationSteps = [
  { name: 'Create client + primary contact', status: 'Done' },
  { name: 'Confirm onboarding call scheduled', status: 'Next' },
  { name: 'Collect access (analytics, repo, CMS)', status: 'Pending' },
  { name: 'Define success metric + timeline', status: 'Pending' },
];

const readiness = [
  { label: 'Access', value: 'Partial', state: 'Watch' },
  { label: 'Scope clarity', value: 'Medium', state: 'Watch' },
  { label: 'Stakeholders', value: 'Known', state: 'Good' },
  { label: 'Billing', value: 'Ready', state: 'Good' },
];

export default function PlatformActivationPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-orange-500/10 p-2">
                <Rocket className="h-5 w-5 text-orange-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Platform Activation
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              A lightweight onboarding cockpit: access, stakeholders, scope
              clarity, and readiness to execute.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Add stakeholder
            </Button>
            <Button>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Mark ready
            </Button>
            <Button asChild variant="ghost">
              <Link href="/clients">
                Back to Clients <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-4">
            {readiness.map(r => (
              <Card key={r.label}>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{r.label}</p>
                  <p className="text-lg font-semibold text-foreground">
                    {r.value}
                  </p>
                  <Badge
                    className="mt-2"
                    variant={r.state === 'Good' ? 'secondary' : 'outline'}
                  >
                    {r.state}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Activation checklist</CardTitle>
                <CardDescription>
                  If a project isn’t moving, it’s usually missing access or
                  clarity.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activationSteps.map(step => (
                  <div
                    key={step.name}
                    className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-muted/30 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium text-foreground">{step.name}</p>
                    </div>
                    <Badge
                      variant={step.status === 'Done' ? 'secondary' : 'outline'}
                    >
                      {step.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What “ready” means</CardTitle>
                <CardDescription>
                  You can start execution only when the foundation is stable.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Access</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Credentials + owners + escalation path
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Clarity</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Scope, constraints, and success metric
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Cadence</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Weekly check-in + async updates
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
