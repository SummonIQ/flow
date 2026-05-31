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
  KeyRound,
  Link2,
  PlugZap,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

const services = [
  { name: 'Analytics API', env: 'ANALYTICS_API_URL', status: 'Configured' },
  { name: 'Email provider', env: 'EMAIL_API_KEY', status: 'Missing' },
  { name: 'LinkedIn tools', env: 'LINKEDIN_ACCESS_TOKEN', status: 'Missing' },
  { name: 'Payments', env: 'STRIPE_SECRET_KEY', status: 'Optional' },
];

const checks = [
  {
    title: 'Confirm environment variables are loaded',
    detail: 'Dev env + production env',
  },
  {
    title: 'Validate outbound network access',
    detail: 'DNS + TLS + proxy settings',
  },
  {
    title: 'Test webhooks (if enabled)',
    detail: 'Signature verification + retries',
  },
  { title: 'Enable least-privilege tokens', detail: 'Rotate keys quarterly' },
];

export default function ApiSetupPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-sky-500/10 p-2">
                <PlugZap className="h-5 w-5 text-sky-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                API Setup
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Configure external services, verify environment variables, and run
              connectivity checks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Run checks
            </Button>
            <Button asChild>
              <Link href="/business-tools">
                Back to Business Tools <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Card>
              <CardHeader>
                <CardTitle>Service configuration</CardTitle>
                <CardDescription>
                  This page focuses on wiring. Credentials should live in env
                  vars, never in code.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {services.map(s => (
                  <div
                    key={s.name}
                    className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-muted/30 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {s.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {s.env}
                      </p>
                    </div>
                    <Badge
                      variant={
                        s.status === 'Configured' ? 'secondary' : 'outline'
                      }
                    >
                      {s.status}
                    </Badge>
                  </div>
                ))}

                <div className="pt-1">
                  <Button variant="outline" size="sm">
                    <KeyRound className="mr-2 h-4 w-4" />
                    Open credentials guide
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Setup checklist</CardTitle>
                <CardDescription>
                  Run this once per environment. If a check fails, fix the root
                  cause.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {checks.map(c => (
                  <div
                    key={c.title}
                    className="rounded-lg border border-border/60 bg-muted/30 p-3"
                  >
                    <p className="font-medium text-foreground">{c.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {c.detail}
                    </p>
                  </div>
                ))}

                <div className="pt-1">
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/api-validation">
                      <Link2 className="mr-2 h-4 w-4" />
                      Go to API Validation
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
