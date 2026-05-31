import { Button, Card, CardContent } from '@summoniq/applab-ui';
import Link from 'next/link';

const formComponents = [
  {
    href: '/components/forms/button',
    title: 'Button',
    description: 'Clickable button with multiple variants and sizes',
    preview: (
      <div className="flex gap-2">
        <Button variant="default" size="sm">
          Button
        </Button>
        <Button variant="outline" size="sm">
          Outline
        </Button>
      </div>
    ),
  },
  {
    href: '/components/forms/input',
    title: 'Input',
    description: 'Text input field for user data entry',
    preview: (
      <input
        className="w-full px-3 py-1.5 rounded-md border border-input bg-background text-sm"
        placeholder="Enter text..."
        disabled
      />
    ),
  },
  {
    href: '/components/forms/checkbox',
    title: 'Checkbox',
    description: 'Selection control for multiple choices',
    preview: (
      <div className="flex items-center gap-2">
        <input type="checkbox" className="w-4 h-4" defaultChecked />
        <span className="text-sm">Checkbox</span>
      </div>
    ),
  },
  {
    href: '/components/forms/select',
    title: 'Select',
    description: 'Dropdown menu for selecting options',
    preview: (
      <select className="w-full px-3 py-1.5 rounded-md border border-input bg-background text-sm">
        <option>Select option</option>
      </select>
    ),
  },
  {
    href: '/components/forms/switch',
    title: 'Switch',
    description: 'Toggle switch for binary settings',
    preview: (
      <div className="flex items-center gap-2">
        <div className="w-11 h-6 bg-primary rounded-full relative">
          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
        </div>
        <span className="text-sm">Enabled</span>
      </div>
    ),
  },
  {
    href: '/components/forms/textarea',
    title: 'Textarea',
    description: 'Multi-line text input for longer content',
    preview: (
      <textarea
        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
        placeholder="Enter text..."
        rows={2}
        disabled
      />
    ),
  },
  {
    href: '/components/forms/label',
    title: 'Label',
    description: 'Accessible labels for form fields',
    preview: (
      <div className="space-y-1">
        <label className="text-sm font-medium">Label</label>
        <div className="text-xs text-muted-foreground">Form field label</div>
      </div>
    ),
  },
];

export default function FormsPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/components"
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Components
        </Link>
        <h1 className="text-xl font-bold tracking-tight">Form Components</h1>
        <p className="text-muted-foreground mt-2">
          A collection of form elements including buttons, inputs, and controls
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {formComponents.map(component => (
          <Link key={component.href} href={component.href}>
            <Card className="h-full hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
              <CardContent className="p-3">
                <div className="p-3 rounded-md bg-muted/30 border mb-2 flex items-center justify-center h-[64px]">
                  {component.preview}
                </div>
                <h3 className="text-sm font-medium">{component.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {component.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
