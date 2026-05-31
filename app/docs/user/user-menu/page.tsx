'use client';

import { ComponentExample } from '@/components/docs/component-example';
import { CodeBlock, UserMenu } from '@summoniq/applab-ui';

const user = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
};

const menuItems = [
  { name: 'Your profile', href: '#' },
  { name: 'Settings', href: '#' },
  { name: 'Sign out', href: '#' },
];

export default function UserMenuPage() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">UserMenu</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Complete user menu component with avatar, user info, and dropdown menu
        items
      </p>

      <div className="space-y-12">
        {/* Basic UserMenu */}
        <ComponentExample
          title="Basic UserMenu"
          description="User menu with avatar and dropdown items"
          code={`<UserMenu
  user={{
    name: 'Tom Cook',
    email: 'tom@example.com',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e...',
  }}
  menuItems={[
    { name: 'Your profile', href: '#' },
    { name: 'Settings', href: '#' },
    { name: 'Sign out', href: '#' },
  ]}
  onItemClick={(item) => console.log('Clicked:', item.name)}
/>`}
        >
          <div className="flex justify-center">
            <UserMenu
              user={user}
              menuItems={menuItems}
              onItemClick={item => console.log('Clicked:', item.name)}
            />
          </div>
        </ComponentExample>

        {/* UserMenu without Email */}
        <ComponentExample
          title="UserMenu without Email"
          description="User menu with just name, no email displayed"
          code={`<UserMenu
  user={{
    name: 'Jane Smith',
    imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786...',
  }}
  menuItems={[
    { name: 'Dashboard', href: '#' },
    { name: 'Profile', href: '#' },
    { name: 'Logout', href: '#' },
  ]}
/>`}
        >
          <div className="flex justify-center">
            <UserMenu
              user={{
                name: 'Jane Smith',
                imageUrl:
                  'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
              }}
              menuItems={[
                { name: 'Dashboard', href: '#' },
                { name: 'Profile', href: '#' },
                { name: 'Logout', href: '#' },
              ]}
              onItemClick={item => console.log('Clicked:', item.name)}
            />
          </div>
        </ComponentExample>

        {/* UserMenu with Fallback Avatar */}
        <ComponentExample
          title="UserMenu with Fallback Avatar"
          description="User menu without image, showing initials fallback"
          code={`<UserMenu
  user={{
    name: 'John Doe',
    email: 'john@example.com',
  }}
  menuItems={[
    { name: 'Account', href: '#' },
    { name: 'Billing', href: '#' },
    { name: 'Support', href: '#' },
    { name: 'Sign out', href: '#' },
  ]}
/>`}
        >
          <div className="flex justify-center">
            <UserMenu
              user={{
                name: 'John Doe',
                email: 'john@example.com',
              }}
              menuItems={[
                { name: 'Account', href: '#' },
                { name: 'Billing', href: '#' },
                { name: 'Support', href: '#' },
                { name: 'Sign out', href: '#' },
              ]}
              onItemClick={item => console.log('Clicked:', item.name)}
            />
          </div>
        </ComponentExample>

        {/* Different Avatar Sizes */}
        <ComponentExample
          title="Different Avatar Sizes"
          description="UserMenu with different avatar sizes"
          code={`<UserMenu avatarSize="sm" user={user} menuItems={menuItems} />
<UserMenu avatarSize="md" user={user} menuItems={menuItems} />
<UserMenu avatarSize="lg" user={user} menuItems={menuItems} />
<UserMenu avatarSize="xl" user={user} menuItems={menuItems} />`}
        >
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <UserMenu
                avatarSize="sm"
                user={user}
                menuItems={menuItems}
                onItemClick={item => console.log('Clicked:', item.name)}
              />
              <p className="text-xs text-muted-foreground mt-2">Small</p>
            </div>
            <div className="text-center">
              <UserMenu
                avatarSize="md"
                user={user}
                menuItems={menuItems}
                onItemClick={item => console.log('Clicked:', item.name)}
              />
              <p className="text-xs text-muted-foreground mt-2">Medium</p>
            </div>
            <div className="text-center">
              <UserMenu
                avatarSize="lg"
                user={user}
                menuItems={menuItems}
                onItemClick={item => console.log('Clicked:', item.name)}
              />
              <p className="text-xs text-muted-foreground mt-2">Large</p>
            </div>
            <div className="text-center">
              <UserMenu
                avatarSize="xl"
                user={user}
                menuItems={menuItems}
                onItemClick={item => console.log('Clicked:', item.name)}
              />
              <p className="text-xs text-muted-foreground mt-2">Extra Large</p>
            </div>
          </div>
        </ComponentExample>

        {/* Menu Alignment */}
        <ComponentExample
          title="Menu Alignment"
          description="Different dropdown menu alignments"
          code={`<UserMenu align="start" user={user} menuItems={menuItems} />
<UserMenu align="center" user={user} menuItems={menuItems} />
<UserMenu align="end" user={user} menuItems={menuItems} />`}
        >
          <div className="flex items-center justify-between">
            <div className="text-center">
              <UserMenu
                align="start"
                user={user}
                menuItems={menuItems}
                onItemClick={item => console.log('Clicked:', item.name)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Start aligned
              </p>
            </div>
            <div className="text-center">
              <UserMenu
                align="center"
                user={user}
                menuItems={menuItems}
                onItemClick={item => console.log('Clicked:', item.name)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Center aligned
              </p>
            </div>
            <div className="text-center">
              <UserMenu
                align="end"
                user={user}
                menuItems={menuItems}
                onItemClick={item => console.log('Clicked:', item.name)}
              />
              <p className="text-xs text-muted-foreground mt-2">End aligned</p>
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
                    user
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    User
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    required
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    User object with name, email, imageUrl
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    menuItems
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    MenuItem[]
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    []
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Array of menu items
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    onItemClick
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    function
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    undefined
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Callback when menu item is clicked
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    avatarSize
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    "sm" | "md" | "lg" | "xl"
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    "md"
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Size of the avatar
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    align
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    "start" | "center" | "end"
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    "end"
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Dropdown menu alignment
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    className
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    string
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    undefined
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Additional CSS classes
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Import Example */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Import Statement
          </h3>
          <CodeBlock
            code={`import { UserMenu } from '@summoniq/applab-ui'`}
            language="typescript"
          />
        </div>
      </div>
    </div>
  );
}
