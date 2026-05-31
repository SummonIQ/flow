import { Globe, Monitor, Server, Smartphone } from 'lucide-react';

const appTypeIcons: Record<string, any> = {
  api: Server,
  desktop: Monitor,
  marketing: Globe,
  web: Globe,
};

interface AppCardProps {
  name: string;
  type?: string;
  description?: string;
}

export function AppCard({ name, type, description }: AppCardProps) {
  const Icon = appTypeIcons[type || 'web'] || Smartphone;

  return (
    <div className="group relative bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-md bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-base truncate">
            {name}
          </h3>
          {type && <p className="text-xs text-muted-foreground capitalize">{type}</p>}
        </div>
      </div>
    </div>
  );
}
