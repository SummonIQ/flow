import { Button, Card } from '@summoniq/applab-ui';
import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';
import { ArrowRight, Bot, Users, Workflow } from 'lucide-react';
import Link from 'next/link';

export default function AutomatePage() {
  return (
    <Page className="h-full">
      <PageHeader
        title="Automate"
        description="Teams, agents, and workflows that run your projects."
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Users className="h-4 w-4" />
                  </span>
                  <h2 className="text-sm font-semibold">Teams</h2>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Organize people and automation ownership.
                </p>
              </div>
              <Button asChild variant="outline" className="h-9">
                <Link href="/teams">
                  Open
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </span>
                  <h2 className="text-sm font-semibold">Agents</h2>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Configure and monitor agent capabilities.
                </p>
              </div>
              <Button asChild variant="outline" className="h-9">
                <Link href="/agents">
                  Open
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Workflow className="h-4 w-4" />
                  </span>
                  <h2 className="text-sm font-semibold">Workflows</h2>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Define how work moves through your system.
                </p>
              </div>
              <Button asChild variant="outline" className="h-9">
                <Link href="/workflows">
                  Open
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}
