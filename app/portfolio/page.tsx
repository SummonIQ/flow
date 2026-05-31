import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, Briefcase, Filter, Plus } from 'lucide-react';
import Link from 'next/link';

const caseStudies = [
  {
    name: 'Baseline Health — Website refresh',
    industry: 'Health',
    scope: 'Design + Frontend',
    outcome: 'Faster landing iterations + clearer positioning',
    tag: 'Featured',
  },
  {
    name: 'Northwind Labs — Analytics baseline',
    industry: 'B2B SaaS',
    scope: 'Instrumentation',
    outcome: 'Reliable funnel metrics + lower debugging time',
    tag: 'Ops',
  },
  {
    name: 'Harper & Co. — Brand + landing',
    industry: 'Consumer',
    scope: 'Brand + Copy',
    outcome: 'Improved clarity + stronger conversion story',
    tag: 'Design',
  },
];

export default function PortfolioPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-slate-500/10 p-2">
                <Briefcase className="h-5 w-5 text-slate-300" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Portfolio
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              A curated set of outcomes and proof. Keep these concise: problem →
              approach → result.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New case study
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
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {caseStudies.map(cs => (
              <Card key={cs.name}>
                <CardHeader>
                  <CardTitle className="text-base">{cs.name}</CardTitle>
                  <CardDescription>{cs.outcome}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{cs.industry}</Badge>
                    <Badge variant="outline">{cs.scope}</Badge>
                    <Badge
                      variant={cs.tag === 'Featured' ? 'secondary' : 'outline'}
                    >
                      {cs.tag}
                    </Badge>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Structure</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Problem, approach, shipped artifacts, metrics, and
                      visuals.
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    View details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
