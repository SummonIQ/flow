import { getProject } from '@/lib/services/project-service';
import { DocumentationTab } from '../tabs/documentation-tab';

export default async function DocumentationPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const project = await getProject(name);

  return <DocumentationTab project={project} />;
}
