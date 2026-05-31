'use client';

import { useTheme } from '@/components/themes/theme-provider';
import {
  CANVAS_COLOR_THEMES,
  applyCanvasTheme,
  loadCanvasTheme,
  saveCanvasTheme,
  type CanvasColorTheme,
} from '@/lib/studio/themes';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Palette } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeSelector() {
  const initialTheme = CANVAS_COLOR_THEMES[0];
  if (!initialTheme) {
    throw new Error('No canvas themes configured');
  }

  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] =
    useState<CanvasColorTheme>(initialTheme);
  const { theme: mode } = useTheme();

  // Load saved theme on mount
  useEffect(() => {
    const saved = loadCanvasTheme();
    if (saved) {
      setSelectedTheme(saved);
      applyCanvasTheme(saved);
    }
  }, []);

  // Re-apply theme when light/dark mode changes
  useEffect(() => {
    if (mode) {
      applyCanvasTheme(selectedTheme);
    }
  }, [mode, selectedTheme]);

  const handleThemeSelect = (theme: CanvasColorTheme) => {
    setSelectedTheme(theme);
    applyCanvasTheme(theme);
    saveCanvasTheme(theme);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 hover:bg-accent rounded-md transition-colors"
        title="Change color theme"
      >
        <Palette size={18} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Theme Selector Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl"
            >
              <div className="bg-card border border-border rounded-lg shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Choose a Color Theme
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Select a color theme for your application
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {CANVAS_COLOR_THEMES.map(theme => (
                    <button
                      key={theme.name}
                      onClick={() => handleThemeSelect(theme)}
                      className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                        selectedTheme.name === theme.name
                          ? 'border-primary bg-accent'
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      {selectedTheme.name === theme.name && (
                        <div className="absolute top-2 right-2">
                          <Check size={16} className="text-primary" />
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="font-medium text-sm">{theme.name}</div>
                        <div className="flex gap-1">
                          <div
                            className="w-8 h-8 rounded-md border border-border"
                            style={{
                              backgroundColor: theme.colors.light.primary,
                            }}
                            title="Primary"
                          />
                          <div
                            className="w-8 h-8 rounded-md border border-border"
                            style={{
                              backgroundColor: theme.colors.light.accent,
                            }}
                            title="Accent"
                          />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Theme changes apply immediately
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
