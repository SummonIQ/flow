import { getProjectWithApps } from '@/lib/services/project-service';
import { OverviewTab } from '../tabs/overview-tab';

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const project = await getProjectWithApps(name);

  return <OverviewTab project={project} />;
}
