import {
  Calendar,
  Globe,
  Mail } from 'lucide-react';
import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';
import Link from 'next/link';

import prisma from '@/lib/db/prisma';
import { Button,
  Card,
  CardContent,
} from '@summoniq/applab-ui';

import { AppleCalendarForm } from '../../calendar/components/apple-calendar-form';
import { IcsCalendarForm } from '../../calendar/components/ics-calendar-form';
import { OutlookCalendarForm } from '../../calendar/components/outlook-calendar-form';

type CalendarConnectionDelegate = {
  findFirst: (args: {
    where: { provider: string };
    select: { providerAccountId: true };
  }) => Promise<{ providerAccountId: string } | null>;
  findMany: (args: {
    where: { provider: string };
    select: {
      calendarId: true;
      calendarName: true;
      providerAccountId: true;
    };
    orderBy: { createdAt: 'desc' };
  }) => Promise<
    Array<{
      calendarId: string;
      calendarName: string;
      providerAccountId: string;
    }>
  >;
};

function getCalendarConnectionDelegate(
  value: unknown,
): CalendarConnectionDelegate | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const delegate = record['calendarConnection'];
  if (!delegate || typeof delegate !== 'object') return null;
  const delRecord = delegate as Record<string, unknown>;
  if (typeof delRecord['findFirst'] !== 'function') return null;
  if (typeof delRecord['findMany'] !== 'function') return null;
  return delegate as CalendarConnectionDelegate;
}

export default async function SettingsIntegrationsPage() {
  const delegate = getCalendarConnectionDelegate(prisma as unknown);

  let isPrismaReady = true;
  let appleConnection: { providerAccountId: string } | null = null;
  let icsConnections: Array<{
    calendarId: string;
    calendarName: string;
    providerAccountId: string;
  }> = [];
  let microsoftConnection: {
    providerAccountId: string;
    calendarName: string;
  } | null = null;

  if (!delegate) {
    isPrismaReady = false;
  } else {
    try {
      [appleConnection, icsConnections] = await Promise.all([
        delegate.findFirst({
          where: { provider: 'apple' },
          select: { providerAccountId: true },
        }),
        delegate.findMany({
          where: { provider: 'ics' },
          select: {
            calendarId: true,
            calendarName: true,
            providerAccountId: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      // Fetch Microsoft connection separately (different select fields)
      try {
        microsoftConnection = await (
          prisma as {
            calendarConnection: {
              findFirst: (args: unknown) => Promise<{
                providerAccountId: string;
                calendarName: string;
              } | null>;
            };
          }
        ).calendarConnection.findFirst({
          where: { provider: 'microsoft' },
          select: { providerAccountId: true, calendarName: true },
        });
      } catch {
        microsoftConnection = null;
      }
    } catch {
      isPrismaReady = false;
      appleConnection = null;
      icsConnections = [];
    }
  }

  const connectedCount = [
    microsoftConnection,
    appleConnection,
    icsConnections.length > 0 ? true : null,
  ].filter(Boolean).length;

  return (
    <Page className="h-full">
      <PageHeader
        title="Integrations"
        description="Connect external calendars and import events into Flow."
        actions={
          <Button asChild size="sm" variant="secondary">
            <Link href="/calendar">Back to calendar</Link>
          </Button>
        }
      />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl space-y-8 px-6 pb-10">
          {!isPrismaReady ? (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Integrations are unavailable because the database client is not
                ready. Run the Flow Prisma generate step and reload.
              </CardContent>
            </Card>
          ) : null}

          {/* Stats Overview */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-linear-to-br from-blue-500/5 to-transparent p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{connectedCount}</p>
                  <p className="text-xs text-muted-foreground">
                    Connected sources
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border/60 bg-linear-to-br from-purple-500/5 to-transparent p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                  <Mail className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">
                    {microsoftConnection ? 1 : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Email accounts
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border/60 bg-linear-to-br from-emerald-500/5 to-transparent p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Globe className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">
                    {icsConnections.length}
                  </p>
                  <p className="text-xs text-muted-foreground">ICS feeds</p>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar & Email Section */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Calendar & Email</h2>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Connect your calendar and email accounts to sync events and
              messages with Flow.
            </p>
            <div className="grid gap-4 lg:grid-cols-2">
              <OutlookCalendarForm
                connectedEmail={microsoftConnection?.calendarName ?? null}
                isConnected={Boolean(microsoftConnection)}
              />
              <AppleCalendarForm
                initialIcloudEmail={appleConnection?.providerAccountId ?? ''}
                isConnected={Boolean(appleConnection)}
              />
            </div>
          </section>

          {/* ICS Feeds Section */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10">
                <Globe className="h-4 w-4 text-emerald-500" />
              </div>
              <h2 className="text-lg font-semibold">ICS Calendar Feeds</h2>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Import calendar events from ICS feeds or files.
            </p>
            <IcsCalendarForm connections={icsConnections} />
          </section>
        </div>
      </div>
    </Page>
  );
}
