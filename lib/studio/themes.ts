export interface BaseTheme {
  name: string;
  baseColor: "neutral" | "stone" | "zinc" | "gray" | "slate" | "sky";
  preview: {
    light: string;
    dark: string;
  };
}

export interface CanvasColorTheme {
  name: string;
  colors: {
    light: {
      primary: string;
      primaryForeground: string;
      accent: string;
      accentForeground: string;
      secondary: string;
      secondaryForeground: string;
    };
    dark: {
      primary: string;
      primaryForeground: string;
      accent: string;
      accentForeground: string;
      secondary: string;
      secondaryForeground: string;
    };
  };
}

export const BASE_THEMES: BaseTheme[] = [
  {
    name: "Neutral",
    baseColor: "neutral",
    preview: {
      light: "oklch(0.205 0 0)",
      dark: "oklch(0.922 0 0)",
    },
  },
  {
    name: "Zinc",
    baseColor: "zinc",
    preview: {
      light: "oklch(0.24 0.01 247.9)",
      dark: "oklch(0.898 0.004 247.9)",
    },
  },
  {
    name: "Slate",
    baseColor: "slate",
    preview: {
      light: "oklch(0.213 0.027 256)",
      dark: "oklch(0.898 0.005 256)",
    },
  },
  {
    name: "Stone",
    baseColor: "stone",
    preview: {
      light: "oklch(0.282 0.018 56.3)",
      dark: "oklch(0.976 0.001 106.4)",
    },
  },
  {
    name: "Gray",
    baseColor: "gray",
    preview: {
      light: "oklch(0.235 0.014 256)",
      dark: "oklch(0.96 0.003 256)",
    },
  },
  {
    name: "Sky",
    baseColor: "sky",
    preview: {
      light: "oklch(0.46 0.11 240)",
      dark: "oklch(0.92 0.03 240)",
    },
  },
];

export const CANVAS_COLOR_THEMES: CanvasColorTheme[] = [
  {
    name: "Blue",
    colors: {
      light: {
        primary: "oklch(0.488 0.243 264.376)", // Blue
        primaryForeground: "oklch(0.985 0 0)",
        accent: "oklch(0.645 0.246 16.439)", // Complementary Orange
        accentForeground: "oklch(0.985 0 0)",
        secondary: "oklch(0.6 0.118 162.48)", // Analogous Cyan
        secondaryForeground: "oklch(0.985 0 0)",
      },
      dark: {
        primary: "oklch(0.696 0.17 264.376)",
        primaryForeground: "oklch(0.145 0.054 264.376)",
        accent: "oklch(0.828 0.189 16.439)",
        accentForeground: "oklch(0.145 0.095 16.439)",
        secondary: "oklch(0.696 0.17 162.48)",
        secondaryForeground: "oklch(0.145 0.068 162.48)",
      },
    },
  },
  {
    name: "Green",
    colors: {
      light: {
        primary: "oklch(0.6 0.118 162.48)", // Green
        primaryForeground: "oklch(0.985 0 0)",
        accent: "oklch(0.627 0.265 303.9)", // Complementary Magenta
        accentForeground: "oklch(0.985 0 0)",
        secondary: "oklch(0.645 0.246 16.439)", // Analogous Yellow-Orange
        secondaryForeground: "oklch(0.985 0 0)",
      },
      dark: {
        primary: "oklch(0.696 0.17 162.48)",
        primaryForeground: "oklch(0.145 0.068 162.48)",
        accent: "oklch(0.745 0.246 303.9)",
        accentForeground: "oklch(0.145 0.123 303.9)",
        secondary: "oklch(0.828 0.189 84.429)",
        secondaryForeground: "oklch(0.145 0.095 84.429)",
      },
    },
  },
  {
    name: "Orange",
    colors: {
      light: {
        primary: "oklch(0.645 0.246 16.439)", // Orange
        primaryForeground: "oklch(0.985 0 0)",
        accent: "oklch(0.488 0.243 264.376)", // Complementary Blue
        accentForeground: "oklch(0.985 0 0)",
        secondary: "oklch(0.627 0.265 343.9)", // Analogous Red-Pink
        secondaryForeground: "oklch(0.985 0 0)",
      },
      dark: {
        primary: "oklch(0.828 0.189 84.429)",
        primaryForeground: "oklch(0.145 0.095 84.429)",
        accent: "oklch(0.696 0.17 264.376)",
        accentForeground: "oklch(0.145 0.054 264.376)",
        secondary: "oklch(0.745 0.246 343.9)",
        secondaryForeground: "oklch(0.145 0.123 343.9)",
      },
    },
  },
  {
    name: "Rose",
    colors: {
      light: {
        primary: "oklch(0.627 0.265 303.9)", // Rose/Magenta
        primaryForeground: "oklch(0.985 0 0)",
        accent: "oklch(0.6 0.118 162.48)", // Complementary Green
        accentForeground: "oklch(0.985 0 0)",
        secondary: "oklch(0.488 0.243 264.376)", // Analogous Blue-Purple
        secondaryForeground: "oklch(0.985 0 0)",
      },
      dark: {
        primary: "oklch(0.745 0.246 303.9)",
        primaryForeground: "oklch(0.145 0.123 303.9)",
        accent: "oklch(0.696 0.17 162.48)",
        accentForeground: "oklch(0.145 0.068 162.48)",
        secondary: "oklch(0.696 0.17 264.376)",
        secondaryForeground: "oklch(0.145 0.054 264.376)",
      },
    },
  },
];

