'use client';

import {
  BarChart3,
  BookOpen,
  Bot,
  Box,
  Briefcase,
  Brush,
  Calendar,
  ChevronDown,
  Clock,
  CreditCard,
  Database,
  FileCode,
  FolderOpen,
  Grid3x3,
  Hammer,
  Home,
  Layers,
  Library,
  Lightbulb,
  Mail,
  Package,
  Palette,
  Settings,
  Settings2,
  Sparkles,
  Star,
  Tag,
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  BarChart3,
  BookOpen,
  Bot,
  Box,
  Briefcase,
  Brush,
  Calendar,
  Clock,
  CreditCard,
  Database,
  FileCode,
  FolderOpen,
  Grid3x3,
  Hammer,
  Home,
  Layers,
  Library,
  Lightbulb,
  Mail,
  Palette,
  Package,
  Settings,
  Settings2,
  Sparkles,
  Star,
  Tag,
  Users,
  Workflow,
};

export interface NavigationItem {
  href: string;
  icon: string;
  name: string;
  children?: NavigationItem[];
}

interface NavigationMenuProps {
  items: NavigationItem[];
  collapsed?: boolean;
}

function NavItem({
  item,
  collapsed,
  pathname,
  level = 0,
}: {
  item: NavigationItem;
  collapsed: boolean;
  pathname: string;
  level?: number;
}) {
  const Icon = iconMap[item.icon];
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.href;
  const isChildActive =
    hasChildren &&
    item.children?.some(
      child => pathname === child.href || pathname.startsWith(child.href + '/'),
    );
  const [isOpen, setIsOpen] = useState(isActive || isChildActive);
  const labelClasses = cn(
    'truncate overflow-hidden transition-[max-width,opacity,transform] duration-150',
    collapsed
      ? 'max-w-0 opacity-0 -translate-x-2'
      : 'max-w-full opacity-100 translate-x-0',
    !collapsed && hasChildren && 'flex-1 min-w-0 text-left',
    level > 0 && !collapsed && 'text-[12px]',
  );

  if (!Icon) return null;

  if (hasChildren) {
    const itemButton = (
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center w-full rounded-md text-[13px] font-medium transition-all duration-150',
          'outline-none',
          collapsed ? 'justify-center px-1.5 py-3.5' : 'gap-2.5 px-3 py-2',
          collapsed && 'relative group',
          isActive || isChildActive
            ? 'text-primary'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
        )}
      >
        <Icon
          className={cn('shrink-0', collapsed ? 'h-6 w-6' : 'h-[15px] w-[15px]')}
        />
        <span className={labelClasses} aria-hidden={collapsed}>
          {item.name}
        </span>
        {!collapsed && (
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 transition-transform duration-200',
              isOpen && 'rotate-180',
            )}
          />
        )}
      </button>
    );

    return (
      <div>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>{itemButton}</TooltipTrigger>
            <TooltipContent side="right">{item.name}</TooltipContent>
          </Tooltip>
        ) : (
          itemButton
        )}
        {!collapsed && isOpen && (
          <div className="ml-3 mt-0.5 border-l border-border/50 pl-2 flex flex-col gap-0.5">
            {item.children?.map(child => (
              <NavItem
                key={`${child.href}:${child.name}`}
                item={child}
                collapsed={collapsed}
                pathname={pathname}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const itemLink = (
    <Link
      href={item.href}
      className={cn(
        'flex items-center rounded-md text-[13px] font-medium transition-all duration-150',
        'outline-none',
        collapsed ? 'justify-center px-1.5 py-3.5' : 'gap-2.5 px-3 py-2',
        collapsed && 'relative group',
        level > 0 && !collapsed && 'text-[12px] py-1.5',
        isActive
          ? 'bg-primary/15 text-primary shadow-sm'
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
      )}
    >
      <Icon
        className={cn(
          'shrink-0',
          collapsed ? 'h-6 w-6' : 'h-[15px] w-[15px]',
          level > 0 && !collapsed && 'h-[13px] w-[13px]',
        )}
      />
      <span className={labelClasses} aria-hidden={collapsed}>
        {item.name}
      </span>
    </Link>
  );

  return (
    collapsed ? (
      <Tooltip>
        <TooltipTrigger asChild>{itemLink}</TooltipTrigger>
        <TooltipContent side="right">{item.name}</TooltipContent>
      </Tooltip>
    ) : (
      itemLink
    )
  );
}

export function NavigationMenu({
  items,
  collapsed = false,
}: NavigationMenuProps) {
  const pathname = usePathname();
  return (
    <TooltipProvider delayDuration={100}>
      <nav className="flex-1 flex flex-col p-2">
        <div className={cn('flex flex-col', collapsed ? 'gap-2.5' : 'gap-1')}>
          {items
            .filter(item => {
              if (!iconMap[item.icon]) {
                console.warn(`Icon "${item.icon}" not found in iconMap`);
                return false;
              }
              return true;
            })
            .map(item => (
              <NavItem
                key={`${item.href}:${item.name}`}
                item={item}
                collapsed={collapsed}
                pathname={pathname}
              />
            ))}
        </div>
      </nav>
    </TooltipProvider>
  );
}
