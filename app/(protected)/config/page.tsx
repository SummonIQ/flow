import { Card } from '@/components/ui/card';
import { Page, PageHeader } from '@/components/ui/page-layout';

interface AppConfig {
  name: string;
  devPort: number;
  dbPort: number | null;
  studioPort: number | null;
  docsPort: number | null;
  betterAuthKey: string | null;
  status: 'active' | 'inactive';
}

const appConfigs: AppConfig[] = [
  {
    name: 'AgencyBase',
    devPort: 10000,
    dbPort: 10005,
    studioPort: 10006,
    docsPort: null,
    betterAuthKey: 'a93Kd2-2Jf03d-D39k20-1D2k9j-3FkL92',
    status: 'active',
  },
  {
    name: 'AgentSuite',
    devPort: 10010,
    dbPort: 10015,
    studioPort: 10016,
    docsPort: null,
    betterAuthKey: null,
    status: 'active',
  },
  {
    name: 'SummonIQ',
    devPort: 10020,
    dbPort: 10025,
    studioPort: 10026,
    docsPort: null,
    betterAuthKey: 'd23kF9-3kL9D2-F29d3J-1Dk0a2-2J93fD',
    status: 'active',
  },
  {
    name: 'Bright and Early',
    devPort: 10030,
    dbPort: 10035,
    studioPort: 10036,
    docsPort: null,
    betterAuthKey: 'm49dJ2-3f0K2l-A3kD19-2Fj9K2-4kD9j1',
    status: 'active',
  },
  {
    name: 'BudgetBloom',
    devPort: 10040,
    dbPort: 10045,
    studioPort: 10046,
    docsPort: null,
    betterAuthKey: 't2K39d-4Jf29L-D93k10-2D0kL3-5k9fJ2',
    status: 'active',
  },
  {
    name: 'Chatterworks',
    devPort: 10050,
    dbPort: null,
    studioPort: null,
    docsPort: null,
    betterAuthKey: null,
    status: 'active',
  },
  {
    name: 'Gimme Job',
    devPort: 10060,
    dbPort: 10065,
    studioPort: 10066,
    docsPort: null,
    betterAuthKey: 'c2J9k4-5dL2J3-A3f9K2-3D0kL1-2J93dK',
    status: 'active',
  },
  {
    name: 'GrabbaTime',
    devPort: 10070,
    dbPort: 10075,
    studioPort: 10076,
    docsPort: null,
    betterAuthKey: 'v1D9k2-3K0dL2-F9jK23-4L0fD2-1K9dJ3',
    status: 'active',
  },
  {
    name: 'Plavement',
    devPort: 10080,
    dbPort: 10085,
    studioPort: 10086,
    docsPort: null,
    betterAuthKey: 'h3K29L-4D9fJ1-A3kL02-2Jf0K3-5k2D9J',
    status: 'active',
  },
  {
    name: 'SignalSplash',
    devPort: 10090,
    dbPort: 10095,
    studioPort: 10096,
    docsPort: null,
    betterAuthKey: 'p9L2dJ-3D9k02-F1kJ23-2K0fL3-4J2d9K',
    status: 'active',
  },
  {
    name: 'Summonate',
    devPort: 10100,
    dbPort: 10105,
    studioPort: 10106,
    docsPort: null,
    betterAuthKey: 'x3D92k-9f3J2d-Ak29F2-3f9dL1-9Kd2J0',
    status: 'inactive',
  },
  {
    name: 'Tech Lead Toolkit',
    devPort: 10110,
    dbPort: 10115,
    studioPort: 10116,
    docsPort: null,
    betterAuthKey: 's3Jd92-4K9L2F-D1k03J-3fL0K2-5J9dK1',
    status: 'active',
  },
];

export default function ConfigPage() {
  return (
    <Page className="h-full">
      <PageHeader
        title="App Configuration Dashboard"
        description="View port assignments and configuration for all applications in the workspace"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="container mx-auto space-y-6">
          <div className="grid gap-4">
            {appConfigs.map(app => (
              <Card key={app.name} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold">{app.name}</h2>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          app.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`http://localhost:${app.devPort}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Open →
                  </a>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">
                      Dev Port
                    </p>
                    <p className="font-mono text-sm font-semibold">
                      {app.devPort}
                    </p>
                    <a
                      href={`http://localhost:${app.devPort}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      localhost:{app.devPort}
                    </a>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">
                      DB Port
                    </p>
                    <p className="font-mono text-sm font-semibold">
                      {app.dbPort ?? 'N/A'}
                    </p>
                    {app.dbPort && (
                      <p className="text-xs text-muted-foreground">
                        localhost:{app.dbPort}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">
                      Studio Port
                    </p>
                    <p className="font-mono text-sm font-semibold">
                      {app.studioPort ?? 'N/A'}
                    </p>
                    {app.studioPort && (
                      <a
                        href={`http://localhost:${app.studioPort}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        localhost:{app.studioPort}
                      </a>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">
                      BetterAuth Key
                    </p>
                    <p className="font-mono text-xs truncate max-w-[150px]">
                      {app.betterAuthKey ?? 'N/A'}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Port Schema
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p>
                <strong>Pattern:</strong> Each app uses a block of 10 ports
              </p>
              <p>
                <strong>Dev Port:</strong> x0 (e.g., 10000, 10010, 10020)
              </p>
              <p>
                <strong>DB Port:</strong> x5 (e.g., 10005, 10015, 10025)
              </p>
              <p>
                <strong>Studio Port:</strong> x6 (e.g., 10006, 10016, 10026)
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}
