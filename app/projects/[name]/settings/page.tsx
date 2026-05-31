import { ProjectSettings } from './project-settings';

interface PageProps {
  params: Promise<{
    name: string;
  }>;
}

export default async function ProjectSettingsPage({ params }: PageProps) {
  const { name } = await params;
  
  return <ProjectSettings projectName={name} />;
}
