'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Tab {
  value: string;
  label: string;
  href: string;
  hidden?: boolean;
  rightAligned?: boolean;
  icon?: React.ReactNode;
}

interface AnimatedTabNavProps {
  tabs: Tab[];
  activeTab: string;
  className?: string;
}

export function AnimatedTabNav({
  tabs,
  activeTab,
  className,
}: AnimatedTabNavProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [tabWidths, setTabWidths] = useState<number[]>([]);
  const [tabOffsets, setTabOffsets] = useState<number[]>([]);
  const navRef = useRef<HTMLDivElement>(null);

  const visibleTabs = tabs.filter(tab => !tab.hidden);

  const updateTabMeasurements = useCallback(() => {
    if (!navRef.current) return;

    const links = navRef.current.querySelectorAll('a');
    const widths: number[] = [];
    const offsets: number[] = [];

    links.forEach((link, index) => {
      const rect = link.getBoundingClientRect();
      const navRect = navRef.current!.getBoundingClientRect();
      widths.push(rect.width);
      offsets.push(rect.left - navRect.left);

      if (visibleTabs[index]?.value === activeTab) {
        setActiveIndex(index);
      }
    });

    setTabWidths(widths);
    setTabOffsets(offsets);
  }, [activeTab, visibleTabs]);

  useEffect(() => {
    updateTabMeasurements();
    const timeoutId = setTimeout(updateTabMeasurements, 100);
    return () => clearTimeout(timeoutId);
  }, [updateTabMeasurements]);

  useEffect(() => {
    const handleResize = () => updateTabMeasurements();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateTabMeasurements]);

  const leftTabs = visibleTabs.filter(tab => !tab.rightAligned);
  const rightTabs = visibleTabs.filter(tab => tab.rightAligned);

  return (
    <nav
      ref={navRef}
      className={cn(
        'relative flex max-w-7xl w-full px-6 -mb-px border-b border-border bg-card',
        className,
      )}
    >
      {leftTabs.map((tab, index) => {
        const isActive = tab.value === activeTab;
        return (
          <Link
            key={tab.value}
            href={tab.href}
            className={cn(
              'relative inline-flex items-center justify-center gap-1.5',
              'px-4 py-3 text-sm font-medium whitespace-nowrap',
              'transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-ring focus-visible:ring-offset-2',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.icon}
            {tab.label}
          </Link>
        );
      })}

      {/* Spacer to push right-aligned tabs to the right */}
      {rightTabs.length > 0 && <div className="flex-1" />}

      {rightTabs.map((tab, index) => {
        const isActive = tab.value === activeTab;
        return (
          <Link
            key={tab.value}
            href={tab.href}
            className={cn(
              'relative inline-flex items-center justify-center gap-1.5',
              'px-4 py-3 text-sm font-medium whitespace-nowrap',
              'transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-ring focus-visible:ring-offset-2',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.icon}
            {tab.label}
          </Link>
        );
      })}

      {/* Animated border indicator */}
      {tabWidths.length > 0 && tabOffsets.length > 0 && (
        <div
          className="absolute bottom-0 h-[2px] bg-primary"
          style={{
            left: `${tabOffsets[activeIndex]}px`,
            width: `${tabWidths[activeIndex]}px`,
            transition: 'left 200ms ease-out, width 200ms ease-out',
            willChange: 'left, width',
          }}
        />
      )}
    </nav>
  );
}
