'use client';

import { CodeBlock } from '@/components/docs/code-block';
import { ComponentExample } from '@/components/docs/component-example';
import {
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@summoniq/applab-ui';
import { useState } from 'react';

export default function SelectPage() {
  const [country, setCountry] = useState('');
  const [theme, setTheme] = useState('system');

  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">Select</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Dropdown selection component for choosing from a list of options
      </p>

      <div className="space-y-12">
        {/* Basic Select */}
        <ComponentExample
          title="Basic Select"
          description="A simple dropdown with options"
          code={`<Select>
  <SelectTrigger>
    <SelectValue placeholder="Choose an option" />
  </SelectTrigger>

  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>`}
        >
          <Select>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Choose an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
              <SelectItem value="option3">Option 3</SelectItem>
            </SelectContent>
          </Select>
        </ComponentExample>

        {/* With Label */}
        <ComponentExample
          title="Select with Label"
          description="Pairing select with a label for better accessibility"
          code={`<div className="space-y-2">
  <Label htmlFor="country">Country</Label>
  <Select>
    <SelectTrigger id="country">
      <SelectValue placeholder="Select a country" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="us">United States</SelectItem>
      <SelectItem value="ca">Canada</SelectItem>
      <SelectItem value="uk">United Kingdom</SelectItem>
      <SelectItem value="au">Australia</SelectItem>
    </SelectContent>
  </Select>
</div>`}
        >
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select>
              <SelectTrigger id="country" className="w-[240px]">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="au">Australia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </ComponentExample>

        {/* Controlled Select */}
        <ComponentExample
          title="Controlled Select"
          description="Managing select value with state"
          code={`const [country, setCountry] = useState('');

<div className="space-y-2">
  <Label htmlFor="controlled-country">Country</Label>
  <Select
    value={country}
    onValueChange={setCountry}
  >
    <SelectTrigger id="controlled-country">
      <SelectValue placeholder="Select a country" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="us">United States</SelectItem>
      <SelectItem value="ca">Canada</SelectItem>
      <SelectItem value="uk">United Kingdom</SelectItem>
      <SelectItem value="au">Australia</SelectItem>
    </SelectContent>
  </Select>
  <p className="text-xs text-muted-foreground">
    Selected: {country || 'None'}
  </p>
</div>`}
        >
          <div className="space-y-2">
            <Label htmlFor="controlled-country">Country</Label>
            <Select value={country || undefined} onValueChange={setCountry}>
              <SelectTrigger id="controlled-country" className="w-[240px]">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="au">Australia</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Selected: {country || 'None'}
            </p>
          </div>
        </ComponentExample>

        {/* With Option Groups */}
        <ComponentExample
          title="Grouped Options"
          description="Organizing options into logical groups"
          code={`<Select>
  <SelectTrigger>
    <SelectValue placeholder="Choose a browser" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Popular</SelectLabel>
      <SelectItem value="chrome">Chrome</SelectItem>
      <SelectItem value="firefox">Firefox</SelectItem>
      <SelectItem value="safari">Safari</SelectItem>
    </SelectGroup>
    <SelectGroup>
      <SelectLabel>Other</SelectLabel>
      <SelectItem value="edge">Edge</SelectItem>
      <SelectItem value="opera">Opera</SelectItem>
      <SelectItem value="brave">Brave</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>`}
        >
          <Select>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Choose a browser" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Popular</SelectLabel>
                <SelectItem value="chrome">Chrome</SelectItem>
                <SelectItem value="firefox">Firefox</SelectItem>
                <SelectItem value="safari">Safari</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Other</SelectLabel>
                <SelectItem value="edge">Edge</SelectItem>
                <SelectItem value="opera">Opera</SelectItem>
                <SelectItem value="brave">Brave</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </ComponentExample>

        {/* Disabled State */}
        <ComponentExample
          title="Disabled State"
          description="Select in a disabled state"
          code={`<Select disabled>
  <SelectTrigger>
    <SelectValue placeholder="Cannot select" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>`}
        >
          <Select disabled>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Cannot select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
            </SelectContent>
          </Select>
        </ComponentExample>

        {/* With Default Value */}
        <ComponentExample
          title="With Default Value"
          description="Setting a pre-selected option"
          code={`<div className="space-y-2">
  <Label htmlFor="theme">Theme Preference</Label>
  <Select defaultValue="system">
    <SelectTrigger id="theme">
      <SelectValue placeholder="Select theme" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="light">Light</SelectItem>
      <SelectItem value="dark">Dark</SelectItem>
      <SelectItem value="system">System</SelectItem>
    </SelectContent>
  </Select>
</div>`}
        >
          <div className="space-y-2">
            <Label htmlFor="theme">Theme Preference</Label>
            <Select defaultValue="system">
              <SelectTrigger id="theme" className="w-[240px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </ComponentExample>

        {/* Required Field */}
        <ComponentExample
          title="Required Field"
          description="Select with required attribute"
          code={`<div className="space-y-2">
  <Label htmlFor="required-select">
    Category <span className="text-destructive">*</span>
  </Label>
  <Select>
    <SelectTrigger id="required-select">
      <SelectValue placeholder="Select a category" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="electronics">Electronics</SelectItem>
      <SelectItem value="clothing">Clothing</SelectItem>
      <SelectItem value="books">Books</SelectItem>
      <SelectItem value="home">Home & Garden</SelectItem>
    </SelectContent>
  </Select>
  <p className="text-xs text-muted-foreground">Required field</p>
</div>`}
        >
          <div className="space-y-2">
            <Label htmlFor="required-select">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select>
              <SelectTrigger id="required-select" className="w-[240px]">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="books">Books</SelectItem>
                <SelectItem value="home">Home & Garden</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Required field</p>
          </div>
        </ComponentExample>

        {/* Form Example */}
        <ComponentExample
          title="Form Integration"
          description="Using select in a complete form"
          code={`<form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
  <div className="space-y-2">
    <Label htmlFor="form-country">Country</Label>
    <Select>
      <SelectTrigger id="form-country">
        <SelectValue placeholder="Select your country" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="us">United States</SelectItem>
        <SelectItem value="ca">Canada</SelectItem>
        <SelectItem value="uk">United Kingdom</SelectItem>
      </SelectContent>
    </Select>
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="form-state">State/Province</Label>
    <Select>
      <SelectTrigger id="form-state">
        <SelectValue placeholder="Select state" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ca">California</SelectItem>
        <SelectItem value="ny">New York</SelectItem>
        <SelectItem value="tx">Texas</SelectItem>
      </SelectContent>
    </Select>
  </div>
  
  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
    Submit
  </button>
</form>`}
        >
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="form-country">Country</Label>
              <Select>
                <SelectTrigger id="form-country" className="w-[240px]">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="ca">Canada</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-state">State/Province</Label>
              <Select>
                <SelectTrigger id="form-state" className="w-[240px]">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ca">California</SelectItem>
                  <SelectItem value="ny">New York</SelectItem>
                  <SelectItem value="tx">Texas</SelectItem>
                </SelectContent>
              </Select>
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
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Import Statement
          </h3>
          <CodeBlock
            code={`import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@summoniq/applab-ui'`}
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
                    required
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    boolean
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    false
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Mark field as required
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
                    Callback fired when selection changes
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
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Accessibility
          </h3>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="bg-muted/40 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">
                ✅ Best Practices
              </h4>
              <ul className="space-y-2">
                <li>• Always pair select with a label using htmlFor/id</li>
                <li>• Include a default "please select" option</li>
                <li>• Use optgroup to organize long option lists</li>
                <li>• Provide clear, descriptive option text</li>
                <li>
                  • Support keyboard navigation (Arrow keys, Enter, Escape)
                </li>
              </ul>
            </div>

            <div className="bg-muted/40 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">
                ⌨️ Keyboard Support
              </h4>
              <ul className="space-y-2">
                <li>
                  •{' '}
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">
                    Space
                  </kbd>{' '}
                  /{' '}
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">
                    Enter
                  </kbd>{' '}
                  - Open dropdown
                </li>
                <li>
                  • <kbd className="px-2 py-1 bg-muted rounded text-xs">↑</kbd>{' '}
                  / <kbd className="px-2 py-1 bg-muted rounded text-xs">↓</kbd>{' '}
                  - Navigate options
                </li>
                <li>
                  •{' '}
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">
                    Enter
                  </kbd>{' '}
                  - Select option
                </li>
                <li>
                  •{' '}
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>{' '}
                  - Close without selecting
                </li>
                <li>
                  •{' '}
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">Tab</kbd>{' '}
                  - Move to next field
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
