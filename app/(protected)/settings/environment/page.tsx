import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { prisma } from '@/lib/db/prisma';
import { Page, PageHeader } from '@/components/ui/page-layout';
import { Copy, Edit, Eye, EyeOff, Trash2 } from 'lucide-react';

type EnvVar = {
  id: string;
  key: string;
  value: string;
  category: string | null;
  isSecret: boolean;
  isRequired: boolean;
  description: string | null;
};

type ProjectWithEnvVars = {
  id: string;
  name: string;
  envVars: EnvVar[];
};

async function getProjectsWithEnvVars() {
  const projects = await prisma.project.findMany({
    include: {
      envVars: {
        orderBy: [{ category: 'asc' }, { key: 'asc' }],
      },
    },
    orderBy: { name: 'asc' },
  });

  return projects;
}

function EnvVarRow({ envVar }: { envVar: EnvVar }) {
  const displayValue = envVar.isSecret ? '••••••••••••••••' : envVar.value;

  return (
    <div className="flex items-center gap-4 py-3 px-4 border-b last:border-b-0 hover:bg-muted/50">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <code className="text-sm font-mono font-semibold">{envVar.key}</code>
          {envVar.isSecret && (
            <Badge variant="secondary" className="text-xs">
              Secret
            </Badge>
          )}
          {envVar.isRequired && (
            <Badge variant="destructive" className="text-xs">
              Required
            </Badge>
          )}
        </div>
        <code className="text-xs text-muted-foreground font-mono truncate block">
          {displayValue}
        </code>
        {envVar.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {envVar.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title={envVar.isSecret ? 'Show value' : 'Hide value'}
        >
          {envVar.isSecret ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="Copy value"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit">
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default async function EnvironmentPage() {
  const projects = await getProjectsWithEnvVars();

  return (
    <Page className="h-full">
      <PageHeader
        title="Environment Variables"
        description="Manage environment variables for all projects"
        actions={<Button>Add Variable</Button>}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="container mx-auto space-y-6">
          {projects.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No projects found. Run the migration script first.
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {projects.map(project => (
                <Card key={project.id} className="overflow-hidden">
                  <div className="bg-muted/50 px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">
                          {project.name}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.envVars.length} variables
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Sync from .env
                        </Button>
                        <Button variant="outline" size="sm">
                          Export to .env
                        </Button>
                      </div>
                    </div>
                  </div>

                  {project.envVars.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No environment variables loaded. Click "Sync from .env" to
                      import.
                    </div>
                  ) : (
                    <div>
                      {/* Group by category */}
                      {Object.entries(
                        project.envVars.reduce(
                          (acc: Record<string, EnvVar[]>, envVar: EnvVar) => {
                            const category = envVar.category || 'General';
                            if (!acc[category]) acc[category] = [];
                            acc[category].push(envVar);
                            return acc;
                          },
                          {} as Record<string, EnvVar[]>,
                        ),
                      ).map(([category, vars]: [string, EnvVar[]]) => (
                        <div key={category}>
                          <div className="px-6 py-2 bg-muted/30 border-b">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                              {category}
                            </h3>
                          </div>
                          {vars.map(envVar => (
                            <EnvVarRow key={envVar.id} envVar={envVar} />
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🔐 Security Notice
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <p>
                Environment variables marked as "Secret" are stored securely in
                the database.
              </p>
              <p>
                <strong>Important:</strong> This page is for development
                reference only. Production secrets should be managed through
                your hosting provider's environment variable system (Vercel,
                Railway, etc.).
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}