export function applyCanvasTheme(theme: CanvasColorTheme) {
  // Create or update a style element for canvas theme overrides
  let styleEl = document.getElementById(
    "canvas-theme-override"
  ) as HTMLStyleElement;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "canvas-theme-override";
    document.head.appendChild(styleEl);
  }

  // Apply canvas-specific colors that only affect canvas elements
  const lightColors = theme.colors.light;
  const darkColors = theme.colors.dark;

  styleEl.textContent = `
    :root {
      --canvas-primary: ${lightColors.primary};
      --canvas-primary-foreground: ${lightColors.primaryForeground};
      --canvas-accent: ${lightColors.accent};
      --canvas-accent-foreground: ${lightColors.accentForeground};
      --canvas-secondary: ${lightColors.secondary};
      --canvas-secondary-foreground: ${lightColors.secondaryForeground};
    }
    
    .dark {
      --canvas-primary: ${darkColors.primary};
      --canvas-primary-foreground: ${darkColors.primaryForeground};
      --canvas-accent: ${darkColors.accent};
      --canvas-accent-foreground: ${darkColors.accentForeground};
      --canvas-secondary: ${darkColors.secondary};
      --canvas-secondary-foreground: ${darkColors.secondaryForeground};
    }
  `;
}

// Store the selected canvas theme in localStorage
export function saveCanvasTheme(theme: CanvasColorTheme) {
  localStorage.setItem("selectedCanvasTheme", JSON.stringify(theme));
}

