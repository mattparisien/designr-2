import { type LucideIcon } from "lucide-react";

export interface Navigation {
  title: string
  sections: {
    id: string;
    items: NavigationItem[]
  }[]
}

export interface NavigationItem {
  id: string
  title: string
  href?: string
  children?: NavigationItem[]
  icon?: string | LucideIcon
}


