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
  Calendar,
  Mail,
  MessageSquare,
  Send,
  Sparkles,
  Target,
} from 'lucide-react';
import Link from 'next/link';

const templates = [
  {
    name: 'Short value pitch (agency)',
    use: 'Cold intro',
    tone: 'Direct',
  },
  {
    name: 'Warm intro ask',
    use: 'Connector outreach',
    tone: 'Friendly',
  },
  {
    name: 'Follow-up #2 (polite bump)',
    use: 'No reply',
    tone: 'Light',
  },
];

const queue = [
  {
    name: 'Riley Chen (Harper & Co.)',
    reason: 'Hiring signal: 2 eng roles',
    next: 'Send intro + offer a 10-min call',
    status: 'To send',
  },
  {
    name: 'Alex Morgan (Northwind Labs)',
    reason: 'Raised seed (recent)',
    next: 'Send founder pitch + case study',
    status: 'To send',
  },
  {
    name: 'Taylor Singh (Baseline Health)',
    reason: 'PLG experiments',
    next: 'Ask 3 qualifying questions',
    status: 'Follow-up',
  },
];

export default function OutreachPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="flex w-full items-start justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-pink-500/10 p-2">
                <MessageSquare className="h-5 w-5 text-pink-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Outreach
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Queue messages, reuse templates, and keep follow-up cadence
              consistent.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Sparkles className="mr-2 h-4 w-4" />
              Draft with AI
            </Button>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Send batch
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-5 py-4">
        <div className="flex w-full flex-col gap-4">
          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Templates</CardTitle>
                <CardDescription>
                  Keep templates short and role-specific.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {templates.map(t => (
                  <div
                    key={t.name}
                    className="rounded-lg border border-border/60 bg-muted/30 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {t.name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t.use} - {t.tone}
                        </p>
                      </div>
                      <Badge variant="outline">Template</Badge>
                    </div>
                  </div>
                ))}

                <div className="pt-1">
                  <Button size="sm" variant="outline">
                    <Mail className="mr-2 h-4 w-4" />
                    New template
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Follow-up rhythm</CardTitle>
                <CardDescription>
                  Simple cadence beats complex automation.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      Cadence
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Day 0 / Day 2 / Day 6
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Add new value on each follow-up.
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">SLA</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Reply within 24 hours
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Speed increases win rate.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <section className="space-y-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Outreach queue
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Prospects with a reason and next action. No maybe-later entries.
              </p>
            </div>
            <Report
              className="h-auto w-full"
              data={queue}
              definition={{
                columns: [
                  { header: 'Prospect', key: 'name' },
                  { header: 'Reason', key: 'reason' },
                  { header: 'Next action', key: 'next' },
                  { header: 'Status', key: 'status' },
                ],
                data: queue,
                view: 'table' as any,
                sortBy: 'name',
                activeFilters: [],
                filters: [],
              }}
            />

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button asChild size="sm" variant="ghost">
                <Link href="/clients">Back to Clients</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
