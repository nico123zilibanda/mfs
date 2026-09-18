"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import {
  LogIn,
  Moon,
  Sun,
} from "lucide-react";

import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import GovernmentTopBar from "./government-top-bar";
import MobileNavigation from "./mobile-navigation";

const navigation = [
  {
    title: "Nyumbani",
    href: "/",
  },
  {
    title: "Fuatilia Taarifa",
    href: "/public/tracking",
  },
] as const;

export default function PublicNavbar() {
  const pathname = usePathname();

  const {
    theme,
    setTheme,
    resolvedTheme,
  } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark =
    mounted &&
    (resolvedTheme === "dark" ||
      theme === "dark");

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <>
      {/* -------------------------------------------------------
       * GOVERNMENT IDENTITY BANNER
       * ----------------------------------------------------- */}

      <GovernmentTopBar />

      {/* -------------------------------------------------------
       * PUBLIC NAVIGATION
       * ----------------------------------------------------- */}

      <header
        className="
          sticky
          top-0
          z-50
          w-full

          border-b
          border-slate-200/80

          bg-white/95
          shadow-[0_4px_20px_-12px_rgba(15,23,42,0.25)]

          backdrop-blur-xl

          supports-backdrop-filter:bg-white/85

          dark:border-slate-800/80
          dark:bg-slate-950/95
          dark:supports-backdrop-filter:bg-slate-950/85
        "
      >
        <Container
          className="
            flex
            h-16
            items-center
            justify-between
            py-0

            sm:h-17
            lg:h-18
          "
        >
          {/* ---------------------------------------------------
           * DESKTOP NAVIGATION
           * ------------------------------------------------- */}

          <nav
            className="
              hidden
              items-center
              gap-1

              lg:flex
            "
            aria-label="Menyu kuu"
          >
            {navigation.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(
                  `${item.href}/`
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={cn(
                    `
                      relative
                      flex
                      h-10
                      items-center
                      rounded-xl
                      px-4

                      text-sm
                      font-semibold

                      transition-all
                      duration-200
                    `,

                    active
                      ? `
                          bg-purple-50
                          text-purple-700

                          dark:bg-purple-950/50
                          dark:text-purple-300
                        `
                      : `
                          text-slate-600

                          hover:bg-slate-100
                          hover:text-slate-950

                          dark:text-slate-400
                          dark:hover:bg-slate-900
                          dark:hover:text-white
                        `
                  )}
                >
                  {item.title}

                  {active && (
                    <span
                      aria-hidden="true"
                      className="
                        absolute
                        bottom-1
                        left-1/2
                        h-1
                        w-1
                        -translate-x-1/2
                        rounded-full

                        bg-purple-600

                        dark:bg-purple-400
                      "
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ---------------------------------------------------
           * RIGHT CONTROLS
           * ------------------------------------------------- */}

          <div
            className="
              hidden
              items-center
              gap-2

              lg:flex
            "
          >
            {/* Theme Toggle */}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={
                isDark
                  ? "Washa mwanga"
                  : "Washa hali ya usiku"
              }
              title={
                isDark
                  ? "Hali ya mwanga"
                  : "Hali ya usiku"
              }
              className="
                h-10
                w-10
                rounded-xl

                border
                border-transparent

                text-slate-600

                transition-all

                hover:border-slate-200
                hover:bg-slate-100
                hover:text-slate-950

                dark:text-slate-300
                dark:hover:border-slate-700
                dark:hover:bg-slate-900
                dark:hover:text-white
              "
            >
              {mounted ? (
                isDark ? (
                  <Sun className="h-4.5 w-4.5" />
                ) : (
                  <Moon className="h-4.5 w-4.5" />
                )
              ) : (
                <Moon className="h-4.5 w-4.5" />
              )}

              <span className="sr-only">
                {isDark
                  ? "Badili kwenda light mode"
                  : "Badili kwenda dark mode"}
              </span>
            </Button>

            {/* Vertical Divider */}

            <div
              aria-hidden="true"
              className="
                mx-2
                h-7
                w-px
                bg-slate-200

                dark:bg-slate-800
              "
            />

            {/* Login */}

            <Button
              asChild
              className="
                h-10
                rounded-xl
                px-5

                bg-purple-600
                text-white

                font-semibold

                shadow-sm
                shadow-purple-600/20

                transition-all
                duration-200

                hover:bg-purple-700
                hover:shadow-md
                hover:shadow-purple-600/25

                active:scale-[0.98]

                dark:bg-purple-600
                dark:hover:bg-purple-500
              "
            >
              <Link href="/login">
                <LogIn className="mr-2 h-4.25 w-4.25" />

                Ingia
              </Link>
            </Button>
          </div>

          {/* ---------------------------------------------------
           * MOBILE NAVIGATION
           * ------------------------------------------------- */}

          <div className="lg:hidden">
            <MobileNavigation />
          </div>
        </Container>
      </header>
    </>
  );
}