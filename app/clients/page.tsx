import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@summoniq/applab-ui';
import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';
import { Users } from 'lucide-react';

const clientStats = [
  { label: 'Active clients', value: '18', detail: '+3 this quarter' },
  { label: 'Onboarding', value: '4', detail: 'Avg. 12 days' },
  { label: 'At risk', value: '2', detail: 'Needs attention' },
  { label: 'Expansion ready', value: '6', detail: 'Upsell pipeline' },
];

const clients = [
  {
    id: 'client-001',
    name: 'Northwind Studio',
    owner: 'Casey Rivera',
    tier: 'Enterprise',
    health: 'Healthy',
    nextTouch: 'Sep 18',
    mrr: '$8,200',
  },
  {
    id: 'client-002',
    name: 'Brightside Labs',
    owner: 'Jordan Lee',
    tier: 'Growth',
    health: 'Watch',
    nextTouch: 'Sep 19',
    mrr: '$3,750',
  },
  {
    id: 'client-003',
    name: 'Venture Atlas',
    owner: 'Taylor Harper',
    tier: 'Enterprise',
    health: 'Healthy',
    nextTouch: 'Sep 20',
    mrr: '$9,400',
  },
  {
    id: 'client-004',
    name: 'Nova Health',
    owner: 'Luna Martinez',
    tier: 'Growth',
    health: 'At risk',
    nextTouch: 'Sep 22',
    mrr: '$4,150',
  },
  {
    id: 'client-005',
    name: 'Studio 88',
    owner: 'Alex Chen',
    tier: 'Core',
    health: 'Healthy',
    nextTouch: 'Sep 23',
    mrr: '$2,900',
  },
];

export default function ClientsPage() {
  return (
    <Page className="h-full">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <span className="rounded-lg bg-rose-500/10 p-2">
              <Users className="h-5 w-5 text-rose-500" />
            </span>
            Clients
          </span>
        }
        description="Keep client health, ownership, and next steps visible."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary">Import clients</Button>
            <Button>Add client</Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {clientStats.map(stat => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-semibold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Client roster</CardTitle>
              <CardDescription>
                Track tiers, ownership, and renewal momentum.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Health</TableHead>
                      <TableHead>Next touch</TableHead>
                      <TableHead className="text-right">MRR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map(client => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">
                          {client.name}
                        </TableCell>
                        <TableCell>{client.owner}</TableCell>
                        <TableCell>{client.tier}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              client.health === 'At risk'
                                ? 'destructive'
                                : client.health === 'Watch'
                                  ? 'outline'
                                  : 'secondary'
                            }
                          >
                            {client.health}
                          </Badge>
                        </TableCell>
                        <TableCell>{client.nextTouch}</TableCell>
                        <TableCell className="text-right">
                          {client.mrr}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Page>
  );
}
