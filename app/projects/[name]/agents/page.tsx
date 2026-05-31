import { redirect } from 'next/navigation';

export default async function AgentsPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  redirect(`/projects/${encodeURIComponent(name)}/team?tab=agents`);
}
