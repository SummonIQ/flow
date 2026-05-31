import { DatabaseViewer } from './components/database-viewer';

interface PageProps {
  params: Promise<{ name: string; id: string }>;
}

export default async function DatabaseViewerPage({ params }: PageProps) {
  const { name, id } = await params;

  return (
    <div className="h-screen flex flex-col">
      <DatabaseViewer projectName={name} databaseId={id} />
    </div>
  );
}
