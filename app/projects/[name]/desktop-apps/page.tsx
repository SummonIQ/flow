import { getProject, getProjectApps } from '@/lib/services/project-service';
import { DesktopAppsTab } from '../tabs/desktop-apps-tab';

export default async function DesktopAppsPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const [project, apps] = await Promise.all([
    getProject(name),
    getProjectApps(name),
  ]);

  return <DesktopAppsTab project={project} apps={apps} />;
}
