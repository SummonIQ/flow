'use client';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@summoniq/applab-ui';
import { useEnvVariables, useProjectConfigs } from '@/hooks/use-settings';

/**
 * Example component showing how to use settings in your application
 */
export function SettingsExample() {
  const { envVariables, getEnvValue, loading: envLoading } = useEnvVariables();
  const {
    projectConfigs,
    getConfigByName,
    loading: configLoading,
  } = useProjectConfigs();

  if (envLoading || configLoading) {
    return <div>Loading settings...</div>;
  }

  // Example: Get a specific environment variable
  const apiKey = getEnvValue('API_KEY');

  // Example: Get a specific project configuration
  const devConfig = getConfigByName('Development');

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Total variables: {envVariables.length}
          </p>
          {apiKey && (
            <div className="p-3 bg-muted rounded-md">
              <code className="text-sm">API_KEY is configured</code>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Configurations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Total configurations: {projectConfigs.length}
          </p>
          {devConfig && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-semibold mb-2">{devConfig.name}</p>
              <pre className="text-xs">
                {JSON.stringify(devConfig.settings, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Example usage in a page component:
// 
// import { SettingsExample } from '@/components/settings/settings-example';
// 
// export default function MyPage() {
//   return (
//     <div>
//       <h1>My Application</h1>
//       <SettingsExample />
//     </div>
//   );
// }
