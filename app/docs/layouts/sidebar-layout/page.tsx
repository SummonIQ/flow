'use client';

import { CodeBlock } from '@/components/docs/code-block';
import { ComponentExample } from '@/components/docs/component-example';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  SidebarLayout,
} from '@summoniq/applab-ui';
import {
  BarChart3,
  Calendar,
  FileText,
  FolderOpen,
  Home,
  Users,
} from 'lucide-react';

const exampleCode = `import { SidebarLayout } from '@summoniq/applab-ui';
import {
  Home,
  Users,
  FolderOpen,
  Calendar,
  FileText,
  BarChart3
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '#', icon: Home, current: true },
  { name: 'Team', href: '#', icon: Users, current: false },
  { name: 'Projects', href: '#', icon: FolderOpen, current: false },
  { name: 'Calendar', href: '#', icon: Calendar, current: false },
  { name: 'Documents', href: '#', icon: FileText, current: false },
  { name: 'Reports', href: '#', icon: BarChart3, current: false },
];

const teams = [
  { id: 1, name: 'Engineering', href: '#', initial: 'E', current: false },
  { id: 2, name: 'Design', href: '#', initial: 'D', current: false },
  { id: 3, name: 'Marketing', href: '#', initial: 'M', current: false },
];

export function MyApp() {
  return (
    <SidebarLayout
      navigation={navigation}
      teams={teams}
      userProfile={{
        name: 'Tom Cook',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        href: '#profile'
      }}
    >
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Your dashboard content */}
        </div>
      </div>
    </SidebarLayout>
  );
}`;

const customNavigationCode = `// Custom navigation with different icons and structure
const navigation = [
  { name: 'Overview', href: '#', icon: Home, current: true },
  { name: 'Analytics', href: '#', icon: BarChart3, current: false },
  { name: 'Team Members', href: '#', icon: Users, current: false },
  { name: 'Settings', href: '#', icon: Settings, current: false },
  { name: 'Help', href: '#', icon: HelpCircle, current: false },
];

// Without teams section
<SidebarLayout
  navigation={navigation}
  userProfile={{
    name: 'Jane Smith',
    href: '#profile'
  }}
>
  {/* Content */}
</SidebarLayout>`;

const customLogoCode = `// Custom logo component
const CustomLogo = () => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
      <span className="text-white font-bold">A</span>
    </div>
    <span className="font-bold text-lg">AppName</span>
  </div>
);

<SidebarLayout
  logo={<CustomLogo />}
  navigation={navigation}
  teams={teams}
  userProfile={userProfile}
>
  {/* Content */}
</SidebarLayout>`;

