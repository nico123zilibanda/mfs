"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import {
  FileText,
  Home,
  Landmark,
  LogIn,
  Moon,
  Search,
  Sun,
  type LucideIcon,
} from "lucide-react";

import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import GovernmentTopBar from "./government-top-bar";
import MobileNavigation from "./mobile-navigation";

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

const navigation: readonly NavItem[] = [
  { title: "Nyumbani", href: "/", icon: Home },
  { title: "Wasilisha Taarifa", href: "/public/feedback", icon: FileText },
  { title: "Fuatilia Taarifa", href: "/public/tracking", icon: Search },
];

const BRAND = {
  title: "Halmashauri ya Wilaya ya Mlele",
  subtitle: "Mfumo wa Taarifa za Wananchi",
};

function isActivePath(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Tanzanian flag colours: green, gold, black, blue. */
function FlagStrip() {
  return (
    <div aria-hidden="true" className="flex h-1 w-full">
      <span className="flex-1 bg-[#1eb53a]" />
      <span className="flex-1 bg-[#fcd116]" />
      <span className="flex-1 bg-black" />
      <span className="flex-1 bg-[#00a3dd]" />
    </div>
  );
}

function Brand() {
  return (
    <Link
      href="/"
      aria-label={`${BRAND.title}, ukurasa wa nyumbani`}
      className="group flex min-w-0 items-center gap-3 rounded-xl py-1 pr-2 outline-none focus-visible:ring-2 focus-visible:ring-purple-600/60"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-purple-600 to-purple-800 text-white shadow-sm shadow-purple-600/30 ring-1 ring-inset ring-white/15 transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none sm:size-11">
        <Landmark className="size-5" aria-hidden="true" />
      </span>

      <span className="min-w-0 leading-tight">
        <span className="block truncate text-[13px] font-bold tracking-tight text-slate-950 sm:text-sm dark:text-white">
          {BRAND.title}
        </span>
        <span className="mt-0.5 hidden truncate text-[11px] font-medium uppercase tracking-wider text-slate-500 sm:block dark:text-slate-400">
          {BRAND.subtitle}
        </span>
      </span>
    </Link>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group/link relative flex h-full items-center gap-2 px-4 text-sm font-semibold outline-none transition-colors duration-200",
        "focus-visible:bg-slate-100 dark:focus-visible:bg-slate-900",
        active
          ? "text-purple-700 dark:text-purple-300"
          : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white",
      )}
    >
      <Icon
        className={cn(
          "size-4 transition-colors",
          active ? "text-purple-600 dark:text-purple-400" : "text-slate-400 dark:text-slate-500",
        )}
        aria-hidden="true"
      />
      {item.title}

      {/* Active / hover indicator sitting on the header's bottom edge */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-3 bottom-0 h-0.5 origin-center rounded-full bg-linear-to-r from-purple-600 to-[#d4a017] transition-transform duration-200 motion-reduce:transition-none",
          active ? "scale-x-100" : "scale-x-0 group-hover/link:scale-x-100",
        )}
      />
    </Link>
  );
}

export default function PublicNavbar() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <>
      {/* Accessibility: let keyboard users skip the navigation. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-lg focus:bg-purple-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        Ruka hadi maudhui makuu
      </a>

      <FlagStrip />

      {/* Government identity banner */}
      <GovernmentTopBar />

      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl transition-shadow duration-300",
          "supports-backdrop-filter:bg-white/80",
          "dark:border-slate-800/80 dark:bg-slate-950/90 dark:supports-backdrop-filter:bg-slate-950/80",
          scrolled
            ? "shadow-[0_10px_30px_-15px_rgba(15,23,42,0.35)]"
            : "shadow-[0_4px_20px_-14px_rgba(15,23,42,0.2)]",
        )}
      >
        <Container className="flex h-16 items-center justify-between gap-3 py-0 lg:h-18">
          {/* Left: mobile menu + brand */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="lg:hidden">
              <MobileNavigation />
            </div>
            <Brand />
          </div>

          {/* Right: navigation + controls */}
          <div className="flex h-full shrink-0 items-center gap-1.5 sm:gap-2">
            <nav
              aria-label="Menyu kuu"
              className="hidden h-full items-stretch lg:flex"
            >
              {navigation.map((item) => (
                <NavLink key={item.href} item={item} active={isActivePath(pathname, item.href)} />
              ))}
            </nav>

            <div
              aria-hidden="true"
              className="mx-2 hidden h-7 w-px bg-slate-200 lg:block dark:bg-slate-800"
            />

            {/* Theme toggle */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={isDark ? "Washa hali ya mwanga" : "Washa hali ya usiku"}
              title={isDark ? "Hali ya mwanga" : "Hali ya usiku"}
              className="size-10 shrink-0 rounded-xl border border-transparent text-slate-600 transition-colors duration-200 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-white"
            >
              {isDark ? (
                <Sun className="size-5 text-[#d4a017]" aria-hidden="true" />
              ) : (
                <Moon className="size-5" aria-hidden="true" />
              )}
            </Button>

            {/* Login */}
            <Button
              asChild
              className="h-10 shrink-0 rounded-xl bg-linear-to-b from-purple-600 to-purple-700 px-4 font-semibold text-white shadow-sm shadow-purple-600/25 ring-1 ring-inset ring-white/10 transition-all duration-200 hover:from-purple-500 hover:to-purple-700 hover:shadow-md hover:shadow-purple-600/30 active:scale-[0.98] sm:px-5"
            >
              <Link href="/login">
                <LogIn className="mr-2 size-4" aria-hidden="true" />
                Ingia
              </Link>
            </Button>
          </div>
        </Container>

        {/* Soft brand-coloured hairline under the bar */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-linear-to-r from-transparent via-purple-600/40 to-transparent"
        />
      </header>
    </>
  );
}
