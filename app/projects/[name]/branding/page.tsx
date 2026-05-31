import { getProject } from '@/lib/services/project-service';
import { BrandingTab } from '../tabs/branding-tab';

export default async function BrandingPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const project = await getProject(name);

  return <BrandingTab project={project} />;
}