export default function SidebarLayoutPage() {
  const navigation = [
    { name: 'Dashboard', href: '#', icon: Home, current: true },
    { name: 'Team', href: '#', icon: Users, current: false },
    { name: 'Projects', href: '#', icon: FolderOpen, current: false },
    { name: 'Calendar', href: '#', icon: Calendar, current: false },
    { name: 'Documents', href: '#', icon: FileText, current: false },
    { name: 'Reports', href: '#', icon: BarChart3, current: false },
  ];

  const teams = [
    { id: 1, name: 'Engineering', href: '#', initial: 'E', current: false },
    { id: 2, name: 'Design', href: '#', initial: 'D', current: false },
    { id: 3, name: 'Marketing', href: '#', initial: 'M', current: false },
  ];

  const userProfile = {
    name: 'Tom Cook',
    image:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    href: '#',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Sidebar Layout
        </h1>
        <p className="text-lg text-muted-foreground">
          A responsive sidebar navigation layout with mobile support, team
          sections, and user profiles.
        </p>
      </div>

      {/* Basic Example */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Sidebar Layout</CardTitle>
          <CardDescription>
            A complete sidebar layout with navigation, teams, and user profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ComponentExample code={exampleCode}>
            <div className="relative h-[600px] overflow-hidden rounded-lg border border-border">
              <SidebarLayout
                sidebar={
                  <div className="p-4 space-y-6">
                    <div className="text-sm font-semibold text-foreground">
                      Navigation
                    </div>
                    <nav className="space-y-1">
                      {navigation.map(item => (
                        <a
                          key={item.name}
                          href={item.href}
                          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                            item.current
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </a>
                      ))}
                    </nav>

                    <div className="text-sm font-semibold text-foreground">
                      Teams
                    </div>
                    <div className="space-y-1">
                      {teams.map(team => (
                        <a
                          key={team.id}
                          href={team.href}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-xs font-semibold text-foreground">
                            {team.initial}
                          </span>
                          {team.name}
                        </a>
                      ))}
                    </div>

                    <div className="border-t border-border pt-4">
                      <a
                        href={userProfile.href}
                        className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent transition-colors"
                      >
                        <img
                          alt={userProfile.name}
                          src={userProfile.image}
                          className="h-8 w-8 rounded-full"
                        />
                        <div className="text-sm font-medium text-foreground">
                          {userProfile.name}
                        </div>
                      </a>
                    </div>
                  </div>
                }
              >
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      Welcome back! Here's what's happening with your projects.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Total Revenue
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground">
                          +20.1% from last month
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Active Projects
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">
                          +2 new this week
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Team Members
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-xs text-muted-foreground">
                          4 pending invites
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 bg-primary/100 rounded-full" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              New project created
                            </p>
                            <p className="text-xs text-muted-foreground">
                              2 hours ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 bg-primary/100 rounded-full" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              Team meeting scheduled
                            </p>
                            <p className="text-xs text-muted-foreground">
                              5 hours ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              Report generated
                            </p>
                            <p className="text-xs text-muted-foreground">
                              1 day ago
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </SidebarLayout>
            </div>
          </ComponentExample>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>
            Key features of the Sidebar Layout component
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-2">
              Responsive Design
            </h4>
            <p className="text-sm text-muted-foreground">
              Automatically adapts to mobile and desktop screens with a
              collapsible sidebar on mobile devices.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">Team Sections</h4>
            <p className="text-sm text-muted-foreground">
              Support for organizing navigation into teams or groups with visual
              indicators.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">User Profile</h4>
            <p className="text-sm text-muted-foreground">
              Built-in user profile section with avatar and name display.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">
              Dark Mode Support
            </h4>
            <p className="text-sm text-muted-foreground">
              Fully supports dark mode with appropriate color adjustments.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Customization Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Customization</CardTitle>
          <CardDescription>
            Examples of customizing the Sidebar Layout
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium text-foreground mb-2">
              Custom Navigation
            </h4>
            <CodeBlock code={customNavigationCode} language="tsx" />
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-2">Custom Logo</h4>
            <CodeBlock code={customLogoCode} language="tsx" />
          </div>
        </CardContent>
      </Card>

      {/* Props */}
      <Card>
        <CardHeader>
          <CardTitle>Props</CardTitle>
          <CardDescription>
            Available props for the SidebarLayout component
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left py-2 font-medium text-foreground">
                    Prop
                  </th>
                  <th className="text-left py-2 font-medium text-foreground">
                    Type
                  </th>
                  <th className="text-left py-2 font-medium text-foreground">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2 text-foreground">children</td>
                  <td className="py-2 text-muted-foreground">ReactNode</td>
                  <td className="py-2 text-muted-foreground">
                    Main content to display
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-foreground">navigation</td>
                  <td className="py-2 text-muted-foreground">
                    NavigationItem[]
                  </td>
                  <td className="py-2 text-muted-foreground">
                    Array of navigation items
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-foreground">teams</td>
                  <td className="py-2 text-muted-foreground">TeamItem[]</td>
                  <td className="py-2 text-muted-foreground">
                    Optional array of team items
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-foreground">logo</td>
                  <td className="py-2 text-muted-foreground">ReactNode</td>
                  <td className="py-2 text-muted-foreground">
                    Custom logo component
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-foreground">userProfile</td>
                  <td className="py-2 text-muted-foreground">UserProfile</td>
                  <td className="py-2 text-muted-foreground">
                    User profile information
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-foreground">className</td>
                  <td className="py-2 text-muted-foreground">string</td>
                  <td className="py-2 text-muted-foreground">
                    Additional CSS classes
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
