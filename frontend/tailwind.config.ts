import type { Config } from 'tailwindcss'
import containerQueries from '@tailwindcss/container-queries'

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.stories.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CSS custom property references
        background: "var(--background)",
        foreground: "var(--foreground)",
        "interactive-border-accent": "var(--interactive-border-accent)",

        // Design system colors - root level only for utility class generation
        primary: "var(--bg-primary)",
        accent: "var(--color-accent)",
        secondary: "var(--bg-secondary)",
        tertiary: "var(--bg-tertiary)",
        scrim: "var(--bg-scrim)",
        "elevated-primary": "var(--bg-elevated-primary)",
        "elevated-secondary": "var(--bg-elevated-secondary)",
        "status-warning": "var(--bg-status-warning)",
        "status-error": "var(--bg-status-error)",

        // Text colors at root level for text- classes
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary": "var(--text-tertiary)",
        "text-inverted": "var(--text-inverted)",
        "text-accent": "var(--text-accent)",

        // Border colors at root level for border- classes  
        "border-default": "var(--border-default)",
        "border-heavy": "var(--border-heavy)",
        "border-light": "var(--border-light)",

        // Interactive colors at root level
        "interactive-secondary-hover": "var(--interactive-bg-secondary-hover)",
        "interactive-accent": "var(--interactive-bg-accent-default)",
      },

      // Custom border colors
      borderColor: {
        accent: "var(--border-accent)",
        DEFAULT: "var(--border-default)",
        heavy: "var(--border-heavy)",
        light: "var(--border-light)",
        "status-warning": "var(--border-status-warning)",
        "status-error": "var(--border-status-error)",
      },

      // Custom text colors
      textColor: {
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        tertiary: "var(--text-tertiary)",
        inverted: "var(--text-inverted)",
        "inverted-static": "var(--text-inverted-static)",
        accent: "var(--text-accent)",
        "status-warning": "var(--text-status-warning)",
        "status-error": "var(--text-status-error)",

        // Icon colors for text utility
        "icon-primary": "var(--icon-primary)",
        "icon-secondary": "var(--icon-secondary)",
        "icon-tertiary": "var(--icon-tertiary)",
        "icon-inverted": "var(--icon-inverted)",
        "icon-inverted-static": "var(--icon-inverted-static)",
        "icon-accent": "var(--icon-accent)",
        "icon-status-warning": "var(--icon-status-warning)",
        "icon-status-error": "var(--icon-status-error)",
      },

      // Custom background colors
      backgroundColor: {
        primary: "var(--bg-primary)",
        secondary: "var(--bg-secondary)",
        tertiary: "var(--bg-tertiary)",
        scrim: "var(--bg-scrim)",
        "elevated-primary": "var(--bg-elevated-primary)",
        "elevated-secondary": "var(--bg-elevated-secondary)",
        "status-warning": "var(--bg-status-warning)",
        "status-error": "var(--bg-status-error)",
        // Interactive backgrounds
        "interactive-primary": "var(--interactive-bg-primary-default)",
        "interactive-primary-hover": "var(--interactive-bg-primary-hover)",
        "interactive-primary-press": "var(--interactive-bg-primary-press)",
        "interactive-primary-inactive": "var(--interactive-bg-primary-inactive)",
        "interactive-primary-selected": "var(--interactive-bg-primary-selected)",
        "interactive-secondary": "var(--interactive-bg-secondary-default)",
        "interactive-secondary-hover": "var(--interactive-bg-secondary-hover)",
        "interactive-secondary-press": "var(--interactive-bg-secondary-press)",
        "interactive-secondary-inactive": "var(--interactive-bg-secondary-inactive)",
        "interactive-secondary-selected": "var(--interactive-bg-secondary-selected)",
        "interactive-tertiary": "var(--interactive-bg-tertiary-default)",
        "interactive-tertiary-hover": "var(--interactive-bg-tertiary-hover)",
        "interactive-tertiary-press": "var(--interactive-bg-tertiary-press)",
        "interactive-tertiary-inactive": "var(--interactive-bg-tertiary-inactive)",
        "interactive-tertiary-selected": "var(--interactive-bg-tertiary-selected)",
        "interactive-accent": "var(--interactive-bg-accent-default)",
        "interactive-accent-hover": "var(--interactive-bg-accent-hover)",
        "interactive-accent-muted-hover": "var(--interactive-bg-accent-muted-hover)",
        "interactive-accent-press": "var(--interactive-bg-accent-press)",
        "interactive-accent-muted-press": "var(--interactive-bg-accent-muted-press)",
        "interactive-accent-inactive": "var(--interactive-bg-accent-inactive)",
      },
    },
  },
  plugins: [
    containerQueries,
  ],
}

export default config
