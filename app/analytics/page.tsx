import { AnalyticsDashboard } from './components/analytics-dashboard';
import { fetchAnalyticsSummary } from './actions';

export default async function AnalyticsPage() {
  const initialResult = await fetchAnalyticsSummary('orchestrator');

  return (
    <AnalyticsDashboard
      initialAppId="orchestrator"
      initialData={initialResult.success ? initialResult.data : null}
    />
  );
}
