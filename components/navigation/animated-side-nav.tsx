'use client';

import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export interface AnimatedSideNavItem {
  href: string;
  id?: string;
  label: string;
}

export interface AnimatedSideNavCategory {
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
  id: string;
  items: AnimatedSideNavItem[];
  label: string;
}

export interface AnimatedSideNavSection {
  href: string;
  icon: React.ReactNode;
  label: string;
  subCategories?: AnimatedSideNavCategory[];
  subItems?: AnimatedSideNavItem[];
}

interface AnimatedSideNavProps {
  sections: AnimatedSideNavSection[];
  onLinkClick?: () => void;
  collapsed?: boolean;
}

interface LineStyle {
  activeCenter: number | null;
  dottedHeight: number;
  iconOffset: number;
  left: number;
  solidHeight: number;
}

interface NavItemProps {
  expandedSections: string[];
  isExpanded: boolean;
  item: AnimatedSideNavSection;
  pathname: string;
  onLinkClick?: () => void;
  toggleSection: (href: string) => void;
  isActiveSection: boolean;
}

function AnimatedNavItem({
  expandedSections,
  isExpanded,
  item,
  pathname,
  onLinkClick,
  toggleSection,
  isActiveSection,
}: NavItemProps) {
  const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
  const hasSubCategories = Boolean(
    item.subCategories && item.subCategories.length > 0,
  );
  const hasChildren = hasSubItems || hasSubCategories;
  const isActive = isActiveSection;

  const iconWrapperRef = useRef<HTMLSpanElement>(null);
  const childContainerRef = useRef<HTMLDivElement>(null);

  const [lineStyle, setLineStyle] = useState<LineStyle>({
    activeCenter: null,
    dottedHeight: 0,
    iconOffset: 0,
    left: 24,
    solidHeight: 0,
  });

  const activeChildPath = useMemo(() => {
    if (!hasChildren) return null;

    if (hasSubItems) {
      const match = item.subItems!.find(sub => pathname === sub.href);
      if (match) return match.href;
    }

    if (hasSubCategories) {
      for (const subCat of item.subCategories!) {
        const match = subCat.items.find(catItem =>
          pathname.startsWith(catItem.href),
        );
        if (match) return match.href;
      }
    }

    return null;
  }, [hasChildren, hasSubCategories, hasSubItems, item, pathname]);

  const updateLineMetrics = useCallback(() => {
    if (!hasChildren || !isExpanded) return;

    const container = childContainerRef.current;
    const iconEl = iconWrapperRef.current;

    if (!container || !iconEl) return;

    const containerRect = container.getBoundingClientRect();
    const iconRect = iconEl.getBoundingClientRect();

    const iconCenterY = iconRect.top + iconRect.height / 2;
    const iconCenterX = iconRect.left + iconRect.width / 2;
    const iconOffset = iconCenterY - (containerRect.top - 32);

    let solidHeight = 0;
    let activeCenter: number | null = null;

    if (activeChildPath) {
      const activeEl = container.querySelector<HTMLElement>(
        `[data-nav-path="${activeChildPath}"]`,
      );

      if (activeEl) {
        const activeRect = activeEl.getBoundingClientRect();
        const activeCenterY = activeRect.top + activeRect.height / 2;
        solidHeight = Math.max(activeCenterY - (iconCenterY + 32), 0);
        activeCenter = activeCenterY - containerRect.top;
      }
    }

    const containerHeight = container.offsetHeight;
    const dottedHeight = containerHeight + Math.max(-iconOffset, 0) - 28;

    setLineStyle({
      activeCenter,
      dottedHeight,
      iconOffset,
      left: iconCenterX - containerRect.left,
      solidHeight,
    });
  }, [activeChildPath, hasChildren, isExpanded]);

  useLayoutEffect(() => {
    updateLineMetrics();
  }, [updateLineMetrics]);

  useEffect(() => {
    if (!hasChildren || !isExpanded) return;

    const handleResize = () => {
      updateLineMetrics();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hasChildren, isExpanded, updateLineMetrics]);

  return (
    <div className="relative">
      <div
        className={cn(
          'group flex items-center rounded-lg pr-1.5 text-sm font-medium transition-all',
          isActive
            ? 'text-primary'
            : 'text-foreground hover:text-primary hover:bg-muted',
        )}
      >
        <Link
          className="flex min-w-0 flex-1 items-center gap-0.5 px-1 py-1"
          href={item.href}
          onClick={onLinkClick}
        >
          <span
            className="relative flex h-6 w-6 shrink-0 items-center justify-center [&>svg]:w-4 [&>svg]:h-4"
            ref={iconWrapperRef}
          >
            {item.icon}
          </span>
          <span className="flex-1 truncate text-left">{item.label}</span>
        </Link>
        {hasChildren && (
          <button
            aria-label={
              isExpanded ? `Collapse ${item.label}` : `Expand ${item.label}`
            }
            className={cn(
              'shrink-0 rounded-full p-0.5 transition-all duration-300',
              isActive
                ? 'text-primary hover:text-primary/80 opacity-100'
                : 'text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100',
            )}
            onClick={() => toggleSection(item.href)}
            type="button"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 rotate-0 transform transition-all duration-300" />
            ) : (
              <ChevronDown className="h-4 w-4 translate-x-px -rotate-90 transform transition-all duration-300" />
            )}
          </button>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="relative mt-2 space-y-1 pb-2" ref={childContainerRef}>
          {/* Dotted vertical line */}
          <span
            aria-hidden
            className="pointer-events-none absolute border-l-2 border-dotted border-primary/35"
            style={{
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent 0%, black 24px, black 100%)',
              height: `${lineStyle.dottedHeight + 5.5}px`,
              left: `${lineStyle.left - 1}px`,
              maskImage:
                'linear-gradient(to bottom, transparent 0%, black 24px, black 100%)',
              top: `${lineStyle.iconOffset - 3}px`,
            }}
          />
          {/* Solid line to active item */}
          {lineStyle.solidHeight > 0 && (
            <span
              aria-hidden
              className="pointer-events-none absolute border-l-2 border-primary/80 transition-all duration-500"
              style={{
                WebkitMaskImage:
                  'linear-gradient(to bottom, transparent 0%, black 12px, black 100%)',
                height: `${lineStyle.solidHeight ?? 1}px`,
                left: `${lineStyle.left - 1}px`,
                maskImage:
                  'linear-gradient(to bottom, transparent 0%, black 12px, black 100%)',
                top: `${lineStyle.iconOffset}px`,
              }}
            />
          )}
          {/* Horizontal line to active item */}
          {lineStyle.activeCenter !== null && (
            <span
              aria-hidden
              className="pointer-events-none absolute h-[2px] bg-primary transition-all duration-500"
              style={{
                left: `${lineStyle.left - 0.5}px`,
                top: `${lineStyle.activeCenter}px`,
                transform: 'translateY(-50%)',
                width: '14px',
              }}
            />
          )}

          {hasSubItems && (
            <div className="relative space-y-1">
              {item.subItems!.map(subItem => {
                // Check if active - exact match OR preview page for this item
                const slug = subItem.href.split('/').pop();
                const isSubActive =
                  pathname === subItem.href ||
                  (pathname.includes('/preview/') &&
                    pathname.endsWith(`/${slug}`));

                return (
                  <div className="relative" key={subItem.href}>
                    <span
                      className="pointer-events-none absolute border-t-2 border-dotted border-primary/40"
                      style={{
                        left: `${lineStyle.left + 3}px`,
                        top: 16,
                        transform: 'translateY(-50%)',
                        width: 12,
                      }}
                    />
                    <Link
                      className={cn(
                        'relative block rounded-lg py-1.5 pr-3 pl-11 text-sm transition-all',
                        isSubActive
                          ? 'text-primary font-semibold'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                      data-nav-path={subItem.href}
                      href={subItem.href}
                      onClick={onLinkClick}
                    >
                      {subItem.label}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {hasSubCategories && (
            <div className="relative space-y-1">
              {item.subCategories!.map(subCat => {
                const subCatKey = `${item.href}-${subCat.id}`;
                const isSubCatExpanded = expandedSections.includes(subCatKey);

                return (
                  <div className="relative" key={subCat.id}>
                    <button
                      className={cn(
                        'relative flex items-center gap-1.5 rounded-lg py-1.5 pr-3 pl-9 text-[13px] transition-all w-full text-left',
                        isSubCatExpanded
                          ? 'font-semibold'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                      onClick={() => toggleSection(subCatKey)}
                      type="button"
                    >
                      {subCat.icon && (
                        <subCat.icon className="w-4 h-4 shrink-0" />
                      )}
                      <span className="flex-1">{subCat.label}</span>
                    </button>

                    {isSubCatExpanded && (
                      <div className="relative space-y-1 pl-6">
                        {subCat.items.map(catItem => {
                          const isCatItemActive = pathname.startsWith(
                            catItem.href,
                          );

                          return (
                            <div className="relative" key={catItem.href}>
                              <span
                                className="pointer-events-none absolute border-t-2 border-dotted border-primary/50"
                                style={{
                                  left: -1,
                                  top: 16,
                                  transform: 'translateY(-50%)',
                                  width: 20,
                                }}
                              />
                              <Link
                                className={cn(
                                  'relative block rounded-lg py-1.5 pr-3 pl-[32px] text-sm transition-all',
                                  isCatItemActive
                                    ? 'text-primary font-semibold'
                                    : 'text-muted-foreground hover:text-foreground',
                                )}
                                data-nav-path={catItem.href}
                                href={catItem.href}
                                onClick={onLinkClick}
                              >
                                {catItem.label}
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AnimatedSideNav({
  sections,
  onLinkClick,
  collapsed = false,
}: AnimatedSideNavProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Calculate the most specific active section
  const activeSection = useMemo(() => {
    const matchingSections = sections.filter(item =>
      pathname.startsWith(item.href),
    );

    return matchingSections.reduce(
      (longest, current) => {
        if (!longest || current.href.length > longest.href.length) {
          return current;
        }
        return longest;
      },
      null as AnimatedSideNavSection | null,
    );
  }, [pathname, sections]);

  const toggleSection = (href: string) => {
    const isTopLevel = sections.some(item => item.href === href);

    if (isTopLevel) {
      setExpandedSections(prev => {
        const isCurrentlyExpanded = prev.includes(href);

        // Check if this section contains the active page
        const isActiveSection = pathname.startsWith(href);

        if (isCurrentlyExpanded) {
          // Don't collapse if it contains the active page
          if (isActiveSection) {
            return prev;
          }
          return prev.filter(h => !h.startsWith(href) && h !== href);
        } else {
          const allTopLevelHrefs = sections.map(item => item.href);
          const otherTopLevelHrefs = allTopLevelHrefs.filter(tl => tl !== href);
          return [
            href,
            ...prev.filter(h => {
              return !otherTopLevelHrefs.some(
                tl => h === tl || h.startsWith(tl + '-'),
              );
            }),
          ];
        }
      });
    } else {
      // For sub-categories, check if they contain the active item
      const parentSection = sections.find(section =>
        section.subCategories?.some(
          subCat => `${section.href}-${subCat.id}` === href,
        ),
      );

      if (parentSection) {
        const subCat = parentSection.subCategories?.find(
          sc => `${parentSection.href}-${sc.id}` === href,
        );

        const hasActiveItem = subCat?.items.some(item =>
          pathname.startsWith(item.href),
        );

        setExpandedSections(prev => {
          // Don't collapse if it contains the active item
          if (hasActiveItem && prev.includes(href)) {
            return prev;
          }
          return prev.includes(href)
            ? prev.filter(h => h !== href)
            : [...prev, href];
        });
      } else {
        setExpandedSections(prev =>
          prev.includes(href) ? prev.filter(h => h !== href) : [...prev, href],
        );
      }
    }
  };

  useEffect(() => {
    if (activeSection) {
      setExpandedSections(prev => {
        // Always include the current section
        if (!prev.includes(activeSection.href)) {
          const allTopLevelHrefs = sections.map(item => item.href);
          const otherTopLevelHrefs = allTopLevelHrefs.filter(
            tl => tl !== activeSection.href,
          );

          // Remove other top-level sections but keep the current one
          const filtered = prev.filter(h => {
            return !otherTopLevelHrefs.some(
              tl => h === tl || h.startsWith(tl + '-'),
            );
          });

          return [activeSection.href, ...filtered];
        }

        // Also expand any sub-categories that contain the active item
        if (activeSection.subCategories) {
          const activeSubCat = activeSection.subCategories.find(subCat =>
            subCat.items.some(item => pathname.startsWith(item.href)),
          );

          if (activeSubCat) {
            const subCatKey = `${activeSection.href}-${activeSubCat.id}`;
            if (!prev.includes(subCatKey)) {
              return [...prev, subCatKey];
            }
          }
        }

        return prev;
      });
    }
  }, [activeSection, pathname, sections]);

  if (collapsed) {
    return (
      <nav className="space-y-1">
        {sections.map(item => {
          const isActive = activeSection?.href === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-center rounded-lg p-2 transition-all',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
              title={item.label}
              onClick={onLinkClick}
            >
              <span className="[&>svg]:w-5 [&>svg]:h-5">{item.icon}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="space-y-1.5">
      {sections.map(item => (
        <AnimatedNavItem
          expandedSections={expandedSections}
          isExpanded={expandedSections.includes(item.href)}
          item={item}
          key={item.href}
          pathname={pathname}
          onLinkClick={onLinkClick}
          toggleSection={toggleSection}
          isActiveSection={activeSection?.href === item.href}
        />
      ))}
    </nav>
  );
}
