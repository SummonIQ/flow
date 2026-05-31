'use client';

import { CodeBlock } from '@/components/docs/code-block';
import { ComponentExample } from '@/components/docs/component-example';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  MasonryGrid,
  MasonryItem,
} from '@summoniq/applab-ui';
import {
  Calendar,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  Music,
  Share2,
  Star,
  User,
  Video,
} from 'lucide-react';
import { useState } from 'react';

export default function MasonryGridPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Sample data for examples
  const sampleCards = [
    {
      title: 'Beautiful Landscape',
      description: 'A stunning view of mountains and valleys',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      height: 'h-32',
      tags: ['Nature', 'Photography'],
      icon: ImageIcon,
      color: 'bg-primary/12',
    },
    {
      title: 'Quick Note',
      description: 'Just a brief reminder',
      content:
        "Don't forget to check the latest updates on the project dashboard.",
      height: 'h-20',
      tags: ['Note'],
      icon: FileText,
      color: 'bg-primary/12',
    },
    {
      title: 'Video Tutorial',
      description: 'Learn React in 30 minutes',
      content:
        'This comprehensive tutorial covers all the basics you need to know about React development, including components, state management, and hooks. Perfect for beginners looking to get started quickly.',
      height: 'h-40',
      tags: ['Tutorial', 'React', 'Development'],
      icon: Video,
      color: 'bg-accent/15',
    },
    {
      title: 'Favorite Playlist',
      description: 'Coding background music',
      content:
        'A curated collection of ambient tracks perfect for deep focus sessions.',
      height: 'h-24',
      tags: ['Music', 'Productivity'],
      icon: Music,
      color: 'bg-secondary/20',
    },
    {
      title: 'Project Update',
      description: 'Weekly status report',
      content:
        "Great progress this week! We've completed the user authentication system, implemented the new dashboard layout, and fixed several critical bugs. The team is on track to meet our milestone deadline. Next week we'll focus on the mobile responsive design and performance optimizations.",
      height: 'h-48',
      tags: ['Project', 'Update', 'Status'],
      icon: Calendar,
      color: 'bg-destructive/10',
    },
    {
      title: 'Design System',
      description: 'Component library guidelines',
      content:
        'Our design system provides consistent patterns and components for building user interfaces.',
      height: 'h-36',
      tags: ['Design', 'UI/UX'],
      icon: User,
      color: 'bg-accent/15',
    },
  ];

  // Static heights for consistent SSR rendering
  const heights = ['h-48', 'h-32', 'h-40', 'h-48', 'h-32', 'h-40', 'h-48', 'h-32', 'h-40', 'h-48', 'h-32', 'h-40'];
  const photoCards = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `Photo ${i + 1}`,
    height: heights[i],
    likes: 10 + (i * 7) % 90,
    comments: 1 + (i * 3) % 19,
  }));

  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">Masonry Grid</h1>
      <p className="text-lg text-muted-foreground mb-8">
        A responsive masonry layout component that automatically arranges items
        in columns based on available space and content height
      </p>

      <div className="space-y-12">
        {/* Basic Masonry Grid */}
        <ComponentExample
          title="Basic Masonry Grid"
          description="Simple masonry layout with automatic column calculation"
          code={`<MasonryGrid columns={{ default: 1, sm: 2, lg: 3 }} gap={16}>
  <MasonryItem>
    <Card className="h-32">
      <CardContent className="p-4">
        <h3>Item 1</h3>
        <p>Short content</p>
      </CardContent>
    </Card>
  </MasonryItem>
  <MasonryItem>
    <Card className="h-48">
      <CardContent className="p-4">
        <h3>Item 2</h3>
        <p>Longer content that takes up more vertical space...</p>
      </CardContent>
    </Card>
  </MasonryItem>
  <MasonryItem>
    <Card className="h-24">
      <CardContent className="p-4">
        <h3>Item 3</h3>
        <p>Minimal</p>
      </CardContent>
    </Card>
  </MasonryItem>
</MasonryGrid>`}
        >
          <MasonryGrid columns={{ default: 1, sm: 2, lg: 3 }} gap={16}>
            {sampleCards.slice(0, 6).map((card, index) => (
              <MasonryItem key={index}>
                <Card
                  className={`${card.height} ${card.color} border-l-4 border-l-primary`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <card.icon className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm">{card.title}</CardTitle>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Star className="h-3 w-3" />
                      </Button>
                    </div>
                    <CardDescription className="text-xs">
                      {card.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground mb-2">
                      {card.content}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {card.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs px-1 py-0"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </MasonryItem>
            ))}
          </MasonryGrid>
        </ComponentExample>

        {/* Photo Gallery Style */}
        <ComponentExample
          title="Photo Gallery Layout"
          description="Pinterest-style photo grid with interactive elements"
          code={`<MasonryGrid columns={{ default: 2, md: 3, lg: 4 }} gap={12}>
  {photos.map(photo => (
    <MasonryItem key={photo.id}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          <div className={\`bg-gradient-to-br from-muted/40 via-muted/60 to-muted/70 \${photo.height} flex items-center justify-center\`}>
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent className="p-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {photo.likes}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {photo.comments}
              </span>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Share2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </MasonryItem>
  ))}
</MasonryGrid>`}
        >
          <MasonryGrid columns={{ default: 2, md: 3, lg: 4 }} gap={12}>
            {photoCards.map(photo => (
              <MasonryItem key={photo.id}>
                <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <div
                      className={`bg-gradient-to-br from-muted/40 via-muted/60 to-muted/70 ${photo.height} flex items-center justify-center`}
                    >
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <span className="absolute bottom-2 left-2 text-xs font-mono text-muted-foreground">
                        {photo.title}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {photo.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {photo.comments}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </MasonryItem>
            ))}
          </MasonryGrid>
        </ComponentExample>

        {/* Custom Column Configuration */}
        <ComponentExample
          title="Custom Column Breakpoints"
          description="Fine-tuned responsive behavior with custom breakpoint configuration"
          code={`<MasonryGrid
  columns={{
    default: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5
  }}
  gap={20}
>
  {items.map(item => (
    <MasonryItem key={item.id}>
      <Card>
        <CardContent className="p-4">
          {item.content}
        </CardContent>
      </Card>
    </MasonryItem>
  ))}
</MasonryGrid>`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-lg bg-primary/12 p-4">
              <span className="text-sm font-medium text-primary">
                Current columns:
              </span>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 bg-card rounded border">
                  xs: 1 col
                </span>
                <span className="px-2 py-1 bg-card rounded border">
                  sm: 2 cols
                </span>
                <span className="px-2 py-1 bg-card rounded border">
                  md: 3 cols
                </span>
                <span className="px-2 py-1 bg-card rounded border">
                  lg: 4 cols
                </span>
                <span className="px-2 py-1 bg-card rounded border">
                  xl: 5 cols
                </span>
              </div>
            </div>

            <MasonryGrid
              columns={{ default: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
              gap={20}
            >
              {Array.from({ length: 8 }, (_, i) => (
                <MasonryItem key={i}>
                  <Card
                    className={
                      i % 3 === 0 ? 'h-32' : i % 3 === 1 ? 'h-20' : 'h-28'
                    }
                  >
                    <CardContent className="p-4 h-full flex flex-col justify-between">
                      <div>
                        <h3 className="font-medium text-sm mb-1">
                          Card {i + 1}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {i % 3 === 0
                            ? 'This is a taller card with more content to demonstrate varying heights in the masonry layout.'
                            : i % 3 === 1
                            ? 'Short content card.'
                            : 'Medium height card with moderate content.'}
                        </p>
                      </div>
                      <Badge variant="outline" className="self-start text-xs">
                        Item {i + 1}
                      </Badge>
                    </CardContent>
                  </Card>
                </MasonryItem>
              ))}
            </MasonryGrid>
          </div>
        </ComponentExample>

        {/* Dashboard Style Layout */}
        <ComponentExample
          title="Dashboard Widget Layout"
          description="Mixed content types in a dashboard-style masonry grid"
          code={`<MasonryGrid columns={{ default: 1, md: 2, lg: 3 }} gap={24}>
  <MasonryItem>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activities.map(activity => (
            <div key={activity.id} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary/100 rounded-full" />
              <span className="text-sm">{activity.text}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </MasonryItem>

  <MasonryItem>
    <Card>
      <CardHeader>
        <CardTitle>Quick Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">124</div>
            <div className="text-xs text-muted-foreground">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">98%</div>
            <div className="text-xs text-muted-foreground">Uptime</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </MasonryItem>
</MasonryGrid>`}
        >
          <MasonryGrid columns={{ default: 1, md: 2, lg: 3 }} gap={24}>
            <MasonryItem>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      'User john.doe logged in',
                      "New project 'Mobile App' created",
                      'Database backup completed',
                      '3 new team members added',
                      'Security scan finished - no issues',
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary/100 rounded-full" />
                        <span className="text-sm text-muted-foreground">
                          {activity}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </MasonryItem>

            <MasonryItem>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">
                        124
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total Users
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">
                        98%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Uptime
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">
                        45
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Projects
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">
                        12
                      </div>
                      <div className="text-xs text-muted-foreground">Teams</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </MasonryItem>

            <MasonryItem>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Downloads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { name: 'Project Report.pdf', size: '2.4 MB' },
                      { name: 'Design Assets.zip', size: '15.8 MB' },
                      { name: 'User Guide.docx', size: '1.2 MB' },
                    ].map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded bg-muted/40"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {file.size}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </MasonryItem>

            <MasonryItem>
              <Card>
                <CardHeader>
                  <CardTitle>Team Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        name: 'Alice Johnson',
                        status: 'Online',
                        color: 'bg-primary/100',
                      },
                      {
                        name: 'Bob Smith',
                        status: 'Away',
                        color: 'bg-yellow-500',
                      },
                      {
                        name: 'Carol White',
                        status: 'Busy',
                        color: 'bg-destructive/100',
                      },
                      {
                        name: 'David Brown',
                        status: 'Offline',
                        color: 'bg-gray-400',
                      },
                    ].map((member, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${member.color}`}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {member.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {member.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </MasonryItem>
          </MasonryGrid>
        </ComponentExample>

        {/* Import Example */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Import Statement
          </h3>
          <CodeBlock
            code={`import { MasonryGrid, MasonryItem } from '@summoniq/applab-ui'`}
            language="typescript"
          />
        </div>

        {/* Props Reference */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Props Reference
          </h3>

          <div className="space-y-6">
            <div>
              <h4 className="text-md font-medium text-foreground mb-3">
                MasonryGrid Props
              </h4>
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
                        children
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        ReactNode
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        -
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        The items to display in the masonry grid
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                        columns
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {`{ default: number; sm?: number; md?: number; lg?: number; xl?: number; }`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{`{ default: 1, sm: 2, lg: 3 }`}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        Number of columns at different breakpoints
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                        gap
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        number
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        24
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        Gap between items in pixels
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

            <div>
              <h4 className="text-md font-medium text-foreground mb-3">
                MasonryItem Props
              </h4>
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
                        children
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        ReactNode
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        -
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        The content of the masonry item
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
          </div>
        </div>

        {/* Usage Notes */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Usage notes
          </h3>
          <div className="rounded-lg border border-primary/30 bg-primary/12 p-6">
            <h4 className="text-md font-medium text-primary mb-3">
              Best practices
            </h4>
            <ul className="space-y-2 text-sm text-primary/80">
              <li>
                • Wrap each item in a{' '}
                <code className="rounded bg-muted px-1">MasonryItem</code>{' '}
                component
              </li>
              <li>• Use consistent content types for better visual harmony</li>
              <li>• Consider loading states for dynamic content</li>
              <li>• Test responsive behavior across different screen sizes</li>
              <li>
                • Items are positioned absolutely, so avoid complex nested
                layouts
              </li>
              <li>
                • The component automatically handles window resize and content
                changes
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
