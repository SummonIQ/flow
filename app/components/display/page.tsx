import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  FancyBadge,
} from '@summoniq/applab-ui';
import Link from 'next/link';

const displayComponents = [
  {
    href: '/components/display/avatar',
    title: 'Avatar',
    description: 'User profile images with fallback support',
    preview: (
      <div className="flex gap-2 items-center">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="text-xs">JD</AvatarFallback>
        </Avatar>
        <Avatar className="w-10 h-10">
          <AvatarFallback className="text-sm">AB</AvatarFallback>
        </Avatar>
      </div>
    ),
  },
  {
    href: '/components/display/badge',
    title: 'Badge',
    description: 'Small status indicators and labels',
    preview: (
      <div className="flex flex-wrap gap-2">
        <Badge variant="default">New</Badge>
        <Badge variant="secondary">Beta</Badge>
      </div>
    ),
  },
  {
    href: '/components/display/fancy-badge',
    title: 'Fancy Badge',
    description: 'Stylized badges with gradient effects',
    preview: (
      <div className="flex flex-wrap gap-2">
        <FancyBadge>Premium</FancyBadge>
      </div>
    ),
  },
];

export default function DisplayPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/components"
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Components
        </Link>
        <h1 className="text-xl font-bold tracking-tight">Display Components</h1>
        <p className="text-muted-foreground mt-2">
          Visual components for displaying information and user data
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {displayComponents.map(component => (
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
