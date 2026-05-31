'use client';

import {
  AnimatedSideNav,
  AnimatedSideNavSection,
} from '@/components/navigation/animated-side-nav';

interface ComponentsNavigationProps {
  sections: AnimatedSideNavSection[];
  collapsed?: boolean;
}

export function ComponentsNavigation({
  sections,
  collapsed = false,
}: ComponentsNavigationProps) {
  return <AnimatedSideNav sections={sections} collapsed={collapsed} />;
}
