'use client';

import { CodeBlock } from '@/components/docs/code-block';
import { ComponentExample } from '@/components/docs/component-example';
import { Input, Label } from '@summoniq/applab-ui';
import { useState } from 'react';
import { Search, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function InputPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');

  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">Input</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Text input component for capturing user data with various types and states
      </p>

      <div className="space-y-12">
        {/* Basic Input */}
        <ComponentExample
          title="Basic Input"
          description="A simple text input with placeholder"
          code={`<Input placeholder="Enter text..." />`}
        >
          <Input placeholder="Enter text..." />
        </ComponentExample>

        {/* Input Types */}
        <ComponentExample
          title="Input Types"
          description="Different input types for various data formats"
          code={`<div className="space-y-4">
  <Input type="text" placeholder="Text input" />
  <Input type="email" placeholder="Email address" />
  <Input type="password" placeholder="Password" />
  <Input type="number" placeholder="Number" />
  <Input type="tel" placeholder="Phone number" />
  <Input type="url" placeholder="Website URL" />
  <Input type="search" placeholder="Search..." />
  <Input type="date" />
</div>`}
        >
          <div className="space-y-4">
            <Input type="text" placeholder="Text input" />
            <Input type="email" placeholder="Email address" />
            <Input type="password" placeholder="Password" />
            <Input type="number" placeholder="Number" />
            <Input type="tel" placeholder="Phone number" />
            <Input type="url" placeholder="Website URL" />
            <Input type="search" placeholder="Search..." />
            <Input type="date" />
          </div>
        </ComponentExample>

        {/* With Label */}
        <ComponentExample
          title="Input with Label"
          description="Pairing inputs with labels for better accessibility"
          code={`<div className="space-y-2">
  <Label htmlFor="username">Username</Label>
  <Input id="username" placeholder="Enter your username" />
</div>`}
        >
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="Enter your username" />
          </div>
        </ComponentExample>

        {/* With Icons */}
        <ComponentExample
          title="Input with Icons"
          description="Adding icons for better visual context"
          code={`<div className="space-y-4">
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input className="pl-9" placeholder="Search..." />
  </div>
  
  <div className="relative">
    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input className="pl-9" type="email" placeholder="Email" />
  </div>
  
  <div className="relative">
    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input className="pl-9" type="password" placeholder="Password" />
  </div>
</div>`}
        >
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search..." />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" type="email" placeholder="Email" />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" type="password" placeholder="Password" />
            </div>
          </div>
        </ComponentExample>

        {/* Password Toggle */}
        <ComponentExample
          title="Password with Toggle"
          description="Show/hide password functionality"
          code={`const [password, setPassword] = useState('');
const [showPassword, setShowPassword] = useState(false);

<div className="space-y-2">
  <Label htmlFor="password">Password</Label>
  <div className="relative">
    <Input
      id="password"
      type={showPassword ? "text" : "password"}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Enter password"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
    >
      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  </div>
</div>`}
        >
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </ComponentExample>

        {/* Disabled State */}
        <ComponentExample
          title="Disabled State"
          description="Input in a disabled state"
          code={`<Input disabled placeholder="Disabled input" />`}
        >
          <Input disabled placeholder="Disabled input" />
        </ComponentExample>

        {/* Validation States */}
        <ComponentExample
          title="Validation States"
          description="Input with validation feedback"
          code={`<div className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="valid">Valid Input</Label>
    <Input
      id="valid"
      className="border-green-500 focus-visible:ring-green-500"
      defaultValue="valid@email.com"
    />
    <p className="text-xs text-green-600">Email is valid</p>
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="invalid">Invalid Input</Label>
    <Input
      id="invalid"
      className="border-destructive focus-visible:ring-destructive"
      defaultValue="invalid-email"
    />
    <p className="text-xs text-destructive">Please enter a valid email</p>
  </div>
</div>`}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="valid">Valid Input</Label>
              <Input
                id="valid"
                className="border-green-500 focus-visible:ring-green-500"
                defaultValue="valid@email.com"
              />
              <p className="text-xs text-green-600">Email is valid</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invalid">Invalid Input</Label>
              <Input
                id="invalid"
                className="border-destructive focus-visible:ring-destructive"
                defaultValue="invalid-email"
              />
              <p className="text-xs text-destructive">Please enter a valid email</p>
            </div>
          </div>
        </ComponentExample>

        {/* Controlled Input */}
        <ComponentExample
          title="Controlled Input"
          description="Managing input value with state"
          code={`const [email, setEmail] = useState('');

<div className="space-y-2">
  <Label htmlFor="controlled-email">Email</Label>
  <Input
    id="controlled-email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="your@email.com"
  />
  <p className="text-xs text-muted-foreground">
    Current value: {email || '(empty)'}
  </p>
</div>`}
        >
          <div className="space-y-2">
            <Label htmlFor="controlled-email">Email</Label>
            <Input
              id="controlled-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
            <p className="text-xs text-muted-foreground">
              Current value: {email || '(empty)'}
            </p>
          </div>
        </ComponentExample>

        {/* Form Example */}
        <ComponentExample
          title="Form Integration"
          description="Using inputs in a complete form"
          code={`<form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
  <div className="space-y-2">
    <Label htmlFor="form-name">Full Name</Label>
    <Input id="form-name" placeholder="John Doe" required />
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="form-email">Email</Label>
    <Input id="form-email" type="email" placeholder="john@example.com" required />
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="form-phone">Phone</Label>
    <Input id="form-phone" type="tel" placeholder="+1 (555) 000-0000" />
  </div>
  
  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
    Submit
  </button>
</form>`}
        >
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="form-name">Full Name</Label>
              <Input id="form-name" placeholder="John Doe" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-email">Email</Label>
              <Input id="form-email" type="email" placeholder="john@example.com" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-phone">Phone</Label>
              <Input id="form-phone" type="tel" placeholder="+1 (555) 000-0000" />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Submit
            </button>
          </form>
        </ComponentExample>

        {/* Import Example */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Import Statement</h3>
          <CodeBlock code={`import { Input } from '@summoniq/applab-ui'`} language="typescript" />
        </div>

        {/* Props Reference */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Props Reference</h3>
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
                    type
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    string
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    'text'
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    HTML input type (text, email, password, etc.)
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                    placeholder
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    string
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    -
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Placeholder text when input is empty
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                    disabled
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    boolean
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    false
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Disable user interaction
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                    value
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    string
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    -
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Controlled component value
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                    defaultValue
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    string
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    -
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Default value for uncontrolled component
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                    onChange
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    function
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    -
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Callback fired when value changes
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
              </tbody>
            </table>
          </div>
        </div>

        {/* Accessibility */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Accessibility</h3>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="bg-muted/40 rounded-lg p-4">
              <ul className="space-y-2">
                <li>• Always pair inputs with labels using htmlFor/id attributes</li>
                <li>• Use appropriate input types for better mobile keyboard support</li>
                <li>• Provide clear error messages with aria-describedby</li>
                <li>• Ensure sufficient color contrast for text and borders</li>
                <li>• Support keyboard navigation (Tab, Shift+Tab)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
