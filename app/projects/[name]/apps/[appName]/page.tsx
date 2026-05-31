import { AppDetail } from './app-detail';

interface PageProps {
  params: Promise<{
    name: string;
    appName: string;
  }>;
}

export default async function AppPage({ params }: PageProps) {
  const { name, appName } = await params;
  
  return <AppDetail projectName={name} appName={appName} />;
}
