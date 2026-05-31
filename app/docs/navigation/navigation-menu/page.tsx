'use client';

import { CodeBlock } from '@/components/docs/code-block';
import { ComponentExample } from '@/components/docs/component-example';
import {
  AppHeader,
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@summoniq/applab-ui';
import { useState } from 'react';

const navigationItems = [
  { label: 'Dashboard', href: '#', current: true },
  { label: 'Team', href: '#', current: false },
  { label: 'Projects', href: '#', current: false },
  { label: 'Calendar', href: '#', current: false },
  { label: 'Reports', href: '#', current: false },
];

const user = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
};

const userNavigation = [
  { label: 'Your profile', href: '#' },
  { label: 'Settings', href: '#' },
  { label: 'Sign out', href: '#' },
];

export default function NavigationMenuPage() {
  const [activeItem, setActiveItem] = useState('Dashboard');

  const handleNavigationClick = (item: { label: string; href: string }) => {
    setActiveItem(item.label);
    console.log('Navigate to:', item.label);
  };

  const updatedNavigation = navigationItems.map(item => ({
    ...item,
    current: item.label === activeItem,
  }));

  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">
        NavigationMenu
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        Flexible navigation component with horizontal/vertical orientations and
        multiple style variants
      </p>

      <div className="space-y-12">
        {/* Basic Horizontal Navigation */}
        <ComponentExample
          title="Horizontal Navigation (Default Variant)"
          description="Standard horizontal navigation menu with default styling"
          code={`const navigationItems = [
  { label: 'Dashboard', href: '#', current: true },
  { label: 'Team', href: '#', current: false },
  { label: 'Projects', href: '#', current: false },
  { label: 'Calendar', href: '#', current: false },
]

<NavigationMenu>
  <NavigationMenuList>
    {navigationItems.map(item => (
      <NavigationMenuItem key={item.label}>
        <NavigationMenuLink href={item.href} data-active={item.current}>
          {item.label}
        </NavigationMenuLink>
      </NavigationMenuItem>
    ))}
  </NavigationMenuList>
</NavigationMenu>`}
        >
          <div className="border rounded-lg p-6 bg-muted/40">
            <NavigationMenu viewport={false}>
              <NavigationMenuList>
                {updatedNavigation.map(item => (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuLink
                      href={item.href}
                      data-active={item.current}
                      onClick={() => handleNavigationClick(item)}
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </ComponentExample>

        {/* Border Variant Horizontal */}
        <ComponentExample
          title="Horizontal Navigation (Border Variant)"
          description="Horizontal navigation with border variant styling from Tailwind UI"
          code={`<NavigationMenu>
  <NavigationMenuList>
    {/* ...items */}
  </NavigationMenuList>
</NavigationMenu>`}
        >
          <div className="border rounded-lg p-6 bg-muted/80">
            <NavigationMenu viewport={false}>
              <NavigationMenuList>
                {updatedNavigation.map(item => (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuLink
                      href={item.href}
                      data-active={item.current}
                      onClick={() => handleNavigationClick(item)}
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-accent"
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </ComponentExample>

        {/* Vertical Navigation */}
        <ComponentExample
          title="Vertical Navigation (Default Variant)"
          description="Vertical navigation menu for sidebars or mobile layouts"
          code={`<NavigationMenu>
  <NavigationMenuList className="flex-col items-start">
    {/* ...items */}
  </NavigationMenuList>
</NavigationMenu>`}
        >
          <div className="border rounded-lg p-6 bg-muted/40 max-w-xs">
            <NavigationMenu viewport={false}>
              <NavigationMenuList className="flex-col items-start">
                {updatedNavigation.map(item => (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuLink
                      href={item.href}
                      data-active={item.current}
                      onClick={() => handleNavigationClick(item)}
                      className="w-full rounded-md px-3 py-2 text-sm hover:bg-accent"
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </ComponentExample>

        {/* Vertical Border Variant */}
        <ComponentExample
          title="Vertical Navigation (Border Variant)"
          description="Vertical navigation with border variant styling"
          code={`<NavigationMenu>
  <NavigationMenuList className="flex-col items-start">
    {/* ...items */}
  </NavigationMenuList>
</NavigationMenu>`}
        >
          <div className="border rounded-lg p-6 bg-muted/80 max-w-xs">
            <NavigationMenu viewport={false}>
              <NavigationMenuList className="flex-col items-start">
                {updatedNavigation.map(item => (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuLink
                      href={item.href}
                      data-active={item.current}
                      onClick={() => handleNavigationClick(item)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-accent"
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </ComponentExample>

        {/* Custom Styling */}
        <ComponentExample
          title="Custom Item Styling"
          description="NavigationMenu with custom itemClassName for additional styling"
          code={`<NavigationMenu>
  <NavigationMenuList>
    {/* ...items */}
  </NavigationMenuList>
</NavigationMenu>`}
        >
          <div className="border rounded-lg p-6 bg-muted/40">
            <NavigationMenu viewport={false}>
              <NavigationMenuList>
                {updatedNavigation.map(item => (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuLink
                      href={item.href}
                      data-active={item.current}
                      onClick={() => handleNavigationClick(item)}
                      className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary hover:bg-primary/20"
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </ComponentExample>

        {/* Integration with AppHeader */}
        <ComponentExample
          title="Integration with AppHeader"
          description="NavigationMenu is now used internally by AppHeader with variant support"
          code={`<AppHeader
  navigation={navigationItems}
  user={user}
  variant="default"
/>`}
        >
          <div className="border rounded-lg overflow-hidden">
            <AppHeader
              navigation={updatedNavigation}
              user={user}
              variant="default"
            />
          </div>
        </ComponentExample>

        {/* AppHeader with Border Variant */}
        <ComponentExample
          title="AppHeader with Border Variant"
          description="AppHeader using the border variant for navigation styling"
          code={`<AppHeader
  navigation={navigationItems}
  user={user}
  variant="default"
/>`}
        >
          <div className="border rounded-lg overflow-hidden">
            <AppHeader
              navigation={updatedNavigation}
              user={user}
              variant="default"
            />
          </div>
        </ComponentExample>

        {/* Interactive Demo */}
        <ComponentExample
          title="Interactive Demo"
          description="Click navigation items to see active state changes"
          code={`const [activeItem, setActiveItem] = useState('Dashboard')

const handleNavigationClick = (item) => {
  setActiveItem(item.label)
}

const updatedNavigation = navigationItems.map(item => ({
  ...item,
  current: item.label === activeItem
}))

<NavigationMenu>
  <NavigationMenuList>
    {/* ...items */}
  </NavigationMenuList>
</NavigationMenu>`}
        >
          <div className="space-y-4">
            <div className="border rounded-lg p-6 bg-muted/40">
              <NavigationMenu viewport={false}>
                <NavigationMenuList>
                  {updatedNavigation.map(item => (
                    <NavigationMenuItem key={item.label}>
                      <NavigationMenuLink
                        href={item.href}
                        data-active={item.current}
                        onClick={() => handleNavigationClick(item)}
                      >
                        {item.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Active Item:</strong> {activeItem}
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
              <tbody className="bg-background divide-y divide-border">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    NavigationItem[]
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    required
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Array of navigation items with name, href, and current
                    properties
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    orientation
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    "horizontal" | "vertical"
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    "horizontal"
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Layout direction of navigation items
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    variant
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    "default" | "border"
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    "default"
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Visual style variant for navigation items
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    onItemClick
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    (item: NavigationItem) =&gt; void
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    undefined
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Callback fired when a navigation item is clicked
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    itemClassName
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    string
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    undefined
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Additional CSS classes for navigation items
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
                    Additional CSS classes for the navigation container
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* NavigationItem Interface */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            NavigationItem Interface
          </h3>
          <CodeBlock
            code={`interface NavigationItem {
  name: string      // Display name for the navigation item
  href: string      // URL or route for the navigation item
  current?: boolean // Whether this item is currently active
}`}
            language="typescript"
          />
        </div>

        {/* Import Example */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Import Statement
          </h3>
          <CodeBlock
            code={`import { NavigationMenu, type NavigationItem } from '@summoniq/applab-ui'`}
            language="typescript"
          />
        </div>
      </div>
    </div>
  );
}
