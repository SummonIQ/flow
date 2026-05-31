'use client';

import { CodeBlock } from '@/components/docs/code-block';
import { ComponentExample } from '@/components/docs/component-example';
import { Textarea, Label } from '@summoniq/applab-ui';
import { useState } from 'react';

export default function TextareaPage() {
  const [value, setValue] = useState('');
  const [bioValue, setBioValue] = useState('');

  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">Textarea</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Multi-line text input component for capturing longer form content
      </p>

      <div className="space-y-12">
        {/* Basic Usage */}
        <ComponentExample
          title="Basic Textarea"
          description="A simple textarea with placeholder text"
          code={`<Textarea placeholder="Enter your message here..." />`}
        >
          <Textarea placeholder="Enter your message here..." />
        </ComponentExample>

        {/* With Label */}
        <ComponentExample
          title="Textarea with Label"
          description="Combining textarea with a label for better accessibility"
          code={`<div className="space-y-2">
  <Label htmlFor="message">Message</Label>
  <Textarea 
    id="message" 
    placeholder="Type your message..." 
  />
</div>`}
        >
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" placeholder="Type your message..." />
          </div>
        </ComponentExample>

        {/* Controlled Component */}
        <ComponentExample
          title="Controlled Textarea"
          description="Using state to control the textarea value"
          code={`const [value, setValue] = useState('');

<div className="space-y-2">
  <Label htmlFor="controlled">Controlled Input</Label>
  <Textarea
    id="controlled"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    placeholder="Type something..."
  />
  <p className="text-sm text-muted-foreground">
    Character count: {value.length}
  </p>
</div>`}
        >
          <div className="space-y-2">
            <Label htmlFor="controlled">Controlled Input</Label>
            <Textarea
              id="controlled"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Type something..."
            />
            <p className="text-sm text-muted-foreground">
              Character count: {value.length}
            </p>
          </div>
        </ComponentExample>

        {/* With Rows */}
        <ComponentExample
          title="Custom Height"
          description="Control the textarea height with rows attribute"
          code={`<div className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="small">Small (3 rows)</Label>
    <Textarea id="small" rows={3} placeholder="3 rows..." />
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="large">Large (8 rows)</Label>
    <Textarea id="large" rows={8} placeholder="8 rows..." />
  </div>
</div>`}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="small">Small (3 rows)</Label>
              <Textarea id="small" rows={3} placeholder="3 rows..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="large">Large (8 rows)</Label>
              <Textarea id="large" rows={8} placeholder="8 rows..." />
            </div>
          </div>
        </ComponentExample>

        {/* Disabled State */}
        <ComponentExample
          title="Disabled State"
          description="Textarea in a disabled state"
          code={`<Textarea 
  disabled 
  placeholder="This textarea is disabled" 
  defaultValue="Cannot edit this text"
/>`}
        >
          <Textarea
            disabled
            placeholder="This textarea is disabled"
            defaultValue="Cannot edit this text"
          />
        </ComponentExample>

        {/* With Max Length */}
        <ComponentExample
          title="Character Limit"
          description="Textarea with maximum character length"
          code={`const [bioValue, setBioValue] = useState('');
const maxLength = 200;

<div className="space-y-2">
  <Label htmlFor="bio">Bio</Label>
  <Textarea
    id="bio"
    value={bioValue}
    onChange={(e) => setBioValue(e.target.value)}
    maxLength={maxLength}
    placeholder="Tell us about yourself..."
  />
  <p className="text-sm text-muted-foreground text-right">
    {bioValue.length} / {maxLength} characters
  </p>
</div>`}
        >
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bioValue}
              onChange={(e) => setBioValue(e.target.value)}
              maxLength={200}
              placeholder="Tell us about yourself..."
            />
            <p className="text-sm text-muted-foreground text-right">
              {bioValue.length} / 200 characters
            </p>
          </div>
        </ComponentExample>

        {/* Form Example */}
        <ComponentExample
          title="Form Integration"
          description="Using textarea in a typical form layout"
          code={`<form className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="feedback">Feedback</Label>
    <Textarea
      id="feedback"
      placeholder="Share your thoughts..."
      rows={5}
    />
    <p className="text-xs text-muted-foreground">
      Your feedback helps us improve our product.
    </p>
  </div>
  
  <div className="flex gap-2">
    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
      Submit
    </button>
    <button className="px-4 py-2 border border-input rounded-md">
      Cancel
    </button>
  </div>
</form>`}
        >
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Share your thoughts..."
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                Your feedback helps us improve our product.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Submit
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-input rounded-md hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </ComponentExample>

        {/* Custom Styling */}
        <ComponentExample
          title="Custom Styling"
          description="Applying custom classes for specific use cases"
          code={`<Textarea 
  className="font-mono text-xs" 
  placeholder="Code snippet or JSON..." 
  rows={6}
/>`}
        >
          <Textarea
            className="font-mono text-xs"
            placeholder="Code snippet or JSON..."
            rows={6}
          />
        </ComponentExample>

        {/* Import Example */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Import Statement
          </h3>
          <CodeBlock
            code={`import { Textarea } from '@summoniq/applab-ui'`}
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
                    placeholder
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    string
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    -
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Placeholder text when textarea is empty
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                    rows
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    number
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    -
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Number of visible text lines
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
                    maxLength
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    number
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    -
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Maximum number of characters allowed
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

        {/* Usage Notes */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Usage Guidelines
          </h3>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="bg-muted/40 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">
                ✅ Best Practices
              </h4>
              <ul className="space-y-2">
                <li>• Use clear, descriptive labels with every textarea</li>
                <li>• Provide helpful placeholder text as a guide</li>
                <li>• Show character count for limited-length inputs</li>
                <li>• Use appropriate row heights for expected content length</li>
                <li>• Include helper text for formatting requirements</li>
              </ul>
            </div>

            <div className="bg-muted/40 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">
                🎯 Accessibility
              </h4>
              <ul className="space-y-2">
                <li>• Always associate textarea with a label using htmlFor/id</li>
                <li>• Use aria-describedby for helper text and error messages</li>
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
