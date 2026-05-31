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
  BookOpen,
  FileText,
  FolderOpen,
  Plus,
  Search,
} from 'lucide-react';
import Link from 'next/link';

const sections = [
  {
    name: 'Operating system',
    detail: 'Cadences, checklists, and how decisions get made',
    tag: 'Core',
  },
  {
    name: 'Sales & delivery',
    detail: 'Proposals, onboarding, scope, and execution playbooks',
    tag: 'Playbooks',
  },
  {
    name: 'Brand & assets',
    detail: 'Design standards, templates, and reusable components',
    tag: 'Assets',
  },
];

const recentDocs = [
  { title: 'Proposal template — agency services', updated: 'Today' },
  { title: 'Client kickoff checklist', updated: 'Yesterday' },
  { title: 'Lead qualification rubric', updated: 'Mon' },
];

export default function BusinessDocumentationPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 px-6 py-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-amber-500/10 p-2">
                <BookOpen className="h-5 w-5 text-amber-500" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Business Documentation
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Centralize the operating system: playbooks, templates, and
              standards.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New doc
            </Button>
            <Button asChild variant="ghost">
              <Link href="/business-tools">
                Back to Business Tools <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <Card>
              <CardHeader>
                <CardTitle>Sections</CardTitle>
                <CardDescription>
                  Organize docs by how you operate, not by tool.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {sections.map(s => (
                  <div
                    key={s.name}
                    className="rounded-lg border border-border/60 bg-muted/30 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {s.name}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {s.detail}
                        </p>
                      </div>
                      <Badge variant="outline">{s.tag}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recently updated</CardTitle>
                  <CardDescription>
                    Keep your playbooks current as the product and business
                    evolve.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentDocs.map(d => (
                    <div
                      key={d.title}
                      className="rounded-lg border border-border/60 bg-muted/30 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {d.title}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Updated {d.updated}
                          </p>
                        </div>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Templates</CardTitle>
                  <CardDescription>
                    Standardize output: proposals, checklists, and meeting
                    notes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Browse templates
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
