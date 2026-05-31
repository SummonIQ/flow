import { getProject, getProjectApps } from '@/lib/services/project-service';
import { MarketingSitesTab } from '../tabs/marketing-sites-tab';

export default async function MarketingPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const [project, apps] = await Promise.all([
    getProject(name),
    getProjectApps(name),
  ]);

  return <MarketingSitesTab project={project} apps={apps} />;
}
