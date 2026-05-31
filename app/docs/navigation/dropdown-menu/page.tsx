'use client';

import { CodeBlock } from '@/components/docs/code-block';
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@summoniq/applab-ui';
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronDown,
  Copy,
  LogOut,
  Mail,
  Settings,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function DropdownMenuPage() {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailsEnabled, setEmailsEnabled] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('light');

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const installCode = `bun add @summoniq/applab-ui`;

  const basicUsage = `import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@summoniq/applab-ui';

function MyComponent() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}`;

  const withLabelsExample = `<DropdownMenu>
  <DropdownMenuTrigger>Account</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Billing</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`;

  const checkboxExample = `const [notifications, setNotifications] = useState(true);
const [emails, setEmails] = useState(false);

<DropdownMenu>
  <DropdownMenuTrigger>Preferences</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuCheckboxItem
      checked={notifications}
      onCheckedChange={setNotifications}
    >
      Notifications
    </DropdownMenuCheckboxItem>
    <DropdownMenuCheckboxItem
      checked={emails}
      onCheckedChange={setEmails}
    >
      Email Updates
    </DropdownMenuCheckboxItem>
  </DropdownMenuContent>
</DropdownMenu>`;

  const radioExample = `const [theme, setTheme] = useState('light');

<DropdownMenu>
  <DropdownMenuTrigger>Theme</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
      <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>`;

  const subMenuExample = `<DropdownMenu>
  <DropdownMenuTrigger>More Options</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>Settings</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem>Account</DropdownMenuItem>
        <DropdownMenuItem>Privacy</DropdownMenuItem>
        <DropdownMenuItem>Security</DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`;

  const variantsExample = `// Default variant
<DropdownMenuTrigger variant="default">Default</DropdownMenuTrigger>

// Ghost variant
<DropdownMenuTrigger variant="ghost">Ghost</DropdownMenuTrigger>

// Outline variant
<DropdownMenuTrigger variant="outline">Outline</DropdownMenuTrigger>

// Secondary variant
<DropdownMenuTrigger variant="secondary">Secondary</DropdownMenuTrigger>

// Destructive variant
<DropdownMenuTrigger variant="destructive">Destructive</DropdownMenuTrigger>`;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/navigation"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Navigation
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <ChevronDown className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">
              Dropdown Menu
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            A fully accessible dropdown menu component with keyboard navigation,
            sub-menus, checkboxes, radio groups, and more.
          </p>
        </div>

        {/* Features */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Features
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-card p-4 rounded-lg border border-border">
              <h4 className="font-semibold text-foreground mb-2">
                Keyboard Navigation
              </h4>
              <p className="text-sm text-muted-foreground">
                Full keyboard support with arrow keys and shortcuts
              </p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <h4 className="font-semibold text-foreground mb-2">
                Nested Menus
              </h4>
              <p className="text-sm text-muted-foreground">
                Support for sub-menus with smooth transitions
              </p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <h4 className="font-semibold text-foreground mb-2">
                Checkboxes & Radio Groups
              </h4>
              <p className="text-sm text-muted-foreground">
                Built-in support for selections and toggles
              </p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <h4 className="font-semibold text-foreground mb-2">
                Customizable Styling
              </h4>
              <p className="text-sm text-muted-foreground">
                Multiple variants and full Tailwind customization
              </p>
            </div>
          </div>
        </div>

        {/* Installation */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Installation
          </h3>
          <div className="relative">
            <CodeBlock language="bash" code={installCode} />
            <button
              onClick={() => copyToClipboard(installCode, 'install')}
              className="absolute top-3 right-3 p-2 rounded-md border border-border bg-card text-muted-foreground hover:bg-muted transition-colors"
            >
              {copiedStates.install ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Basic Usage */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Basic Usage
          </h3>
          <div className="relative mb-6">
            <CodeBlock language="tsx" code={basicUsage} />
            <button
              onClick={() => copyToClipboard(basicUsage, 'basic')}
              className="absolute top-3 right-3 p-2 rounded-md border border-border bg-card text-muted-foreground hover:bg-muted transition-colors"
            >
              {copiedStates.basic ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* Live Example */}
          <div className="bg-card p-8 rounded-lg border border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <User className="w-4 h-4 mr-2" />
                  Open Menu
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* With Labels */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            With Labels & Separators
          </h3>
          <div className="relative mb-6">
            <CodeBlock language="tsx" code={withLabelsExample} />
            <button
              onClick={() => copyToClipboard(withLabelsExample, 'labels')}
              className="absolute top-3 right-3 p-2 rounded-md border border-border bg-card text-muted-foreground hover:bg-muted transition-colors"
            >
              {copiedStates.labels ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>

          <div className="bg-card p-8 rounded-lg border border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Account</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Checkbox Items
          </h3>
          <div className="relative mb-6">
            <CodeBlock language="tsx" code={checkboxExample} />
            <button
              onClick={() => copyToClipboard(checkboxExample, 'checkbox')}
              className="absolute top-3 right-3 p-2 rounded-md border border-border bg-card text-muted-foreground hover:bg-muted transition-colors"
            >
              {copiedStates.checkbox ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>

          <div className="bg-card p-8 rounded-lg border border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary">
                  <Bell className="w-4 h-4 mr-2" />
                  Preferences
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Push Notifications
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={emailsEnabled}
                  onCheckedChange={setEmailsEnabled}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Updates
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Radio Groups */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Radio Groups
          </h3>
          <div className="relative mb-6">
            <CodeBlock language="tsx" code={radioExample} />
            <button
              onClick={() => copyToClipboard(radioExample, 'radio')}
              className="absolute top-3 right-3 p-2 rounded-md border border-border bg-card text-muted-foreground hover:bg-muted transition-colors"
            >
              {copiedStates.radio ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>

          <div className="bg-card p-8 rounded-lg border border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Theme: {selectedTheme}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={selectedTheme}
                  onValueChange={setSelectedTheme}
                >
                  <DropdownMenuRadioItem value="light">
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">
                    System
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Sub Menus */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Sub Menus
          </h3>
          <div className="relative mb-6">
            <CodeBlock language="tsx" code={subMenuExample} />
            <button
              onClick={() => copyToClipboard(subMenuExample, 'submenu')}
              className="absolute top-3 right-3 p-2 rounded-md border border-border bg-card text-muted-foreground hover:bg-muted transition-colors"
            >
              {copiedStates.submenu ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>

          <div className="bg-card p-8 rounded-lg border border-border">
            <DropdownMenu>
              <DropdownMenuTrigger>More Options</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>Account</DropdownMenuItem>
                    <DropdownMenuItem>Privacy</DropdownMenuItem>
                    <DropdownMenuItem>Security</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Variants */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Trigger Variants
          </h3>
          <div className="relative mb-6">
            <CodeBlock language="tsx" code={variantsExample} />
            <button
              onClick={() => copyToClipboard(variantsExample, 'variants')}
              className="absolute top-3 right-3 p-2 rounded-md border border-border bg-card text-muted-foreground hover:bg-muted transition-colors"
            >
              {copiedStates.variants ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>

          <div className="bg-card p-8 rounded-lg border border-border">
            <div className="flex flex-wrap gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>Default</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Option 1</DropdownMenuItem>
                  <DropdownMenuItem>Option 2</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">Ghost</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Option 1</DropdownMenuItem>
                  <DropdownMenuItem>Option 2</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Outline</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Option 1</DropdownMenuItem>
                  <DropdownMenuItem>Option 2</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary">Secondary</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Option 1</DropdownMenuItem>
                  <DropdownMenuItem>Option 2</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
