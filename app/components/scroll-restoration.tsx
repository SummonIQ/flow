'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

const SCROLL_KEY = 'applab-scroll-positions';
const SCROLL_CONTAINER_ID = 'main-scroll-container';
const COMPONENTS_SCROLL_CONTAINER_ID = 'components-scroll-container';
const SCROLL_TTL_MS = 1000 * 60 * 60 * 6;
const SCROLL_MAX_ENTRIES = 50;

type StoredScrollPosition = {
  position: number;
  updatedAt: number;
};

function normalizePosition(value: unknown): StoredScrollPosition | null {
  if (typeof value === 'number') {
    return { position: value, updatedAt: 0 };
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { position?: unknown }).position === 'number' &&
    typeof (value as { updatedAt?: unknown }).updatedAt === 'number'
  ) {
    const v = value as StoredScrollPosition;
    return { position: v.position, updatedAt: v.updatedAt };
  }
  return null;
}

function getSavedScrollTop(
  positions: Record<string, unknown>,
  path: string,
): number | null {
  const normalized = normalizePosition(positions[path]);
  return normalized?.position ?? null;
}

function getScrollPositions(): Record<string, StoredScrollPosition> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = sessionStorage.getItem(SCROLL_KEY);
    const parsed = stored
      ? (JSON.parse(stored) as Record<string, unknown>)
      : {};
    const now = Date.now();
    const normalized: Record<string, StoredScrollPosition> = {};

    for (const [key, value] of Object.entries(parsed)) {
      const v = normalizePosition(value);
      if (!v) continue;
      if (v.updatedAt > 0 && now - v.updatedAt > SCROLL_TTL_MS) continue;
      normalized[key] = v;
    }

    const entries = Object.entries(normalized);
    if (entries.length > SCROLL_MAX_ENTRIES) {
      entries
        .sort((a, b) => (a[1].updatedAt || 0) - (b[1].updatedAt || 0))
        .slice(0, entries.length - SCROLL_MAX_ENTRIES)
        .forEach(([key]) => {
          delete normalized[key];
        });
    }

    sessionStorage.setItem(SCROLL_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    return {};
  }
}

function saveScrollPosition(path: string, position: number) {
  if (typeof window === 'undefined') return;
  try {
    const positions = getScrollPositions();
    positions[path] = { position, updatedAt: Date.now() };
    sessionStorage.setItem(SCROLL_KEY, JSON.stringify(positions));
  } catch {
    // Ignore storage errors
  }
}

function getScrollContainerIdForPath(pathname: string): string {
  if (pathname.startsWith('/components')) return COMPONENTS_SCROLL_CONTAINER_ID;
  return SCROLL_CONTAINER_ID;
}

export function ScrollRestoration() {
  const pathname = usePathname();
  const isBackNavRef = useRef(false);
  const prevPathRef = useRef<string | null>(null);
  const ignoreScrollRef = useRef(false);

  // Listen for back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      isBackNavRef.current = true;
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Track scroll position continuously
  useEffect(() => {
    const containerId = getScrollContainerIdForPath(pathname);
    const container = document.getElementById(containerId);
    if (!container) return;

    const handleScroll = () => {
      // Don't save when we just programmatically scrolled
      if (ignoreScrollRef.current) return;
      saveScrollPosition(pathname, container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // Handle navigation
  useEffect(() => {
    // Skip first render
    if (prevPathRef.current === null) {
      prevPathRef.current = pathname;
      return;
    }

    // Same path, skip
    if (prevPathRef.current === pathname) return;

    const leavingContainerId = getScrollContainerIdForPath(prevPathRef.current);
    const arrivingContainerId = getScrollContainerIdForPath(pathname);
    const leavingContainer = document.getElementById(leavingContainerId);
    const arrivingContainer = document.getElementById(arrivingContainerId);
    const leavingPath = prevPathRef.current;
    prevPathRef.current = pathname;

    // Save the scroll position of the page we're LEAVING
    if (leavingContainer) {
      saveScrollPosition(leavingPath, leavingContainer.scrollTop);
    }

    if (isBackNavRef.current) {
      // BACK navigation - restore scroll position
      isBackNavRef.current = false;

      const positions = getScrollPositions();
      const savedPosition = getSavedScrollTop(positions, pathname);

      if (savedPosition != null && savedPosition > 0) {
        let attempts = 0;
        const maxAttempts = 40;

        const tryRestore = () => {
          const c = document.getElementById(arrivingContainerId);
          attempts++;

          if (!c) {
            if (attempts < maxAttempts) setTimeout(tryRestore, 50);
            return;
          }

          const canScroll = c.scrollHeight - c.clientHeight >= savedPosition;

          if (canScroll || attempts >= maxAttempts) {
            ignoreScrollRef.current = true;
            c.scrollTo(0, savedPosition);
            setTimeout(() => {
              ignoreScrollRef.current = false;
            }, 100);
          } else {
            setTimeout(tryRestore, 50);
          }
        };

        tryRestore();
      }
    } else {
      const positions = getScrollPositions();
      const savedPosition = getSavedScrollTop(positions, pathname);
      const isReturningToParent = leavingPath.startsWith(`${pathname}/`);

      if (savedPosition != null && savedPosition > 0 && isReturningToParent) {
        let attempts = 0;
        const maxAttempts = 40;

        const tryRestore = () => {
          const c = document.getElementById(arrivingContainerId);
          attempts++;

          if (!c) {
            if (attempts < maxAttempts) setTimeout(tryRestore, 50);
            return;
          }

          const canScroll = c.scrollHeight - c.clientHeight >= savedPosition;

          if (canScroll || attempts >= maxAttempts) {
            ignoreScrollRef.current = true;
            c.scrollTo(0, savedPosition);
            setTimeout(() => {
              ignoreScrollRef.current = false;
            }, 100);
          } else {
            setTimeout(tryRestore, 50);
          }
        };

        tryRestore();
        return;
      }

      // FORWARD navigation - scroll to top
      if (arrivingContainer) {
        ignoreScrollRef.current = true;
        arrivingContainer.scrollTo(0, 0);
        setTimeout(() => {
          ignoreScrollRef.current = false;
        }, 100);
      }
    }
  }, [pathname]);

  return null;
}
