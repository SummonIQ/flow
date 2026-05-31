import { prisma } from '@/lib/db/prisma';

export type ProjectIdentity = {
  id: string;
  name: string;
};

export async function resolveProjectIdentity(
  projectIdOrName?: string,
): Promise<ProjectIdentity | null> {
  if (!projectIdOrName) return null;

  const byId = await prisma.project.findUnique({
    where: { id: projectIdOrName },
    select: { id: true, name: true },
  });
  if (byId) return byId;

  const byName = await prisma.project.findUnique({
    where: { name: projectIdOrName },
    select: { id: true, name: true },
  });

  return byName;
}

export async function migrateKnowledgeProjectId(
  project: ProjectIdentity,
): Promise<void> {
  await prisma.knowledgeDocument.updateMany({
    where: { projectId: project.name },
    data: { projectId: project.id },
  });

  await prisma.embedding.updateMany({
    where: {
      sourceType: 'KNOWLEDGE_DOCUMENT',
      projectId: project.name,
    },
    data: { projectId: project.id },
  });
}
