import Link from "next/link";
import {
  ArrowUpRight,
  FileText,
  Bookmark,
  Activity,
  Sparkles,
  LayoutDashboard,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type Action = {
  title: string;
  href: string;
  icon: React.ElementType;
};

const actions: Action[] = [
  {
    title: "Dashibodi",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Angalia Taarifa",
    href: "/all-reports",
    icon: FileText,
  },
  {
    title: "Taarifa Zilizohifadhiwa",
    href: "/deleted",
    icon: Bookmark,
  },
  {
    title: "Ufuatiliaji",
    href: "/"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ClipboardList,
  FileText,
  Bookmark,
  LayoutDashboard,
  Activity,
  LogOut,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

import { logoutAdmin } from "@/lib/actions/auth";

type SidebarProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const navigation = [
  {
    title: "Dashibodi",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Taarifa Zote",
    href: "/all-reports",
    icon: FileText,
  },
  {
    title: "Taarifa Zilizohifadhiwa",
    href: "/deleted",
    icon: Bookmark,
  },
  {
    title: "Ufuatiliaji",
    href: "/trackings",
    icon: Activity,
  },
];

export default function QuickActions() {
  return (
    <section aria-labelledby="quick-actions-title" className="space-y-4">
      {/* Section heading */}
      <div className="flex items-center gap-4">
        <div
          className="
            flex h-8 w-8 shrink-0 items-center justify-center
            rounded-lg
            bg-purple-50
            text-purple-600
            ring-1 ring-purple-100
            dark:bg-purple-950/40
            dark:text-purple-400
            dark:ring-purple-900/50
          "
        >
          <Sparkles className="h-4 w-4" />
        </div>

        <div>
          <h2
            id="quick-actions-title"
            className="
              text-base
              font-bold
              tracking-tight
              text-slate-900
              dark:text-white
            "
          >
            Vitendo vya Haraka
          </h2>

          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Fikia huduma muhimu kwa haraka.
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="
                group
                block
                rounded-xl
                outline-none
                focus-visible:ring-2
                focus-visible:ring-purple-500/40
                focus-visible:ring-offset-2
                dark:focus-visible:ring-offset-slate-950
              "
            >
              <Card
                className="
                  relative
                  overflow-hidden
                  rounded-xl
                  border
                  border-slate-200/80
                  bg-white
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:border-purple-200
                  hover:shadow-md
                  dark:border-slate-800
                  dark:bg-slate-900
                  dark:hover:border-purple-900
                "
              >
                {/* Subtle top accent */}
                <div
                  aria-hidden="true"
                  className="
                    absolute
                    inset-x-0
                    top-0
                    h-0.5
                    bg-linear-to-r
                    from-purple-500
                    via-violet-500
                    to-indigo-500
                    opacity-60
                    transition-opacity
                    duration-300
                    group-hover:opacity-100
                  "
                />

                <CardContent className="flex items-center gap-3 p-3.5">
                  {/* Icon */}
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-purple-100
                      bg-purple-50
                      text-purple-600
                      transition-all
                      duration-300
                      group-hover:scale-105
                      group-hover:border-purple-200
                      group-hover:bg-purple-100
                      dark:border-purple-900/50
                      dark:bg-purple-950/40
                      dark:text-purple-400
                      dark:group-hover:bg-purple-950/60
                    "
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Title */}
                  <h3
                    className="
                      min-w-0
                      flex-1
                      truncate
                      text-sm
                      font-semibold
                      tracking-tight
                      text-slate-800
                      transition-colors
                      duration-200
                      group-hover:text-purple-700
                      dark:text-slate-100
                      dark:group-hover:text-purple-300
                    "
                  >
                    {action.title}
                  </h3>

                  {/* Arrow */}
                  <div
                    className="
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-md
                      text-slate-400
                      transition-all
                      duration-300
                      group-hover:bg-purple-50
                      group-hover:text-purple-600
                      dark:text-slate-500
                      dark:group-hover:bg-purple-950/50
                      dark:group-hover:text-purple-400
                    "
                  >
                    <ArrowUpRight
                      className="
                        h-3.5
                        w-3.5
                        transition-transform
                        duration-300
                        group-hover:translate-x-0.5
                        group-hover:-translate-y-0.5
                      "
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
