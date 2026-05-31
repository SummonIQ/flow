'use client';

import { CodeBlock } from '@/components/docs/code-block';
import { ComponentExample } from '@/components/docs/component-example';
import type { PageMetadataProps } from '@summoniq/applab-ui';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Page,
  PageActions,
  PageBreadcrumbs,
  PageDescription,
  PageHeader,
  PageMetadata,
  PageTitle,
} from '@summoniq/applab-ui';
import {
  Briefcase,
  Calendar,
  DollarSign,
  Download,
  Edit,
  MapPin,
  Share2,
} from 'lucide-react';

const breadcrumbs = [
  { label: 'Jobs', href: '#' },
  { label: 'Engineering', href: '#' },
  { label: 'Back End Developer', href: '#' },
];

const metaItems = [
  { icon: () => <Briefcase className="h-4 w-4" />, label: 'Full-time' },
  { icon: () => <MapPin className="h-4 w-4" />, label: 'Remote' },
  { icon: () => <DollarSign className="h-4 w-4" />, label: '$120k – $140k' },
  {
    icon: () => <Calendar className="h-4 w-4" />,
    label: 'Closing on January 9, 2020',
  },
] as unknown as PageMetadataProps['items'];

export default function PageComponentPage() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">
        Page Components
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        Composable page components for building complete application layouts
        with consistent spacing and structure
      </p>

      <div className="space-y-12">
        {/* Individual Components */}
        <ComponentExample
          title="Individual Page Components"
          description="All page components can be used independently for maximum flexibility"
          code={`import { 
  PageTitle, 
  PageDescription, 
  PageMetadata, 
  PageActions,
  PageBreadcrumbs,
  PageAvatar 
} from '@summoniq/applab-ui'

<div className="space-y-6">
  <PageTitle>Back End Developer</PageTitle>
  <PageDescription>
    Applied for Front End Developer on August 25, 2020
  </PageDescription>
  <PageMetadata items={metaItems} />
  <PageActions>
    <Button variant="outline">Edit</Button>
    <Button>Publish</Button>
  </PageActions>
</div>`}
        >
          <div className="border rounded-lg p-6 bg-muted/40">
            <div className="space-y-6">
              <PageTitle>Back End Developer</PageTitle>
              <PageDescription>
                Applied for Front End Developer on August 25, 2020
              </PageDescription>
              <PageMetadata items={metaItems} />
              <PageActions>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm">Publish</Button>
              </PageActions>
            </div>
          </div>
        </ComponentExample>

        {/* PageHeader with Breadcrumbs */}
        <ComponentExample
          title="PageHeader with Breadcrumbs and Meta"
          description="Complete page header with breadcrumbs, title, meta information, and actions"
          code={`<div className="space-y-4">
  <PageBreadcrumbs items={breadcrumbs} />
  <PageHeader
    title="Back End Developer"
    actions={
      <>
        <Button variant="outline">Edit</Button>
        <Button>Publish</Button>
      </>
    }
  />
  <PageMetadata items={metaItems} />
</div>`}
        >
          <div className="border rounded-lg overflow-hidden bg-muted/40">
            <div className="space-y-4 p-6">
              <PageBreadcrumbs items={breadcrumbs} />
              <PageHeader
                title="Back End Developer"
                actions={
                  <>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button size="sm">Publish</Button>
                  </>
                }
              />
              <PageMetadata items={metaItems} />
            </div>
          </div>
        </ComponentExample>

        {/* PageHeader with Avatar */}
        <ComponentExample
          title="PageHeader with Avatar"
          description="Page header with user avatar and description"
          code={`<div className="space-y-4">
  <PageHeader
    title="Ricardo Cooper"
    description="Applied for Front End Developer on August 25, 2020"
    actions={
      <>
        <Button variant="outline">Disqualify</Button>
        <Button>Advance to offer</Button>
      </>
    }
  />
</div>`}
        >
          <div className="border rounded-lg overflow-hidden bg-muted/40">
            <PageHeader
              title="Ricardo Cooper"
              description="Applied for Front End Developer on August 25, 2020"
              actions={
                <>
                  <Button variant="outline" size="sm">
                    Disqualify
                  </Button>
                  <Button size="sm">Advance to offer</Button>
                </>
              }
            />
          </div>
        </ComponentExample>

        {/* PageHeader with Banner */}
        <ComponentExample
          title="PageHeader with Banner Image"
          description="Page header with banner image and avatar overlay"
          code={`<PageHeader
  title="Ricardo Cooper"
  actions={
    <>
      <Button variant="outline">
        <Share2 className="h-4 w-4 mr-2" />
        Message
      </Button>
      <Button variant="outline">
        <Download className="h-4 w-4 mr-2" />
        Call
      </Button>
    </>
  }
/>`}
        >
          <div className="border rounded-lg overflow-hidden">
            <PageHeader
              title="Ricardo Cooper"
              actions={
                <>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </>
              }
            />
          </div>
        </ComponentExample>

        {/* Complete Page Example */}
        <ComponentExample
          title="Complete Page Layout"
          description="Full page layout using headerProps to configure the page header"
          code={`<Page
  headerProps={{
    title: "Project Dashboard",
    description: "Monitor your project progress and key metrics",
    actions: (
      <>
        <Button variant="outline">Export Data</Button>
        <Button>New Project</Button>
      </>
    )
  }}
>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
        <CardDescription>Project statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Your project content here...</p>
      </CardContent>
    </Card>
  </div>
</Page>`}
        >
          <div className="border rounded-lg overflow-hidden bg-muted/40">
            <Page
              headerProps={{
                title: 'Project Dashboard',
                description: 'Monitor your project progress and key metrics',
                actions: (
                  <>
                    <Button variant="outline" size="sm">
                      Export Data
                    </Button>
                    <Button size="sm">New Project</Button>
                  </>
                ),
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Overview</CardTitle>
                    <CardDescription>
                      Project statistics and metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Total Tasks
                        </span>
                        <Badge>24</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Completed
                        </span>
                        <Badge>18</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest project updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      No recent activity to display.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </Page>
          </div>
        </ComponentExample>

        {/* Import Example */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Import Statement
          </h3>
          <CodeBlock
            code={`import { 
  Page,
  PageHeader,
  PageContent,
  PageTitle,
  PageDescription,
  PageMeta,
  PageBreadcrumbs,
  PageAvatar,
  PageBannerImage,
  PageActions
} from '@summoniq/applab-ui'`}
            language="typescript"
          />
        </div>
      </div>
    </div>
  );
}
