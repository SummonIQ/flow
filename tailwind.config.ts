import type { Config } from 'tailwindcss';

// Tailwind CSS v4 uses CSS-based configuration via @theme in globals.css
// This file is minimal and only needed for TypeScript types
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './constants/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@summoniq/applab-ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
};

export default config;
