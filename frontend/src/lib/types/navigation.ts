import type { LucideIcon } from 'lucide-react';

/**
 * A top-level navigation group.
 */
export interface Navigation {
  id: string;
  label?: string;
  sections: NavigationSection[];
  /** Defaults to true if omitted. */
  isVisible?: boolean;
}

/**
 * A navigation section within a navigation group.
 */
export interface NavigationSection {
  id: string;
  label?: string;
  items: NavigationItem[];
}

/**
 * An individual navigation entry; can nest recursively.
 */
export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  children?: NavigationItem[];
  icon?: string | LucideIcon;
  badge?: string | number;
  isExternal?: boolean;
  onDelete?: (item: NavigationItem) => void;
}
