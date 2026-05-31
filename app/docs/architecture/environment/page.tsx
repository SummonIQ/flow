import { Settings, Key, List, Shield, Mail, CreditCard, Database, Zap } from "lucide-react";

export default function EnvironmentVariablesPage() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Settings className="w-4 h-4" />
            Environment Configuration
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Environment Variables Reference
          </h1>
          <p className="text-xl text-muted-foreground">
            Complete reference for all environment variables used across the
            application ecosystem.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="rounded-lg border border-border bg-muted/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <List className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">On This Page</h2>
          </div>
          <nav className="grid sm:grid-cols-2 gap-2 text-sm">
            <a href="#general" className="text-muted-foreground hover:text-foreground transition-colors">
              General Configuration
            </a>
            <a href="#database" className="text-muted-foreground hover:text-foreground transition-colors">
              Database
            </a>
            <a href="#authentication" className="text-muted-foreground hover:text-foreground transition-colors">
              Authentication
            </a>
            <a href="#email" className="text-muted-foreground hover:text-foreground transition-colors">
              Email Services
            </a>
            <a href="#oauth" className="text-muted-foreground hover:text-foreground transition-colors">
              OAuth Providers
            </a>
            <a href="#payment" className="text-muted-foreground hover:text-foreground transition-colors">
              Payment (Stripe)
            </a>
            <a href="#realtime" className="text-muted-foreground hover:text-foreground transition-colors">
              Real-time (Pusher)
            </a>
            <a href="#ai" className="text-muted-foreground hover:text-foreground transition-colors">
              AI & APIs
            </a>
            <a href="#monitoring" className="text-muted-foreground hover:text-foreground transition-colors">
              Monitoring & Logging
            </a>
            <a href="#project-management" className="text-muted-foreground hover:text-foreground transition-colors">
              Project Management
            </a>
          </nav>
        </div>

        {/* General Configuration */}
        <div className="space-y-6" id="general">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            General Configuration
          </h2>

          <div className="rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="p-4 text-left font-semibold">Variable</th>
                    <th className="p-4 text-left font-semibold">Description</th>
                    <th className="p-4 text-left font-semibold">Example</th>
                    <th className="p-4 text-left font-semibold">Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-4 font-mono text-xs">NEXT_PORT</td>
                    <td className="p-4">Development server port</td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">3085</td>
                    <td className="p-4">No</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-mono text-xs">DB_PORT</td>
                    <td className="p-4">Local PostgreSQL port</td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">4085</td>
                    <td className="p-4">No</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-mono text-xs">DB_STUDIO_PORT</td>
                    <td className="p-4">Prisma Studio port</td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">4086</td>
                    <td className="p-4">No</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-mono text-xs">NEXT_PUBLIC_HOST</td>
                    <td className="p-4">Public-facing application URL</td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">http://localhost:3010</td>
                    <td className="p-4">Yes</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-mono text-xs">PUBLIC_HOST</td>
                    <td className="p-4">Alias for NEXT_PUBLIC_HOST</td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">http://localhost:3010</td>
                    <td className="p-4">Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
            <p className="text-sm text-blue-600 dark:text-blue-300">
              <strong>Note:</strong> Variables prefixed with <code className="text-xs bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_</code> are
              exposed to the browser. Keep sensitive data in server-only variables.
            </p>
          </div>
        </div>

        {/* Database */}
        <div className="space-y-6" id="database">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6" />
            Database Configuration
          </h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">PostgreSQL Connection</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <code className="text-sm font-mono text-primary">DATABASE_URL</code>
                    <p className="text-sm text-muted-foreground mt-1">
                      PostgreSQL connection string for Prisma
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-red-500">Required</span>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs font-mono break-all">
                    Local: postgresql://postgres:password@localhost:$DB_PORT/postgres?schema=public
                  </p>
                  <p className="text-xs font-mono break-all mt-2">
                    Production: postgres://...@....aws.neon.tech/neondb?sslmode=require
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-600 dark:text-amber-300">
              <strong>Security:</strong> Never commit production database URLs to version control.
              Use environment-specific .env files or secret management services.
            </p>
          </div>
        </div>

        {/* Authentication */}
        <div className="space-y-6" id="authentication">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Authentication (Better Auth)
          </h2>

          <div className="rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="p-4 text-left font-semibold">Variable</th>
                    <th className="p-4 text-left font-semibold">Description</th>
                    <th className="p-4 text-left font-semibold">Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-4 font-mono text-xs">BETTER_AUTH_SECRET</td>
                    <td className="p-4">
                      Secret key for session encryption
                      <p className="text-xs text-muted-foreground mt-1">
                        Generate: <code className="bg-muted px-1 py-0.5 rounded">openssl rand -base64 32</code>
                      </p>
                    </td>
                    <td className="p-4"><span className="text-red-500 font-semibold">Yes</span></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-mono text-xs">BETTER_AUTH_URL</td>
                    <td className="p-4">
                      Base URL for authentication callbacks
                      <p className="text-xs text-muted-foreground mt-1">
                        Should match PUBLIC_HOST
                      </p>
                    </td>
                    <td className="p-4"><span className="text-red-500 font-semibold">Yes</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Email Services */}
        <div className="space-y-6" id="email">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="w-6 h-6" />
            Email Services
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Resend</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <code className="font-mono text-xs text-primary">RESEND_API_KEY</code>
                  <p className="text-muted-foreground mt-1">API key from resend.com</p>
                </div>
                <div>
                  <code className="font-mono text-xs text-primary">RESEND_FROM_EMAIL</code>
                  <p className="text-muted-foreground mt-1">
                    Sender email address
                    <br />
                    <span className="text-xs">Example: AppName &lt;noreply@domain.com&gt;</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">SendGrid</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <code className="font-mono text-xs text-primary">SENDGRID_API_KEY</code>
                  <p className="text-muted-foreground mt-1">API key from sendgrid.com</p>
                </div>
                <div>
                  <code className="font-mono text-xs text-primary">SENDGRID_FROM_EMAIL</code>
                  <p className="text-muted-foreground mt-1">
                    Verified sender email
                    <br />
                    <span className="text-xs">Example: hello@domain.com</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OAuth Providers */}
        <div className="space-y-6" id="oauth">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Key className="w-6 h-6" />
            OAuth Providers
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Google OAuth</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <code className="font-mono text-xs text-primary">GOOGLE_CLIENT_ID</code>
                  <p className="text-muted-foreground mt-1">OAuth 2.0 client ID</p>
                </div>
                <div>
                  <code className="font-mono text-xs text-primary">GOOGLE_CLIENT_SECRET</code>
                  <p className="text-muted-foreground mt-1">OAuth 2.0 client secret</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Setup at: <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">console.cloud.google.com</a>
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Microsoft OAuth</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <code className="font-mono text-xs text-primary">MICROSOFT_CLIENT_ID</code>
                  <p className="text-muted-foreground mt-1">Application (client) ID</p>
                </div>
                <div>
                  <code className="font-mono text-xs text-primary">MICROSOFT_CLIENT_SECRET</code>
                  <p className="text-muted-foreground mt-1">Client secret value</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Setup at: <a href="https://portal.azure.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">portal.azure.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stripe */}
        <div className="space-y-6" id="payment">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Payment Processing (Stripe)
          </h2>

          <div className="rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="p-4 text-left font-semibold">Variable</th>
                    <th className="p-4 text-left font-semibold">Description</th>
                    <th className="p-4 text-left font-semibold">Environment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-4 font-mono text-xs">STRIPE_SECRET_KEY</td>
                    <td className="p-4">
                      Secret key for server-side API calls
                      <p className="text-xs text-muted-foreground mt-1">Format: sk_test_... or sk_live_...</p>
                    </td>
                    <td className="p-4">Server-only</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-mono text-xs">STRIPE_PUBLISHABLE_KEY</td>
                    <td className="p-4">
                      Publishable key for client-side Stripe.js
                      <p className="text-xs text-muted-foreground mt-1">Format: pk_test_... or pk_live_...</p>
                    </td>
                    <td className="p-4">Public (can be exposed)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-mono text-xs">STRIPE_WEBHOOK_SECRET</td>
                    <td className="p-4">
                      Webhook signing secret for verifying events
                      <p className="text-xs text-muted-foreground mt-1">Format: whsec_...</p>
                    </td>
                    <td className="p-4">Server-only</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pusher */}
        <div className="space-y-6" id="realtime">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Real-time Events (Pusher)
          </h2>

          <div className="rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="p-4 text-left font-semibold">Variable</th>
                    <th className="p-4 text-left font-semibold">Description</th>
                    <th className="p-4 text-left font-semibold">Environment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-4 font-mono text-xs">PUSHER_APP_ID</td>
                    <td className="p-4">Application ID from Pusher dashboard</td>
                    <td className="p-4">Server-only</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-mono text-xs">PUSHER_KEY</td>
                    <td className="p-4">Server-side key</td>
                    <td className="p-4">Server-only</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-mono text-xs">PUSHER_SECRET</td>
                    <td className="p-4">Secret key for authentication</td>
                    <td className="p-4">Server-only</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-mono text-xs">PUSHER_CLUSTER</td>
                    <td className="p-4">
                      Region cluster (e.g., us3, eu, ap1)
                    </td>
                    <td className="p-4">Server-only</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-mono text-xs">NEXT_PUBLIC_PUSHER_KEY</td>
                    <td className="p-4">Client-side publishable key</td>
                    <td className="p-4">Public (browser)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-mono text-xs">NEXT_PUBLIC_PUSHER_CLUSTER</td>
                    <td className="p-4">Region cluster for client connections</td>
                    <td className="p-4">Public (browser)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* AI & APIs */}
        <div className="space-y-6" id="ai">
          <h2 className="text-2xl font-bold">AI & External APIs</h2>

          <div className="grid gap-6">
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">OpenAI</h3>
              <div className="space-y-2">
                <code className="font-mono text-xs text-primary">OPENAI_API_KEY</code>
                <p className="text-sm text-muted-foreground">
                  API key for OpenAI services (GPT-4, embeddings, etc.)
                </p>
                <p className="text-xs text-muted-foreground">
                  Get your key at: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">platform.openai.com/api-keys</a>
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">SERP API</h3>
              <div className="space-y-2">
                <code className="font-mono text-xs text-primary">SERP_API_SECRET</code>
                <p className="text-sm text-muted-foreground">
                  API key for Google Search scraping via SerpApi
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Apollo (CRM)</h3>
              <div className="space-y-2">
                <code className="font-mono text-xs text-primary">APOLLO_API_KEY</code>
                <p className="text-sm text-muted-foreground">
                  API key for Apollo.io CRM integration
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Plaid (Financial Accounts)</h3>
              <div className="space-y-3">
                <div>
                  <code className="font-mono text-xs text-primary">PLAID_CLIENT_ID</code>
                  <p className="text-sm text-muted-foreground mt-1">Client ID from Plaid dashboard</p>
                </div>
                <div>
                  <code className="font-mono text-xs text-primary">PLAID_SECRET</code>
                  <p className="text-sm text-muted-foreground mt-1">Secret key for API authentication</p>
                </div>
                <div>
                  <code className="font-mono text-xs text-primary">PLAID_ENV</code>
                  <p className="text-sm text-muted-foreground mt-1">
                    Environment: <code className="bg-muted px-1 py-0.5 rounded">sandbox</code>, <code className="bg-muted px-1 py-0.5 rounded">development</code>, or <code className="bg-muted px-1 py-0.5 rounded">production</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monitoring & Logging */}
        <div className="space-y-6" id="monitoring">
          <h2 className="text-2xl font-bold">Monitoring & Logging</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Sentry (Error Tracking)</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <code className="font-mono text-xs text-primary">SENTRY_AUTH_TOKEN</code>
                  <p className="text-muted-foreground mt-1">Auth token for sourcemap uploads</p>
                </div>
                <div>
                  <code className="font-mono text-xs text-primary">SENTRY_SUPPRESS_TURBOPACK_WARNING</code>
                  <p className="text-muted-foreground mt-1">
                    Set to "1" to suppress Turbopack warnings
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Application Logging</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <code className="font-mono text-xs text-primary">NEXT_PUBLIC_LOG_LEVEL</code>
                  <p className="text-muted-foreground mt-1">
                    Log level for client-side logging
                    <br />
                    <span className="text-xs">Values: debug, info, warn, error</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Management */}
        <div className="space-y-6" id="project-management">
          <h2 className="text-2xl font-bold">Project Management</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Linear (via MCP)</h3>
            <div className="space-y-3 text-sm">
              <div>
                <code className="font-mono text-xs text-primary">LINEAR_TEAM_ID</code>
                <p className="text-muted-foreground mt-1">Team identifier (e.g., "BRI")</p>
              </div>
              <div>
                <code className="font-mono text-xs text-primary">LINEAR_PROJECT_NAME</code>
                <p className="text-muted-foreground mt-1">Project name for issue creation</p>
              </div>
              <div>
                <code className="font-mono text-xs text-primary">LINEAR_PROJECT_URL</code>
                <p className="text-muted-foreground mt-1">Full URL to Linear project</p>
              </div>
              <div>
                <code className="font-mono text-xs text-primary">LINEAR_DEFAULT_ASSIGNEE_USER</code>
                <p className="text-muted-foreground mt-1">Default assignee username</p>
              </div>
              <div>
                <code className="font-mono text-xs text-primary">LINEAR_DEFAULT_ASSIGNEE_USER_EMAIL</code>
                <p className="text-muted-foreground mt-1">Default assignee email</p>
              </div>
            </div>
          </div>
        </div>

        {/* Storage */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">File Storage</h2>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Vercel Blob Storage</h3>
            <div className="space-y-2">
              <code className="font-mono text-xs text-primary">BLOB_READ_WRITE_TOKEN</code>
              <p className="text-sm text-muted-foreground">
                Read/write token for Vercel Blob storage
              </p>
            </div>
          </div>
        </div>

        {/* Quick Setup Guide */}
        <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-6">
          <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-4">
            Quick Setup Guide
          </h3>
          <ol className="text-sm text-blue-600 dark:text-blue-300 space-y-2 list-decimal list-inside">
            <li>Copy <code className="text-xs bg-muted px-1 py-0.5 rounded">.env.example</code> to <code className="text-xs bg-muted px-1 py-0.5 rounded">.env</code></li>
            <li>Generate BETTER_AUTH_SECRET: <code className="text-xs bg-muted px-1 py-0.5 rounded">openssl rand -base64 32</code></li>
            <li>Set up local PostgreSQL and update DATABASE_URL</li>
            <li>Configure required services (Stripe, Pusher, etc.) as needed</li>
            <li>Update PUBLIC_HOST and BETTER_AUTH_URL for your environment</li>
            <li>Run <code className="text-xs bg-muted px-1 py-0.5 rounded">bun db:generate</code> and <code className="text-xs bg-muted px-1 py-0.5 rounded">bun db:migrate</code></li>
          </ol>
        </div>

        {/* Security Warning */}
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-6">
          <h3 className="font-semibold text-red-700 dark:text-red-400 mb-4">
            Security Best Practices
          </h3>
          <ul className="text-sm text-red-600 dark:text-red-300 space-y-2">
            <li>✗ Never commit .env files to version control</li>
            <li>✗ Never expose server-only secrets to the browser</li>
            <li>✓ Use different credentials for development and production</li>
            <li>✓ Rotate secrets regularly, especially after team changes</li>
            <li>✓ Use secret management services for production (Vercel, AWS Secrets Manager, etc.)</li>
            <li>✓ Add .env to .gitignore and commit .env.example instead</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
