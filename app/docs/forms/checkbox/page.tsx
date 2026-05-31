'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
} from '@summoniq/applab-ui';
import { useState } from 'react';

export default function CheckboxPage() {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(true);
  const [checked3, setChecked3] = useState(false);
  const [indeterminate, setIndeterminate] = useState(true);
  const [items, setItems] = useState([
    { id: 1, label: 'Item 1', checked: false },
    { id: 2, label: 'Item 2', checked: false },
    { id: 3, label: 'Item 3', checked: false },
  ]);

  return (
    <div className="p-6 w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Checkbox</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Beautiful animated checkbox component with smooth transitions, stroke
          animations, and customizable styling.
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Usage</CardTitle>
            <CardDescription>
              Simple checkbox with smooth animations and transitions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Checkbox
              checked={checked1}
              label="Default checkbox"
              onCheckedChange={setChecked1}
            />
            <Checkbox
              checked={checked2}
              label="Pre-checked checkbox"
              onCheckedChange={setChecked2}
            />
            <Checkbox defaultChecked={true} label="Uncontrolled checkbox" />
          </CardContent>
        </Card>

        {/* Indeterminate State */}
        <Card>
          <CardHeader>
            <CardTitle>Indeterminate State</CardTitle>
            <CardDescription>
              Useful for "select all" scenarios with partial selection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Checkbox
              checked={indeterminate}
              indeterminate={true}
              label="Indeterminate checkbox"
              onCheckedChange={setIndeterminate}
            />
          </CardContent>
        </Card>

        {/* Custom Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Colors</CardTitle>
            <CardDescription>
              Customize checkbox colors to match your brand
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Checkbox
              checked={checked3}
              checkedColor="bg-primary/100 border-green-500"
              label="Green checkbox"
              onCheckedChange={setChecked3}
            />
            <Checkbox
              borderColor="border-purple-300"
              checkedColor="bg-purple-500 border-purple-500"
              defaultChecked={true}
              focusRingColor="ring-purple-500"
              label="Purple checkbox"
            />
            <Checkbox
              borderColor="border-orange-300"
              checkedColor="bg-orange-500 border-orange-500"
              defaultChecked={true}
              focusRingColor="ring-orange-500"
              label="Orange checkbox"
            />
          </CardContent>
        </Card>

        {/* Sizes */}
        <Card>
          <CardHeader>
            <CardTitle>Different Sizes</CardTitle>
            <CardDescription>
              Customize the size of the checkbox
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Checkbox defaultChecked={true} label="Small" size="w-5 h-5" />
            <Checkbox
              defaultChecked={true}
              label="Medium (default)"
              size="w-7 h-7"
            />
            <Checkbox defaultChecked={true} label="Large" size="w-9 h-9" />
          </CardContent>
        </Card>

        {/* Hover Variant */}
        <Card>
          <CardHeader>
            <CardTitle>Hover Variant</CardTitle>
            <CardDescription>
              Checkboxes that fade in on hover - perfect for lists
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {items.map(item => (
                <div
                  key={item.id}
                  className="group flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <Checkbox
                    checked={item.checked}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onCheckedChange={checked => {
                      setItems(
                        items.map(i =>
                          i.id === item.id ? { ...i, checked } : i,
                        ),
                      );
                    }}
                  />
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Code Example */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Example</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              {`import { Checkbox } from '@summoniq/applab-ui';

function MyComponent() {
  const [checked, setChecked] = useState(false);

  return (
    <Checkbox
      checked={checked}
      label="Accept terms and conditions"
      onCheckedChange={setChecked}
    />
  );
}`}
            </pre>
          </CardContent>
        </Card>

        {/* Props */}
        <Card>
          <CardHeader>
            <CardTitle>Props</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Checkbox</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    <code className="bg-muted px-1 rounded">checked</code> -
                    Controlled checked state
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">
                      defaultChecked
                    </code>{' '}
                    - Uncontrolled default state
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">
                      onCheckedChange
                    </code>{' '}
                    - Callback when state changes
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">label</code> - Label
                    text
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">indeterminate</code>{' '}
                    - Show indeterminate state
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">size</code> - Custom
                    size (e.g., "w-8 h-8")
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">checkedColor</code>{' '}
                    - Background/border color when checked
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">borderColor</code> -
                    Border color when unchecked
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">
                      focusRingColor
                    </code>{' '}
                    - Focus ring color
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  CheckboxHover
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    <code className="bg-muted px-1 rounded">fadeOnHover</code> -
                    Fade in checkbox on hover
                  </li>
                  <li>All Checkbox props are also supported</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
