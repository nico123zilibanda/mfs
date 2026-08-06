import {
  FileText,
  LayoutDashboard,
  Trash2,
  type LucideIcon,
} from "lucide-react";

export type NavigationChild = {
  title: string;
  href: string;
  icon?: LucideIcon;
  badge?: string;
  disabled?: boolean;
};

export type NavigationItem = {
  description?: string;
  title: string;
  icon: LucideIcon;

  /**
   * Used for normal navigation items.
   * Omit when the item only acts as a parent.
   */
  href?: string;

  /**
   * Nested navigation.
   */
  children?: NavigationChild[];

  badge?: string;
  disabled?: boolean;
};

export const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },

  {
    title: "Reports",
    icon: FileText,

    children: [
      {
        title: "All Reports",
        href: "/reports",
      },

      {
        title: "Deleted Reports",
        href: "/reports/deleted",
        icon: Trash2,
      },
    ],
  },
];
