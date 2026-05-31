import { getProject } from '@/lib/services/project-service';
import { KanbanTab } from '../tabs/kanban-tab';

export default async function KanbanPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const project = await getProject(name);

  return <KanbanTab project={project} />;
}
