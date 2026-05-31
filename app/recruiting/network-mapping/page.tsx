'use client';

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
  Download,
  Network,
  Plus,
  Sparkles,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { useEffect, useMemo, useState } from 'react';

import {
  useRecruitingStore,
  type NetworkEntityKind,
} from '@/lib/recruiting/store';

const notes = [
  {
    title: 'Identify 10 companies where you can get a warm intro',
    detail: 'Use connectors + past clients to shortcut cold outreach.',
  },
  {
    title: 'Track relationship strength explicitly',
    detail: 'Strong / Medium / Weak + when you last spoke.',
  },
  {
    title: 'Always store a “next ask”',
    detail: 'Intro request, hiring context, or referral to the right owner.',
  },
];

export default function RecruitingNetworkMappingPage() {
  const hasHydrated = useRecruitingStore(state => state.hasHydrated);
  const ensureSeeded = useRecruitingStore(state => state.ensureSeeded);
  const network = useRecruitingStore(state => state.network);
  const addNetworkEntity = useRecruitingStore(state => state.addNetworkEntity);

  const [draft, setDraft] = useState({
    kind: 'connector' as NetworkEntityKind,
    name: '',
    tag: '',
  });

  useEffect(() => {
    if (!hasHydrated) return;
    ensureSeeded();
  }, [ensureSeeded, hasHydrated]);

  const segments = useMemo(() => {
    const connectors = network.filter(n => n.kind === 'connector').length;
    const companies = network.filter(n => n.kind === 'company').length;
    const hiringManagers = network.filter(
      n => n.kind === 'hiring_manager',
    ).length;
    return [
      { name: 'Warm connectors', count: connectors, tag: 'Intro' },
      { name: 'Target companies', count: companies, tag: 'Account' },
      { name: 'Hiring managers', count: hiringManagers, tag: 'People' },
    ];
  }, [network]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-fuchsia-500/10 p-2">
                <Network className="h-5 w-5 text-fuchsia-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Network Mapping
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Turn relationships into deal flow: connectors → intros → hiring
              context → placements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New contact
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Segments</CardTitle>
                <CardDescription>
                  Organize the graph by intent: who can introduce you to what.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {segments.map(segment => (
                  <div
                    key={segment.name}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {segment.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {segment.tag}
                      </p>
                    </div>
                    <Badge variant="secondary">{segment.count}</Badge>
                  </div>
                ))}

                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <select
                      value={draft.kind}
                      onChange={event =>
                        setDraft(prev => ({
                          ...prev,
                          kind: event.target.value as NetworkEntityKind,
                        }))
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="connector">Connector</option>
                      <option value="company">Company</option>
                      <option value="hiring_manager">Hiring manager</option>
                    </select>
                    <input
                      value={draft.name}
                      onChange={event =>
                        setDraft(prev => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Name"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <div className="flex gap-2">
                      <input
                        value={draft.tag}
                        onChange={event =>
                          setDraft(prev => ({
                            ...prev,
                            tag: event.target.value,
                          }))
                        }
                        placeholder="Tag (Intro/Account/People)"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                      <Button
                        disabled={!draft.name.trim() || !draft.tag.trim()}
                        onClick={() => {
                          addNetworkEntity({
                            kind: draft.kind,
                            name: draft.name.trim(),
                            tag: draft.tag.trim(),
                          });
                          setDraft({ kind: 'connector', name: '', tag: '' });
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Relationship canvas</CardTitle>
                  <CardDescription>
                    A lightweight “graph” view placeholder — contacts,
                    companies, and paths.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                    {network.length ? (
                      <div className="grid gap-2">
                        {network.slice(0, 12).map(entity => (
                          <div
                            key={entity.id}
                            className="flex items-start justify-between gap-3 rounded-md border border-border/60 bg-background/40 px-3 py-2"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-foreground">
                                {entity.name}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {entity.kind.replace('_', ' ')} • {entity.tag}
                              </p>
                            </div>
                            <Badge variant="outline">
                              {entity.relationshipStrength}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-10 text-center">
                        <Users className="h-6 w-6 text-muted-foreground" />
                        <p className="mt-3 font-medium text-foreground">
                          Add connectors to start mapping paths
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Example: “Avery → Casey → Harper & Co. CTO”
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                          <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add connector
                          </Button>
                          <Button size="sm" variant="outline">
                            <Sparkles className="mr-2 h-4 w-4" />
                            Suggest paths
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How to use this</CardTitle>
                  <CardDescription>
                    Make warm intros a repeatable system, not a random event.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notes.map(n => (
                    <div
                      key={n.title}
                      className="rounded-lg border border-border/60 bg-muted/30 p-3"
                    >
                      <p className="font-medium text-foreground">{n.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {n.detail}
                      </p>
                    </div>
                  ))}

                  <div className="pt-1">
                    <Button asChild size="sm" variant="ghost">
                      <Link href="/recruiting">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Back to Recruiting Hub
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/business-tools">Back to Business Tools</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
