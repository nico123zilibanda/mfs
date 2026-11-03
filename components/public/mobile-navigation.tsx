"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

import {
  ChevronRight,
  FileText,
  Home,
  LogIn,
  Menu,
  Moon,
  Search,
  ShieldCheck,
  Sun,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { cn } from "@/lib/utils";

import PublicBrand from "./public-brand";

type NavItem = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

const navigation: readonly NavItem[] = [
  {
    title: "Nyumbani",
    description: "Rudi ukurasa mkuu",
    href: "/",
    icon: Home,
  },
  {
    title: "Wasilisha Taarifa",
    description: "Wasilisha maoni, malalamiko au taarifa",
    href: "/public/feedback",
    icon: FileText,
  },
  {
    title: "Fuatilia Taarifa",
    description: "Angalia hali ya taarifa yako",
    href: "/public/tracking",
    icon: Search,
  },
];

function isActivePath(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MobileNavigation() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always close the menu after navigating (including back/forward).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // resolvedTheme reflects the real theme even when the choice is "system".
  const isDark = mounted && resolvedTheme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  const isLoginActive = isActivePath(pathname, "/login");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Fungua menyu"
          className="size-10 rounded-xl border border-transparent text-slate-700 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 dark:text-slate-200 dark:hover:border-purple-900 dark:hover:bg-purple-950/40 dark:hover:text-purple-300"
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>

      {/* Opens from the left, next to the button that opened it. */}
      <SheetContent
        side="left"
        className="flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-0 border-r border-slate-200 bg-white p-0 dark:border-slate-800 dark:bg-slate-950"
      >
        {/* Tanzanian flag colours */}
        <div aria-hidden="true" className="flex h-1 w-full shrink-0">
          <span className="flex-1 bg-[#1eb53a]" />
          <span className="flex-1 bg-[#fcd116]" />
          <span className="flex-1 bg-black" />
          <span className="flex-1 bg-[#00a3dd]" />
        </div>

        <SheetHeader className="shrink-0 gap-0 border-b border-slate-200 bg-linear-to-br from-purple-50 via-white to-white p-0 px-5 py-5 pr-14 text-left dark:border-slate-800 dark:from-purple-950/30 dark:via-slate-950 dark:to-slate-950">
          <SheetTitle className="sr-only">Menyu kuu</SheetTitle>
          <SheetDescription className="sr-only">
            Viungo vya kuelekea kurasa za huduma za wananchi na kuingia kwenye mfumo.
          </SheetDescription>
          <PublicBrand />
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <nav aria-label="Menyu kuu" className="space-y-1.5 p-4">
            <p className="mb-3 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Huduma za Wananchi
            </p>

            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-3.5 rounded-2xl p-3 outline-none transition-all duration-200",
                    "focus-visible:ring-2 focus-visible:ring-purple-600/60",
                    active
                      ? "bg-linear-to-br from-purple-600 to-purple-800 text-white shadow-lg shadow-purple-900/25"
                      : "text-slate-700 hover:bg-purple-50 dark:text-slate-200 dark:hover:bg-purple-950/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                      active
                        ? "bg-white/15 text-white ring-1 ring-inset ring-white/20"
                        : "bg-slate-100 text-slate-500 group-hover:bg-purple-100 group-hover:text-purple-700 dark:bg-slate-900 dark:text-slate-400 dark:group-hover:bg-purple-950 dark:group-hover:text-purple-300",
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{item.title}</span>
                    <span
                      className={cn(
                        "mt-0.5 block truncate text-xs",
                        active ? "text-purple-100" : "text-slate-500 dark:text-slate-400",
                      )}
                    >
                      {item.description}
                    </span>
                  </span>

                  <ChevronRight
                    className={cn(
                      "size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none",
                      active ? "text-white/80" : "text-slate-300 dark:text-slate-600",
                    )}
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </nav>

          {/* Appearance */}
          <div className="border-t border-slate-200 p-4 dark:border-slate-800">
            <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Muonekano
            </p>

            <button
              type="button"
              role="switch"
              aria-checked={isDark}
              onClick={toggleTheme}
              className="group flex w-full items-center justify-between gap-3 rounded-2xl p-3 text-left outline-none transition-colors hover:bg-purple-50 focus-visible:ring-2 focus-visible:ring-purple-600/60 dark:hover:bg-purple-950/40"
            >
              <span className="flex items-center gap-3.5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors group-hover:bg-purple-100 group-hover:text-purple-700 dark:bg-slate-900 dark:text-slate-400 dark:group-hover:bg-purple-950 dark:group-hover:text-purple-300">
                  {isDark ? (
                    <Sun className="size-5 text-[#d4a017]" aria-hidden="true" />
                  ) : (
                    <Moon className="size-5" aria-hidden="true" />
                  )}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Hali ya Usiku
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                    {isDark ? "Imewashwa" : "Imezimwa"}
                  </span>
                </span>
              </span>

              <span
                aria-hidden="true"
                className={cn(
                  "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
                  isDark ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-700",
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 size-4 rounded-full bg-white shadow-sm transition-transform duration-200 motion-reduce:transition-none",
                    isDark ? "translate-x-6" : "translate-x-1",
                  )}
                />
              </span>
            </button>
          </div>
        </div>

        {/* Login */}
        <div className="shrink-0 border-t border-slate-200 bg-slate-50/60 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-slate-800 dark:bg-slate-900/40">
          <Button
            asChild
            className={cn(
              "h-12 w-full rounded-xl bg-linear-to-b from-purple-600 to-purple-700 font-semibold text-white shadow-sm shadow-purple-600/25 ring-1 ring-inset ring-white/10 transition-all duration-200 hover:from-purple-500 hover:to-purple-700 active:scale-[0.98]",
              isLoginActive && "ring-2 ring-purple-300 dark:ring-purple-800",
            )}
          >
            <Link href="/login" aria-current={isLoginActive ? "page" : undefined}>
              <LogIn className="mr-2 size-4" aria-hidden="true" />
              Ingia kama Msimamizi
            </Link>
          </Button>

          <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
            Malalamiko Portal
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
