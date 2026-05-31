import { getProject, getProjectApps } from '@/lib/services/project-service';
import { ApisTab } from '../tabs/apis-tab';

export default async function ApisPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const [project, apps] = await Promise.all([
    getProject(name),
    getProjectApps(name),
  ]);

  return <ApisTab project={project} apps={apps} />;
}
