'use client';

import { CodeBlock } from '@/components/docs/code-block';
import { ComponentExample } from '@/components/docs/component-example';
import { AppHeader, UserAvatar, UserMenu } from '@summoniq/applab-ui';

const user = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
};

const navigation = [
  { label: 'Dashboard', href: '#', current: true },
  { label: 'Team', href: '#', current: false },
  { label: 'Projects', href: '#', current: false },
  { label: 'Calendar', href: '#', current: false },
];

const userNavigation = [
  { name: 'Your profile', href: '#' },
  { name: 'Settings', href: '#' },
  { name: 'Sign out', href: '#' },
];

export default function AppHeaderPage() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">AppHeader</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Application header component with navigation, user dropdown, and mobile
        menu support
      </p>

      <div className="space-y-12">
        {/* Basic AppHeader */}
        <ComponentExample
          title="Basic AppHeader"
          description="Standard application header with navigation and user menu"
          code={`<AppHeader
  navigation={[
    { label: 'Dashboard', href: '#', current: true },
    { label: 'Team', href: '#', current: false },
    { label: 'Projects', href: '#', current: false },
    { label: 'Calendar', href: '#', current: false },
  ]}
  user={{
    name: 'Tom Cook',
    email: 'tom@example.com',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e...',
  }}
/>`}
        >
          <div className="border rounded-lg overflow-hidden">
            <AppHeader navigation={navigation} user={user} />
          </div>
        </ComponentExample>

        {/* AppHeader without User */}
        <ComponentExample
          title="AppHeader without User"
          description="Header with navigation only, no user menu"
          code={`<AppHeader
  navigation={[
    { label: 'Home', href: '#', current: true },
    { label: 'About', href: '#', current: false },
    { label: 'Contact', href: '#', current: false },
  ]}
/>`}
        >
          <div className="border rounded-lg overflow-hidden">
            <AppHeader
              navigation={[
                { label: 'Home', href: '#', current: true },
                { label: 'About', href: '#', current: false },
                { label: 'Contact', href: '#', current: false },
              ]}
            />
          </div>
        </ComponentExample>

        {/* Custom Logo */}
        <ComponentExample
          title="Custom Logo"
          description="AppHeader with custom logo and branding"
          code={`<AppHeader
  logo={
    <img
      src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=blue&shade=600"
      alt="Custom Company"
      className="h-8 w-auto"
    />
  }
  navigation={[
    { label: 'Products', href: '#', current: false },
    { label: 'Solutions', href: '#', current: true },
    { label: 'Pricing', href: '#', current: false },
  ]}
  user={user}
/>`}
        >
          <div className="border rounded-lg overflow-hidden">
            <AppHeader
              logo={
                <img
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=blue&shade=600"
                  alt="Custom Company"
                  className="h-8 w-auto"
                />
              }
              navigation={[
                { label: 'Products', href: '#', current: false },
                { label: 'Solutions', href: '#', current: true },
                { label: 'Pricing', href: '#', current: false },
              ]}
              user={user}
            />
          </div>
        </ComponentExample>

        {/* Mobile Responsive Demo */}
        <ComponentExample
          title="Mobile Responsive"
          description="The AppHeader automatically adapts to mobile screens with a hamburger menu"
          code={`// The mobile menu is automatically handled
// Resize your browser to see the mobile version`}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The AppHeader component automatically switches to a
              mobile-friendly layout on smaller screens:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>
                • Navigation items are hidden and replaced with a hamburger menu
              </li>
              <li>
                • User profile and notifications are moved to the mobile menu
              </li>
              <li>• Touch-friendly tap targets for mobile interaction</li>
              <li>• Collapsible menu with smooth animations</li>
            </ul>
            <div className="border rounded-lg overflow-hidden">
              <AppHeader navigation={navigation} user={user} />
            </div>
          </div>
        </ComponentExample>

        {/* Props Documentation */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-foreground">Props</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Prop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Default
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    logoSrc
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    string
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    tailwindcss logo
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    URL for the logo image
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    logoAlt
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    string
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    "Your Company"
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Alt text for the logo
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    navigation
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    NavigationItem[]
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    []
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Array of navigation items
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    user
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    User
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    undefined
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    User object with name, email, imageUrl
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    userNavigation
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    UserNavigationItem[]
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    []
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Array of user menu items
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    onNavigationClick
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    function
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    undefined
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Callback when navigation item is clicked
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    onUserNavigationClick
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    function
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    undefined
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Callback when user menu item is clicked
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    onNotificationClick
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    function
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    undefined
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Callback when notification bell is clicked
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Composable Components */}
        <ComponentExample
          title="Composable Components"
          description="AppHeader uses composable UserMenu and UserAvatar components internally"
          code={`// AppHeader internally uses:
import { UserMenu, UserAvatar } from '@summoniq/applab-ui'

// You can also use these components separately:
<UserMenu 
  user={user} 
  menuItems={userNavigation}
  onItemClick={onUserNavigationClick}
/>

<UserAvatar 
  src={user.imageUrl}
  name={user.name}
  size="md"
/>`}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The AppHeader component is built using smaller, composable
              components that you can also use independently:
            </p>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <UserMenu
                  user={user}
                  menuItems={userNavigation}
                  onItemClick={item => console.log('User action:', item.name)}
                />
                <p className="text-xs text-muted-foreground mt-2">UserMenu</p>
              </div>
              <div className="text-center">
                <UserAvatar src={user.imageUrl} name={user.name} size="md" />
                <p className="text-xs text-muted-foreground mt-2">UserAvatar</p>
              </div>
            </div>
          </div>
        </ComponentExample>

        {/* Import Example */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Import Statement
          </h3>
          <CodeBlock
            code={`import { AppHeader, UserMenu, UserAvatar } from '@summoniq/applab-ui'`}
            language="typescript"
          />
        </div>
      </div>
    </div>
  );
}
