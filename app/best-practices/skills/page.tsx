'use client';

import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';

import { Badge, Card } from '@summoniq/applab-ui';
import {
  BookOpen,
  Brain,
  Code2,
  Database,
  FileCode,
  Layers,
  LayoutGrid,
  Palette,
  Search,
  Server,
  Settings,
  Shield,
  Sparkles,
  TestTube,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Skill {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  content: string;
  tags: string[];
  isOfficial: boolean;
  usageCount: number;
}

const categoryIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  FRONTEND: Code2,
  BACKEND: Server,
  FULLSTACK: Layers,
  DATABASE: Database,
  DEVOPS: Settings,
  TESTING: TestTube,
  SECURITY: Shield,
  PERFORMANCE: Zap,
  ACCESSIBILITY: BookOpen,
  DOCUMENTATION: FileCode,
  ARCHITECTURE: LayoutGrid,
  TOOLING: Settings,
  AI_ML: Brain,
  MOBILE: Sparkles,
  API: Server,
  STYLING: Palette,
  STATE_MANAGEMENT: Layers,
  BUILD_TOOLS: Settings,
  VERSION_CONTROL: FileCode,
  DEBUGGING: Code2,
  DEPLOYMENT: Server,
  MONITORING: Zap,
  OTHER: Sparkles,
};

const categoryLabels: Record<string, string> = {
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  FULLSTACK: 'Full Stack',
  DATABASE: 'Database',
  DEVOPS: 'DevOps',
  TESTING: 'Testing',
  SECURITY: 'Security',
  PERFORMANCE: 'Performance',
  ACCESSIBILITY: 'Accessibility',
  DOCUMENTATION: 'Documentation',
  ARCHITECTURE: 'Architecture',
  TOOLING: 'Tooling',
  AI_ML: 'AI/ML',
  MOBILE: 'Mobile',
  API: 'API',
  STYLING: 'Styling',
  STATE_MANAGEMENT: 'State Management',
  BUILD_TOOLS: 'Build Tools',
  VERSION_CONTROL: 'Version Control',
  DEBUGGING: 'Debugging',
  DEPLOYMENT: 'Deployment',
  MONITORING: 'Monitoring',
  OTHER: 'Other',
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  useEffect(() => {
    loadSkills();
  }, []);

  async function loadSkills() {
    try {
      setLoading(true);
      const response = await fetch('/api/skills');
      if (response.ok) {
        const data = await response.json();
        setSkills(data);
      }
    } catch (error) {
      console.error('Failed to load skills:', error);
    } finally {
      setLoading(false);
    }
  }

  const categories = [...new Set(skills.map(s => s.category))].sort();

  const filteredSkills = skills.filter(skill => {
    const matchesSearch =
      !searchQuery ||
      skill.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      !selectedCategory || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Page className="h-full">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <span className="rounded-lg bg-violet-500/10 p-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
            </span>
            AI Agent Skills
          </span>
        }
        description="Reusable knowledge modules that enhance AI capabilities for development tasks."
      />

      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar - Categories */}
        <div className="w-56 shrink-0 border-r border-border/40 overflow-auto p-3">
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Categories
            </h3>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                !selectedCategory
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              All Skills ({skills.length})
            </button>
          </div>
          <div className="space-y-0.5">
            {categories.map(category => {
              const Icon = categoryIcons[category] || Sparkles;
              const count = skills.filter(s => s.category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {categoryLabels[category] || category}
                  </span>
                  <span className="ml-auto text-xs opacity-60">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Skills List */}
          <div className="w-80 shrink-0 border-r border-border/40 overflow-auto">
            <div className="sticky top-0 bg-background z-10 p-3 border-b border-border/40">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-input bg-background"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Loading skills...
              </div>
            ) : filteredSkills.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No skills found
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredSkills.map(skill => {
                  const Icon = categoryIcons[skill.category] || Sparkles;
                  return (
                    <button
                      key={skill.id}
                      onClick={() => setSelectedSkill(skill)}
                      className={`w-full text-left p-2 rounded-md transition-colors ${
                        selectedSkill?.id === skill.id
                          ? 'bg-primary/10 border border-primary/30'
                          : 'hover:bg-muted/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium truncate">
                              {skill.displayName}
                            </span>
                            {skill.isOfficial && (
                              <Badge
                                variant="secondary"
                                className="text-[9px] px-1 py-0"
                              >
                                Official
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {skill.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {skill.tags.slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                            {skill.tags.length > 3 && (
                              <span className="text-[10px] text-muted-foreground">
                                +{skill.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Skill Detail */}
          <div className="flex-1 overflow-auto">
            {selectedSkill ? (
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold">
                      {selectedSkill.displayName}
                    </h2>
                    {selectedSkill.isOfficial && (
                      <Badge variant="default" className="text-xs">
                        Official
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    {selectedSkill.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {selectedSkill.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Card className="p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <FileCode className="h-4 w-4" />
                    SKILL.md Content
                  </h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <pre className="text-xs bg-muted/30 p-4 rounded-lg overflow-auto whitespace-pre-wrap">
                      {selectedSkill.content}
                    </pre>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select a skill to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}
