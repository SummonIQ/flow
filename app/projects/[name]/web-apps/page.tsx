import { getProject, getProjectApps } from '@/lib/services/project-service';
import { WebAppsTab } from '../tabs/web-apps-tab';

export default async function WebAppsPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const [project, apps] = await Promise.all([
    getProject(name),
    getProjectApps(name),
  ]);

  return <WebAppsTab project={project} apps={apps} />;
}
