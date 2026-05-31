import { getProject } from '@/lib/services/project-service';
import { FilesTab } from '../tabs/files-tab';

export default async function FilesPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const project = await getProject(name);

  return <FilesTab project={project} />;
}
