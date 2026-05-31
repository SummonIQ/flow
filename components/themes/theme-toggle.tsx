'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from './theme-provider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-8 h-8" />;
  }

  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      aria-label="Toggle theme"
      className="w-8 h-8 flex items-center justify-center group cursor-pointer relative"
      onClick={toggleTheme}
    >
              <AnimatePresence initial={false} mode="wait">
                {!isDark ? (
                  <motion.div
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 180, scale: 0 }}
                    initial={{ opacity: 0, rotate: -180, scale: 0 }}
                    key="sun"
                    style={{
                      filter: 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.9)) drop-shadow(0 0 2px rgba(251, 191, 36, 0.8))',
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <Sun className="w-5 h-5 text-amber-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 180, scale: 0 }}
                    initial={{ opacity: 0, rotate: -180, scale: 0 }}
                    key="moon"
                    style={{
                      filter: 'drop-shadow(0 0 10px rgba(37, 99, 235, 1)) drop-shadow(0 0 6px rgba(59, 130, 246, 1)) drop-shadow(0 0 3px rgba(96, 165, 250, 0.9))',
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <Moon className="w-4 h-4 text-white" />
                  </motion.div>

                )}
      </AnimatePresence>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
