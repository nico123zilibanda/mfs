"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

import {
  Home,
  LogIn,
  Menu,
  Moon,
  Search,
  ShieldCheck,
  Sun,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import PublicBrand from "./public-brand";

const navigation = [
  {
    title: "Nyumbani",
    href: "/",
    icon: Home,
  },
  {
    title: "Fuatilia Taarifa",
    href: "/public/tracking",
    icon: Search,
  },
] as const;

export default function MobileNavigation() {
  const pathname = usePathname();

  const {
    theme,
    setTheme,
    resolvedTheme,
  } = useTheme();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /*
   * resolvedTheme gives the actual theme even when
   * the selected theme is "system".
   */
  const isDark =
    mounted && resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  // Active states

  const isHomeActive =
    pathname === "/";

  const isTrackingActive =
    pathname === "/public/tracking" ||
    pathname.startsWith("/public/tracking/");

  const isLoginActive =
    pathname === "/login" ||
    pathname.startsWith("/login/");

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
    >
      {/* Menu Trigger */}

      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Fungua menyu"
          className="
            rounded-xl

            hover:bg-purple-50
            hover:text-purple-600

            dark:hover:bg-purple-950/40
            dark:hover:text-purple-400
          "
        >
          <Menu
            className="
              h-6
              w-6
              text-slate-700

              dark:text-slate-200
            "
          />
        </Button>
      </SheetTrigger>

      {/* Mobile Menu */}

      <SheetContent
        side="right"
        className="
          flex
          w-[min(22rem,calc(100vw-2rem))]
          flex-col
          border-l
          border-slate-200
          bg-white
          p-0

          dark:border-slate-800
          dark:bg-slate-950
        "
      >
        {/* Header */}

        <SheetHeader
          className="
            border-b
            border-slate-200
            px-6
            py-6

            dark:border-slate-800
          "
        >
          <PublicBrand />
        </SheetHeader>

        {/* Navigation */}

        <nav
          className="
            flex-1
            space-y-2
            p-5
          "
          aria-label="Menyu kuu"
        >
          {/* Section Title */}

          <div
            className="
              mb-4
              flex
              items-center
              gap-2
              px-2
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-slate-400
            "
          >
            <ShieldCheck className="h-3.5 w-3.5" />

            Huduma za Wananchi
          </div>

          {/* Navigation Links */}

          {navigation.map((item) => {
            const Icon = item.icon;

            const active =
              item.href === "/"
                ? isHomeActive
                : isTrackingActive;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={
                  active
                    ? "page"
                    : undefined
                }
                className={cn(
                  `
                    group
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-4
                    py-3.5
                    text-sm
                    font-semibold
                    transition-all
                    duration-200
                  `,
                  active
                    ? `
                        bg-[#6d28d9]
                        text-white
                        shadow-lg
                        shadow-purple-900/20
                      `
                    : `
                        text-slate-600
                        hover:bg-purple-50
                        hover:text-[#6d28d9]

                        dark:text-slate-300
                        dark:hover:bg-purple-950/40
                        dark:hover:text-purple-400
                      `
                )}
              >
                <Icon
                  className={cn(
                    `
                      h-5
                      w-5
                      transition-colors
                    `,
                    active
                      ? "text-white"
                      : `
                          text-slate-400
                          group-hover:text-[#6d28d9]

                          dark:group-hover:text-purple-400
                        `
                  )}
                />

                {item.title}
              </Link>
            );
          })}

          {/* Theme Toggle */}

          <div
            className="
              mt-6
              border-t
              border-slate-200
              pt-5

              dark:border-slate-800
            "
          >
            <button
              type="button"
              onClick={toggleTheme}
              className="
                group
                flex
                w-full
                items-center
                justify-between
                rounded-xl
                px-4
                py-3.5
                text-sm
                font-semibold
                text-slate-600
                transition-all
                duration-200

                hover:bg-purple-50
                hover:text-purple-600

                dark:text-slate-300
                dark:hover:bg-purple-950/40
                dark:hover:text-purple-400
              "
              aria-label={
                isDark
                  ? "Washa hali ya mwanga"
                  : "Washa hali ya usiku"
              }
            >
              <div className="flex items-center gap-3">
                {mounted ? (
                  isDark ? (
                    <Sun
                      className="
                        h-5
                        w-5
                        text-amber-500
                        dark:text-amber-400
                      "
                    />
                  ) : (
                    <Moon
                      className="
                        h-5
                        w-5
                        text-slate-500
                        group-hover:text-purple-600

                        dark:text-slate-400
                        dark:group-hover:text-purple-400
                      "
                    />
                  )
                ) : (
                  <Moon
                    className="
                      h-5
                      w-5
                      text-slate-500
                    "
                  />
                )}

                <span>
                  {mounted && isDark
                    ? "Hali ya Mwanga"
                    : "Hali ya Usiku"}
                </span>
              </div>

              {/* Toggle Indicator */}

              <span
                className={cn(
                  `
                    relative
                    h-6
                    w-11
                    rounded-full
                    transition-colors
                    duration-200
                  `,
                  isDark
                    ? "bg-purple-600"
                    : "bg-slate-300 dark:bg-slate-700"
                )}
              >
                <span
                  className={cn(
                    `
                      absolute
                      top-1
                      h-4
                      w-4
                      rounded-full
                      bg-white
                      shadow-sm
                      transition-transform
                      duration-200
                    `,
                    isDark
                      ? "translate-x-6"
                      : "translate-x-1"
                  )}
                />
              </span>
            </button>
          </div>
        </nav>

        {/* Login */}

        <div
          className="
            border-t
            border-slate-200
            p-5

            dark:border-slate-800
          "
        >
          <Button
            asChild
            className={cn(
              `
                h-12
                w-full
                rounded-xl
                transition-all
                duration-200
              `,
              isLoginActive
                ? `
                    bg-[#4c1d95]
                    text-white
                    shadow-lg
                    shadow-purple-900/25
                    ring-2
                    ring-purple-200

                    dark:bg-purple-700
                    dark:ring-purple-900
                  `
                : `
                    bg-[#6d28d9]
                    text-white
                    hover:bg-[#4c1d95]

                    dark:bg-purple-600
                    dark:hover:bg-purple-700
                  `
            )}
          >
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              aria-current={
                isLoginActive
                  ? "page"
                  : undefined
              }
            >
              <LogIn
                className="
                  mr-2
                  h-4
                  w-4
                "
              />

              Ingia kama Msimamizi
            </Link>
          </Button>

          <p
            className="
              mt-4
              text-center
              text-xs
              text-slate-400
            "
          >
            Maoni na Malalamiko Portal
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
