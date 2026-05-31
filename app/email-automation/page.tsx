import { Report } from '@summoniq/applab-ui';
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
  Mail,
  Send,
  Shield,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

const health = [
  { label: 'SPF/DKIM', value: 'Configured', state: 'Good' },
  { label: 'Bounce rate', value: '0.9%', state: 'Good' },
  { label: 'Spam complaints', value: '0.02%', state: 'Good' },
  { label: 'Warmup', value: 'Not enabled', state: 'Watch' },
];

const campaigns = [
  {
    name: 'Welcome sequence — inbound leads',
    trigger: 'Lead created',
    status: 'Active',
    sends: '342',
  },
  {
    name: 'Nurture — cold leads',
    trigger: 'Added to segment',
    status: 'Draft',
    sends: '—',
  },
  {
    name: 'Client check-in',
    trigger: 'Monthly schedule',
    status: 'Active',
    sends: '28',
  },
];

export default function EmailAutomationPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-blue-500/10 p-2">
                <Mail className="h-5 w-5 text-blue-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Email Automation
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Deliverability, sequences, triggers, and safeguards. Automate
              thoughtfully.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Sparkles className="mr-2 h-4 w-4" />
              Draft sequence
            </Button>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Send test
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Deliverability health</CardTitle>
                <CardDescription>
                  These checks protect your domain reputation and response rate.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {health.map(item => (
                  <div
                    key={item.label}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 p-3"
                  >
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="mt-1 font-medium text-foreground">
                        {item.value}
                      </p>
                    </div>
                    <Badge
                      variant={item.state === 'Good' ? 'secondary' : 'outline'}
                    >
                      {item.state}
                    </Badge>
                  </div>
                ))}

                <div className="pt-1">
                  <Button size="sm" variant="outline">
                    <Shield className="mr-2 h-4 w-4" />
                    Run checks
                  </Button>
                </div>
              </CardContent>
            </Card>

            <section className="space-y-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Sequences
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Keep sequences short, use tags, and always include an easy
                  opt-out.
                </p>
              </div>
              <Report
                className="h-auto"
                data={campaigns}
                definition={{
                  columns: [
                    { header: 'Campaign', key: 'name' },
                    { header: 'Trigger', key: 'trigger' },
                    { header: 'Status', key: 'status' },
                    { header: 'Sends', key: 'sends' },
                  ],
                  data: campaigns,
                  view: 'table' as any,
                  sortBy: 'name',
                  activeFilters: [],
                  filters: [],
                }}
              />

              <div className="mt-4 rounded-lg border border-border/60 bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium text-foreground">Safety defaults</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Auto-throttle, stop on bounce spikes, and require approval for
                  bulk sends.
                </p>
              </div>

              <div className="pt-3">
                <Button asChild size="sm" variant="ghost">
                  <Link href="/business-tools">
                    Back to Business Tools{' '}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
