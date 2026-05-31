import { TeamPageClient } from './team-page-client';

interface PageProps {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function TeamPage({ params, searchParams }: PageProps) {
  const { name } = await params;
  const { tab } = await searchParams;

  return <TeamPageClient projectName={name} initialTab={tab} />;
}
