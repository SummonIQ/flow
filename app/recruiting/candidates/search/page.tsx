'use client';

import { Report, type ReportColumnDefinition } from '@summoniq/applab-ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Search, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { useEffect, useMemo, useState } from 'react';

import { useRecruitingStore } from '@/lib/recruiting/store';

export default function RecruitingCandidateSearchPage() {
  const hasHydrated = useRecruitingStore(state => state.hasHydrated);
  const ensureSeeded = useRecruitingStore(state => state.ensureSeeded);
  const roles = useRecruitingStore(state => state.roles);
  const candidates = useRecruitingStore(state => state.candidates);
  const savedSearches = useRecruitingStore(state => state.savedSearches);
  const runSavedSearch = useRecruitingStore(state => state.runSavedSearch);
  const moveCandidateStage = useRecruitingStore(
    state => state.moveCandidateStage,
  );
  const updateCandidate = useRecruitingStore(state => state.updateCandidate);

  const [filters, setFilters] = useState({
    keywords: '',
    location: '',
    experience: '',
    mustHaves: '',
  });

  useEffect(() => {
    if (!hasHydrated) return;
    ensureSeeded();
  }, [ensureSeeded, hasHydrated]);

  const results = useMemo(() => {
    const needle = filters.keywords.trim().toLowerCase();
    const loc = filters.location.trim().toLowerCase();
    const must = filters.mustHaves.trim().toLowerCase();

    return candidates.filter(candidate => {
      const hay =
        `${candidate.name} ${candidate.headline} ${candidate.tags.join(' ')}`.toLowerCase();
      const locationHay = candidate.location.toLowerCase();
      const notesHay = candidate.notes.toLowerCase();

      if (needle && !hay.includes(needle)) return false;
      if (loc && !locationHay.includes(loc)) return false;
      if (must && !hay.includes(must) && !notesHay.includes(must)) return false;
      return true;
    });
  }, [candidates, filters.keywords, filters.location, filters.mustHaves]);

  const resultColumns = useMemo<
    ReportColumnDefinition<(typeof results)[number]>[]
  >(
    () => [
      {
        header: 'Candidate',
        key: 'name',
      },
      {
        header: 'Role',
        key: 'headline',
      },
      {
        header: 'Location',
        key: 'location',
      },
      {
        header: 'Score',
        key: 'score',
        cellFn: candidate => (
          <Badge variant="secondary">{candidate.score}</Badge>
        ),
      },
      {
        header: 'Status',
        key: 'stage',
        cellFn: candidate => (
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={candidate.stage}
              onChange={event =>
                moveCandidateStage(candidate.id, event.target.value as any)
              }
              className="h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {[
                'Sourced',
                'Contacted',
                'Screening',
                'Client loop',
                'Offer',
                'Placed',
                'Rejected',
              ].map(stage => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>

            <select
              value={candidate.roleId ?? ''}
              onChange={event =>
                updateCandidate(candidate.id, {
                  roleId: event.target.value || undefined,
                })
              }
              className="h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Unassigned</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.title} • {role.company}
                </option>
              ))}
            </select>
          </div>
        ),
      },
    ],
    [moveCandidateStage, roles, updateCandidate],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-indigo-500/10 p-2">
                <Search className="h-5 w-5 text-indigo-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Candidate Search
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Build shortlists fast with reusable filters, saved searches, and
              AI-assisted enrichment.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Sparkles className="mr-2 h-4 w-4" />
              AI refine
            </Button>
            <Button>Run search</Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <Card>
              <CardHeader>
                <CardTitle>Search filters</CardTitle>
                <CardDescription>
                  Start broad, then tighten by role, location, and quality
                  signals.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Role keywords
                  </p>
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="e.g. fullstack, backend, design engineer"
                    value={filters.keywords}
                    onChange={event =>
                      setFilters(prev => ({
                        ...prev,
                        keywords: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Location
                    </p>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Remote, SF Bay, NYC"
                      value={filters.location}
                      onChange={event =>
                        setFilters(prev => ({
                          ...prev,
                          location: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Experience
                    </p>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="e.g. 5-8 years"
                      value={filters.experience}
                      onChange={event =>
                        setFilters(prev => ({
                          ...prev,
                          experience: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Notes / must-haves
                  </p>
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="e.g. React + Node, shipped B2B SaaS"
                    value={filters.mustHaves}
                    onChange={event =>
                      setFilters(prev => ({
                        ...prev,
                        mustHaves: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Button variant="outline">Save filters</Button>
                  <Link
                    className="text-sm text-primary hover:underline"
                    href="/recruiting"
                  >
                    Back to Recruiting Hub
                  </Link>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Saved searches</CardTitle>
                  <CardDescription>
                    Re-run the same intent across new candidates and companies.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {savedSearches.map(search => (
                    <div
                      key={search.id}
                      className="rounded-lg border border-border/60 bg-muted/30 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {search.name}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {[
                              search.roleKeywords,
                              search.location,
                              search.experience,
                            ]
                              .filter(Boolean)
                              .slice(0, 3)
                              .map(tag => (
                                <Badge key={tag} variant="outline">
                                  {tag}
                                </Badge>
                              ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last run{' '}
                          {search.lastRunAt
                            ? new Date(search.lastRunAt).toLocaleDateString()
                            : '—'}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            runSavedSearch(search.id);
                            setFilters({
                              keywords: search.roleKeywords,
                              location: search.location,
                              experience: search.experience,
                              mustHaves: search.mustHaves,
                            });
                          }}
                        >
                          Run
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Autofills filters
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <section className="space-y-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Results preview
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Shortlist candidates and push them into your pipeline.
                  </p>
                </div>
                <Report
                  className="h-auto"
                  data={results}
                  definition={{
                    columns: resultColumns,
                    data: results,
                    view: 'table' as any,
                    sortBy: 'score',
                    activeFilters: [],
                    filters: [],
                  }}
                  search={false}
                />

                {!hasHydrated ? (
                  <div className="mt-3 text-sm text-muted-foreground">
                    Loading workspace...
                  </div>
                ) : null}
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
