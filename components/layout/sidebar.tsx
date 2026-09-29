"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ClipboardList,
  FileText,
  LayoutDashboard,
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
    icon: Trash2,
  },
  {
    title: "Ufuatiliaji",
    href: "/trackings",
    icon: ClipboardList,
  },
] as const;

export default function Sidebar({
  open,
  onOpenChange,
}: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="
          fixed
          inset-y-0
          left-0
          z-50
          hidden
          w-72
          border-r
          border-slate-200
          bg-white
          lg:block
          dark:border-slate-800
          dark:bg-slate-950
        "
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet
        open={open}
        onOpenChange={onOpenChange}
      >
        <SheetContent
          side="left"
          className="
            w-72
            border-r
            border-slate-200
            bg-white
            p-0
            text-slate-900
            dark:border-slate-800
            dark:bg-slate-950
            dark:text-white
          "
        >
          <SheetTitle className="sr-only">
            Menyu ya Msimamizi
          </SheetTitle>

          <SidebarContent
            onNavigate={() => onOpenChange(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

function SidebarContent({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* =====================================================
          BRANDING
      ====================================================== */}
      <div
        className="
          border-b
          border-slate-100
          px-5
          py-5
          dark:border-slate-800
        "
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="
            group
            flex
            items-center
            gap-3
            rounded-xl
            outline-none
            transition-opacity
            hover:opacity-90
            focus-visible:ring-2
            focus-visible:ring-purple-500/40
          "
        >
          {/* Logo */}
          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              p-2
              shadow-sm
              ring-1
              ring-black/2
              dark:border-slate-700
              dark:bg-slate-900
              dark:ring-white/5
            "
          >
            <Image
              src="/images/logo.jpeg"
              alt="Nembo ya Halmashauri ya Mlele"
              width={38}
              height={38}
              sizes="38"
              priority
              className="object-contain"
            />
          </div>

          {/* Brand */}
          <div className="min-w-0">
            <h2
              className="
                truncate
                text-sm
                font-bold
                tracking-tight
                text-slate-900
                dark:text-white
              "
            >
              Ongea na DED
            </h2>

            <p
              className="
                mt-0.5
                truncate
                text-[11px]
                leading-4
                text-slate-500
                dark:text-slate-400
              "
            >
              Halmashauri ya Wilaya ya Mlele
            </p>
          </div>
        </Link>
      </div>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}
      <nav
        className="
          flex-1
          overflow-y-auto
          px-3
          py-5
        "
        aria-label="Menyu ya msimamizi"
      >
        {/* Section Label */}
        <div
          className="
            mb-3
            flex
            items-center
            gap-2
            px-3
          "
        >
          <ShieldCheck
            className="
              h-3.5
              w-3.5
              text-purple-500
              dark:text-purple-400
            "
          />

          <span
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-slate-400
              dark:text-slate-500
            "
          >
            Usimamizi
          </span>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          {navigation.map(
            ({
              title,
              href,
              icon: Icon,
            }) => {
              /*
               * Keep the parent navigation item active
               * when visiting its detail/sub-pages.
               *
               * Examples:
               * /all-reports
               * /all-reports/123
               * /all-reports/123/edit
               *
               * All of the above keep "Taarifa Zote" active.
               */
              const active =
                pathname === href ||
                pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  aria-current={
                    active ? "page" : undefined
                  }
                  className={cn(
                    `
                      group
                      relative
                      flex
                      min-h-11
                      items-center
                      gap-3
                      rounded-xl
                      px-3.5
                      py-2.5
                      text-sm
                      font-medium
                      outline-none
                      transition-all
                      duration-200
                      focus-visible:ring-2
                      focus-visible:ring-purple-500/40
                    `,
                    active
                      ? `
                          bg-purple-50
                          text-purple-700
                          dark:bg-purple-950/40
                          dark:text-purple-300
                        `
                      : `
                          text-slate-600
                          hover:bg-slate-50
                          hover:text-slate-900
                          dark:text-slate-400
                          dark:hover:bg-slate-900
                          dark:hover:text-slate-100
                        `
                  )}
                >
                  {/* Active Indicator */}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="
                        absolute
                        left-0
                        top-1/2
                        h-6
                        w-0.5
                        -translate-y-1/2
                        rounded-r-full
                        bg-purple-600
                        dark:bg-purple-400
                      "
                    />
                  )}

                  {/* Icon */}
                  <Icon
                    className={cn(
                      `
                        h-4.5
                        w-4.5
                        shrink-0
                        transition-colors
                        duration-200
                      `,
                      active
                        ? `
                            text-purple-600
                            dark:text-purple-400
                          `
                        : `
                            text-slate-400
                            group-hover:text-purple-500
                            dark:text-slate-500
                            dark:group-hover:text-purple-400
                          `
                    )}
                  />

                  {/* Label */}
                  <span className="truncate">
                    {title}
                  </span>
                </Link>
              );
            }
          )}
        </div>
      </nav>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <div
        className="
          border-t
          border-slate-100
          p-3
          dark:border-slate-800
        "
      >
        {/* Logout */}
        <form action={logoutAdmin}>
          <Button
            type="submit"
            variant="ghost"
            className="
              h-10
              w-full
              justify-start
              gap-3
              rounded-xl
              px-3.5
              text-sm
              font-medium
              text-slate-500
              transition-colors
              hover:bg-red-50
              hover:text-red-600
              dark:text-slate-400
              dark:hover:bg-red-950/30
              dark:hover:text-red-400
            "
          >
            <LogOut className="h-4.5 w-4.5" />

            Ondoka
          </Button>
        </form>

        {/* System Information */}
        <div
          className="
            mt-3
            rounded-xl
            border
            border-slate-200
            bg-slate-50/80
            px-3
            py-3
            dark:border-slate-800
            dark:bg-slate-900/60
          "
        >
          <div className="flex items-center gap-2">
            <span
              className="
                h-2
                w-2
                shrink-0
                rounded-full
                bg-emerald-500
                ring-4
                ring-emerald-500/10
              "
            />

            <p
              className="
                truncate
                text-[11px]
                font-semibold
                text-slate-700
                dark:text-slate-300
              "
            >
              Malalamiko Portal
            </p>
          </div>

          <p
            className="
              mt-1.5
              truncate
              text-[10px]
              text-slate-400
              dark:text-slate-500
            "
          >
            Halmashauri ya Wilaya ya Mlele
          </p>

          <div
            className="
              mt-3
              flex
              items-center
              justify-between
              border-t
              border-slate-200
              pt-2.5
              dark:border-slate-800
            "
          >
            <span
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.12em]
                text-slate-400
                dark:text-slate-600
              "
            >
              System
            </span>

            <span
              className="
                text-[9px]
                font-semibold
                text-slate-400
                dark:text-slate-600
              "
            >
              v1.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
