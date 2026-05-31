'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type Theme = 'light' | 'dark';
type ThemeInput = Theme | 'system';

interface ThemeProviderProps {
  attribute?: 'class' | 'data-theme';
  children: ReactNode;
  defaultTheme?: ThemeInput;
  enableSystem?: boolean;
}

interface ThemeContextValue {
  setTheme: (theme: ThemeInput) => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'theme';
const VALID_THEMES: ThemeInput[] = ['light', 'dark', 'system'];

const getSystemTheme = (): Theme =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

/**
 * Validates and sanitizes the stored theme value
 * Returns null if invalid to trigger fallback to defaultTheme
 */
const getValidatedStoredTheme = (): ThemeInput | null => {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    // No stored value is valid - will use defaultTheme
    if (!stored) return null;

    // Check if it's a valid theme value
    if (VALID_THEMES.includes(stored as ThemeInput)) {
      return stored as ThemeInput;
    }

    // Invalid value found - clean it up
    console.warn(
      `[ThemeProvider] Invalid theme value "${stored}" found in localStorage. Cleaning up...`,
    );
    localStorage.removeItem(STORAGE_KEY);
    return null;
  } catch (error) {
    // localStorage might be unavailable (private browsing, etc.)
    console.error('[ThemeProvider] Error accessing localStorage:', error);
    return null;
  }
};

const applyTheme = (
  theme: Theme,
  attribute: ThemeProviderProps['attribute'] = 'class',
) => {
  if (typeof document === 'undefined') return;

  if (attribute === 'class') {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  } else if (attribute === 'data-theme') {
    document.documentElement.setAttribute('data-theme', theme);
  }

  document.documentElement.setAttribute('data-mode', theme);
};

export function ThemeProvider({
  attribute = 'class',
  children,
  defaultTheme = 'light',
  enableSystem = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Get validated stored theme (null if invalid/missing)
    const stored = getValidatedStoredTheme();

    // Determine initial theme with validation
    const initialTheme = stored
      ? stored === 'system' && enableSystem
        ? getSystemTheme()
        : (stored as Theme)
      : defaultTheme === 'system' && enableSystem
      ? getSystemTheme()
      : (defaultTheme as Theme);

    setThemeState(initialTheme);
    applyTheme(initialTheme, attribute);
    setIsMounted(true);

    // Only save to localStorage if we have a valid default and nothing was stored
    if (!stored && defaultTheme) {
      try {
        localStorage.setItem(STORAGE_KEY, defaultTheme);
      } catch (error) {
        console.error(
          '[ThemeProvider] Error saving theme to localStorage:',
          error,
        );
      }
    }

    if (enableSystem) {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const storedTheme = localStorage.getItem(STORAGE_KEY);
        if (storedTheme === 'system') {
          const systemTheme = getSystemTheme();
          setThemeState(systemTheme);
          applyTheme(systemTheme, attribute);
        }
      };
      media.addEventListener('change', handleChange);
      return () => media.removeEventListener('change', handleChange);
    }
  }, [attribute, defaultTheme, enableSystem]);

  const setTheme = useCallback(
    (nextTheme: ThemeInput) => {
      // Validate input
      if (!VALID_THEMES.includes(nextTheme)) {
        console.warn(
          `[ThemeProvider] Invalid theme value "${nextTheme}". Using "light" instead.`,
        );
        nextTheme = 'light';
      }

      if (nextTheme === 'system') {
        const systemTheme = enableSystem ? getSystemTheme() : 'light';
        setThemeState(systemTheme);
        try {
          localStorage.setItem(STORAGE_KEY, 'system');
        } catch (error) {
          console.error(
            '[ThemeProvider] Error saving theme to localStorage:',
            error,
          );
        }
        applyTheme(systemTheme, attribute);
        return;
      }

      const resolved = nextTheme ?? 'light';
      setThemeState(resolved);
      try {
        localStorage.setItem(STORAGE_KEY, resolved);
      } catch (error) {
        console.error(
          '[ThemeProvider] Error saving theme to localStorage:',
          error,
        );
      }
      applyTheme(resolved, attribute);
    },
    [attribute, enableSystem],
  );

  const value = useMemo(
    () => ({
      setTheme,
      theme,
    }),
    [setTheme, theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
