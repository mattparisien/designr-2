import type { LucideIcon } from 'lucide-react';

/**
 * A top-level navigation group.
 */
export interface Navigation {
  id: string;
  title?: string;
  items: NavigationItem[];
  /** Defaults to true if omitted. */
  isVisible?: boolean;
}

/**
 * An individual navigation entry; can nest recursively.
 */
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  children?: NavigationItem[];
  icon?: string | LucideIcon;
  badge?: string | number;
  isExternal?: boolean;
}
