'use client';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Report,
} from '@summoniq/applab-ui';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Inbox,
  Plus,
  Settings2,
  Sparkles,
  Tag,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

const leads = [
  {
    name: 'Baseline Health',
    contact: 'Taylor Singh',
    intent: 'Website refresh',
    source: 'Referral',
    status: 'New',
  },
  {
    name: 'Northwind Labs',
    contact: 'Alex Morgan',
    intent: 'Analytics setup',
    source: 'Inbound form',
    status: 'Qualified',
  },
  {
    name: 'Harper & Co.',
    contact: 'Riley Chen',
    intent: 'Brand + landing',
    source: 'Cold email',
    status: 'Nurture',
  },
];

export default function LeadsPage() {
  const [sourceFilter, setSourceFilter] = useState('All');
  const [visibleColumns, setVisibleColumns] = useState({
    contact: true,
    intent: true,
    name: true,
    source: true,
    status: true,
  });

  const sourceOptions = useMemo(
    () => [
      'All',
      ...Array.from(new Set(leads.map(lead => lead.source))).sort(),
    ],
    [],
  );

  const filteredLeads = useMemo(
    () =>
      sourceFilter === 'All'
        ? leads
        : leads.filter(lead => lead.source === sourceFilter),
    [sourceFilter],
  );

  const reportColumns = useMemo(
    () => [
      { header: 'Company', key: 'name' as const, visible: visibleColumns.name },
      {
        header: 'Contact',
        key: 'contact' as const,
        visible: visibleColumns.contact,
      },
      {
        header: 'Intent',
        key: 'intent' as const,
        visible: visibleColumns.intent,
      },
      {
        header: 'Source',
        key: 'source' as const,
        visible: visibleColumns.source,
      },
      {
        header: 'Status',
        key: 'status' as const,
        visible: visibleColumns.status,
      },
    ],
    [visibleColumns],
  );

  const columns = [
    { key: 'name' as const, label: 'Company' },
    { key: 'contact' as const, label: 'Contact' },
    { key: 'intent' as const, label: 'Intent' },
    { key: 'source' as const, label: 'Source' },
    { key: 'status' as const, label: 'Status' },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="flex w-full items-start justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-teal-500/10 p-2">
                <Inbox className="h-5 w-5 text-teal-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Leads
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              A single inbox for potential work. Convert leads into proposals,
              not maybe-later.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Sparkles className="mr-2 h-4 w-4" />
              Summarize
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New lead
            </Button>
            <Button asChild variant="ghost">
              <Link href="/lead-generation">
                Lead Generation <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-5 py-4">
        <div className="flex w-full flex-col gap-4">
          <section className="space-y-3">
            <div className="relative">
              <Report
                className="h-auto w-full [&>div:first-child]:pr-52 sm:[&>div:first-child]:pr-64"
                data={filteredLeads}
                definition={{
                  columns: reportColumns,
                  data: filteredLeads,
                  view: 'table' as any,
                  sortBy: 'name',
                  activeFilters: [],
                  filters: [],
                }}
              />
              <div className="pointer-events-none absolute right-2 top-2 z-10 flex items-center gap-2">
                <select
                  value={sourceFilter}
                  onChange={event => setSourceFilter(event.target.value)}
                  className="pointer-events-auto h-8 min-w-28 rounded-md border border-input bg-background px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-w-36 sm:text-sm"
                >
                  {sourceOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      className="pointer-events-auto h-8 w-8"
                    >
                      <Settings2 className="h-4 w-4" />
                      <span className="sr-only">Manage columns</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {columns.map(column => (
                      <DropdownMenuCheckboxItem
                        key={column.key}
                        checked={visibleColumns[column.key]}
                        onCheckedChange={checked => {
                          setVisibleColumns(prev => ({
                            ...prev,
                            [column.key]: Boolean(checked),
                          }));
                        }}
                      >
                        {column.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button asChild size="sm" variant="ghost">
                <Link href="/agency-leads">
                  <Tag className="mr-2 h-4 w-4" />
                  Triage agency leads
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
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
