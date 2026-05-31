import { getProjectWithApps } from '@/lib/services/project-service';
import { DataTab } from '../tabs/data-tab';

export default async function DataPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const project = await getProjectWithApps(name);

  return <DataTab project={project} />;
}
