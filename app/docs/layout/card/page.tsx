'use client';

import { CodeBlock } from '@/components/docs/code-block';
import { ComponentExample } from '@/components/docs/component-example';
import {
  Badge,
  Button,
  Card,
  CardActions,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@summoniq/applab-ui';
import {
  Bookmark,
  Download,
  Edit,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Trash2,
} from 'lucide-react';

export default function CardPage() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">Card</h1>
      <p className="text-lg text-muted-foreground mb-8">
        A versatile container component for grouping related content with
        flexible layouts
      </p>

      <div className="space-y-12">
        {/* Basic Cards */}
        <ComponentExample
          title="Basic Cards"
          description="Simple card layouts with header, content, and footer sections"
          code={`<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>
      Card description goes here
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content area</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Simple Card</CardTitle>
                <CardDescription>
                  A basic card with header and content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This is the card content area where you can place any content.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Card with Footer</CardTitle>
                <CardDescription>
                  Includes a footer with actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Content with footer actions below.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm">Learn More</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Minimal Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  A card with just title and content.
                </p>
              </CardContent>
            </Card>
          </div>
        </ComponentExample>

        {/* Cards with CardActions in Header */}
        <ComponentExample
          title="Cards with Header Actions"
          description="Using CardActions component to add action buttons in the card header"
          code={`<Card>
  <CardHeader className="flex flex-row items-center justify-between">
    <div>
      <CardTitle>Project Dashboard</CardTitle>
      <CardDescription>Overview of your project</CardDescription>
    </div>
    <CardActions>
      <Button variant="outline" size="sm">
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </CardActions>
  </CardHeader>
  <CardContent>
    <p>Dashboard content here</p>
  </CardContent>
</Card>`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>Project Dashboard</CardTitle>
                  <CardDescription>
                    Overview of your project stats
                  </CardDescription>
                </div>
                <CardActions>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </CardActions>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Tasks
                    </span>
                    <span className="font-semibold">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Completed
                    </span>
                    <span className="font-semibold">18</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      In Progress
                    </span>
                    <span className="font-semibold">6</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle>User Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences
                  </CardDescription>
                </div>
                <CardActions>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardActions>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" placeholder="john.doe" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ComponentExample>

        {/* Complex Card with Actions */}
        <ComponentExample
          title="Social Media Style Card"
          description="Complex card layout with user info, badges, and multiple action areas"
          code={`<Card>
  <CardHeader>
    <div className="flex items-start justify-between">
      <div>
        <CardTitle className="text-base">John Doe</CardTitle>
        <CardDescription className="text-sm">@johndoe · 2h ago</CardDescription>
      </div>
      <Button variant="ghost" size="sm">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
  </CardHeader>
  <CardContent>
    <p>Check out this amazing component library!</p>
    <div className="flex gap-2 mt-2">
      <Badge>React</Badge>
      <Badge>TypeScript</Badge>
      <Badge>UI</Badge>
    </div>
  </CardContent>
  <CardFooter className="border-t pt-4">
    <CardActions className="w-full justify-between">
      <Button variant="ghost" size="sm">
        <Heart className="h-4 w-4 mr-1" /> 42
      </Button>
      <Button variant="ghost" size="sm">
        <MessageCircle className="h-4 w-4 mr-1" /> 12
      </Button>
      <Button variant="ghost" size="sm">
        <Share2 className="h-4 w-4 mr-1" /> Share
      </Button>
      <Button variant="ghost" size="sm">
        <Bookmark className="h-4 w-4" />
      </Button>
    </CardActions>
  </CardFooter>
</Card>`}
        >
          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">John Doe</CardTitle>
                    <CardDescription className="text-sm">
                      @johndoe · 2h ago
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-foreground">
                  Just shipped a new update to our component library! 🚀 Check
                  out the new CardActions component for better header layouts.
                </p>
                <div className="flex gap-2 mt-3">
                  <Badge>React</Badge>
                  <Badge>TypeScript</Badge>
                  <Badge>UI Components</Badge>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <CardActions className="w-full justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Heart className="h-4 w-4 mr-1" /> 42
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" /> 12
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Share2 className="h-4 w-4 mr-1" /> Share
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </CardActions>
              </CardFooter>
            </Card>
          </div>
        </ComponentExample>

        {/* Footer Actions Variations */}
        <ComponentExample
          title="Footer Action Patterns"
          description="Different ways to use CardActions in the card footer"
          code={`// Justified actions
<CardFooter>
  <CardActions className="w-full justify-between">
    <Button variant="outline">Cancel</Button>
    <Button>Save Changes</Button>
  </CardActions>
</CardFooter>

// Right-aligned actions
<CardFooter className="justify-end">
  <CardActions>
    <Button variant="outline">Cancel</Button>
    <Button>Continue</Button>
  </CardActions>
</CardFooter>

// Multiple action groups
<CardFooter className="justify-between">
  <Button variant="ghost" size="sm">Delete</Button>
  <CardActions>
    <Button variant="outline">Cancel</Button>
    <Button>Save</Button>
  </CardActions>
</CardFooter>`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Confirmation</CardTitle>
                <CardDescription>Review your changes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to save these changes?
                </p>
              </CardContent>
              <CardFooter>
                <CardActions className="w-full justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Changes</Button>
                </CardActions>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Step</CardTitle>
                <CardDescription>Continue to payment</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  You're almost done with your order.
                </p>
              </CardContent>
              <CardFooter className="justify-end">
                <CardActions>
                  <Button variant="outline">Back</Button>
                  <Button>Continue</Button>
                </CardActions>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document</CardTitle>
                <CardDescription>Manage this document</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Last edited 2 hours ago
                </p>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="ghost" size="sm" className="text-destructive">
                  Delete
                </Button>
                <CardActions>
                  <Button variant="outline" size="sm">
                    Export
                  </Button>
                  <Button size="sm">Edit</Button>
                </CardActions>
              </CardFooter>
            </Card>
          </div>
        </ComponentExample>

        {/* Import Example */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Import Statement
          </h3>
          <CodeBlock
            code={`import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  CardActions
} from '@summoniq/applab-ui'`}
            language="typescript"
          />
        </div>
      </div>
    </div>
  );
}
