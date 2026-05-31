'use client';

import { CodeBlock } from '@/components/docs/code-block';
import { ComponentExample } from '@/components/docs/component-example';
import { Avatar, AvatarFallback, AvatarImage, Badge } from '@summoniq/applab-ui';

export default function AvatarPage() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">Avatar</h1>
      <p className="text-lg text-muted-foreground mb-8">
        User avatar component with image support and text fallbacks
      </p>

      <div className="space-y-12">
        {/* Basic Avatars */}
        <ComponentExample
          title="Basic Avatars"
          description="Avatar with image and fallback text"
          code={`// With image
<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>

// Fallback only (no image)
<Avatar>
  <AvatarFallback>JD</AvatarFallback>
</Avatar>`}
        >
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="User" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>XY</AvatarFallback>
            </Avatar>
          </div>
        </ComponentExample>

        {/* Different Sizes */}
        <ComponentExample
          title="Avatar Sizes"
          description="Different avatar sizes for various contexts"
          code={`// Size can be controlled with className
<Avatar className="h-8 w-8">
  <AvatarFallback>SM</AvatarFallback>
</Avatar>

<Avatar className="h-10 w-10">
  <AvatarFallback>MD</AvatarFallback>
</Avatar>

<Avatar className="h-12 w-12">
  <AvatarFallback>LG</AvatarFallback>
</Avatar>

<Avatar className="h-16 w-16">
  <AvatarFallback className="text-xl">XL</AvatarFallback>
</Avatar>`}
        >
          <div className="flex items-center gap-4">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">SM</AvatarFallback>
            </Avatar>
            <Avatar className="h-10 w-10">
              <AvatarFallback>MD</AvatarFallback>
            </Avatar>
            <Avatar className="h-12 w-12">
              <AvatarFallback>LG</AvatarFallback>
            </Avatar>
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">XL</AvatarFallback>
            </Avatar>
          </div>
        </ComponentExample>

        {/* With Status Indicators */}
        <ComponentExample
          title="Status Indicators"
          description="Avatars with online/offline status indicators"
          code={`<div className="relative">
  <Avatar>
    <AvatarFallback>JD</AvatarFallback>
  </Avatar>
  <span className="absolute bottom-0 right-0 h-3 w-3 bg-primary/100 border-2 border-white rounded-full"></span>
</div>

<div className="relative">
  <Avatar>
    <AvatarFallback>AB</AvatarFallback>
  </Avatar>
  <span className="absolute bottom-0 right-0 h-3 w-3 bg-yellow-500 border-2 border-white rounded-full"></span>
</div>

<div className="relative">
  <Avatar>
    <AvatarFallback>XY</AvatarFallback>
  </Avatar>
  <span className="absolute bottom-0 right-0 h-3 w-3 bg-gray-400 border-2 border-white rounded-full"></span>
</div>`}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar>
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-3 w-3 bg-primary/100 border-2 border-white rounded-full"></span>
            </div>
            <div className="relative">
              <Avatar>
                <AvatarFallback>AB</AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-3 w-3 bg-yellow-500 border-2 border-white rounded-full"></span>
            </div>
            <div className="relative">
              <Avatar>
                <AvatarFallback>XY</AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-3 w-3 bg-gray-400 border-2 border-white rounded-full"></span>
            </div>
            <div className="relative">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-3 w-3 bg-destructive/100 border-2 border-white rounded-full"></span>
            </div>
          </div>
        </ComponentExample>

        {/* Avatar Groups */}
        <ComponentExample
          title="Avatar Groups"
          description="Grouping multiple avatars together"
          code={`// Overlapping avatars
<div className="flex -space-x-2">
  <Avatar className="border-2 border-white">
    <AvatarFallback>JD</AvatarFallback>
  </Avatar>
  <Avatar className="border-2 border-white">
    <AvatarFallback>AS</AvatarFallback>
  </Avatar>
  <Avatar className="border-2 border-white">
    <AvatarFallback>BJ</AvatarFallback>
  </Avatar>
  <Avatar className="border-2 border-white">
    <AvatarFallback>+3</AvatarFallback>
  </Avatar>
</div>

// Stacked avatars
<div className="flex -space-x-4">
  <Avatar className="z-40 border-2 border-white">
    <AvatarImage src="https://github.com/shadcn.png" />
    <AvatarFallback>U1</AvatarFallback>
  </Avatar>
  <Avatar className="z-30 border-2 border-white">
    <AvatarFallback>U2</AvatarFallback>
  </Avatar>
  <Avatar className="z-20 border-2 border-white">
    <AvatarFallback>U3</AvatarFallback>
  </Avatar>
  <Avatar className="z-10 border-2 border-white bg-muted/30">
    <AvatarFallback className="text-xs">+12</AvatarFallback>
  </Avatar>
</div>`}
        >
          <div className="space-y-4">
            <div className="flex -space-x-2">
              <Avatar className="border-2 border-white">
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Avatar className="border-2 border-white">
                <AvatarFallback>AS</AvatarFallback>
              </Avatar>
              <Avatar className="border-2 border-white">
                <AvatarFallback>BJ</AvatarFallback>
              </Avatar>
              <Avatar className="border-2 border-white bg-muted/30">
                <AvatarFallback>+3</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex -space-x-4">
              <Avatar className="z-40 border-2 border-white">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>U1</AvatarFallback>
              </Avatar>
              <Avatar className="z-30 border-2 border-white">
                <AvatarFallback>U2</AvatarFallback>
              </Avatar>
              <Avatar className="z-20 border-2 border-white">
                <AvatarFallback>U3</AvatarFallback>
              </Avatar>
              <Avatar className="z-10 border-2 border-white bg-muted/30">
                <AvatarFallback className="text-xs">+12</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </ComponentExample>

        {/* Colored Avatars */}
        <ComponentExample
          title="Colored Avatars"
          description="Avatars with custom background colors"
          code={`<Avatar className="bg-destructive/100">
  <AvatarFallback className="bg-destructive/100 text-white">RD</AvatarFallback>
</Avatar>

<Avatar className="bg-primary/100">
  <AvatarFallback className="bg-primary/100 text-white">BL</AvatarFallback>
</Avatar>

<Avatar className="bg-primary/100">
  <AvatarFallback className="bg-primary/100 text-white">GR</AvatarFallback>
</Avatar>

<Avatar className="bg-purple-500">
  <AvatarFallback className="bg-purple-500 text-white">PR</AvatarFallback>
</Avatar>

<Avatar className="bg-orange-500">
  <AvatarFallback className="bg-orange-500 text-white">OR</AvatarFallback>
</Avatar>`}
        >
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarFallback className="bg-destructive/100 text-white">
                RD
              </AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback className="bg-primary/100 text-white">
                BL
              </AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback className="bg-primary/100 text-white">
                GR
              </AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback className="bg-purple-500 text-white">
                PR
              </AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback className="bg-orange-500 text-white">
                OR
              </AvatarFallback>
            </Avatar>
          </div>
        </ComponentExample>

        {/* User List Example */}
        <ComponentExample
          title="User List Pattern"
          description="Common avatar usage in user lists"
          code={`<div className="space-y-3">
  <div className="flex items-center gap-3">
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <p className="font-medium">John Doe</p>
      <p className="text-sm text-muted-foreground">john@example.com</p>
    </div>
    <Badge variant="secondary">Admin</Badge>
  </div>

  <div className="flex items-center gap-3">
    <Avatar>
      <AvatarFallback>AS</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <p className="font-medium">Alice Smith</p>
      <p className="text-sm text-muted-foreground">alice@example.com</p>
    </div>
    <Badge variant="outline">Member</Badge>
  </div>
</div>`}
        >
          <div className="space-y-3 border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">John Doe</p>
                <p className="text-sm text-muted-foreground">
                  john@example.com
                </p>
              </div>
              <Badge variant="secondary">Admin</Badge>
            </div>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>AS</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">Alice Smith</p>
                <p className="text-sm text-muted-foreground">
                  alice@example.com
                </p>
              </div>
              <Badge variant="outline">Member</Badge>
            </div>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-purple-500 text-white">
                  BJ
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">Bob Johnson</p>
                <p className="text-sm text-muted-foreground">bob@example.com</p>
              </div>
              <Badge variant="outline">Member</Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar>
                  <AvatarFallback className="bg-primary/100 text-white">
                    EW
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 h-3 w-3 bg-primary/100 border-2 border-white rounded-full"></span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Emma Wilson</p>
                <p className="text-sm text-muted-foreground">
                  emma@example.com
                </p>
              </div>
              <Badge variant="default">Owner</Badge>
            </div>
          </div>
        </ComponentExample>

        {/* Import Example */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Import Statement
          </h3>
          <CodeBlock
            code={`import { Avatar, AvatarImage, AvatarFallback } from '@summoniq/applab-ui'`}
            language="typescript"
          />
        </div>

        {/* Best Practices */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Best Practices
          </h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start">
              <span className="text-primary mr-2">✓</span>
              <span>
                Always provide a fallback for when images fail to load
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">✓</span>
              <span>Use 2-3 letter initials for text fallbacks</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">✓</span>
              <span>Include alt text on AvatarImage for accessibility</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">✓</span>
              <span>Use consistent sizing across your application</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">✓</span>
              <span>
                Consider using colored backgrounds for better visual distinction
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