export function loadCanvasTheme(): CanvasColorTheme | null {
  const stored = localStorage.getItem("selectedCanvasTheme");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

// Apply base theme (changes the root color palette)
export function applyBaseTheme(theme: BaseTheme) {
  if (typeof document === "undefined") return;

  // Update the data-base-theme attribute on the root element
  document.documentElement.setAttribute("data-base-theme", theme.baseColor);

  // Create or update a style element for base theme
  let styleEl = document.getElementById(
    "base-theme-override"
  ) as HTMLStyleElement;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "base-theme-override";
    document.head.appendChild(styleEl);
  }

  // Color mappings for each base theme
  const themeColors: Record<
    string,
    { light: Record<string, string>; dark: Record<string, string> }
  > = {
    neutral: {
      light: {
        primary: "oklch(0.205 0 0)",
        "primary-foreground": "oklch(0.985 0 0)",
        secondary: "oklch(0.97 0 0)",
        "secondary-foreground": "oklch(0.205 0 0)",
        muted: "oklch(0.97 0 0)",
        "muted-foreground": "oklch(0.556 0 0)",
        accent: "oklch(0.97 0 0)",
        "accent-foreground": "oklch(0.205 0 0)",
        border: "oklch(0.922 0 0)",
        input: "oklch(0.922 0 0)",
        ring: "oklch(0.708 0 0)",
      },
      dark: {
        primary: "oklch(0.922 0 0)",
        "primary-foreground": "oklch(0.205 0 0)",
        secondary: "oklch(0.269 0 0)",
        "secondary-foreground": "oklch(0.985 0 0)",
        muted: "oklch(0.269 0 0)",
        "muted-foreground": "oklch(0.708 0 0)",
        accent: "oklch(0.269 0 0)",
        "accent-foreground": "oklch(0.985 0 0)",
        border: "oklch(1 0 0 / 10%)",
        input: "oklch(1 0 0 / 15%)",
        ring: "oklch(0.556 0 0)",
      },
    },
    zinc: {
      light: {
        primary: "oklch(0.24 0.01 247.9)",
        "primary-foreground": "oklch(0.985 0 0)",
        secondary: "oklch(0.965 0.002 247.9)",
        "secondary-foreground": "oklch(0.24 0.01 247.9)",
        muted: "oklch(0.965 0.002 247.9)",
        "muted-foreground": "oklch(0.556 0.015 247.9)",
        accent: "oklch(0.965 0.002 247.9)",
        "accent-foreground": "oklch(0.24 0.01 247.9)",
        border: "oklch(0.898 0.004 247.9)",
        input: "oklch(0.898 0.004 247.9)",
        ring: "oklch(0.708 0.012 247.9)",
      },
      dark: {
        primary: "oklch(0.898 0.004 247.9)",
        "primary-foreground": "oklch(0.24 0.01 247.9)",
        secondary: "oklch(0.282 0.013 247.9)",
        "secondary-foreground": "oklch(0.985 0 0)",
        muted: "oklch(0.282 0.013 247.9)",
        "muted-foreground": "oklch(0.708 0.012 247.9)",
        accent: "oklch(0.282 0.013 247.9)",
        "accent-foreground": "oklch(0.985 0 0)",
        border: "oklch(1 0 0 / 10%)",
        input: "oklch(1 0 0 / 15%)",
        ring: "oklch(0.556 0.015 247.9)",
      },
    },
    slate: {
      light: {
        primary: "oklch(0.213 0.027 256)",
        "primary-foreground": "oklch(0.985 0 0)",
        secondary: "oklch(0.965 0.007 256)",
        "secondary-foreground": "oklch(0.213 0.027 256)",
        muted: "oklch(0.965 0.007 256)",
        "muted-foreground": "oklch(0.556 0.031 256)",
        accent: "oklch(0.965 0.007 256)",
        "accent-foreground": "oklch(0.213 0.027 256)",
        border: "oklch(0.898 0.005 256)",
        input: "oklch(0.898 0.005 256)",
        ring: "oklch(0.708 0.022 256)",
      },
      dark: {
        primary: "oklch(0.898 0.005 256)",
        "primary-foreground": "oklch(0.213 0.027 256)",
        secondary: "oklch(0.282 0.024 256)",
        "secondary-foreground": "oklch(0.985 0 0)",
        muted: "oklch(0.282 0.024 256)",
        "muted-foreground": "oklch(0.708 0.022 256)",
        accent: "oklch(0.282 0.024 256)",
        "accent-foreground": "oklch(0.985 0 0)",
        border: "oklch(1 0 0 / 10%)",
        input: "oklch(1 0 0 / 15%)",
        ring: "oklch(0.556 0.031 256)",
      },
    },
    stone: {
      light: {
        primary: "oklch(0.282 0.018 56.3)",
        "primary-foreground": "oklch(0.985 0 0)",
        secondary: "oklch(0.964 0.003 106.4)",
        "secondary-foreground": "oklch(0.282 0.018 56.3)",
        muted: "oklch(0.964 0.003 106.4)",
        "muted-foreground": "oklch(0.556 0.019 56.3)",
        accent: "oklch(0.964 0.003 106.4)",
        "accent-foreground": "oklch(0.282 0.018 56.3)",
        border: "oklch(0.898 0.002 106.4)",
        input: "oklch(0.898 0.002 106.4)",
        ring: "oklch(0.708 0.015 56.3)",
      },
      dark: {
        primary: "oklch(0.976 0.001 106.4)",
        "primary-foreground": "oklch(0.282 0.018 56.3)",
        secondary: "oklch(0.282 0.018 56.3)",
        "secondary-foreground": "oklch(0.985 0 0)",
        muted: "oklch(0.282 0.018 56.3)",
        "muted-foreground": "oklch(0.708 0.015 56.3)",
        accent: "oklch(0.282 0.018 56.3)",
        "accent-foreground": "oklch(0.985 0 0)",
        border: "oklch(1 0 0 / 10%)",
        input: "oklch(1 0 0 / 15%)",
        ring: "oklch(0.556 0.019 56.3)",
      },
    },
    gray: {
      light: {
        primary: "oklch(0.235 0.014 256)",
        "primary-foreground": "oklch(0.985 0 0)",
        secondary: "oklch(0.965 0.004 256)",
        "secondary-foreground": "oklch(0.235 0.014 256)",
        muted: "oklch(0.965 0.004 256)",
        "muted-foreground": "oklch(0.556 0.016 256)",
        accent: "oklch(0.965 0.004 256)",
        "accent-foreground": "oklch(0.235 0.014 256)",
        border: "oklch(0.898 0.003 256)",
        input: "oklch(0.898 0.003 256)",
        ring: "oklch(0.708 0.012 256)",
      },
      dark: {
        primary: "oklch(0.96 0.003 256)",
        "primary-foreground": "oklch(0.235 0.014 256)",
        secondary: "oklch(0.282 0.013 256)",
        "secondary-foreground": "oklch(0.985 0 0)",
        muted: "oklch(0.282 0.013 256)",
        "muted-foreground": "oklch(0.708 0.012 256)",
        accent: "oklch(0.282 0.013 256)",
        "accent-foreground": "oklch(0.985 0 0)",
        border: "oklch(1 0 0 / 10%)",
        input: "oklch(1 0 0 / 15%)",
        ring: "oklch(0.556 0.016 256)",
      },
    },
    sky: {
      light: {
        primary: "oklch(0.46 0.11 240)",
        "primary-foreground": "oklch(0.985 0 0)",
        secondary: "oklch(0.94 0.033 240)",
        "secondary-foreground": "oklch(0.24 0.06 240)",
        muted: "oklch(0.94 0.033 240)",
        "muted-foreground": "oklch(0.556 0.078 240)",
        accent: "oklch(0.94 0.033 240)",
        "accent-foreground": "oklch(0.24 0.06 240)",
        border: "oklch(0.87 0.025 240)",
        input: "oklch(0.87 0.025 240)",
        ring: "oklch(0.708 0.088 240)",
      },
      dark: {
        primary: "oklch(0.92 0.03 240)",
        "primary-foreground": "oklch(0.24 0.06 240)",
        secondary: "oklch(0.282 0.045 240)",
        "secondary-foreground": "oklch(0.985 0 0)",
        muted: "oklch(0.282 0.045 240)",
        "muted-foreground": "oklch(0.708 0.088 240)",
        accent: "oklch(0.282 0.045 240)",
        "accent-foreground": "oklch(0.985 0 0)",
        border: "oklch(1 0 0 / 10%)",
        input: "oklch(1 0 0 / 15%)",
        ring: "oklch(0.556 0.078 240)",
      },
    },
  };

  const colors = themeColors[theme.baseColor];
  if (!colors) return;

  // Generate CSS with the theme colors
  const lightVars = Object.entries(colors.light)
    .map(([key, value]) => `      --${key}: ${value};`)
    .join("\n");

  const darkVars = Object.entries(colors.dark)
    .map(([key, value]) => `      --${key}: ${value};`)
    .join("\n");

  // Background colors per theme - light backgrounds with subtle theme tint
  const bgColors: Record<string, { light: string; dark: string }> = {
    neutral: { light: "oklch(1 0 0)", dark: "oklch(0.145 0 0)" },
    zinc: {
      light: "oklch(0.995 0.001 247.9)",
      dark: "oklch(0.141 0.005 247.9)",
    },
    slate: { light: "oklch(0.995 0.002 256)", dark: "oklch(0.129 0.014 256)" },
    stone: {
      light: "oklch(0.995 0.001 106.4)",
      dark: "oklch(0.147 0.009 56.3)",
    },
    gray: { light: "oklch(0.995 0.001 256)", dark: "oklch(0.13 0.007 256)" },
    sky: { light: "oklch(0.995 0.005 240)", dark: "oklch(0.145 0.02 240)" },
  };

  const themeBg = bgColors[theme.baseColor] || bgColors.neutral;
  const lightBg = themeBg.light;
  const darkBg = themeBg.dark;
  const lightFg = colors.light["secondary-foreground"];
  const darkFg = colors.dark["secondary-foreground"];

  styleEl.textContent = `
    /* Light mode canvas (default) */
    [data-canvas-content] {
${lightVars}
      --background: ${lightBg};
      --foreground: ${lightFg};
      --card: ${colors.light.secondary};
      --card-foreground: ${colors.light["secondary-foreground"]};
      --popover: ${colors.light.secondary};
      --popover-foreground: ${colors.light["secondary-foreground"]};
      background-color: var(--background);
      color: var(--foreground);
    }
    
    /* Dark mode canvas - triggered by app-level canvas theme toggle */
    [data-canvas-theme="dark"] [data-canvas-content] {
${darkVars}
      --background: ${darkBg};
      --foreground: ${darkFg};
      --card: ${colors.dark.secondary};
      --card-foreground: ${colors.dark["secondary-foreground"]};
      --popover: ${colors.dark.secondary};
      --popover-foreground: ${colors.dark["secondary-foreground"]};
      background-color: var(--background);
      color: var(--foreground);
    }
  `;

  // Store in localStorage
  localStorage.setItem("selectedBaseTheme", theme.baseColor);
}

// Load base theme from localStorage
export function loadBaseTheme(): BaseTheme | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem("selectedBaseTheme");
  if (stored) {
    return BASE_THEMES.find((t) => t.baseColor === stored) || null;
  }
  return null;
}
