import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@summoniq/applab-ui';
import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';
import { CalendarCheck, Clock, Link2 } from 'lucide-react';

const bookingLinks = [
  {
    id: 'link-1',
    name: 'Client onboarding',
    duration: '45 min',
    url: 'flow.app/meet/onboarding',
  },
  {
    id: 'link-2',
    name: 'Project kickoff',
    duration: '60 min',
    url: 'flow.app/meet/kickoff',
  },
  {
    id: 'link-3',
    name: 'Weekly check-in',
    duration: '30 min',
    url: 'flow.app/meet/checkin',
  },
];

const availability = [
  { day: 'Mon', blocks: ['9:00-12:00', '2:00-5:00'] },
  { day: 'Tue', blocks: ['10:00-12:00', '1:30-4:30'] },
  { day: 'Wed', blocks: ['9:30-11:30', '3:00-5:00'] },
  { day: 'Thu', blocks: ['10:00-1:00', '2:00-4:00'] },
  { day: 'Fri', blocks: ['9:00-12:30'] },
];

const requests = [
  {
    id: 'req-1',
    client: 'Brightside Labs',
    type: 'Campaign sync',
    requested: 'Sep 18 · 2:30 PM',
    status: 'Pending',
  },
  {
    id: 'req-2',
    client: 'Northwind Studio',
    type: 'Quarterly review',
    requested: 'Sep 19 · 9:00 AM',
    status: 'Confirmed',
  },
  {
    id: 'req-3',
    client: 'Venture Atlas',
    type: 'Budget alignment',
    requested: 'Sep 20 · 11:15 AM',
    status: 'Needs reply',
  },
];

export default function SchedulingPage() {
  return (
    <Page className="h-full">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <span className="rounded-lg bg-emerald-500/10 p-2">
              <CalendarCheck className="h-5 w-5 text-emerald-500" />
            </span>
            Scheduling
          </span>
        }
        description="Coordinate booking links, availability, and client requests."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary">Share availability</Button>
            <Button>Create booking link</Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking links</CardTitle>
                <CardDescription>
                  Send tailored links to match each client touchpoint.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {bookingLinks.map(link => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {link.name}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Link2 className="h-3 w-3" />
                        {link.url}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{link.duration}</Badge>
                      <Button size="sm" variant="secondary">
                        Copy
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Incoming requests</CardTitle>
                <CardDescription>
                  Confirm or adjust pending meeting times.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {requests.map(request => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {request.client}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {request.type} · {request.requested}
                      </p>
                    </div>
                    <Badge
                      variant={
                        request.status === 'Confirmed' ? 'secondary' : 'outline'
                      }
                    >
                      {request.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Availability blocks</CardTitle>
                <CardDescription>
                  Set weekly windows for client meetings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {availability.map(day => (
                  <div
                    key={day.day}
                    className="flex items-start justify-between rounded-lg border border-border/60 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {day.day}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {day.blocks.map(block => (
                          <Badge key={block} variant="secondary">
                            {block}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {day.blocks.length} blocks
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Queue load</CardTitle>
                <CardDescription>
                  Monitor how quickly requests are being handled.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Avg. response</p>
                  <p className="text-lg font-semibold text-foreground">
                    3h 12m
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Meetings booked</p>
                  <p className="text-lg font-semibold text-foreground">18</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Pending requests</p>
                  <p className="text-lg font-semibold text-foreground">4</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Page>
  );
}
