'use client';

import { CodeBlock } from '@/components/docs/code-block';
import { ComponentExample } from '@/components/docs/component-example';
import { Checkbox, Input, Label } from '@summoniq/applab-ui';

export default function LabelPage() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">Label</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Form label component for accessible form controls
      </p>

      <div className="space-y-12">
        {/* Basic Label */}
        <ComponentExample
          title="Basic Label"
          description="A simple label paired with an input"
          code={`<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="your@email.com" />
</div>`}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="your@email.com" />
          </div>
        </ComponentExample>

        {/* Required Field */}
        <ComponentExample
          title="Required Field"
          description="Indicating required fields with an asterisk"
          code={`<div className="space-y-2">
  <Label htmlFor="username">
    Username <span className="text-destructive">*</span>
  </Label>
  <Input id="username" required placeholder="Enter username" />
  <p className="text-xs text-muted-foreground">Required field</p>
</div>`}
        >
          <div className="space-y-2">
            <Label htmlFor="username">
              Username <span className="text-destructive">*</span>
            </Label>
            <Input id="username" required placeholder="Enter username" />
            <p className="text-xs text-muted-foreground">Required field</p>
          </div>
        </ComponentExample>

        {/* With Helper Text */}
        <ComponentExample
          title="With Helper Text"
          description="Providing additional context or instructions"
          code={`<div className="space-y-2">
  <Label htmlFor="password">Password</Label>
  <Input id="password" type="password" />
  <p className="text-xs text-muted-foreground">
    Must be at least 8 characters with one uppercase letter
  </p>
</div>`}
        >
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" />
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters with one uppercase letter
            </p>
          </div>
        </ComponentExample>

        {/* With Checkbox */}
        <ComponentExample
          title="With Checkbox"
          description="Label paired with a checkbox control"
          code={`<div className="flex items-center space-x-2">
  <Checkbox ariaLabel="terms" />
  <Label className="text-sm font-normal cursor-pointer">
    I agree to the terms and conditions
  </Label>
</div>`}
        >
          <div className="flex items-center space-x-2">
            <Checkbox ariaLabel="terms" />
            <Label className="text-sm font-normal cursor-pointer">
              I agree to the terms and conditions
            </Label>
          </div>
        </ComponentExample>

        {/* Multiple Fields */}
        <ComponentExample
          title="Form with Multiple Labels"
          description="Complete form example with multiple labeled fields"
          code={`<form className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="first-name">First Name</Label>
    <Input id="first-name" placeholder="John" />
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="last-name">Last Name</Label>
    <Input id="last-name" placeholder="Doe" />
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="email-address">
      Email Address <span className="text-destructive">*</span>
    </Label>
    <Input id="email-address" type="email" required />
    <p className="text-xs text-muted-foreground">
      We'll never share your email
    </p>
  </div>
</form>`}
        >
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input id="first-name" placeholder="John" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input id="last-name" placeholder="Doe" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-address">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input id="email-address" type="email" required />
              <p className="text-xs text-muted-foreground">
                We'll never share your email
              </p>
            </div>
          </form>
        </ComponentExample>

        {/* Error State */}
        <ComponentExample
          title="Error State"
          description="Label with error message"
          code={`<div className="space-y-2">
  <Label htmlFor="invalid-email" className="text-destructive">
    Email Address
  </Label>
  <Input
    id="invalid-email"
    type="email"
    defaultValue="invalid-email"
    className="border-destructive"
  />
  <p className="text-xs text-destructive">
    Please enter a valid email address
  </p>
</div>`}
        >
          <div className="space-y-2">
            <Label htmlFor="invalid-email" className="text-destructive">
              Email Address
            </Label>
            <Input
              id="invalid-email"
              type="email"
              defaultValue="invalid-email"
              className="border-destructive"
            />
            <p className="text-xs text-destructive">
              Please enter a valid email address
            </p>
          </div>
        </ComponentExample>

        {/* Disabled State */}
        <ComponentExample
          title="Disabled Field"
          description="Label with disabled input"
          code={`<div className="space-y-2">
  <Label htmlFor="disabled-field" className="opacity-50">
    Disabled Field
  </Label>
  <Input id="disabled-field" disabled defaultValue="Cannot edit" />
</div>`}
        >
          <div className="space-y-2">
            <Label htmlFor="disabled-field" className="opacity-50">
              Disabled Field
            </Label>
            <Input id="disabled-field" disabled defaultValue="Cannot edit" />
          </div>
        </ComponentExample>

        {/* Import Example */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Import Statement
          </h3>
          <CodeBlock
            code={`import { Label } from '@summoniq/applab-ui'`}
            language="typescript"
          />
        </div>

        {/* Props Reference */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Props Reference
          </h3>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                    htmlFor
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    string
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    -
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    ID of the associated form control
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                    className
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    string
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    -
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Additional CSS classes
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                    children
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    ReactNode
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    -
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Label text or content
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Accessibility */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Accessibility
          </h3>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="bg-muted/40 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">
                ✅ Best Practices
              </h4>
              <ul className="space-y-2">
                <li>
                  • Always use htmlFor attribute to associate label with input
                </li>
                <li>• Keep label text concise and descriptive</li>
                <li>
                  • Use asterisk (*) or "required" text for required fields
                </li>
                <li>• Provide helper text for complex requirements</li>
                <li>• Ensure labels are visible and not just placeholders</li>
              </ul>
            </div>

            <div className="bg-muted/40 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">
                🎯 ARIA Attributes
              </h4>
              <ul className="space-y-2">
                <li>• Use aria-describedby for helper text</li>
                <li>• Use aria-invalid for error states</li>
                <li>• Use aria-required="true" for required fields</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
