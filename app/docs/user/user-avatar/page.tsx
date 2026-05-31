'use client';

import { CodeBlock } from '@/components/docs/code-block';
import { ComponentExample } from '@/components/docs/component-example';
import { UserAvatar } from '@summoniq/applab-ui';

export default function UserAvatarPage() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">UserAvatar</h1>
      <p className="text-lg text-muted-foreground mb-8">
        User avatar component with automatic fallback initials and multiple size
        options
      </p>

      <div className="space-y-12">
        {/* Basic UserAvatar */}
        <ComponentExample
          title="Basic UserAvatar"
          description="User avatar with image and automatic fallback"
          code={`<UserAvatar
  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  name="Tom Cook"
  alt="Tom Cook's avatar"
/>`}
        >
          <div className="flex items-center gap-4">
            <UserAvatar
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              name="Tom Cook"
              alt="Tom Cook's avatar"
            />
            <div>
              <p className="font-medium">Tom Cook</p>
              <p className="text-sm text-muted-foreground">With image</p>
            </div>
          </div>
        </ComponentExample>

        {/* UserAvatar Sizes */}
        <ComponentExample
          title="Avatar Sizes"
          description="Different size options for user avatars"
          code={`<UserAvatar size="sm" name="Small Avatar" />
<UserAvatar size="md" name="Medium Avatar" />
<UserAvatar size="lg" name="Large Avatar" />
<UserAvatar size="xl" name="Extra Large Avatar" />`}
        >
          <div className="flex items-center gap-6">
            <div className="text-center">
              <UserAvatar size="sm" name="Small Avatar" />
              <p className="text-xs text-muted-foreground mt-1">Small (sm)</p>
            </div>
            <div className="text-center">
              <UserAvatar size="md" name="Medium Avatar" />
              <p className="text-xs text-muted-foreground mt-1">Medium (md)</p>
            </div>
            <div className="text-center">
              <UserAvatar size="lg" name="Large Avatar" />
              <p className="text-xs text-muted-foreground mt-1">Large (lg)</p>
            </div>
            <div className="text-center">
              <UserAvatar size="xl" name="Extra Large Avatar" />
              <p className="text-xs text-muted-foreground mt-1">
                Extra Large (xl)
              </p>
            </div>
          </div>
        </ComponentExample>

        {/* UserAvatar Fallbacks */}
        <ComponentExample
          title="Fallback Initials"
          description="Automatic initials generation when no image is provided"
          code={`<UserAvatar name="John Doe" />
<UserAvatar name="Jane Smith" />
<UserAvatar name="A" />
<UserAvatar name="Multiple Word Name Example" />
<UserAvatar /> {/* No name provided */}`}
        >
          <div className="flex items-center gap-4">
            <div className="text-center">
              <UserAvatar name="John Doe" />
              <p className="text-xs text-muted-foreground mt-1">John Doe</p>
            </div>
            <div className="text-center">
              <UserAvatar name="Jane Smith" />
              <p className="text-xs text-muted-foreground mt-1">Jane Smith</p>
            </div>
            <div className="text-center">
              <UserAvatar name="A" />
              <p className="text-xs text-muted-foreground mt-1">
                Single letter
              </p>
            </div>
            <div className="text-center">
              <UserAvatar name="Multiple Word Name Example" />
              <p className="text-xs text-muted-foreground mt-1">Long name</p>
            </div>
            <div className="text-center">
              <UserAvatar />
              <p className="text-xs text-muted-foreground mt-1">No name</p>
            </div>
          </div>
        </ComponentExample>

        {/* Custom Styling */}
        <ComponentExample
          title="Custom Styling"
          description="UserAvatar with custom styling and fallback colors"
          code={`<UserAvatar 
  name="Custom User" 
  className="ring-2 ring-blue-500 ring-offset-2"
  fallbackClassName="bg-primary/100 text-white"
/>
<UserAvatar 
  name="Another User" 
  className="ring-2 ring-green-500 ring-offset-2"
  fallbackClassName="bg-primary/100 text-white"
/>`}
        >
          <div className="flex items-center gap-6">
            <div className="text-center">
              <UserAvatar
                name="Custom User"
                className="ring-2 ring-blue-500 ring-offset-2"
                fallbackClassName="bg-primary/100 text-white"
              />
              <p className="text-xs text-muted-foreground mt-1">Blue theme</p>
            </div>
            <div className="text-center">
              <UserAvatar
                name="Another User"
                className="ring-2 ring-green-500 ring-offset-2"
                fallbackClassName="bg-primary/100 text-white"
              />
              <p className="text-xs text-muted-foreground mt-1">Green theme</p>
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
                    src
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    string
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    undefined
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Image URL for the avatar
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    alt
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    string
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    name or "User avatar"
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Alt text for the image
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    name
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    string
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    undefined
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    User name for generating initials
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    size
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
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    fallbackClassName
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    string
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    undefined
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    CSS classes for the fallback initials
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
            code={`import { UserAvatar } from '@summoniq/applab-ui'`}
            language="typescript"
          />
        </div>
      </div>
    </div>
  );
}
